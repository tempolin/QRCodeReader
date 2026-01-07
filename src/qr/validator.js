// 読み取り結果の検証とURL判定を担当する。
const dangerousSchemes = ["javascript:", "data:", "file:", "vbscript:", "blob:", "about:"];

export function validatePayload(rawText) {
  const trimmed = (rawText ?? "").trim();
  const result = {
    rawText: trimmed,
    isUrl: false,
    url: "",
    hostname: "",
    canOpen: false,
    warnings: []
  };

  if (!trimmed) {
    result.warnings.push("読み取り結果が空です。");
    return result;
  }

  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
  if (!hasScheme) {
    return result;
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    result.warnings.push("URLの形式として読み取れませんでした。");
    return result;
  }

  result.isUrl = true;
  result.url = parsed.toString();
  result.hostname = parsed.hostname || "";

  const scheme = parsed.protocol.toLowerCase();
  if (dangerousSchemes.includes(scheme)) {
    result.warnings.push("危険なスキームのため開けません。");
    return result;
  }

  if (scheme === "http:") {
    result.warnings.push("httpは安全ではないため開けません。");
    return result;
  }

  if (scheme === "https:") {
    result.canOpen = true;
    return result;
  }

  result.warnings.push("未対応のスキームのため開けません。");
  return result;
}