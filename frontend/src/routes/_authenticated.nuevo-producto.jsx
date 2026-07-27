// routes/_authenticated.nuevo-producto.jsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Card, CardContent } from "@/components/common/Card.jsx";
import { Input, Label, Select, Textarea } from "@/components/common/Input.jsx";
import { BarcodeScanner } from "@/components/common/BarCodeScanner"; // Escaner de codigo de Barras
import { productoService } from "@/services/productoService";
import { formatCurrency } from "@/utils/format";

import { EMOJIS_COMUNES } from "@/utils/constants";

export const Route = createFileRoute("/_authenticated/nuevo-producto")({
  component: NuevoProductoPage,
});

function NuevoProductoPage() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    categoria: "",
    precio: "",
    stock: "0",
    imagen: "📦",
    descripcion: "",
  });

  // Cargar categorías
  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const response = await productoService.obtenerCategorias();
      setCategorias(response.datos);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      toast.error("Error al cargar categorías");
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Limpiar error
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validar = () => {
    const newErrors = {};

    if (!form.codigo.trim()) {
      newErrors.codigo = "El código es requerido";
    } else if (form.codigo.length < 3) {
      newErrors.codigo = "Mínimo 3 caracteres";
    }

    if (!form.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!form.categoria) {
      newErrors.categoria = "Seleccione una categoría";
    }

    if (!form.precio || parseFloat(form.precio) <= 0) {
      newErrors.precio = "Ingrese un precio válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validar()) {
      toast.error("Complete los campos requeridos");
      return;
    }

    setLoading(true);

    try {
      const data = {
        codigo: form.codigo.toUpperCase().trim(),
        nombre: form.nombre.trim(),
        categoria: form.categoria,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock) || 0,
        imagen: form.imagen,
        descripcion: form.descripcion.trim(),
      };

      await productoService.crearProducto(data);
      toast.success("¡Producto creado exitosamente!");
      navigate({ to: "/productos" });
    } catch (error) {
      console.error("Error al crear producto:", error);
      toast.error(error.response?.data?.mensaje || "Error al crear producto");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    if (form.nombre || form.codigo || form.precio) {
      if (!window.confirm("¿Salir sin guardar? Los datos se perderán.")) {
        return;
      }
    }
    navigate({ to: "/productos" });
  };

  // Vista previa del precio formateado
  const precioFormateado = formatCurrency(form.precio);

  return (
    <>
      <PageHeader
        title="Nuevo producto"
        description="Agregá un nuevo producto al catálogo"
        actions={
          <Button variant="outline" onClick={handleCancelar}>
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Código y Nombre */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label>
                      Código *
                      {errors.codigo && (
                        <span className="text-destructive text-xs ml-1">
                          {errors.codigo}
                        </span>
                      )}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={form.codigo}
                        onChange={(e) => handleChange("codigo", e.target.value)}
                        placeholder="Escanee o escriba el código"
                        className={
                          errors.codigo ? "border-destructive flex-1" : "flex-1"
                        }
                      />

                      <BarcodeScanner
                        onDetected={(codigo) => handleChange("codigo", codigo)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Único e irrepetible
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <Label>
                      Nombre *
                      {errors.nombre && (
                        <span className="text-destructive text-xs ml-1">
                          {errors.nombre}
                        </span>
                      )}
                    </Label>
                    <Input
                      value={form.nombre}
                      onChange={(e) => handleChange("nombre", e.target.value)}
                      placeholder="Nombre del producto"
                      className={errors.nombre ? "border-destructive" : ""}
                    />
                  </div>
                </div>

                {/* Categoría, Precio, Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label>
                      Categoría *
                      {errors.categoria && (
                        <span className="text-destructive text-xs ml-1">
                          {errors.categoria}
                        </span>
                      )}
                    </Label>
                    <Select
                      value={form.categoria}
                      onChange={(e) =>
                        handleChange("categoria", e.target.value)
                      }
                      className={errors.categoria ? "border-destructive" : ""}
                    >
                      <option value="">Seleccionar categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label>
                      Precio *
                      {errors.precio && (
                        <span className="text-destructive text-xs ml-1">
                          {errors.precio}
                        </span>
                      )}
                    </Label>
                    <Input
                      type="number"
                      value={form.precio}
                      onChange={(e) => handleChange("precio", e.target.value)}
                      placeholder="0"
                      min="0"
                      step="1000"
                      className={errors.precio ? "border-destructive" : ""}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {precioFormateado}
                    </p>
                  </div>

                  <div>
                    <Label>Stock inicial</Label>
                    <Input
                      type="number"
                      value={form.stock}
                      onChange={(e) => handleChange("stock", e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                {/* Imagen/Emoji */}
                <div>
                  <Label>Ícono del producto</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Input
                      value={form.imagen}
                      onChange={(e) => handleChange("imagen", e.target.value)}
                      className="w-16 text-center text-xl"
                      maxLength={2}
                    />
                    <div className="flex flex-wrap gap-1">
                      {EMOJIS_COMUNES.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleChange("imagen", emoji)}
                          className={`p-1.5 rounded-md text-lg hover:bg-muted transition-colors ${
                            form.imagen === emoji
                              ? "bg-primary/20 ring-2 ring-primary"
                              : ""
                          }`}
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    value={form.descripcion}
                    onChange={(e) =>
                      handleChange("descripcion", e.target.value)
                    }
                    placeholder="Descripción detallada del producto (opcional)..."
                    rows={4}
                  />
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelar}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading} size="lg">
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Creando..." : "Crear producto"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Vista previa */}
        <Card className="h-fit lg:sticky lg:top-4">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Vista previa</h3>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background text-2xl border border-border">
                  {form.imagen || "📦"}
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {form.nombre || "Nombre del producto"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {form.codigo || "CÓDIGO"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categoría:</span>
                  <span className="font-medium">
                    {categorias.find((c) => c.id === form.categoria)?.nombre ||
                      "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precio:</span>
                  <span className="font-semibold text-lg">
                    {precioFormateado}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock:</span>
                  <span className="font-medium">
                    {form.stock || "0"} unidades
                  </span>
                </div>
                {form.descripcion && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      {form.descripcion}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Requisitos */}
            <div className="mt-4 p-3 bg-muted/20 rounded-lg">
              <p className="text-xs font-semibold mb-2">Requisitos:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className={form.codigo ? "text-green-600" : ""}>
                  ✓ Código único (3+ caracteres)
                </li>
                <li className={form.nombre ? "text-green-600" : ""}>
                  ✓ Nombre del producto
                </li>
                <li className={form.categoria ? "text-green-600" : ""}>
                  ✓ Categoría asignada
                </li>
                <li className={form.precio > 0 ? "text-green-600" : ""}>
                  ✓ Precio mayor a 0
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
