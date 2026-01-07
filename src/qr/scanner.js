// QRスキャンの開始/停止と結果取得を担当する。
import QrScanner from "https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner.min.js";

QrScanner.WORKER_PATH = "https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner-worker.min.js";

export function createScanner(videoElement, onResult, onError) {
  if (!videoElement) {
    throw new Error("video要素が見つかりません。");
  }

  const scanner = new QrScanner(
    videoElement,
    (result) => {
      const text = result?.data ?? result;
      onResult?.(text);
    },
    {
      returnDetailedScanResult: true,
      highlightScanRegion: true,
      highlightCodeOutline: true
    }
  );

  return {
    start: async () => {
      try {
        await scanner.start();
      } catch (err) {
        onError?.(err);
        throw err;
      }
    },
    stop: () => {
      scanner.stop();
    },
    destroy: () => {
      scanner.destroy();
    }
  };
}