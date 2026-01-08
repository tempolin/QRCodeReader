async function copyToClipboard(text) {
  if (!text) {
    return { ok: false, message: "コピーする内容がありません。" };
  }

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return { ok: true };
    } catch {
      return { ok: false, message: "クリップボードにコピーできませんでした。" };
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  let success = false;
  try {
    success = document.execCommand("copy");
  } catch {
    success = false;
  }

  document.body.removeChild(textarea);

  if (!success) {
    return { ok: false, message: "コピーに失敗しました。" };
  }

  return { ok: true };
}

export function setupControls({
  onStart,
  onStop,
  onOpen,
  getCopyText,
  onCopyResult,
  onCameraChange,
  onRefreshCameras
}) {
  const startButton = document.getElementById("start");
  const stopButton = document.getElementById("stop");
  const openButton = document.getElementById("open");
  const copyButton = document.getElementById("copy");
  const cameraSelect = document.getElementById("cameraSelect");
  const refreshButton = document.getElementById("refreshCameras");

  startButton.addEventListener("click", () => onStart?.());
  stopButton.addEventListener("click", () => onStop?.());
  openButton.addEventListener("click", () => onOpen?.());
  copyButton.addEventListener("click", async () => {
    const text = getCopyText?.() ?? "";
    const result = await copyToClipboard(text);
    onCopyResult?.(result);
  });
  cameraSelect?.addEventListener("change", () => onCameraChange?.(cameraSelect.value));
  refreshButton?.addEventListener("click", () => onRefreshCameras?.());

  return {
    setState: ({ canStart, canStop, canOpen, canCopy, canSelectCamera }) => {
      startButton.disabled = !canStart;
      stopButton.disabled = !canStop;
      openButton.disabled = !canOpen;
      copyButton.disabled = !canCopy;
      if (cameraSelect) {
        cameraSelect.disabled = !canSelectCamera;
      }
      if (refreshButton) {
        refreshButton.disabled = !canSelectCamera;
      }
    },
    setCameraOptions: ({ options, selectedId }) => {
      if (!cameraSelect) {
        return;
      }
      cameraSelect.innerHTML = "";
      if (!options.length) {
        const emptyOption = document.createElement("option");
        emptyOption.value = "";
        emptyOption.textContent = "カメラが見つかりません";
        cameraSelect.appendChild(emptyOption);
        return;
      }
      options.forEach((option) => {
        const item = document.createElement("option");
        item.value = option.id;
        item.textContent = option.label;
        cameraSelect.appendChild(item);
      });
      if (selectedId) {
        cameraSelect.value = selectedId;
      }
    }
  };
}
