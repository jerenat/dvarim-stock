import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/common/Button.jsx";
import { Input, Label } from "@/components/common/Input.jsx";
import { toast } from "sonner";

export function CategoriaModal({ isOpen, onClose, onSave, categoria, isLoading }) {
  const [form, setForm] = useState({ nombre: "", descripcion: "", color: "#3b82f6" });

  useEffect(() => {
    if (categoria) {
      setForm({ nombre: categoria.nombre, descripcion: categoria.descripcion || "", color: categoria.color || "#3b82f6" });
    } else {
      setForm({ nombre: "", descripcion: "", color: "#3b82f6" });
    }
  }, [categoria, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    onSave(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {categoria ? "Editar categoría" : "Nueva categoría"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-md">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Electrónicos"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Breve descripción"
            />
          </div>

          <div>
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="color"
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-12 h-10 p-1"
              />
              <span className="text-sm text-muted-foreground">{form.color}</span>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : categoria ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}