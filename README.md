# Pharmacy Dungeon

PWA IDLE HACK & SLASH v4.4.0

## v4.4.0 変更内容

- `止めるまで同じダンジョンを周回する` チェックボックスを追加
- チェックONの場合、大ボス撃破後も準備フェーズへ戻らず、同じダンジョンの1Fから探索を継続
- チェックOFFの場合、大ボス撃破後は従来どおり準備フェーズへ戻る
- 準備フェーズへ戻るタイミングでランキングへ自動登録
  - 探索停止
  - ダンジョンリタイア
  - 自動周回OFF時の大ボス撃破
- 前回登録時とスコアが同じ場合は、自動登録をスキップ
- PWAキャッシュ名を `pharmacy-dungeon-pwa-v4-4-auto-loop-ranking` に更新

## 自動周回仕様

探索フェーズ中に大ボスを倒したとき、チェック状態で動きが変わります。

### チェックON

```text
大ボス撃破
↓
ダンジョンクリア回数 +1
↓
ダンジョンLv上限 +1
↓
同じダンジョン1Fへ戻る
↓
探索フェーズ継続
```

### チェックOFF

```text
大ボス撃破
↓
ダンジョンクリア回数 +1
↓
ダンジョンLv上限 +1
↓
準備フェーズへ戻る
↓
ランキング自動登録
```

## ランキング自動登録仕様

準備フェーズへ戻る時に自動登録します。

- 探索停止した時
- リタイアした時
- 大ボス撃破後に自動周回せず準備フェーズへ戻った時

同じスコアを重複登録しないよう、前回登録スコアと同じ場合はスキップします。

## 設定済みWebアプリURL

```js
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwfZ6rzQ1XN-LVvCsi9jamdmW4G3xnnwizEdBH-LPY_rUjarhYFwyVyOWYzd67IACQh/exec";
```

## GitHub Pages更新方法

ZIPを展開し、以下をリポジトリ直下へ上書きしてください。

```text
index.html
style.css
app.js
manifest.json
service-worker.js
icons/
gas/
README.md
```

更新後、古い画面が残る場合は以下で開いてください。

```text
https://ユーザー名.github.io/リポジトリ名/?v=440
```

## PWAキャッシュ名

```js
const CACHE_NAME = "pharmacy-dungeon-pwa-v4-4-auto-loop-ranking";
```
