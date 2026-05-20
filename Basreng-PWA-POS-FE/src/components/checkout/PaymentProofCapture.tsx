import {
  IonButton,
  IonIcon,
  IonItem,
  IonSpinner,
} from "@ionic/react";
import { camera, imageOutline, trashBin } from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import { compressImage } from "../../hooks/imageCompression";
import "./PaymentProofCapture.css";

interface PaymentProofCaptureProps {
  value: File | null;
  onChange: (file: File | null) => void;
  onCameraUnavailable?: (message: string) => void;
}

const PaymentProofCapture: React.FC<PaymentProofCaptureProps> = ({
  value,
  onChange,
  onCameraUnavailable,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraMessage, setCameraMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(value);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [value]);

  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {
        // Some mobile browsers need the user to tap again before playback starts.
      });
    }
  }, [isCameraOpen]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const notifyCameraUnavailable = (message: string) => {
    setCameraMessage(message);
    onCameraUnavailable?.(message);
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraOpen(false);
  };

  const startCamera = async () => {
    setCameraMessage(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      notifyCameraUnavailable(
        "Kamera tidak tersedia di browser ini. Silakan pilih gambar dari galeri.",
      );
      fileInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch (error: any) {
      const permissionDenied =
        error?.name === "NotAllowedError" || error?.name === "SecurityError";
      const message = permissionDenied
        ? "Izin kamera ditolak atau tidak tersedia. Silakan pilih gambar dari galeri."
        : "Kamera tidak bisa dibuka di perangkat ini. Silakan pilih gambar dari galeri.";

      notifyCameraUnavailable(message);
      fileInputRef.current?.click();
    }
  };

  const saveFile = async (file: File) => {
    try {
      setIsProcessing(true);
      const compressedFile = await compressImage(file);
      onChange(compressedFile);
    } catch (error) {
      console.error("Gagal memproses bukti pembayaran:", error);
      onChange(file);
    } finally {
      setIsProcessing(false);
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      notifyCameraUnavailable(
        "Preview kamera belum siap. Silakan coba lagi atau pilih gambar dari galeri.",
      );
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      notifyCameraUnavailable(
        "Browser tidak bisa memproses gambar kamera. Silakan pilih gambar dari galeri.",
      );
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          notifyCameraUnavailable(
            "Foto kamera gagal dibuat. Silakan pilih gambar dari galeri.",
          );
          return;
        }

        const file = new File([blob], `payment-proof-${Date.now()}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        await saveFile(file);
        stopCamera();
      },
      "image/jpeg",
      0.9,
    );
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (file) {
      await saveFile(file);
      stopCamera();
    }
  };

  return (
    <IonItem>
      <div className="payment-proof-capture">
        <div className="payment-proof-header">
          <b>Upload Bukti Pembayaran</b>
          {isProcessing && <IonSpinner name="dots" />}
        </div>

        {cameraMessage && <p className="payment-proof-note">{cameraMessage}</p>}

        {isCameraOpen && (
          <div className="payment-proof-camera">
            <video ref={videoRef} playsInline muted />
            <div className="payment-proof-actions">
              <IonButton expand="block" onClick={capturePhoto}>
                <IonIcon slot="start" icon={camera} />
                Ambil Foto
              </IonButton>
              <IonButton expand="block" fill="outline" onClick={stopCamera}>
                Batal
              </IonButton>
            </div>
          </div>
        )}

        {!isCameraOpen && !value && (
          <div className="payment-proof-actions">
            <IonButton expand="block" onClick={startCamera}>
              <IonIcon slot="start" icon={camera} />
              Buka Kamera
            </IonButton>
            <IonButton
              expand="block"
              fill="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <IonIcon slot="start" icon={imageOutline} />
              Pilih Galeri
            </IonButton>
          </div>
        )}

        {previewUrl && value && (
          <div className="payment-proof-preview">
            <img src={previewUrl} alt="Bukti pembayaran" />
            <div className="payment-proof-preview-footer">
              <p>Siap diupload</p>
              <IonButton
                fill="clear"
                color="danger"
                aria-label="Hapus bukti pembayaran"
                onClick={() => onChange(null)}
              >
                <IonIcon slot="icon-only" icon={trashBin} />
              </IonButton>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          className="payment-proof-file"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
    </IonItem>
  );
};

export default React.memo(PaymentProofCapture);
