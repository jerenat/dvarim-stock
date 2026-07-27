// routes/_authenticated.configuracion.jsx
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Building2, Palette, KeyRound, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/common/Card.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Input, Label } from "@/components/common/Input.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import { useAuth } from "@/context/AuthContext.jsx";
import { configuracionService } from "@/services/configuracionService";
import Loading from "@/components/ui/loading";

import {
  actualizarEmpresa,
  actualizarPassword,
  validarPassword,
  PASSWORD_INICIAL,
} from "@/utils/constants.configuracion";

export const Route = createFileRoute("/_authenticated/configuracion")({
  component: ConfiguracionPage,
});

function ConfiguracionPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const isAdmin = user?.rol === "administrador";

  // Estados
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados para cambio de contraseña
  const [passwordForm, setPasswordForm] = useState(PASSWORD_INICIAL);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const response = await configuracionService.obtenerEmpresa();
      setEmpresa(response.datos);
    } catch (error) {
      console.error("Error al cargar configuración:", error);
      toast.error("Error al cargar datos de la empresa");
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarEmpresa = async () => {
    if (!isAdmin) {
      toast.error("Solo el administrador puede modificar estos datos");
      return;
    }

    try {
      setSaving(true);
      await configuracionService.actualizarEmpresa({
        nombre: empresa.nombre,
        ruc: empresa.ruc,
        direccion: empresa.direccion,
        telefono: empresa.telefono,
        email: empresa.email,
        moneda: empresa.moneda,
      });
      toast.success("Datos de la empresa actualizados exitosamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.mensaje || "Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleCambiarPassword = async () => {
    const error = validarPassword(passwordForm);

    if (error) {
      toast.error(error);
      return;
    }

    try {
      await configuracionService.cambiarPassword(passwordForm);

      toast.success("Contraseña actualizada exitosamente");

      setPasswordForm(PASSWORD_INICIAL);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.mensaje || "Error al cambiar contraseña");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!empresa) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">No se pudo cargar la configuración</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Configuración" description="Ajustes generales del sistema" />

      <div className="space-y-6 max-w-3xl">
        {/* Datos de la empresa */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Datos de la empresa</CardTitle>
                <CardDescription>
                  Información que aparecerá en documentos y reportes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={empresa.nombre}
                  onChange={(e) => actualizarEmpresa(setEmpresa, "nombre", e.target.value)}
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <Label>CUIT</Label>
                <Input
                  value={empresa.ruc}
                  onChange={(e) => actualizarEmpresa(setEmpresa, "ruc", e.target.value)}
                  disabled={!isAdmin}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Dirección</Label>
                <Input
                  value={empresa.direccion}
                  onChange={(e) => actualizarEmpresa(setEmpresa, "direccion", e.target.value)}
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input
                  value={empresa.telefono}
                  onChange={(e) => actualizarEmpresa(setEmpresa, "telefono", e.target.value)}
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={empresa.email}
                  onChange={(e) => actualizarEmpresa(setEmpresa, "email", e.target.value)}
                  disabled={!isAdmin}
                />
              </div>
            </div>
            {isAdmin && (
              <Button onClick={handleGuardarEmpresa} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            )}
            {!isAdmin && (
              <p className="text-sm text-muted-foreground">
                Solo el administrador puede modificar estos datos
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tema */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Tema</CardTitle>
                <CardDescription>Modo claro u oscuro</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Modo {theme === "dark" ? "oscuro" : "claro"}</p>
                <p className="text-sm text-muted-foreground">
                  Cambia la apariencia de toda la aplicación
                </p>
              </div>
              <Button variant="outline" onClick={toggleTheme}>
                Cambiar a {theme === "dark" ? "claro" : "oscuro"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cambiar contraseña */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Cambiar contraseña</CardTitle>
                <CardDescription>Actualizá tu contraseña regularmente</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Contraseña actual</Label>
              <Input
                type="password"
                value={passwordForm.passwordActual}
                onChange={(e) =>
                  actualizarPassword(setPasswordForm, "passwordActual", e.target.value)
                }
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label>Nueva contraseña</Label>
              <Input
                type="password"
                value={passwordForm.passwordNueva}
                onChange={(e) =>
                  actualizarPassword(setPasswordForm, "passwordNueva", e.target.value)
                }
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <Label>Confirmar contraseña</Label>
              <Input
                type="password"
                value={passwordForm.confirmarPassword}
                onChange={(e) =>
                  actualizarPassword(setPasswordForm, "confirmarPassword", e.target.value)
                }
                placeholder="Repetí la nueva contraseña"
              />
            </div>
            <Button onClick={handleCambiarPassword}>
              <KeyRound className="h-4 w-4 mr-2" />
              Actualizar contraseña
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
