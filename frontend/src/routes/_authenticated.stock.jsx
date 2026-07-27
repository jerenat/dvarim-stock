// routes/_authenticated.stock.jsx
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Search, Users, Warehouse } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader.jsx";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card.jsx";
import { DataTable } from "@/components/common/DataTable";
import { Input } from "@/components/common/Input.jsx";
import { Badge } from "@/components/common/Badge.jsx";
import { stockService } from "@/services/stockService";

export const Route = createFileRoute("/_authenticated/stock")({
  component: StockPage,
});

function StockPage() {
  const [tab, setTab] = useState("general");
  const [q, setQ] = useState("");
  const [productos, setProductos] = useState([]);
  const [usuariosStock, setUsuariosStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [tab, q]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      if (tab === "general") {
        const response = await stockService.obtenerStockGeneral({ q });
        setProductos(response.datos);
      } else {
        const response = await stockService.obtenerStockPorUsuarios({ q });
        setUsuariosStock(response.datos);
      }
    } catch (error) {
      console.error("Error al cargar stock:", error);
      toast.error(error.response?.data?.mensaje || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setQ(e.target.value);
  };

  const getStockBadge = (stock) => {
    if (stock < 10) return <Badge variant="destructive">Bajo</Badge>;
    if (stock < 30) return <Badge variant="warning">Medio</Badge>;
    return <Badge variant="success">Óptimo</Badge>;
  };

  const columns = useMemo(() => [
    {
      key: "producto",
      header: "Producto",
      render: (p) => (
        <div className="flex items-center gap-3">
          <span className="text-lg">{p.imagen}</span>
          <span className="font-medium">{p.nombre}</span>
        </div>
      ),
    },
    {
      key: "codigo",
      header: "Código",
    },
    {
      key: "categoria",
      header: "Categoría",
    },
    {
      key: "stock",
      header: "Stock",
      className: "text-right",
      render: (p) => <span className="font-semibold text-lg">{p.stock}</span>,
    },
    {
      key: "estado",
      header: "Estado",
      render: (p) => getStockBadge(p.stock),
    },
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Cargando stock...</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Stock" description="Visualizá el stock general y por usuario" />

      <div className="flex gap-2 mb-4 border-b border-border">
        <button
          onClick={() => setTab("general")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "general"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Warehouse className="inline h-4 w-4 mr-1.5" /> Stock general
        </button>
        <button
          onClick={() => setTab("usuario")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "usuario"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="inline h-4 w-4 mr-1.5" /> Stock por usuario
        </button>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar producto..."
          className="pl-10"
          value={q}
          onChange={handleSearch}
        />
      </div>

      {tab === "general" ? (
        <DataTable columns={columns} data={productos} emptyMessage="No se encontraron productos" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {usuariosStock.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No se encontraron usuarios con stock
            </div>
          ) : (
            usuariosStock.map((u) => (
              <Card key={u.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                      {u.avatar}
                    </div>
                    <div>
                      <CardTitle>
                        {u.nombre} {u.apellido}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {u.totalProductos} productos asignados • Stock total: {u.stockAsignado}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {u.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Sin productos asignados
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {u.items.map((item) => (
                        <li
                          key={item.productoId}
                          className="flex items-center justify-between py-2 border-b border-border last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <span>{item.imagen}</span>
                            <span className="text-sm font-medium">{item.nombre}</span>
                          </div>
                          <span className="text-sm font-semibold">{item.cantidad}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </>
  );
}
