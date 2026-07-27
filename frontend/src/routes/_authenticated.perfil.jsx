// routes/_authenticated/perfil.jsx
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Mail, Shield, Calendar, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/common/Card.jsx";
import { Badge } from "@/components/common/Badge.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Input, Label } from "@/components/common/Input.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { useAuth } from "@/context/AuthContext.jsx";
import { usuarioService } from "@/services/usuarioService.js";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    rol: "usuario",
  });

  const esAdmin = user?.rol === "administrador";

  useEffect(() => {
    const cargar = async () => {
      try {
        const { datos } = await usuarioService.obtenerPerfil();
        setForm({
          nombre: datos.nombre || "",
          apellido: datos.apellido || "",
          email: datos.email || "",
          rol: datos.rol || "usuario",
        });
      } catch (error) {
        toast.error("Error al cargar perfil");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Solo enviar email y rol si es admin
      const datosEnviar = {
        nombre: form.nombre,
        apellido: form.apellido,
      };

      if (esAdmin) {
        datosEnviar.email = form.email;
        datosEnviar.rol = form.rol;
      }

      const { datos } = await usuarioService.actualizarPerfil(datosEnviar);
      setUser(datos);
      toast.success("Perfil actualizado");
    } catch (error) {
      toast.error(error.response?.data?.mensaje || "Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const avatar = `${form.nombre?.charAt(0) || "U"}`;

  return (
    <>
      <PageHeader
        title="Mi perfil"
        description="Información personal y preferencias"
      />
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl"
      >
        <Card className="p-6 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground text-3xl font-bold mb-4">
            {avatar}
          </div>
          <h3 className="text-xl font-semibold">
            {form.nombre} {form.apellido}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">{form.email}</p>
          <Badge variant={form.rol === "administrador" ? "primary" : "outline"}>
            <Shield className="h-3 w-3" />{" "}
            {form.rol === "administrador" ? "Administrador" : "Usuario"}
          </Badge>
          <div className="mt-6 space-y-2 text-left text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" /> {form.email}
            </div>
          </div>
          {esAdmin && (
            <div className="mt-4 p-2 bg-primary/10 rounded text-xs text-primary">
              🔑 Tienes permisos de administrador
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Información personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email - editable solo para admin */}
              <div className="sm:col-span-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={!esAdmin}
                  className={!esAdmin ? "bg-muted" : ""}
                />
                {!esAdmin && (
                  <p className="text-xs text-muted-foreground mt-1">
                    El correo solo puede ser modificado por administradores
                  </p>
                )}
              </div>

              {/* Rol - editable solo para admin */}
              <div className="sm:col-span-2">
                <Label htmlFor="rol">Rol</Label>
                {esAdmin ? (
                  <Select
                    value={form.rol}
                    onValueChange={(value) => setForm({ ...form, rol: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usuario">Usuario</SelectItem>
                      <SelectItem value="administrador">
                        Administrador
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="rol"
                    value={
                      form.rol === "administrador" ? "Administrador" : "Usuario"
                    }
                    disabled
                    className="bg-muted"
                  />
                )}
              </div>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </>
  );
}
