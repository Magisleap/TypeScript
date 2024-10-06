## TypeScript + Bun

TypeScript + Bunで動作するテンプレートレポジトリです

### 技術スタック

- DevContainer
- [Node.js](https://github.com/nodejs/node)
- [Bun](https://github.com/oven-sh/bun)
- [commitlint](https://github.com/conventional-changelog/commitlint)
- [husky](https://github.com/typicode/husky)
- [lint-staged](https://github.com/lint-staged/lint-staged)
- [PR Agent](https://github.com/Codium-ai/pr-agent)
- GitHub Actions

#### 備考

- DevContainerを利用したホストマシンから分断したクリーンな開発環境
- 高速かつ軽量なNode.jsランタイムであるBunの採用
- husky+commitlintdでコミットメッセージのルールの厳格化
- lint-stagedでプッシュ前にコードフォーマットの実行
- マージ済みブランチの自動削除に対応
- GPG Keyを利用して署名付きコミットに対応
- GPG Keyによる署名の有効化
- プッシュと同時にブランチを作成する`push.autoSetupRemote`を有効化
- [act](https://github.com/nektos/act)を利用してローカルでGitHub Actionsのテスト実行に対応
- GitHub ActionsでCI/CDを実行
- PR AgentでChatGPTを利用した自動コードレビュー
- モジュールインポート時に`@`を利用して相対パスに対応
- リリースバージョンのバリデーション実行

## 構築

```zsh
git clone https://github.com/Magisleap/TypeScript
cd TypeScript
```

VSCodeから`cmd/ctrl + Shift + p`でコマンドパレットを開き, DevContainerで立ち上げます.

> DevContainerの実行にはExtensionのインストールとDocker Desktopのインストールが必要になります

### 開発

```zsh
bun dev
```

で実行できます

### GitHub

PR Agentを利用する場合, レポジトリシークレットに`OPENAI_KEY`を追加してください.

[テンプレートファイル](https://pr-agent-docs.codium.ai/usage-guide/configuration_options/)については`.pr_agent.toml`に書き込まれているので適時変更してください. デフォルトでは日本語でコメントされるようになっています.

### FAQ

- Node.jsのバージョンを`20.17.0`以降に上げるとcommitlintが正しく動作しなくなります
- Node.jsをインストールしないとcommitlintを含む一部の機能が動作しません
- プッシュ時にリモートブランチ作成のオプションはgitのバージョンが`2.37.0`以降である必要があります
