// -- librerias globales
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ShoppingCart, Package } from "lucide-react";
import { toast } from "sonner";

// -- librerias locales
import { PageHeader } from "@/components/common/PageHeader.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/common/Card.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Input, Label, Select, Textarea } from "@/components/common/Input.jsx";
import { Badge } from "@/components/common/Badge.jsx";
import { ventaService } from "@/services/ventaService";

import { formatNumber } from "@/utils/format";
import { formatearFecha } from "@/utils/date";

export const Route = createFileRoute("/_authenticated/ventas")({
  component: VentasPage,
});

function VentasPage() {
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    producto: "",
    cantidad: "",
    cliente: "",
    observaciones: "",
  });
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [productosRes, ventasRes] = await Promise.all([
        ventaService.obtenerProductosDisponibles(),
        ventaService.obtenerVentas({ limite: 5 }),
      ]);
      setProductos(productosRes.datos);
      setVentas(ventasRes.datos);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleProductoChange = (productoId) => {
    setForm({ ...form, producto: productoId });
    const producto = productos.find((p) => p.id === productoId);
    setProductoSeleccionado(producto || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.producto || !form.cantidad) {
      toast.error("Producto y cantidad son requeridos");
      return;
    }

    const cantidad = parseInt(form.cantidad);
    if (cantidad <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    if (productoSeleccionado && cantidad > productoSeleccionado.stockDisponible) {
      toast.error(`Stock insuficiente. Disponible: ${productoSeleccionado.stockDisponible}`);
      return;
    }

    setSubmitting(true);

    try {
      const response = await ventaService.registrarVenta({
        producto: form.producto,
        cantidad: cantidad,
        cliente: form.cliente,
        observaciones: form.observaciones,
      });

      toast.success(response.mensaje || "Venta registrada correctamente");

      // Limpiar formulario
      setForm({ producto: "", cantidad: "", cliente: "", observaciones: "" });
      setProductoSeleccionado(null);

      // Recargar datos
      cargarDatos();
    } catch (error) {
      console.error("Error al registrar venta:", error);
      toast.error(error.response?.data?.mensaje || "Error al registrar venta");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Ventas" description="Registrá ventas que descuentan tu stock personal" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de venta */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Nueva venta</CardTitle>
                <CardDescription>
                  Se descontará del stock del usuario que registra la venta
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Producto *</Label>
                  <Select
                    value={form.producto}
                    onChange={(e) => handleProductoChange(e.target.value)}
                  >
                    <option value="">Seleccioná un producto</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} (Stock: {p.stockDisponible})
                      </option>
                    ))}
                  </Select>
                  {productoSeleccionado && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="text-lg">{productoSeleccionado.imagen}</span>
                      <div>
                        <p className="text-muted-foreground">
                          Stock disponible:{" "}
                          <span className="font-semibold text-foreground">
                            {productoSeleccionado.stockDisponible}
                          </span>
                        </p>
                        <p className="text-muted-foreground">
                          Precio unitario:{" "}
                          <span className="font-semibold text-foreground">
                            {formatNumber(productoSeleccionado.precio)}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                  {productos.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      No tenés productos con stock disponible. Solicitá una transferencia al
                      administrador.
                    </p>
                  )}
                </div>

                <div>
                  <Label>Cantidad *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.cantidad}
                    onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label>Cliente (opcional)</Label>
                  <Input
                    value={form.cliente}
                    onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                    placeholder="Nombre del cliente"
                  />
                </div>

                <div>
                  <Label>Observaciones</Label>
                  <Textarea
                    value={form.observaciones}
                    onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                    placeholder="Notas adicionales..."
                  />
                </div>

                <Button type="submit" size="lg" disabled={submitting || productos.length === 0}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {submitting ? "Registrando..." : "Registrar venta"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Últimas ventas */}
        <Card className="h-fit">
          <CardHeader>
            <div>
              <CardTitle>Últimas ventas</CardTitle>
              <CardDescription>Tu historial reciente</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {ventas.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">
                No hay ventas registradas
              </p>
            ) : (
              <div className="space-y-3">
                {ventas.slice(0, 5).map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg shrink-0">{v.imagen}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{v.producto}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatearFecha(v.fecha)} • {v.cantidad} unid.
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">{formatNumber(v.total)}</p>
                      <Badge variant="success" className="text-xs">
                        Completado
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
