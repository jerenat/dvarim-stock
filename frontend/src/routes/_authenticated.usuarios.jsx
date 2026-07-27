// routes/_authenticated.usuarios.jsx
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, UserX, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Badge } from "@/components/common/Badge.jsx";
import { DataTable } from "@/components/common/DataTable.jsx";
import { usuarioService } from "@/services/usuarioService";
import { useAuth } from "@/context/AuthContext";
import { UsuarioModal } from "@/components/screens/usuario.modal";

export const Route = createFileRoute("/_authenticated/usuarios")({
  component: UsuariosPage,
});

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await usuarioService.obtenerUsuarios();
      setUsuarios(response.datos);
    } catch (error) {
      toast.error(error.response?.data?.mensaje || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (datos) => {
    setSaving(true);
    try {
      if (usuarioEdit) {
        await usuarioService.actualizarUsuario(usuarioEdit._id, datos);
        toast.success("Usuario actualizado");
      } else {
        await usuarioService.crearUsuario(datos);
        toast.success("Usuario creado");
      }
      setModalOpen(false);
      setUsuarioEdit(null);
      cargarUsuarios();
    } catch (error) {
      toast.error(error.response?.data?.mensaje || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (id === user?._id) {
      toast.error("No puedes eliminar tu propio usuario");
      return;
    }
    if (!confirm(`¿Eliminar al usuario "${nombre}"?`)) return;
    try {
      await usuarioService.eliminarUsuario(id);
      toast.success("Usuario eliminado");
      cargarUsuarios();
    } catch (error) {
      toast.error(error.response?.data?.mensaje || "Error al eliminar");
    }
  };

  const handleToggleEstado = async (id, estadoActual, nombre) => {
    const nuevoEstado = !estadoActual;
    if (!confirm(`¿${nuevoEstado ? "Activar" : "Desactivar"} al usuario "${nombre}"?`)) return;
    try {
      await usuarioService.cambiarEstadoUsuario(id, nuevoEstado);
      toast.success(`Usuario ${nuevoEstado ? "activado" : "desactivado"}`);
      cargarUsuarios();
    } catch (error) {
      toast.error(error.response?.data?.mensaje || "Error al cambiar estado");
    }
  };

  const columns = [
    {
      key: "usuario",
      header: "Usuario",
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {u.avatar || `${u.nombre?.[0] || "U"}`}
          </div>
          <div>
            <p className="font-medium">{u.nombre} {u.apellido}</p>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "rol",
      header: "Rol",
      render: (u) => (
        <Badge variant={u.rol === "administrador" ? "primary" : "outline"}>
          {u.rol === "administrador" ? "Administrador" : "Usuario"}
        </Badge>
      ),
    },
    {
      key: "stockAsignado",
      header: "Stock asignado",
      className: "text-right",
      render: (u) => <span className="font-semibold">{u.stockAsignado || 0}</span>,
    },
    {
      key: "estado",
      header: "Estado",
      render: (u) => (
        <Badge variant={u.estado === "activo" ? "success" : "default"}>
          {u.estado === "activo" ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      className: "text-right",
      render: (u) => (
        <div className="flex justify-end gap-1">
          {u._id !== user?._id && (
            <button
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => handleToggleEstado(u._id, u.estado === "activo", `${u.nombre} ${u.apellido}`)}
              title={u.estado === "activo" ? "Desactivar" : "Activar"}
            >
              {u.estado === "activo" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
            </button>
          )}
          <button
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => { setUsuarioEdit(u); setModalOpen(true); }}
            title="Editar"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          {u._id !== user?._id && (
            <button
              className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              onClick={() => handleDelete(u._id, `${u.nombre} ${u.apellido}`)}
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Usuarios"
        actions={
          <Button onClick={() => { setUsuarioEdit(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4" /> Nuevo usuario
          </Button>
        }
      />
      <DataTable columns={columns} data={usuarios} />

      <UsuarioModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setUsuarioEdit(null); }}
        onSave={handleSave}
        usuario={usuarioEdit}
        isLoading={saving}
      />
    </>
  );
}