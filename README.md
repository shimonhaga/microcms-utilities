# microCMS Utilities

microCMS 向けのユーティリティ集です。

## コントリビュータが最初にすべきこと

1. 依存関係をインストールする
   - `npm install`
2. Git フックを有効化する（Git 管理下でのみ必要）
   - `npm run prepare`
3. フォーマットとテストを実行して、開発環境が正常か確認する
   - `npm run format:check`
   - `npm test`

## 開発時によく使うコマンド

- 自動整形: `npm run format`
- 整形チェック: `npm run format:check`
- テスト実行: `npm test`

## ngWords をブラウザで試す

- `docs/re2/ngWords.html` をブラウザで開くと、そのまま動作確認できます。
- 禁止語（改行 or カンマ区切り）と判定文字列を入力し、`実行する` を押してください。

## ngWords CLI

- `node cli/re2/ngWords.js <禁止語...> [--alphabetClass <文字クラス>] [--text <判定文字列>]`

## tester をブラウザで試す

- `docs/re2/tester.html` をブラウザで開くと、そのまま動作確認できます。
- 正規表現パターン・テスト文字列・フラグ（任意）を入力し、`判定する` を押してください。

## tester CLI

- `node cli/re2/tester.js <正規表現> <テスト文字列> [フラグ]`

## コミット時のルール

- pre-commit フックで `npm run format:check` が実行されます。
- 整形エラーがある場合はコミットされません。

## VS Code を使うコントリビュータ向け設定（ローカルのみ）

このリポジトリでは `.vscode/` を Git 管理しません（`.gitignore` で除外）。
各自のローカル環境で、次の設定を行ってください。

1. Prettier 拡張（`esbenp.prettier-vscode`）をインストールする
2. ワークスペースの `.vscode/settings.json`（ローカルのみ）に以下を設定する
   - `"editor.formatOnSave": true`
   - `"prettier.requireConfig": true`
   - `javascript/json/jsonc/markdown` の `editor.defaultFormatter` を `esbenp.prettier-vscode` に設定する

例:

```jsonc
{
  "editor.formatOnSave": true,
  "prettier.requireConfig": true,
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
  },
}
```
