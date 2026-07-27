// routes/_authenticated.editar-producto.$id.jsx
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Card, CardContent } from "@/components/common/Card.jsx";
import { Input, Label, Select, Textarea } from "@/components/common/Input.jsx";
import { productoService } from "@/services/productoService";

export const Route = createFileRoute("/_authenticated/editar-producto/$id")({
  component: EditarProductoPage,
});

function EditarProductoPage() {
  const { id } = useParams({ from: "/_authenticated/editar-producto/$id" });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    categoria: "",
    precio: "",
    stock: "",
    imagen: "📦",
    descripcion: "",
  });

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoadingData(true);
      const [productoRes, categoriasRes] = await Promise.all([
        productoService.obtenerProducto(id),
        productoService.obtenerCategorias(),
      ]);

      const p = productoRes.datos;
      setForm({
        codigo: p.codigo || "",
        nombre: p.nombre || "",
        categoria: p.categoria?._id || p.categoria || "",
        precio: p.precio?.toString() || "",
        stock: p.stock?.toString() || "",
        imagen: p.imagen || "📦",
        descripcion: p.descripcion || "",
      });
      setCategorias(categoriasRes.datos || []);
    } catch (error) {
      console.error("Error al cargar:", error);
      toast.error("Error al cargar producto");
      navigate({ to: "/productos" });
    } finally {
      setLoadingData(false);
    }
  };

  // ✅ Manejador genérico para todos los campos incluyendo select
  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  // ✅ Manejador específico para Select si es necesario
  const handleSelectChange = (value) => {
    setForm((prev) => ({ ...prev, categoria: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Validar que todos los campos requeridos estén llenos
    if (!form.codigo || !form.nombre || !form.categoria || !form.precio || !form.stock) {
      toast.error("Todos los campos son requeridos");
      return;
    }

    setLoading(true);
    try {
      await productoService.actualizarProducto(id, {
        codigo: form.codigo,
        nombre: form.nombre,
        categoria: form.categoria,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock),
        imagen: form.imagen || "📦",
        descripcion: form.descripcion || "",
      });
      toast.success("Producto actualizado exitosamente");
      navigate({ to: "/productos" });
    } catch (error) {
      console.error("Error al actualizar:", error);
      toast.error(error.response?.data?.mensaje || "Error al actualizar producto");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Editar producto"
        description={`Editando: ${form.nombre}`}
        actions={
          <Button variant="outline" onClick={() => navigate({ to: "/productos" })}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  value={form.codigo}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoría *</Label>
                <select
                  id="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id || c._id} value={c.id || c._id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="precio">Precio *</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  value={form.precio}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="imagen">Ícono</Label>
                <Input
                  id="imagen"
                  value={form.imagen}
                  onChange={handleChange}
                  placeholder="📦"
                  maxLength={2}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <textarea
                id="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/productos" })}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                  
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Actualizar producto
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}