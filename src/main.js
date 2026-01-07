// 画面初期化とモジュール間の連携を担当する。
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
  lastValidation: null
};

function updateControls(controls) {
  controls.setState({
    canStart: !state.isScanning,
    canStop: state.isScanning,
    canOpen: Boolean(state.lastValidation?.canOpen),
    canCopy: Boolean(state.lastText)
  });
}

function applyValidation(result) {
  state.lastValidation = result;
  setResult(result.rawText || "未読み取り");
  setDomain(result.hostname || "-");
  setWarnings(result.warnings);
  clearError();
}

async function handleStart(scanner, controls) {
  const support = checkCameraSupport();
  if (!support.ok) {
    setError(support.message);
    return;
  }

  try {
    await scanner.start();
    state.isScanning = true;
    setStatus("スキャン中");
    clearError();
  } catch (err) {
    setError(getCameraErrorMessage(err));
  }

  updateControls(controls);
}

function handleStop(scanner, controls) {
  scanner.stop();
  state.isScanning = false;
  setStatus("停止");
  updateControls(controls);
}

function handleScanResult(text, controls) {
  const normalized = (text ?? "").trim();
  if (!normalized) {
    return;
  }

  state.lastText = normalized;
  const validation = validatePayload(normalized);
  applyValidation(validation);
  setStatus("スキャン中");
  updateControls(controls);
}

function handleCopyResult(result) {
  if (result.ok) {
    setStatus("コピーしました");
    clearError();
  } else if (result.message) {
    setError(result.message);
  }
}

function handleOpenRequest() {
  if (!state.lastValidation?.canOpen || !state.lastValidation.url) {
    return;
  }
  const ok = window.confirm("外部サイトを開きます。続行しますか？");
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
    (err) => setError(getCameraErrorMessage(err))
  );

  controls = setupControls({
    onStart: () => handleStart(scanner, controls),
    onStop: () => handleStop(scanner, controls),
    onOpen: () => handleOpenRequest(),
    getCopyText: () => state.lastText,
    onCopyResult: handleCopyResult
  });

  setStatus("停止");
  setResult("未読み取り");
  setDomain("-");
  setWarnings([]);
  clearError();
  updateControls(controls);
});