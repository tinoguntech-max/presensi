import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

export default function CameraCard({ onDescriptor, onStatusChange, autoScan = false }) {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Memuat model AI...');
  const [isScanning, setIsScanning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    let stream;

    const setup = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 540 } },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setLoading(false);
        setStatus('Kamera siap. Wajah bisa discan.');
        onStatusChange?.('ready');

        // Start auto-scan if enabled
        if (autoScan) {
          startAutoScan();
        }
      } catch (error) {
        console.error(error);
        setStatus('Gagal memuat kamera atau model wajah.');
        onStatusChange?.('error');
      }
    };

    setup();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [onStatusChange, autoScan]);

  const startAutoScan = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setIsScanning(true);
    setStatus('Auto-scan aktif. Posisikan wajah di depan kamera...');
    
    intervalRef.current = setInterval(async () => {
      await performScan();
    }, 1000); // Scan setiap 1 detik
  };

  const stopAutoScan = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsScanning(false);
    setStatus('Auto-scan dihentikan. Klik tombol untuk scan manual.');
  };

  const performScan = async () => {
    if (!videoRef.current) return;

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        if (!autoScan || !isScanning) {
          setStatus('Wajah belum terdeteksi. Pastikan pencahayaan cukup.');
        }
        return;
      }

      const descriptor = Array.from(detection.descriptor);
      onDescriptor(descriptor);
      
      if (autoScan && isScanning) {
        setStatus('Wajah terdeteksi! Memproses...');
        stopAutoScan();
      } else {
        setStatus('Scan wajah berhasil.');
      }
    } catch (error) {
      console.error('Scan error:', error);
      if (!autoScan || !isScanning) {
        setStatus('Error saat scanning wajah.');
      }
    }
  };

  const handleScan = async () => {
    if (isScanning) {
      stopAutoScan();
      return;
    }

    if (autoScan) {
      startAutoScan();
    } else {
      setStatus('Menganalisis wajah...');
      await performScan();
    }
  };

  return (
    <div className="rounded-[32px] border border-white/50 bg-white/55 p-5 shadow-soft backdrop-blur-xl">
      <div className="overflow-hidden rounded-[28px] bg-slate-100 relative">
        <video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full object-cover" />
        {isScanning && (
          <div className="absolute inset-0 border-4 border-emerald-400 rounded-[28px] animate-pulse"></div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-slate-800">
            Kamera Live {autoScan && <span className="text-emerald-600">(Auto-Scan)</span>}
          </p>
          <p className="text-sm text-slate-500">{status}</p>
        </div>

        <button
          type="button"
          onClick={handleScan}
          disabled={loading}
          className={`rounded-2xl px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 ${
            isScanning 
              ? 'bg-gradient-to-r from-red-400 to-red-500' 
              : 'bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400'
          }`}
        >
          {loading 
            ? 'Loading...' 
            : isScanning 
              ? 'Stop Auto-Scan' 
              : autoScan 
                ? 'Mulai Auto-Scan' 
                : 'Scan Wajah'
          }
        </button>
      </div>
    </div>
  );
}
