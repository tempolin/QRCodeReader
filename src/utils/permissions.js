// カメラ権限とエラーメッセージ整理を担当する。
export function checkCameraSupport() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return { ok: false, message: "このブラウザではカメラが利用できません。" };
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
    return "カメラの使用が拒否されました。ブラウザの許可設定を確認してください。";
  }
  if (name === "NotFoundError") {
    return "利用できるカメラが見つかりません。";
  }
  if (name === "NotReadableError") {
    return "カメラを使用中の別アプリがある可能性があります。";
  }
  if (name === "OverconstrainedError") {
    return "指定したカメラ条件を満たせませんでした。";
  }
  if (name === "SecurityError") {
    return "セキュリティ設定によりカメラへアクセスできません。";
  }
  return "カメラの初期化に失敗しました。";
}