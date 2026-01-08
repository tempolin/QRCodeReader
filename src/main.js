import { createScanner } from "./qr/scanner.js";
import { validatePayload } from "./qr/validator.js";
import { setupControls } from "./ui/controls.js";
import {
  setStatus,
  setResult,
  setDomain,
  setWarnings,
  setError,
  clearError
} from "./ui/panel.js";
import { checkCameraSupport, getCameraErrorMessage } from "./utils/permissions.js";

const state = {
  isScanning: false,
  lastText: "",
  lastValidation: null,
  cameraId: ""
};

function updateControls(controls) {
  controls.setState({
    canStart: !state.isScanning,
    canStop: state.isScanning,
    canOpen: Boolean(state.lastValidation?.canOpen),
    canCopy: Boolean(state.lastText),
    canSelectCamera: !state.isScanning
  });
}

function applyValidation(result) {
  state.lastValidation = result;
  setResult(result.rawText || "未読み取り");
  setDomain(result.hostname || "-");
  setWarnings(result.warnings);
  clearError();
}

function normalizeCameras(cameras) {
  if (!Array.isArray(cameras)) {
    return [];
  }
  return cameras
    .map((camera, index) => {
      const id = camera?.id ?? camera?.deviceId ?? "";
      if (!id) {
        return null;
      }
      const label = (camera?.label ?? "").trim() || `カメラ${index + 1}`;
      return { id, label };
    })
    .filter(Boolean);
}

async function refreshCameraList(scanner, controls) {
  if (!scanner.listCameras) {
    return;
  }
  let cameras = [];
  try {
    cameras = await scanner.listCameras(state.isScanning);
  } catch {
    cameras = [];
  }
  const normalized = normalizeCameras(cameras);
  if (!normalized.find((camera) => camera.id === state.cameraId)) {
    state.cameraId = normalized[0]?.id ?? "";
  }
  controls.setCameraOptions({
    options: normalized,
    selectedId: state.cameraId
  });
  updateControls(controls);
}

async function handleStart(scanner, controls) {
  const support = checkCameraSupport();
  if (!support.ok) {
    setStatus("エラー");
    setError(support.message);
    updateControls(controls);
    return;
  }

  try {
    if (state.cameraId) {
      await scanner.setCamera(state.cameraId);
    }
    await scanner.start();
    state.isScanning = true;
    setStatus("スキャン中");
    clearError();
    await refreshCameraList(scanner, controls);
  } catch (err) {
    setStatus("エラー");
    setError(getCameraErrorMessage(err));
  }

  updateControls(controls);
}

function handleCameraChange(value, scanner, controls) {
  state.cameraId = value;
  if (!state.isScanning || !value) {
    return;
  }
  scanner.setCamera(value).catch((err) => {
    setError(getCameraErrorMessage(err));
    updateControls(controls);
  });
}

function handleStop(scanner, controls) {
  scanner.stop();
  state.isScanning = false;
  setStatus("停止中");
  updateControls(controls);
}

function handleScanResult(text, controls) {
  const normalized = (text ?? "").trim();
  if (!normalized) {
    return;
  }
  if (normalized === state.lastText) {
    return;
  }

  state.lastText = normalized;
  const validation = validatePayload(normalized);
  applyValidation(validation);
  if (state.isScanning) {
    setStatus("スキャン中");
  }
  updateControls(controls);
}

function handleCopyResult(result) {
  if (result.ok) {
    setStatus("コピーしました");
    clearError();
    return;
  }
  if (result.message) {
    setError(result.message);
  }
}

function handleOpenRequest() {
  if (!state.lastValidation?.canOpen || !state.lastValidation.url) {
    return;
  }
  const hostname = state.lastValidation.hostname || "";
  const message = hostname
    ? `httpsのリンクを開きますか？ (${hostname})`
    : "httpsのリンクを開きますか？";
  const ok = window.confirm(message);
  if (!ok) {
    return;
  }
  window.open(state.lastValidation.url, "_blank", "noopener");
}

window.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("camera");
  let controls;
  const scanner = createScanner(
    video,
    (text) => handleScanResult(text, controls),
    (err) => {
      setStatus("エラー");
      setError(getCameraErrorMessage(err));
    }
  );

  controls = setupControls({
    onStart: () => handleStart(scanner, controls),
    onStop: () => handleStop(scanner, controls),
    onOpen: () => handleOpenRequest(),
    getCopyText: () => state.lastText,
    onCopyResult: handleCopyResult,
    onCameraChange: (value) => handleCameraChange(value, scanner, controls),
    onRefreshCameras: () => refreshCameraList(scanner, controls)
  });

  setStatus("停止中");
  setResult("未読み取り");
  setDomain("-");
  setWarnings([]);
  clearError();
  refreshCameraList(scanner, controls);
  updateControls(controls);

  window.addEventListener("beforeunload", () => {
    scanner.stop();
    scanner.destroy();
  });
});
