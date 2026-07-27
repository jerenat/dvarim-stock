// -- librerias globales
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Package, Boxes, Users, ShoppingCart, ArrowLeftRight, AlertTriangle } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

// -- librerias locales
import { StatCard } from "@/components/common/StatCard.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/common/Card.jsx";
import { Badge } from "@/components/common/Badge.jsx";
import { PageHeader } from "@/components/common/PageHeader.jsx";
import { dashboardService } from "@/services/dashboardService";

// -- utils
import { formatearFechaHora } from "@/utils/date";
import { formatCurrency, formatNumber } from "@/utils/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

const tipoBadge = {
  ingreso: { variant: "success", label: "Ingreso" },
  venta: { variant: "primary", label: "Venta" },
  transferencia: { variant: "warning", label: "Transferencia" },
  ajuste: { variant: "default", label: "Ajuste" },
  devolucion: { variant: "info", label: "Devolución" },
};

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.obtenerDashboard();
      setDashboard(response.datos);
    } catch (error) {
      console.error("Error al cargar dashboard:", error);
      toast.error("Error al cargar datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Cargando dashboard...</div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">No se pudieron cargar los datos</div>
      </div>
    );
  }

  const { estadisticas, ventasSemana, movimientosSemana, ultimosMovimientos } = dashboard;

  return (
    <>
      <PageHeader title="Dashboard" description="Resumen general del sistema de gestión de stock" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
        <StatCard
          label="Total productos"
          value={formatNumber(estadisticas.totalProductos)}
          icon={Package}
          accent="primary"
        />
        <StatCard
          label="Stock total"
          value={formatNumber(estadisticas.stockTotal)}
          icon={Boxes}
          accent="success"
        />
        <StatCard
          label="Usuarios activos"
          value={estadisticas.totalUsuarios}
          icon={Users}
          accent="primary"
        />
        <StatCard
          label="Ventas hoy"
          value={estadisticas.ventasHoy}
          icon={ShoppingCart}
          accent="success"
          trend={estadisticas.tendenciaVentas > 0 ? "up" : "down"}
          trendValue={`${estadisticas.tendenciaVentas}%`}
        />
        <StatCard
          label="Transferencias hoy"
          value={estadisticas.transferenciasHoy}
          icon={ArrowLeftRight}
          accent="warning"
        />
        <StatCard
          label="Stock bajo"
          value={estadisticas.stockBajo}
          icon={AlertTriangle}
          accent="destructive"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        {/* Ventas de la semana */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Ventas de la semana</CardTitle>
              <CardDescription>Ingresos diarios en ARS</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={ventasSemana}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="dia" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Line
                  type="monotone"
                  dataKey="monto"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Movimientos por tipo */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Movimientos por tipo</CardTitle>
              <CardDescription>Últimos 7 días</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={movimientosSemana}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="dia" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="ingresos" fill="oklch(0.65 0.16 155)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="transferencias" fill="oklch(0.75 0.16 75)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ventas" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Últimos movimientos */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Últimos movimientos</CardTitle>
            <CardDescription>Actividad reciente en el sistema</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-border bg-muted/30">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">
                    Cantidad
                  </th>
                </tr>
              </thead>
              <tbody>
                {ultimosMovimientos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No hay movimientos registrados
                    </td>
                  </tr>
                ) : (
                  ultimosMovimientos.map((m) => (
                    <tr key={m.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-6 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {formatearFechaHora(m.fecha)}
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={tipoBadge[m.tipo]?.variant || "default"}>
                          {tipoBadge[m.tipo]?.label || m.tipo}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 font-medium">{m.producto}</td>
                      <td className="px-6 py-3 text-muted-foreground">{m.usuario}</td>
                      <td className="px-6 py-3 text-right font-semibold">{m.cantidad}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
