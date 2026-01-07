// ボタン制御とコピー処理を担当する。
async function copyToClipboard(text) {
  if (!text) {
    return { ok: false, message: "コピー対象がありません。" };
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

export function setupControls({ onStart, onStop, onOpen, getCopyText, onCopyResult }) {
  const startButton = document.getElementById("start");
  const stopButton = document.getElementById("stop");
  const openButton = document.getElementById("open");
  const copyButton = document.getElementById("copy");

  startButton.addEventListener("click", () => onStart?.());
  stopButton.addEventListener("click", () => onStop?.());
  openButton.addEventListener("click", () => onOpen?.());
  copyButton.addEventListener("click", async () => {
    const text = getCopyText?.() ?? "";
    const result = await copyToClipboard(text);
    onCopyResult?.(result);
  });

  return {
    setState: ({ canStart, canStop, canOpen, canCopy }) => {
      startButton.disabled = !canStart;
      stopButton.disabled = !canStop;
      openButton.disabled = !canOpen;
      copyButton.disabled = !canCopy;
    }
  };
}