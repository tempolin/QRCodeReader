export function checkCameraSupport() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return { ok: false, message: "このブラウザはカメラに対応していません。" };
  }

  const isLocalhost = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if (!window.isSecureContext && !isLocalhost) {
    return { ok: false, message: "カメラ利用にはHTTPSまたはlocalhostが必要です。" };
  }

  return { ok: true, message: "" };
}

export function getCameraErrorMessage(error) {
  const name = error?.name || "";
  if (name === "NotAllowedError") {
    return "カメラの使用が拒否されました。ブラウザの権限設定を確認してください。";
  }
  if (name === "NotFoundError") {
    return "利用できるカメラが見つかりません。";
  }
  if (name === "NotReadableError") {
    return "カメラが他のアプリで使用中の可能性があります。";
  }
  if (name === "OverconstrainedError") {
    return "指定したカメラ条件を満たせませんでした。";
  }
  if (name === "SecurityError") {
    return "セキュリティ設定によりカメラへアクセスできません。";
  }
  return "カメラの起動に失敗しました。";
}