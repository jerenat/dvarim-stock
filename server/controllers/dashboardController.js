// controllers/dashboardController.js
import Producto from '../models/Producto.js';
import Usuario from '../models/Usuario.js';
import Movimiento from '../models/Movimiento.js';
import StockUsuario from '../models/StockUsuario.js';

// @desc    Obtener datos del dashboard
// @route   GET /api/dashboard
// @access  Privado
export const obtenerDashboard = async (req, res) => {
  try {
    console.log('📊 Generando dashboard...');

    // 1. Estadísticas generales
    const [
      totalProductos,
      totalUsuarios,
      productosStockBajo,
      stockTotal
    ] = await Promise.all([
      Producto.countDocuments({ estado: 'activo' }),
      Usuario.countDocuments({ estado: 'activo' }),
      Producto.countDocuments({ estado: 'activo', stock: { $lt: 10 } }),
      Producto.aggregate([
        { $match: { estado: 'activo' } },
        { $group: { _id: null, total: { $sum: '$stock' } } }
      ])
    ]);

    // 2. Movimientos de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const [ventasHoy, transferenciasHoy, ingresosHoy] = await Promise.all([
      Movimiento.countDocuments({ 
        tipo: 'venta', 
        estado: 'completado',
        createdAt: { $gte: hoy, $lt: manana }
      }),
      Movimiento.countDocuments({ 
        tipo: 'transferencia',
        createdAt: { $gte: hoy, $lt: manana }
      }),
      Movimiento.countDocuments({ 
        tipo: 'ingreso',
        createdAt: { $gte: hoy, $lt: manana }
      })
    ]);

    // 3. Ventas de la semana (últimos 7 días)
    const semanaInicio = new Date();
    semanaInicio.setDate(semanaInicio.getDate() - 7);
    semanaInicio.setHours(0, 0, 0, 0);

    const ventasSemana = await Movimiento.aggregate([
      {
        $match: {
          tipo: 'venta',
          estado: 'completado',
          createdAt: { $gte: semanaInicio }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          ventas: { $sum: 1 },
          monto: { $sum: '$cantidad' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Mapear días de la semana
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const ventasSemanaFormateado = diasSemana.map((dia, index) => {
      const encontrado = ventasSemana.find(v => v._id === index + 1);
      return {
        dia,
        ventas: encontrado ? encontrado.ventas : 0,
        monto: encontrado ? encontrado.monto : 0
      };
    });

    // 4. Movimientos por tipo (últimos 7 días)
    const movimientosSemana = await Movimiento.aggregate([
      {
        $match: {
          createdAt: { $gte: semanaInicio }
        }
      },
      {
        $group: {
          _id: {
            dia: { $dayOfWeek: '$createdAt' },
            tipo: '$tipo'
          },
          total: { $sum: 1 }
        }
      },
      { $sort: { '_id.dia': 1 } }
    ]);

    const movimientosSemanaFormateado = diasSemana.map((dia, index) => {
      const diaMovimientos = movimientosSemana.filter(m => m._id.dia === index + 1);
      return {
        dia,
        ingresos: diaMovimientos.find(m => m._id.tipo === 'ingreso')?.total || 0,
        transferencias: diaMovimientos.find(m => m._id.tipo === 'transferencia')?.total || 0,
        ventas: diaMovimientos.find(m => m._id.tipo === 'venta')?.total || 0
      };
    });

    // 5. Últimos 5 movimientos
    const ultimosMovimientos = await Movimiento.find()
      .populate('producto', 'nombre')
      .populate('registradoPor', 'nombre apellido')
      .sort({ createdAt: -1 })
      .limit(5);

    const ultimosMovimientosFormateado = ultimosMovimientos.map(m => ({
      id: m._id,
      fecha: m.createdAt,
      tipo: m.tipo,
      producto: m.producto?.nombre || 'Producto eliminado',
      usuario: m.registradoPor 
        ? `${m.registradoPor.nombre} ${m.registradoPor.apellido}` 
        : 'Sistema',
      cantidad: m.cantidad,
      estado: m.estado
    }));

    // 6. Calcular tendencias (comparación con semana anterior)
    const semanaAnteriorInicio = new Date(semanaInicio);
    semanaAnteriorInicio.setDate(semanaAnteriorInicio.getDate() - 7);
    
    const ventasSemanaAnterior = await Movimiento.countDocuments({
      tipo: 'venta',
      estado: 'completado',
      createdAt: { $gte: semanaAnteriorInicio, $lt: semanaInicio }
    });

    const ventasSemanaActual = ventasSemana.reduce((sum, v) => sum + v.ventas, 0);
    
    let tendenciaVentas = 0;
    if (ventasSemanaAnterior > 0) {
      tendenciaVentas = Math.round(((ventasSemanaActual - ventasSemanaAnterior) / ventasSemanaAnterior) * 100);
    }

    console.log('✅ Dashboard generado exitosamente');

    res.json({
      exito: true,
      datos: {
        estadisticas: {
          totalProductos,
          stockTotal: stockTotal[0]?.total || 0,
          totalUsuarios,
          ventasHoy,
          transferenciasHoy,
          ingresosHoy,
          stockBajo: productosStockBajo,
          tendenciaVentas
        },
        ventasSemana: ventasSemanaFormateado,
        movimientosSemana: movimientosSemanaFormateado,
        ultimosMovimientos: ultimosMovimientosFormateado
      }
    });

  } catch (error) {
    console.error('❌ Error al generar dashboard:', error);
    res.status(500).json({
      exito: false,
      error: 'Error del servidor',
      mensaje: 'Error al generar dashboard: ' + error.message
    });
  }
};

// @desc    Obtener resumen rápido (versión ligera)
// @route   GET /api/dashboard/resumen
// @access  Privado
export const obtenerResumen = async (req, res) => {
  try {
    const [
      totalProductos,
      totalUsuarios,
      stockBajo,
      movimientosHoy
    ] = await Promise.all([
      Producto.countDocuments({ estado: 'activo' }),
      Usuario.countDocuments({ estado: 'activo' }),
      Producto.countDocuments({ estado: 'activo', stock: { $lt: 10 } }),
      Movimiento.countDocuments({
        createdAt: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
    ]);

    res.json({
      exito: true,
      datos: {
        totalProductos,
        totalUsuarios,
        stockBajo,
        movimientosHoy
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      exito: false,
      error: 'Error del servidor',
      mensaje: 'Error al obtener resumen'
    });
  }
};