# 放置ハクスラ薬屋ダンジョン PWAサンプル

「1画面で遊べるハクスラPWA」＋「Googleスプレッドシートランキング」のサンプルです。  
この版では、Diablo系ハクスラを参考にした以下の要素を追加しています。

- 職業システム
- 職業ごとのパッシブ効果
- 職業ごとの一定ターン発動スキル
- 敵の特殊能力、Affix
- ボスの第2フェーズ、激怒フェーズ
- 装備の追加効果
- ランキングへの職業表示

※ Diablo4の名称・画像・固有データは使用していません。ゲーム性の方向性のみを参考にしたオリジナル実装です。

## フォルダ構成

```text
yakudungeon_pwa_sample/
├─ index.html
├─ style.css
├─ app.js
├─ manifest.json
├─ service-worker.js
├─ icons/
│  ├─ icon-192.png
│  └─ icon-512.png
└─ gas/
   └─ Code.gs
```

## 職業

| 職業 | 特徴 |
|---|---|
| 調剤剣士 | 攻守バランス型。4回に1回「処方斬り」 |
| 爆薬錬金師 | 高火力型。5回に1回「調合爆発」 |
| 毒刃薬師 | 会心・毒型。長期戦やボスに強い |
| 守護薬士 | 高HP・被ダメ軽減型。ボス戦が安定 |
| 薬草召喚士 | 自然回復・ドロップ補正型。放置向き |

## ローカルでの確認方法

GitHub Pagesへアップロードする場合、ローカルサーバー起動は不要です。

手元で一時確認する場合のみ、以下を使えます。

```bat
cd yakudungeon_pwa_sample
python -m http.server 8080
```

```text
http://localhost:8080/
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

GitHub Pagesを有効化すると、以下のようなURLで開けます。

```text
https://ユーザー名.github.io/リポジトリ名/
```

## Googleスプレッドシートランキングの設定

### 1. Googleスプレッドシートを作成

新しいGoogleスプレッドシートを作成します。

### 2. Apps Scriptを開く

```text
拡張機能 > Apps Script
```

### 3. `gas/Code.gs` の内容を貼り付け

Apps Scriptの `Code.gs` に、このサンプル内の `gas/Code.gs` を丸ごと貼り付けます。

### 4. setup() を1回実行

Apps Script画面で関数 `setup` を選び、実行します。

### 5. Webアプリとしてデプロイ

```text
デプロイ > 新しいデプロイ > 種類の選択 > ウェブアプリ
```

設定例:

```text
説明: 薬屋ダンジョンRankingAPI
次のユーザーとして実行: 自分
アクセスできるユーザー: 全員
```

### 6. app.js にWebアプリURLを設定

`app.js` の先頭付近にある下記を変更します。

```js
const GAS_WEB_APP_URL = "";
```

例:

```js
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/xxxxxxxxxxxxxxxxxxxxxxxx/exec";
```

## 既存のランキングシートを使っている場合

今回、rankingシートに以下の列が追加されています。

- classId
- className

古い `Code.gs` のままだと職業名がランキングに出ないため、Apps Scriptも今回の `gas/Code.gs` に差し替えてください。

今回の `Code.gs` は旧版のランキング行も読み取れるようにしています。ただし、表示をきれいに揃えたい場合は新しいスプレッドシートで始めるか、旧rankingシートをバックアップ後に作り直してください。

## PWA更新時の注意

GitHubを更新しても古い画面が残る場合は、`service-worker.js` の `CACHE_NAME` を変更してください。

```js
const CACHE_NAME = "yakudungeon-pwa-v1";
```

例:

```js
const CACHE_NAME = "yakudungeon-pwa-v2";
```

## よく変更する場所

### 職業バランス

`app.js`

```js
const classData = { ... }
```

### 敵の強さ

`app.js`

```js
const enemyTemplates = [ ... ]
```

### 敵の特殊能力

`app.js`

```js
const enemyAffixes = [ ... ]
```

### レア度と装備倍率

`app.js`

```js
const rarities = [ ... ]
```

### ランキング項目

`app.js`

```js
submitRanking()
renderRanking()
```

`gas/Code.gs`

```js
HEADERS
submit_()
ranking_()
```
