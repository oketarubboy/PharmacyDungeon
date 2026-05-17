# Pharmacy Dungeon

PWA IDLE HACK & SLASH v4.1.2

「1画面で遊べるハクスラPWA」＋「Googleスプレッドシートランキング」のサンプルです。

## 今回の変更点

- アプリ名を `Pharmacy Dungeon` に変更
- 画面上部の `PWA IDLE HACK & SLASH` の後ろにバージョン `v4.1.2` を表示
- 複数ダンジョンを追加
- 各ダンジョンの途中に中ボスを配置
- 各ダンジョンの最下層に大ボスを配置
- 大ボス撃破後、そのダンジョンを1Fから周回可能
- 到達階層を `薬草の森1F` のように表示
- ランキング送信にダンジョン名・ダンジョン階層・周回数を追加
- PWAキャッシュ名を `pharmacy-dungeon-pwa-v4-1-1-startup-fix` に更新

## 設定済みWebアプリURL

```js
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwfZ6rzQ1XN-LVvCsi9jamdmW4G3xnnwizEdBH-LPY_rUjarhYFwyVyOWYzd67IACQh/exec";
```

## ダンジョン一覧

| ダンジョン | 階層 | 中ボス | 大ボス | 解放条件 |
|---|---:|---|---|---|
| 薬草の森 | 20F | 10F | 20F | 最初から |
| 調剤地下道 | 30F | 15F | 30F | 薬草の森1周クリア、総合到達18F |
| 監査塔 | 40F | 20F | 40F | 調剤地下道1周クリア、総合到達35F |
| 奈落処方庫 | 50F | 25F・40F | 50F | 監査塔1周クリア、総合到達55F |

## 周回仕様

大ボスを倒すと、そのダンジョンのクリア回数が増えます。

例:

```text
薬草の森20Fの大ボス撃破
↓
薬草の森クリア回数 +1
↓
薬草の森1Fへ戻る
```

同じダンジョンを繰り返し周回できます。

周回数が増えると、そのダンジョンの敵が少し強くなります。

## 表示仕様

到達階層は、以下の形式で表示します。

```text
薬草の森1F
調剤地下道15F
監査塔40F
奈落処方庫25F
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

## Apps Scriptについて

オンラインランキングにダンジョン名・ダンジョン階層・周回数を保存するため、Apps Script側も最新版の `gas/Code.gs` に差し替えてください。

既存のランキング行も可能な範囲で読み取れるようにしています。

## PWA更新時の注意

GitHubを更新しても古い画面が残る場合は、ブラウザ側のPWAキャッシュが残っています。  
今回の版では `service-worker.js` のキャッシュ名を変更済みです。

```js
const CACHE_NAME = "pharmacy-dungeon-pwa-v4-1-1-startup-fix";
```


## v4.1.2 更新機能

画面右上に `最新版に更新` ボタンを追加しました。

このボタンは以下を実行します。

1. 現在のセーブデータを保存
2. 登録済みService Workerを解除
3. Cache Storageを削除
4. URLに `?v=` を付けて再読み込み

セーブデータは `localStorage` に残すため、通常のゲーム進行データは消えません。

## 更新されない場合の対処

GitHub Pagesへ上書き後、画面が古いままの場合は以下の順で試してください。

1. アプリ画面右上の `最新版に更新` を押す
2. ブラウザで `Ctrl + F5`
3. Edge/Chromeの開発者ツール > Application > Service Workers > Unregister
4. Application > Storage > Clear site data
5. URL末尾に `?v=任意の数字` を付けて開く

例:

```text
https://ユーザー名.github.io/リポジトリ名/?v=410
```


## v4.1.2 起動不具合修正

初期データ作成時に、まだ準備前の `state` を参照してJavaScriptが停止する問題を修正しました。

この不具合が出ている古い画面では `最新版に更新` ボタンも動かないため、GitHubへ上書き後に以下のどれかで更新してください。

```text
1. URL末尾に ?v=411 を付けて開く
2. Ctrl + F5 で強制再読み込み
3. ブラウザの Application > Storage > Clear site data を実行
```


## v4.1.2 修正内容

古い `index.html` と新しい `app.js` がキャッシュで混在した場合でも、JavaScriptが途中停止しないようにイベント登録を安全化しました。

職業/転職やダンジョンが `オプションなし` になる場合は、古いHTMLまたは古いService Workerが残っています。GitHubへ上書き後、以下のURLのように `?v=412` を付けて開いてください。

```text
https://ユーザー名.github.io/リポジトリ名/?v=412
```
