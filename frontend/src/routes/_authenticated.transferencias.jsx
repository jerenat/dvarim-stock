// -- librerias globales
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeftRight, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// -- librerias locales
import { PageHeader } from "@/components/common/PageHeader.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/common/Card.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Input, Label, Select, Textarea } from "@/components/common/Input.jsx";
import { Badge } from "@/components/common/Badge.jsx";

// -- services
import { transferenciaService } from "@/services/transferenciaService";

// -- utils
import { formatearFecha } from "@/utils/date";

export const Route = createFileRoute("/_authenticated/transferencias")({
  component: TransferenciasPage,
});

function TransferenciasPage() {
  const [form, setForm] = useState({
    usuario: "",
    producto: "",
    cantidad: "",
    observaciones: "",
  });
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [transferencias, setTransferencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [usuariosRes, productosRes, transferenciasRes] = await Promise.all([
        transferenciaService.obtenerUsuarios(),
        transferenciaService.obtenerProductos(),
        transferenciaService.obtenerHistorial(),
      ]);

      setUsuarios(usuariosRes.datos);
      setProductos(productosRes.datos);
      setTransferencias(transferenciasRes.datos);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar datos");
    }
  };

  const handleProductoChange = (productoId) => {
    setForm({ ...form, producto: productoId });
    const producto = productos.find((p) => p.id === productoId);
    setProductoSeleccionado(producto || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.usuario || !form.producto || !form.cantidad) {
      toast.error("Complete todos los campos requeridos");
      return;
    }

    const cantidad = parseInt(form.cantidad);
    if (cantidad <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    if (productoSeleccionado && cantidad > productoSeleccionado.stock) {
      toast.error(`Stock insuficiente. Disponible: ${productoSeleccionado.stock}`);
      return;
    }

    setLoading(true);

    try {
      await transferenciaService.crearTransferencia({
        usuario: form.usuario,
        producto: form.producto,
        cantidad: cantidad,
        observaciones: form.observaciones,
      });

      toast.success("Transferencia registrada correctamente");

      // Limpiar formulario
      setForm({ usuario: "", producto: "", cantidad: "", observaciones: "" });
      setProductoSeleccionado(null);

      // Recargar datos
      cargarDatos();
    } catch (error) {
      console.error("Error en transferencia:", error);
      toast.error(error.response?.data?.mensaje || "Error al realizar la transferencia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Transferencias"
        description="Transferí productos desde el stock general hacia usuarios"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Formulario de transferencia */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Nueva transferencia</CardTitle>
                <CardDescription>Reparte stock del administrador hacia un usuario</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Usuario destino *</Label>
                  <Select
                    value={form.usuario}
                    onChange={(e) => setForm({ ...form, usuario: e.target.value })}
                  >
                    <option value="">Seleccioná un usuario</option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombreCompleto} — {u.email}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label>Producto *</Label>
                  <Select
                    value={form.producto}
                    onChange={(e) => handleProductoChange(e.target.value)}
                  >
                    <option value="">Seleccioná un producto</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} (Stock: {p.stock})
                      </option>
                    ))}
                  </Select>
                  {productoSeleccionado && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span>{productoSeleccionado.imagen}</span>
                      <span className="text-muted-foreground">
                        Stock disponible:
                        <span className="font-semibold text-foreground ml-1">
                          {productoSeleccionado.stock}
                        </span>
                      </span>
                      {productoSeleccionado.stock < 10 && (
                        <Badge variant="destructive" className="ml-2">
                          Stock bajo
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Cantidad *</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="0"
                    value={form.cantidad}
                    onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Observaciones</Label>
                  <Textarea
                    placeholder="Notas adicionales (opcional)"
                    value={form.observaciones}
                    onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
                  {loading ? (
                    <>Procesando...</>
                  ) : (
                    <>
                      <Check className="h-4 w-4" /> Confirmar transferencia
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Historial de transferencias */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Historial de transferencias</CardTitle>
                <CardDescription>Últimas transferencias realizadas</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {transferencias.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No hay transferencias registradas
                </p>
              ) : (
                <div className="space-y-3">
                  {transferencias.slice(0, 10).map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{t.imagen}</span>
                        <div>
                          <p className="text-sm font-medium">{t.producto}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.destino} ← {t.cantidad} unidades
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={t.estado === "completado" ? "success" : "warning"}>
                          {t.estado}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatearFecha(t.fecha)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
