<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <meta name="theme-color" content="#265c4b" />
  <title>放置ハクスラ薬屋ダンジョン</title>
  <link rel="manifest" href="./manifest.json" />
  <link rel="apple-touch-icon" href="./icons/icon-192.png" />
  <link rel="stylesheet" href="./style.css" />
</head>
<body>
  <main class="app">
    <header class="heroHeader">
      <div>
        <p class="eyebrow">PWA Idle Hack & Slash</p>
        <h1>放置ハクスラ薬屋ダンジョン</h1>
      </div>
      <button id="installBtn" class="ghostBtn hidden">ホーム画面に追加</button>
    </header>

    <section class="panel namePanel">
      <label class="nameLabel">
        プレイヤー名
        <input id="playerName" maxlength="12" placeholder="なまえ" />
      </label>

      <label class="nameLabel">
        職業 / 転職
        <select id="classSelect"></select>
      </label>

      <div id="classInfo" class="classInfo"></div>

      <div class="buttonRow">
        <button id="startBtn" class="primaryBtn">探索開始</button>
        <button id="submitRankBtn">ランキング登録</button>
        <button id="resetBtn" class="dangerBtn">リセット</button>
      </div>
    </section>

    <section class="grid">
      <section class="panel statusPanel">
        <h2>薬屋ステータス</h2>
        <div class="character">
          <div class="avatar" id="classIcon" aria-hidden="true">🔰</div>
          <div class="statList">
            <div><span>職業</span><strong id="className">新人薬剤師</strong></div>
            <div><span>熟練度</span><strong id="masteryText">Lv0</strong></div>
            <div><span>Lv</span><strong id="level">1</strong></div>
            <div><span>到達階層</span><strong id="floor">1F</strong></div>
            <div><span>戦闘力</span><strong id="power">0</strong></div>
            <div><span>ポーション</span><strong id="potions">3個</strong></div>
            <div><span>ゴールド</span><strong id="gold">0G</strong></div>
            <div><span>転職解放</span><strong id="unlockedCount">1職</strong></div>
          </div>
        </div>

        <div class="barBlock">
          <div class="barTitle"><span>HP</span><span id="hpText">100 / 100</span></div>
          <div class="bar"><div id="hpBar" class="barFill hp"></div></div>
        </div>
        <div class="barBlock">
          <div class="barTitle"><span>EXP</span><span id="expText">0 / 30</span></div>
          <div class="bar"><div id="expBar" class="barFill exp"></div></div>
        </div>

        <div class="equipment">
          <h3>装備</h3>
          <div id="equipmentList"></div>
        </div>
      </section>

      <section class="panel battlePanel">
        <div class="battleTop">
          <h2>バトル</h2>
          <span id="stateBadge" class="badge">停止中</span>
        </div>

        <div class="enemyCard">
          <div class="enemyIcon" id="enemyIcon">🐭</div>
          <div class="enemyInfo">
            <div class="enemyName" id="enemyName">眠たいスライム</div>
            <div class="enemyMeta" id="enemyMeta">通常</div>
            <div class="barBlock compact">
              <div class="barTitle"><span>敵HP</span><span id="enemyHpText">20 / 20</span></div>
              <div class="bar"><div id="enemyHpBar" class="barFill enemy"></div></div>
            </div>
          </div>
        </div>

        <label class="checkLabel">
          <input id="autoEquipBetter" type="checkbox" />
          <span>今より強い装備が落ちたら自動装備する</span>
        </label>

        <div class="buttonRow battleButtons">
          <button id="potionBtn">ポーション使用</button>
          <button id="bossBtn">エリートボス挑戦</button>
          <button id="sellBtn">不要装備を売却</button>
        </div>

        <div class="dropBox">
          <h3>最新ドロップ</h3>
          <div id="dropInfo" class="muted">まだ装備を拾っていません。</div>
          <button id="equipDropBtn" class="hidden">装備する</button>
        </div>
      </section>

      <section class="panel rankingPanel">
        <div class="rankingHeader">
          <h2>オンラインランキング</h2>
          <button id="reloadRankBtn" class="smallBtn">更新</button>
        </div>
        <div id="rankMessage" class="muted">Google Apps Script URL未設定時は端末内のデモランキングを表示します。</div>
        <ol id="rankingList" class="rankingList"></ol>
      </section>

      <section class="panel logPanel">
        <h2>冒険ログ</h2>
        <div id="log" class="log"></div>
      </section>
    </section>
  </main>

  <script src="./app.js"></script>
</body>
</html>
