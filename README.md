# Pharmacy Dungeon

PWA IDLE HACK & SLASH v4.3.0

## v4.3.0 変更内容

- ダンジョン周回による自動敵強化を廃止
- 敵の強さは、プレイヤーが選択した `ダンジョンLv` で変化
- ダンジョンLvの上限は、そのダンジョンのクリア回数
- ダンジョンをクリアすると、そのダンジョンのLv上限が+1
- 低ランクダンジョンでは低ランク装備のみドロップ
- 低ランクダンジョンでも、ダンジョンLvを上げると高レア装備が解放
- 高ランクダンジョンは最初から高レア装備がドロップしやすい
- 各中ボス・大ボスに初回討伐報酬を追加
- ランキング送信に `dungeonLevel` と `maxRarity` を追加
- PWAキャッシュ名を `pharmacy-dungeon-pwa-v4-3-dungeon-level` に更新

## ダンジョンLv仕様

| 項目 | 内容 |
|---|---|
| 初期Lv | 0 |
| Lv上限 | そのダンジョンのクリア回数 |
| 敵の強さ | ダンジョンLvで上昇 |
| 周回だけの敵強化 | なし |
| クリア時 | Lv上限が1上がる |

例:

```text
薬草の森を初回クリア
↓
薬草の森のダンジョンLv上限が1になる
↓
準備フェーズで薬草の森 Lv0 または Lv1 を選べる
```

Lv0を選べば、同じダンジョンは1周目に近い強さで周回できます。

## ドロップレア度制限

| ダンジョン | 初期最大レア | ダンジョンLvによる解放 |
|---|---|---|
| 薬草の森 | Rまで | Lv2でSR、Lv4でSSR、Lv7でUR |
| 調剤地下道 | SRまで | Lv3でSSR、Lv6でUR |
| 監査塔 | SSRまで | Lv4でUR |
| 奈落処方庫 | URまで | 最初からURまで |

## 初回討伐報酬

各ダンジョンの中ボス・大ボスを初めて倒したとき、記念装備を1回だけ獲得します。

例:

- 大鹿の守護角
- 森獣の薬聖白衣
- カプセル監視者のロッド
- 処方竜の宝珠
- 監査双盾の白衣
- 棚卸し魔王の薬剣
- 奈落在庫番の印章
- 奈落処方支配者の調律杖

報酬装備のレア度は、その時点のダンジョンとダンジョンLvで解放されている最大レア度に合わせます。

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
https://ユーザー名.github.io/リポジトリ名/?v=430
```

## Apps Scriptについて

ランキングにダンジョンLv・最大ドロップレア度を保存するため、`gas/Code.gs` も最新版へ差し替えてください。
