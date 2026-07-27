// src/components/common/FormModal.jsx
import { Modal } from "./Modal.jsx";
import { Button } from "./Button.jsx";

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = "Guardar",
  loading = false,
  size = "lg",
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="space-y-4 py-4">{children}</div>
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
