// -- librerias globales
import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Warehouse, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

// -- librerias locales
import { APP_NAME } from "../utils/constants";
import { useAuth } from "@/context/AuthContext.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Input, Label } from "@/components/common/Input.jsx";

// -- image & logo
import LoginBackground from "@/assets/login_background.jpeg"; // imagen de background
import Logo from "@/assets/logo.svg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: `Iniciar Sesion - ${APP_NAME.title}` },
      {
        name: "description",
        content: "Ingresa a tu panel de gestión de stock.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@dvarim.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Sesión iniciada correctamente");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">

      {/* -- SECCION IZQUIERDA - PRESENTACION & LOGO -- */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden text-primary-foreground">
        {/* Imagen de fondo */}
        <img
          src={LoginBackground}
          alt=""
          className="absolute inset-0 h-full w-full object-cover blur-sm scale-100"
        />

        {/* Overlay azul */}
        <div className="absolute inset-0 bg-primary/70" />

        {/* Luces */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-white blur-3xl" />
        </div>

        {/* Contenido */}
        <div className="relative flex items-center gap-2 font-semibold text-lg text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg backdrop-blur">
            <img src={Logo} alt="DVARIM" className="h-8 w-8" />
          </div>
          {APP_NAME.title}
        </div>

        <div className="relative space-y-4 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight leading-tight text-white">
            Gestioná tu inventario con precisión profesional
          </h1>
          <p className="text-lg text-primary-foreground/80 text-white">
            Control total de stock, transferencias y ventas en una plataforma
            moderna.
          </p>
        </div>

        <div className="relative text-sm text-primary-foreground/70 text-white">
          © 2026 {APP_NAME.title} - Todos los derechos reservados.
        </div>
      </div>

      {/* -- LOGIN O INCIO DE SESIÓN -- */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div>

            <div className="my-10 flex flex-col items-center justify-center gap-10">
              <img src={Logo} alt="DVARIM" className="h-32 w-32" />
              <div className="flex flex-col justify-center items-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Iniciar sesión
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Ingresá tus credenciales para acceder al sistema
              </p>
              </div>
            </div>

          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@dvarim.com"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Ingresar"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
