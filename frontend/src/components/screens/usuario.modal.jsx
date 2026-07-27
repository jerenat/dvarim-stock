// src/components/usuarios/UsuarioModal.jsx
import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/common/Button.jsx";
import { Input, Label } from "@/components/common/Input.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { toast } from "sonner";

export function UsuarioModal({ isOpen, onClose, onSave, usuario, isLoading }) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    rol: "usuario",
  });

  useEffect(() => {
    if (usuario) {
      setForm({
        nombre: usuario.nombre || "",
        apellido: usuario.apellido || "",
        email: usuario.email || "",
        password: "",
        rol: usuario.rol || "usuario",
      });
    } else {
      setForm({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        rol: "usuario",
      });
    }
  }, [usuario, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.email) {
      toast.error("Nombre, apellido y email son requeridos");
      return;
    }
    if (!usuario && !form.password) {
      toast.error("La contraseña es requerida");
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
            {usuario ? "Editar usuario" : "Nuevo usuario"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-md">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="apellido">Apellido *</Label>
              <Input
                id="apellido"
                value={form.apellido}
                onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {!usuario && (
            <div>
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
          )}

          <div>
            <Label>Rol</Label>
            <Select
              value={form.rol}
              onValueChange={(value) => setForm({ ...form, rol: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usuario">Usuario</SelectItem>
                <SelectItem value="administrador">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : usuario ? (
                "Actualizar"
              ) : (
                "Crear"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
