# 放置ハクスラ薬屋ダンジョン PWAサンプル

「1画面で遊べるハクスラPWA」＋「Googleスプレッドシートランキング」のサンプルです。

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

## できること

- ブラウザで動くPWAゲーム
- 探索開始後、自動で敵と戦闘
- EXP、レベルアップ、階層進行
- 装備ドロップ、レア度、装備変更
- ポーション自動使用
- ボス挑戦
- localStorageによるセーブ
- Service Workerによるオフライン起動
- Google Apps Script + Googleスプレッドシートでオンラインランキング

## ローカルでの確認方法

Service Workerの都合上、`file://`で直接開くより、ローカルWebサーバーで起動してください。

Pythonが入っている場合:

```bat
cd yakudungeon_pwa_sample
python -m http.server 8080
```

その後、ブラウザで下記を開きます。

```text
http://localhost:8080/
```

## Googleスプレッドシートランキングの設定

### 1. Googleスプレッドシートを作成

新しいGoogleスプレッドシートを作成します。

### 2. Apps Scriptを開く

スプレッドシート上部メニューから開きます。

```text
拡張機能 > Apps Script
```

### 3. `gas/Code.gs` の内容を貼り付け

Apps Scriptの `Code.gs` に、このサンプル内の `gas/Code.gs` を丸ごと貼り付けます。

### 4. setup() を1回実行

Apps Script画面で関数 `setup` を選び、実行します。

初回はGoogleの承認画面が出ます。

### 5. Webアプリとしてデプロイ

Apps Script画面右上から設定します。

```text
デプロイ > 新しいデプロイ > 種類の選択 > ウェブアプリ
```

設定例:

```text
説明: 薬屋ダンジョンRankingAPI
次のユーザーとして実行: 自分
アクセスできるユーザー: 全員
```

デプロイ後に表示されるWebアプリURLをコピーします。

### 6. app.js にWebアプリURLを設定

`app.js` の先頭付近にある下記を変更します。

```js
const GAS_WEB_APP_URL = "";
```

例:

```js
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/xxxxxxxxxxxxxxxxxxxxxxxx/exec";
```

これでオンラインランキングが有効になります。

## API_KEYについて

`app.js` と `gas/Code.gs` の両方に同じ `API_KEY` を設定しています。

```js
const API_KEY = "yakudungeon-demo-key";
```

公開利用する場合は、任意の文字列に変更してください。

ただし、PWAのJavaScript内に書く値なので、完全な秘密情報にはなりません。
このサンプルのAPI_KEYは、誤送信や簡単ないたずらを減らすための簡易対策です。

## チート対策について

このサンプルでは、Apps Script側で以下の簡易チェックを行っています。

- API_KEYチェック
- 名前・数値の整形
- スコア異常値チェック
- 短時間の連続登録制限
- 同一端末ユーザーは最高スコアのみランキング表示

PWAはブラウザ側で動くため、本格的なチート対策にはサーバー側でバトル計算やセーブ管理を持つ構成が必要です。

## 公開方法

社内や個人利用なら、以下のような場所にアップロードできます。

- GitHub Pages
- 社内Webサーバー
- Xserverなどのレンタルサーバー
- Cloudflare Pages
- Firebase Hosting

PWAとしてホーム画面に追加する場合は、HTTPS環境での公開を推奨します。

## よく変更する場所

### タイトル

`index.html`

```html
<title>放置ハクスラ薬屋ダンジョン</title>
```

### ゲームバランス

`app.js`

- `enemyTemplates`
- `bossTemplates`
- `rarities`
- `calcScore()`
- `generateDrop()`
- `levelUp()`

### ランキング項目

`gas/Code.gs`

- `HEADERS`
- `submit_()`
- `ranking_()`

`app.js`

- `submitRanking()`
- `renderRanking()`
