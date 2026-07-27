// -- librerias globales
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

// -- librerias locales
import { PageHeader } from "@/components/common/PageHeader.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Card } from "@/components/common/Card.jsx";
import { CategoriaModal } from "@/components/screens/categoria.modal";
import { categoriaService } from "@/services/categoriaService";

export const Route = createFileRoute("/_authenticated/categorias")({
  component: CategoriasPage,
});

function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoriaEdit, setCategoriaEdit] = useState(null);
  const [saving, setSaving] = useState(false);

  // Cargar categorías
  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const response = await categoriaService.obtenerCategorias();
      setCategorias(response.datos);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      toast.error(
        error.response?.data?.mensaje || "Error al cargar categorías",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (datos) => {
    setSaving(true);
    try {
      if (categoriaEdit) {
        await categoriaService.actualizarCategoria(categoriaEdit.id, datos);
        toast.success("Categoría actualizada");
      } else {
        await categoriaService.crearCategoria(datos);
        toast.success("Categoría creada");
      }
      setModalOpen(false);
      setCategoriaEdit(null);
      cargarCategorias();
    } catch (error) {
      toast.error(error.response?.data?.mensaje || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Está seguro de eliminar la categoría "${nombre}"?`)) return;

    try {
      await categoriaService.eliminarCategoria(id);
      toast.success("Categoría eliminada exitosamente");
      cargarCategorias(); // Recargar lista
    } catch (error) {
      toast.error(
        error.response?.data?.mensaje || "Error al eliminar categoría",
      );
    }
  };

  const openEdit = (categoria) => {
    setCategoriaEdit(categoria);
    setModalOpen(true);
  };

  const openCreate = () => {
    setCategoriaEdit(null);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Cargando categorías...</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Categorías"
        description="Organizá tus productos en categorías"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nueva categoría
          </Button>
        }
      />

      {categorias.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No hay categorías disponibles
          </p>
          <Button onClick={openCreate}>Crear primera categoría</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorias.map((c) => (
            <Card key={c.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-white font-bold text-lg"
                  style={{ backgroundColor: c.color }}
                >
                  {c.nombre.charAt(0)}
                </div>
                <div className="flex gap-1">
                  <button
                    className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => openEdit(c)}
                    title="Editar categoría"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => handleDelete(c.id, c.nombre)}
                    title="Eliminar categoría"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-1">{c.nombre}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {c.descripcion}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">Productos</span>
                <span className="text-lg font-bold">{c.productos}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* -- modal de categoria -- */}
      <CategoriaModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCategoriaEdit(null);
        }}
        onSave={handleSave}
        categoria={categoriaEdit}
        isLoading={saving}
      />
    </>
  );
}
