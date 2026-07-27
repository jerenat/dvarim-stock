import {
  FileText,
  FileSpreadsheet,
  TrendingUp,
  AlertTriangle,
  Users,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/common/Badge";

import { formatearFecha } from "./date";

export const REPORTES = [
  {
    id: "usuarios",
    label: "Stock por usuario",
    icon: Users,
    desc: "Detalle de inventario asignado",
  },
  {
    id: "vendidos",
    label: "Más vendidos",
    icon: TrendingUp,
    desc: "Ranking de productos vendidos",
  },
  { id: "bajo", label: "Stock bajo", icon: AlertTriangle, desc: "Productos por debajo del mínimo" },
  {
    id: "fecha",
    label: "Movimientos por fecha",
    icon: Calendar,
    desc: "Historial filtrado por período",
  },
];

export const stockBajoColumns = [
  {
    key: "producto",
    header: "Producto",
    render: (p) => (
      <span className="font-medium">
        {p.imagen} {p.nombre}
      </span>
    ),
  },
  {
    key: "codigo",
    header: "Código",
    className: "font-mono text-xs text-muted-foreground",
  },
  {
    key: "categoria",
    header: "Categoría",
    className: "text-muted-foreground",
  },
  {
    key: "stock",
    header: "Stock actual",
    className: "text-right font-bold text-destructive",
  },
];

export const movimientosColumns = [
  {
    key: "fecha",
    header: "Fecha",
    render: (m) => formatearFecha(m.fecha),
  },
  {
    key: "tipo",
    header: "Tipo",
    render: (m) => (
      <Badge
        variant={m.tipo === "ingreso" ? "success" : m.tipo === "venta" ? "destructive" : "primary"}
      >
        {m.tipo}
      </Badge>
    ),
  },
  {
    key: "producto",
    header: "Producto",
    className: "font-medium",
  },
  {
    key: "cantidad",
    header: "Cantidad",
    className: "text-right font-semibold",
  },
  {
    key: "estado",
    header: "Estado",
    render: (m) => (
      <Badge variant={m.estado === "completado" ? "success" : "warning"}>{m.estado}</Badge>
    ),
  },
];
