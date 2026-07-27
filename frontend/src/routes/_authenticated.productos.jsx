// -- librerias globales
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

// -- librerias locales

// -- componentes
import { PageHeader } from "@/components/common/PageHeader.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Input, Select } from "@/components/common/Input.jsx";
import { Badge } from "@/components/common/Badge.jsx";
import { Card } from "@/components/common/Card.jsx";

// -- service
import { productoService } from "@/services/productoService";

// -- utils
import { formatCurrency } from "@/utils/format";

export const Route = createFileRoute("/_authenticated/productos")({
  component: ProductosPage,
});

const PAGE_SIZE = 12;

function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("todas");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();



  // Cargar productos y categorías
  useEffect(() => {
    cargarDatos();
  }, [q, cat, page]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const params = {
        q,
        categoria: cat,
        pagina: page,
        limite: PAGE_SIZE,
      };

      const [productosRes, categoriasRes] = await Promise.all([
        productoService.obtenerProductos(params),
        productoService.obtenerCategorias(),
      ]);

      setProductos(productosRes.datos);
      setTotal(productosRes.total);
      setCategorias(categoriasRes.datos);
    } catch (error) {
      toast.error(error.response?.data?.mensaje || "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    console.log("1. Iniciando eliminación:", id, nombre);

    // Usar window.confirm explícitamente
    const confirmar = window.confirm(`¿Está seguro de eliminar "${nombre}"?`);

    console.log("2. Resultado confirm:", confirmar);

    if (!confirmar) {
      console.log("3. Usuario canceló");
      return;
    }

    console.log("4. Procediendo a eliminar...");

    try {
      console.log("5. Llamando API...");
      const response = await productoService.eliminarProducto(id);
      console.log("6. Respuesta:", response);
      toast.success("Producto eliminado exitosamente");
      cargarDatos();
    } catch (error) {
      console.error("7. Error:", error);
      toast.error(
        error.response?.data?.mensaje || "Error al eliminar producto",
      );
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      {/* -- HEADER -- */}
      <PageHeader
        title="Productos"
        description="Gestión completa del catálogo de productos"
        actions={
          <Button onClick={() => navigate({to: "/nuevo-producto"})}>
            <Plus className="h-4 w-4" /> Nuevo producto
          </Button>
        }
      />

      {/* -- SUB CUERPO Y BUSCADOR -- */}
      <Card className="p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o código..."
              className="pl-10"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={cat}
            onChange={(e) => {
              setCat(e.target.value);
              setPage(1);
            }}
            className="sm:w-56"
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* -- CUERPO -- */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Cargando productos...
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                      Producto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                      Código
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                      Categoría
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">
                      Precio
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg">
                            {p.imagen}
                          </div>
                          <span className="font-medium">{p.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {p.codigo}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.categoria}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatCurrency(p.precio)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={
                            p.stock < 10
                              ? "text-destructive font-semibold"
                              : "font-medium"
                          }
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            p.estado === "activo" ? "success" : "default"
                          }
                        >
                          {p.estado}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Editar"
                            onClick={() => navigate({ to: `/editar-producto/${p.id}` })}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Eliminar"
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
              <p className="text-muted-foreground">
                Mostrando{" "}
                {productos.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}–
                {Math.min(page * PAGE_SIZE, total)} de {total}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm font-medium">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

    </>
  );
}
