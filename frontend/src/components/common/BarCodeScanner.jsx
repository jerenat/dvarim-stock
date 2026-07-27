import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

import { Button } from "@/components/common/Button";

export function BarcodeScanner({ onDetected }) {
  const scannerRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const scannerId = "barcode-reader";

  const abrirCamara = () => {
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    iniciarCamara();

    return () => {
      cerrarCamara();
    };
  }, [open]);

  const iniciarCamara = async () => {
    try {
      setLoading(true);

      const cameras = await Html5Qrcode.getCameras();

      if (!cameras || cameras.length === 0) {
        throw new Error("No se encontraron cámaras.");
      }

      console.log("Cámaras disponibles:");
      console.table(cameras);

      // Buscar la mejor cámara automáticamente
      let camera = cameras.find((c) => /back|rear|environment/i.test(c.label));

      // Si no hay trasera, buscar una USB
      if (!camera) {
        camera = cameras.find((c) => /usb/i.test(c.label));
      }

      // Si no encontró ninguna especial, usar la primera
      if (!camera) {
        camera = cameras[0];
      }

      console.log("Usando cámara:", camera);

      scannerRef.current = new Html5Qrcode(scannerId);

      await scannerRef.current.start(
        camera.id,
        {
          fps: 15,

          qrbox: {
            width: 320,
            height: 180,
          },

          aspectRatio: 1.777,

          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
          ],
        },

        (decodedText) => {
          const codigo = decodedText.replace(/\D/g, "");

          console.log("Código detectado:", codigo);

          onDetected(codigo);

          cerrarCamara();
        },

        () => {
          // Ignorar errores normales mientras busca códigos
        },
      );
    } catch (error) {
      console.error(error);

      alert("No fue posible iniciar la cámara.");

      cerrarCamara();
    } finally {
      setLoading(false);
    }
  };

  const cerrarCamara = async () => {
    try {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }

        await scannerRef.current.clear();
      }
    } catch (e) {
      console.error(e);
    } finally {
      scannerRef.current = null;
      setOpen(false);
    }
  };

  return (
    <>
      <Button type="button" variant="outline" onClick={abrirCamara}>
        <Camera className="h-4 w-4" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-xl rounded-xl bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Escanear código de barras
              </h2>

              <Button variant="ghost" onClick={cerrarCamara}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative">
              <div
                id={scannerId}
                className="overflow-hidden rounded-lg border"
              />

              {/* Línea guía */}
              <div className="pointer-events-none absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-red-500 opacity-70" />
            </div>

            {loading && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Iniciando cámara...
              </p>
            )}

            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={cerrarCamara}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
