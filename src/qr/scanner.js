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
    },
    listCameras: async (requestLabels = false) => {
      if (typeof QrScanner.listCameras === "function") {
        return QrScanner.listCameras(requestLabels);
      }
      if (!navigator.mediaDevices?.enumerateDevices) {
        return [];
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter((device) => device.kind === "videoinput")
        .map((device) => ({ id: device.deviceId, label: device.label }));
    },
    setCamera: async (cameraId) => {
      if (!cameraId || typeof scanner.setCamera !== "function") {
        return;
      }
      await scanner.setCamera(cameraId);
    }
  };
}
