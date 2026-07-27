// -- librerias globales
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

// -- librerias locales
import { PageHeader } from "@/components/common/PageHeader.jsx";
import { Card } from "@/components/common/Card.jsx";
import { Input, Select } from "@/components/common/Input.jsx";
import { Badge } from "@/components/common/Badge.jsx";
import { Button } from "@/components/common/Button.jsx";
import { movimientoService } from "@/services/movimientoService";
import { DataTable } from "@/components/common/DataTable";
import { formatearFecha } from "@/utils/date";

export const Route = createFileRoute("/_authenticated/movimientos")({
  component: MovimientosPage,
});

const tipoBadge = {
  ingreso: { variant: "success", label: "Ingreso" },
  venta: { variant: "primary", label: "Venta" },
  transferencia: { variant: "warning", label: "Transferencia" },
  ajuste: { variant: "default", label: "Ajuste" },
  devolucion: { variant: "info", label: "Devolución" },
};

const PAGE_SIZE = 20;

function MovimientosPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [estado, setEstado] = useState("todos");

  useEffect(() => {
    cargarMovimientos();
  }, [q, tipo, estado, pagina]);

  const cargarMovimientos = async () => {
    try {
      setLoading(true);

      const params = {
        q,
        tipo,
        estado,
        pagina,
        limite: PAGE_SIZE,
      };

      const response = await movimientoService.obtenerMovimientos(params);
      setMovimientos(response.datos);
      setTotal(response.total);
    } catch (error) {
      console.error("Error al cargar movimientos:", error);
      toast.error("Error al cargar movimientos");
    } finally {
      setLoading(false);
    }
  };

  const totalPaginas = Math.ceil(total / PAGE_SIZE);

  const columns = useMemo(() => [
    {
      key: "fecha",
      header: "Fecha",
      render: (m) => formatearFecha(m.fecha),
    },
    {
      key: "tipo",
      header: "Tipo",
      render: (m) => (
        <Badge variant={tipoBadge[m.tipo]?.variant || "default"}>
          {tipoBadge[m.tipo]?.label || m.tipo}
        </Badge>
      ),
    },
    {
      key: "producto",
      header: "Producto",
      className: "font-medium",
    },
    {
      key: "origen",
      header: "Origen",
      className: "text-muted-foreground text-xs",
    },
    {
      key: "destino",
      header: "Destino",
      className: "text-muted-foreground text-xs",
    },
    {
      key: "cantidad",
      header: "Cantidad",
      className: "text-right font-semibold",
    },
    {
      key: "usuario",
      header: "Usuario",
      className: "text-muted-foreground text-xs",
    },
    {
      key: "estado",
      header: "Estado",
      render: (m) => (
        <Badge
          variant={
            m.estado === "completado" ? "success" : m.estado === "pendiente" ? "warning" : "default"
          }
        >
          {m.estado}
        </Badge>
      ),
    },
  ]);

  return (
    <>
      <PageHeader title="Movimientos" description="Historial completo de operaciones del sistema" />

      {/* Filtros */}
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar producto o usuario..."
              className="pl-10"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPagina(1);
              }}
            />
          </div>
          <Select
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value);
              setPagina(1);
            }}
          >
            <option value="todos">Todos los tipos</option>
            <option value="ingreso">Ingreso</option>
            <option value="venta">Venta</option>
            <option value="transferencia">Transferencia</option>
            <option value="ajuste">Ajuste</option>
            <option value="devolucion">Devolución</option>
          </Select>
          <Select
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setPagina(1);
            }}
          >
            <option value="todos">Todos los estados</option>
            <option value="completado">Completado</option>
            <option value="pendiente">Pendiente</option>
            <option value="cancelado">Cancelado</option>
          </Select>
        </div>
      </Card>

      {/* Tabla de movimientos */}
      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Cargando movimientos...</div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={movimientos}
            emptyMessage="No se encontraron movimientos"
          />

          {/* Paginación */}
          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Mostrando {(pagina - 1) * PAGE_SIZE + 1} - {Math.min(pagina * PAGE_SIZE, total)} de{" "}
                {total} movimientos
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
