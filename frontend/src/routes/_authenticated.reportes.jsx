// routes/_authenticated.reportes.jsx
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  FileText,
  FileSpreadsheet,
  TrendingUp,
  AlertTriangle,
  Users,
  Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/common/Card.jsx";
import { DataTable } from "@/components/common/DataTable";
import { StatCard } from "@/components/common/StatCard";

// -- services
import { reporteService } from "@/services/reporteService";

// -- utils
import { REPORTES, stockBajoColumns, movimientosColumns } from "@/utils/constants.reportes";

export const Route = createFileRoute("/_authenticated/reportes")({
  component: ReportesPage,
});

function ReportesPage() {
  const [reportes, setReportes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seccionActiva, setSeccionActiva] = useState(null);

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    try {
      setLoading(true);
      const response = await reporteService.obtenerReportes();
      setReportes(response.datos);
    } catch (error) {
      console.error("Error al cargar reportes:", error);
      toast.error("Error al cargar reportes");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Cargando reportes...</div>
      </div>
    );
  }

  if (!reportes) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">No hay datos disponibles</div>
      </div>
    );
  }

  const { resumen, stockBajo, masVendidos, stockPorUsuario, movimientos } = reportes;

  return (
    <>
      <PageHeader title="Reportes" description="Análisis e informes detallados" />

      {/* Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total productos"
          value={resumen.totalProductos}
          icon={FileSpreadsheet}
          accent="primary"
        />

        <StatCard
          label="Usuarios activos"
          value={resumen.totalUsuarios}
          icon={Users}
          accent="success"
        />

        <StatCard
          label="Stock bajo"
          value={resumen.productosBajos}
          icon={AlertTriangle}
          accent="destructive"
        />

        <StatCard
          label="Movimientos"
          value={resumen.totalMovimientos}
          icon={TrendingUp}
          accent="warning"
        />
      </div>

      {/* Secciones de reportes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {REPORTES.map((r) => (
          <Card
            key={r.id}
            className="p-5 cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setSeccionActiva(seccionActiva === r.id ? null : r.id)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
              <r.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold mb-1">{r.label}</h3>
            <p className="text-xs text-muted-foreground">{r.desc}</p>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Productos más vendidos */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Productos más vendidos</CardTitle>
              <CardDescription>Top 5 del período</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {masVendidos.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay datos disponibles</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={masVendidos} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <YAxis
                    dataKey="nombre"
                    type="category"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    width={140}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="vendidos" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Stock por usuario */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Stock por usuario</CardTitle>
              <CardDescription>Cantidad total asignada</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {stockPorUsuario.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay datos disponibles</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stockPorUsuario}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="nombre"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="stock" fill="oklch(0.65 0.16 155)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Productos con stock bajo */}
      <Card className="mb-6">
        <CardHeader>
          <div>
            <CardTitle>Productos con stock bajo</CardTitle>
            <CardDescription>Requieren reabastecimiento (menos de 10 unidades)</CardDescription>
          </div>
        </CardHeader>
        <DataTable
          columns={stockBajoColumns}
          data={stockBajo}
          emptyMessage="¡Excelente! No hay productos con stock bajo"
        />
      </Card>

      {/* Últimos movimientos */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Últimos movimientos</CardTitle>
            <CardDescription>Historial reciente de operaciones</CardDescription>
          </div>
        </CardHeader>
        <DataTable
          columns={movimientosColumns}
          data={movimientos.slice(0, 10)}
          emptyMessage="No hay movimientos registrados"
        />
      </Card>
    </>
  );
}
