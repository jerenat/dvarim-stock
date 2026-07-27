// src/components/common/ConfirmModal.jsx
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";
import { Modal } from "./Modal.jsx";
import { Button } from "./Button.jsx";

const icons = {
  danger: AlertTriangle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

const iconColors = {
  danger: "text-destructive bg-destructive/10",
  success: "text-green-500 bg-green-50 dark:bg-green-950",
  warning: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950",
  info: "text-blue-500 bg-blue-50 dark:bg-blue-950",
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message = "¿Está seguro de realizar esta acción?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger", // danger, success, warning, info
  loading = false,
}) {
  const Icon = icons[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center py-4">
        <div
          className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${iconColors[variant]} mb-4`}
        >
          <Icon className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Procesando..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
