# Pharmacy Dungeon

PWA IDLE HACK & SLASH v4.2.0

「1画面で遊べるハクスラPWA」＋「Googleスプレッドシートランキング」のサンプルです。

## v4.2.0 変更内容

- 最初の中ボス「薬草を守る大鹿」が強すぎる問題を調整
  - 初回の薬草の森10F中ボスは特殊能力を最大1個に制限
  - 鉄壁＋吸血が同時に付かないように調整
  - 初回中ボスのHP・攻撃力倍率を下方修正
- ダンジョンリタイアを追加
  - 現在のダンジョンを1Fからやり直し
  - リタイア後は準備フェーズへ戻る
- 準備フェーズ / 探索フェーズを追加
  - 準備フェーズ: 転職、ダンジョン変更、ストック装備の付け替え、売却が可能
  - 探索フェーズ: 自動戦闘が進行。最新ドロップ装備のみ即時付け替え可能
- 装備ストック機能を追加
  - 獲得した装備はストックに保存
  - 準備フェーズ中にストック装備へ付け替え可能
- 売却機能を強化
  - 選択装備を売却
  - 現在装備より弱い装備を売却
  - N以下 / R以下 / SR以下 / SSR以下をまとめて売却
  - 装備中のアイテムは売却不可
- PWAキャッシュ名を更新

## フェーズ仕様

### 準備フェーズ

以下ができます。

- 転職
- ダンジョン変更
- ストック装備の付け替え
- 選択装備の売却
- レア度指定の一括売却
- ダンジョンリタイア後の再準備

### 探索フェーズ

「探索開始」を押すと探索フェーズに移行します。

探索フェーズ中は以下ができます。

- 自動戦闘
- ポーション使用
- 強敵挑戦
- 最新ドロップ装備の即時装備
- ダンジョンリタイア

探索フェーズ中は以下ができません。

- 転職
- ダンジョン変更
- ストック装備の付け替え
- 装備売却

## 設定済みWebアプリURL

```js
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwfZ6rzQ1XN-LVvCsi9jamdmW4G3xnnwizEdBH-LPY_rUjarhYFwyVyOWYzd67IACQh/exec";
```

## GitHub Pagesで使う方法

ZIPを展開し、以下のファイルをリポジトリ直下へアップロードしてください。

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

GitHub Pagesへ上書き後、古い画面が残る場合は以下のように `?v=420` を付けて開いてください。

```text
https://ユーザー名.github.io/リポジトリ名/?v=420
```

## PWA更新時の注意

今回のキャッシュ名は以下です。

```js
const CACHE_NAME = "pharmacy-dungeon-pwa-v4-2-preparation-inventory";
```

それでも古い場合は、ブラウザで以下を実行してください。

```text
F12
→ Application
→ Service Workers
→ Unregister
→ Storage
→ Clear site data
→ 再読み込み
```
