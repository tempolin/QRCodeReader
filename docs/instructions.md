# Codex実装指示書（Quest Web QRコードリーダー）

## 0. 前提
- このリポジトリは **フォルダ構成と空ファイルが作成済み**。
- **新しいルートフォルダは作らない**（既存ファイルを書き換えるだけ）。
- 目的は **Questのブラウザでも動く Web QRコードリーダー** を作ること。

---

## 1. 重要ルール（必ず守る）
### 1.1 文字化け対策（必須）
- 対象テキストファイル（`.md .html .js .css .json`）は **UTF-8（BOMなし）**で保存する。
- `index.html` の `<head>` に **必ず**以下を入れる：
  - `<meta charset="utf-8">`
  - `<meta name="viewport" content="width=device-width, initial-scale=1">`

### 1.2 日本語統一（必須）
- UI表示文言、コメント、README、docs はすべて **日本語**。
- 変数名・関数名・ファイル名は **英語のままでもOK**（変更しない）。

### 1.3 安全設計（必須）
- QRを読み取っても **自動で外部URLに遷移しない**。
- URLを開くのは **ボタン押下 + confirm** のみ。
- `http:` は **原則ブロック**（警告を出し「開く」ボタン無効）。
- `javascript:` `data:` `file:` 等の危険スキームは **即ブロック**。

### 1.4 変更禁止
- `public/favicon.ico` など **バイナリは触らない**。

---

## 2. 対象ファイル（これらの中身を実装する）
- `README.md`
- `index.html`
- `package.json`
- `styles/main.css`
- `src/main.js`
- `src/qr/scanner.js`
- `src/qr/validator.js`
- `src/ui/controls.js`
- `src/ui/panel.js`
- `src/utils/permissions.js`
- `docs/progress.md`
- `docs/decisions.md`
- `docs/rules.md`
- `docs/test-notes.md`
- `docs/risk.md`

---

## 3. 機能要件（必須）
1) ブラウザでカメラを起動し、QRを読み取れる  
2) 読み取り結果を画面に表示（長文は折り返し）  
3) 自動遷移しない（安全）  
4) URLなら hostname（ドメイン）を表示  
5) `https:` のみ「開く」を有効化（confirm必須）  
6) `http:` は警告表示＋「開く」無効  
7) 「コピー」ボタンで結果文字列をコピー（可能なら `navigator.clipboard`、無理ならフォールバック）  
8) 開始/停止でスキャン制御。停止時はカメラ停止  
9) 権限拒否/カメラ無し/HTTPSでない等を **日本語で分かりやすく**表示
10) カメラ一覧を取得し、選択してスキャン対象を切り替えられるUIを用意する

---

## 4. 実装方針（構造）
### 4.1 役割分離（必須）
- `src/main.js`：初期化、状態管理、モジュール間配線
- `src/qr/scanner.js`：スキャン開始/停止、結果をコールバックで返す
- `src/qr/validator.js`：URL判定、https判定、危険スキーム排除、hostname抽出、警告文生成
- `src/ui/controls.js`：ボタン有効/無効、クリック処理、コピー処理
- `src/ui/panel.js`：画面表示更新（状態/結果/ドメイン/警告）
- `src/utils/permissions.js`：getUserMedia可否チェック、代表エラー整形（日本語）

### 4.2 QR読み取りライブラリ
- `qr-scanner` を CDN（jsdelivr）から **ESM import** で使う  
  例：
  - `https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner.min.js`
- 必要なら `QrScanner.WORKER_PATH` も設定する。

---

## 5. UI要件（index.html / CSS）
### 5.1 index.html 必須要素
- タイトル：Quest対応 Web QRコードリーダー
- 説明文：自動遷移しない／httpsのみ開く 等
- `<video>`（`playsinline` 推奨）
- ボタン：開始 / 停止 / リンクを開く / コピー
- カメラ一覧：カメラ選択用の`select`と一覧更新ボタン
- 表示領域：
  - 状態（待機/スキャン中/停止/エラー）
  - 結果
  - ドメイン
  - 警告（箇条書きでもOK）

### 5.2 読み込み
- CSS：
  - `<link rel="stylesheet" href="./styles/main.css">`
- JS：
  - `<script type="module" src="./src/main.js"></script>`

### 5.3 styles/main.css
- Questで見やすい：文字/ボタン大きめ、余白多め
- videoは最大幅、角丸、枠
- 色は派手にしない

---

## 6. package.json（最小）
- buildツール不要
- scripts：
  - `"dev": "npx serve ."`
  - `"start": "npx serve ."`
- `name` は `quest-qr-code-reader` など適切に
- `private: true` 推奨

---

## 7. README.md（必須セクション）
- 概要
- 特徴（Quest対応・安全設計）
- 起動方法（`npx serve .`）
- Questでの使い方（カメラ許可、使い終わったら停止）
- フォルダ構成
- トラブルシュート（文字化け、HTTPS必須、権限）

---

## 8. docs テンプレ（すべて日本語）
- `docs/progress.md`：進捗テンプレ（今日やった/現状/次/詰まり）
- `docs/decisions.md`：意思決定テンプレ（決定/理由/代替案/影響）
- `docs/rules.md`：運用ルール（安全・ログ更新・命名・テスト）
- `docs/test-notes.md`：テスト記録テンプレ（Quest/PCチェックリスト）
- `docs/risk.md`：リスクと対策（フィッシング、危険URL、権限）

---

## 9. 完了条件（最低限）
- PCのChromeで `npx serve .` → カメラ許可 → QR読み取り → 結果表示ができる
- 自動遷移しない（「開く」ボタン + confirm必須）
- `http:` はブロックされる
- 実装後、変更したファイル一覧を簡潔に報告する

---

## 10. Codexへの出力要件
- 実装後、以下を出力する：
  - 変更したファイル一覧
  - 手動テスト手順（3〜5行）
