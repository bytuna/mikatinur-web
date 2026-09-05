"use client";

import React, { useEffect, useRef, useState } from 'react';
import { domToCanvas } from 'modern-screenshot';
import { Bug, Check, Eraser, Loader2, Send, X } from 'lucide-react';

interface BugReportModalProps {
  target: HTMLElement | null;
  bookTitle: string;
  pageNumber: number;
  onClose: () => void;
}

export const BugReportModal: React.FC<BugReportModalProps> = ({
  target,
  bookTitle,
  pageNumber,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [isCapturing, setIsCapturing] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const capture = async () => {
      if (!target) {
        setError('Okuma alanı görüntülenemedi.');
        setIsCapturing(false);
        return;
      }

      try {
        const computedBackground = window.getComputedStyle(target).backgroundColor;
        const backgroundColor = computedBackground === 'transparent' || computedBackground === 'rgba(0, 0, 0, 0)'
          ? '#fdfcf9'
          : computedBackground;
        const canvas = await domToCanvas(target, {
          backgroundColor,
          scale: Math.min(window.devicePixelRatio || 1, 2),
        });
        if (!active) return;
        setImageData(canvas.toDataURL('image/png'));
        const drawingCanvas = canvasRef.current;
        if (drawingCanvas) {
          drawingCanvas.width = canvas.width;
          drawingCanvas.height = canvas.height;
          drawingCanvas.getContext('2d')?.drawImage(canvas, 0, 0);
        }
      } catch {
        if (active) setError('Ekran görüntüsü alınamadı.');
      } finally {
        if (active) setIsCapturing(false);
      }
    };

    capture();
    return () => {
      active = false;
    };
  }, [target]);

  const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(event);
    if (!point) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const context = event.currentTarget.getContext('2d');
    if (!context) return;
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const point = getCanvasPoint(event);
    const context = event.currentTarget.getContext('2d');
    if (!point || !context) return;
    context.lineTo(point.x, point.y);
    context.strokeStyle = '#c62828';
    context.lineWidth = Math.max(4, canvasRef.current!.width / 280);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.stroke();
  };

  const stopDrawing = () => {
    drawingRef.current = false;
  };

  const clearDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageData) return;
    const image = new Image();
    image.onload = () => {
      const context = canvas.getContext('2d');
      if (!context) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
    };
    image.src = imageData;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !description.trim()) {
      setError('Lütfen hatayı kısaca açıklayın.');
      return;
    }

    setIsSending(true);
    setError('');
    try {
      const response = await fetch('/api/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle,
          pageNumber,
          description: description.trim(),
          reporterEmail: reporterEmail.trim(),
          screenshot: canvas.toDataURL('image/png'),
          url: window.location.href,
        }),
      });
      if (!response.ok) throw new Error('send-failed');
      setSent(true);
    } catch {
      setError('Bildirim gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-950/60 p-3 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-sepia-300 bg-[#f8f2e8] shadow-2xl dark:border-stone-700 dark:bg-stone-900">
        <div className="flex items-center justify-between border-b border-sepia-300/70 px-4 py-3 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-red-700 dark:text-red-400" />
            <div>
              <h2 className="font-serif font-bold text-stone-900 dark:text-stone-100">Hata bildir</h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">{bookTitle} / s. {pageNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800" aria-label="Kapat">
            <X className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="rounded-full bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Check className="h-7 w-7" /></div>
            <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">Bildiriminiz alındı</h3>
            <p className="max-w-sm text-sm text-stone-600 dark:text-stone-400">Teşekkürler. Bildirim incelenmek üzere gönderildi.</p>
            <button onClick={onClose} className="mt-3 rounded-full bg-sepia-accent px-5 py-2 text-xs font-bold text-stone-950">Kapat</button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex min-h-0 flex-col gap-4 overflow-y-auto p-4 sm:p-5">
            <div className="rounded-xl border border-sepia-300/80 bg-white/60 p-2 dark:border-stone-700 dark:bg-stone-950/40">
              <div className="mb-2 flex items-center justify-between px-1 text-[11px] text-stone-500 dark:text-stone-400">
                <span>{isCapturing ? 'Ekran görüntüsü hazırlanıyor...' : 'Hatalı bölgeyi kalemle işaretleyebilirsiniz.'}</span>
                <button type="button" onClick={clearDrawing} disabled={isCapturing} className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-stone-200 disabled:opacity-40 dark:hover:bg-stone-800">
                  <Eraser className="h-3.5 w-3.5" /> Temizle
                </button>
              </div>
              <div className="max-h-[42vh] overflow-auto rounded-lg bg-stone-100 dark:bg-stone-950">
                <canvas ref={canvasRef} className="block h-auto w-full touch-none cursor-crosshair" onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerCancel={stopDrawing} onPointerLeave={stopDrawing} />
              </div>
            </div>

            <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Hata açıklaması
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} required rows={4} placeholder="Bu sayfada gördüğünüz hatayı açıklayın..." className="mt-1.5 w-full resize-y rounded-xl border border-sepia-300 bg-white/70 p-3 text-sm font-normal text-stone-800 outline-none focus:border-sepia-accent dark:border-stone-700 dark:bg-stone-950/50 dark:text-stone-200" />
            </label>
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300">E-posta adresiniz <span className="font-normal text-stone-400">(isteğe bağlı)</span>
              <input type="email" value={reporterEmail} onChange={(event) => setReporterEmail(event.target.value)} placeholder="Geri dönüş yapılacaksa..." className="mt-1.5 w-full rounded-xl border border-sepia-300 bg-white/70 p-3 text-sm font-normal text-stone-800 outline-none focus:border-sepia-accent dark:border-stone-700 dark:bg-stone-950/50 dark:text-stone-200" />
            </label>
            {error && <p className="text-xs font-semibold text-red-700 dark:text-red-400">{error}</p>}
            <div className="flex justify-end gap-2 border-t border-sepia-300/60 pt-3 dark:border-stone-800">
              <button type="button" onClick={onClose} className="rounded-full border border-sepia-300 px-4 py-2 text-xs font-bold text-stone-600 dark:border-stone-700 dark:text-stone-300">Vazgeç</button>
              <button type="submit" disabled={isSending || isCapturing} className="inline-flex items-center gap-2 rounded-full bg-sepia-accent px-4 py-2 text-xs font-bold text-stone-950 disabled:cursor-not-allowed disabled:opacity-50">
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Bildirimi gönder
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
