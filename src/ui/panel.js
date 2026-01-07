// 画面表示の更新を担当する。
const statusElement = document.getElementById("statusText");
const resultElement = document.getElementById("resultText");
const domainElement = document.getElementById("domainText");
const warningListElement = document.getElementById("warningList");
const errorElement = document.getElementById("errorText");

export function setStatus(text) {
  statusElement.textContent = text || "";
}

export function setResult(text) {
  resultElement.textContent = text || "";
}

export function setDomain(text) {
  domainElement.textContent = text || "";
}

export function setWarnings(warnings) {
  warningListElement.innerHTML = "";
  if (!warnings || warnings.length === 0) {
    const item = document.createElement("li");
    item.textContent = "なし";
    warningListElement.appendChild(item);
    return;
  }
  warnings.forEach((warning) => {
    const item = document.createElement("li");
    item.textContent = warning;
    warningListElement.appendChild(item);
  });
}

export function setError(message) {
  errorElement.textContent = message || "";
}

export function clearError() {
  errorElement.textContent = "";
}