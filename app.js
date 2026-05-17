/* 放置ハクスラ薬屋ダンジョン - PWA sample
 * Google Apps Script のWebアプリURLを入れるとオンラインランキングが有効になります。
 */
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwfZ6rzQ1XN-LVvCsi9jamdmW4G3xnnwizEdBH-LPY_rUjarhYFwyVyOWYzd67IACQh/exec"; // 例: "https://script.google.com/macros/s/xxxxx/exec"
const API_KEY = "yakudungeon-demo-key"; // gas/Code.gs 側の API_KEY と同じ値にしてください。

const STORAGE_KEY = "yakudungeon.save.v1";
const USER_ID_KEY = "yakudungeon.userId.v1";

const slots = [
  { key: "weapon", label: "調剤杖" },
  { key: "armor", label: "白衣" },
  { key: "accessory", label: "薬瓶" },
];

const rarities = [
  { id: "N", name: "N", mult: 1.0, chance: 62 },
  { id: "R", name: "R", mult: 1.35, chance: 25 },
  { id: "SR", name: "SR", mult: 1.85, chance: 9 },
  { id: "SSR", name: "SSR", mult: 2.55, chance: 3.3 },
  { id: "UR", name: "UR", mult: 3.8, chance: 0.7 },
];

const enemyTemplates = [
  { name: "眠たいスライム", icon: "🫧", hp: 18, atk: 4, exp: 8, gold: 5 },
  { name: "迷子の薬草ネズミ", icon: "🐭", hp: 24, atk: 5, exp: 10, gold: 7 },
  { name: "湿布ゴブリン", icon: "👺", hp: 34, atk: 7, exp: 13, gold: 10 },
  { name: "カプセルミミック", icon: "💊", hp: 44, atk: 9, exp: 18, gold: 14 },
  { name: "レセプトゴーレム", icon: "🗿", hp: 64, atk: 12, exp: 26, gold: 20 },
];

const bossTemplates = [
  { name: "期限切れドラゴン", icon: "🐉" },
  { name: "棚卸し魔王", icon: "👑" },
  { name: "監査の番人", icon: "🛡️" },
];

const itemNames = {
  weapon: ["薬研の杖", "計数のロッド", "調剤監査ワンド", "レア錠剤セプター"],
  armor: ["新人白衣", "防菌エプロン", "守護の白衣", "薬聖ローブ"],
  accessory: ["小さな薬瓶", "薬歴チャーム", "処方箋リング", "奇跡のアンプル"],
};

const els = {};
let state = createInitialState();
let loopId = null;
let latestDrop = null;
let deferredInstallPrompt = null;

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  load();
  bindEvents();
  render();
  loadRanking();
  registerServiceWorker();
});

function bindElements() {
  [
    "installBtn", "playerName", "startBtn", "submitRankBtn", "resetBtn", "level", "floor", "power", "gold",
    "hpText", "hpBar", "expText", "expBar", "equipmentList", "stateBadge", "enemyIcon", "enemyName",
    "enemyHpText", "enemyHpBar", "potionBtn", "bossBtn", "sellBtn", "dropInfo", "equipDropBtn",
    "reloadRankBtn", "rankMessage", "rankingList", "log"
  ].forEach((id) => els[id] = document.getElementById(id));
}

function bindEvents() {
  els.startBtn.addEventListener("click", toggleRun);
  els.potionBtn.addEventListener("click", usePotion);
  els.bossBtn.addEventListener("click", challengeBoss);
  els.sellBtn.addEventListener("click", sellWeakItems);
  els.equipDropBtn.addEventListener("click", equipLatestDrop);
  els.submitRankBtn.addEventListener("click", submitRanking);
  els.reloadRankBtn.addEventListener("click", loadRanking);
  els.resetBtn.addEventListener("click", resetGame);
  els.playerName.addEventListener("input", () => {
    state.playerName = sanitizeName(els.playerName.value);
    save();
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    els.installBtn.classList.remove("hidden");
  });

  els.installBtn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    els.installBtn.classList.add("hidden");
  });
}

function createInitialState() {
  const equipment = {};
  slots.forEach((slot) => {
    equipment[slot.key] = {
      slot: slot.key,
      name: `古びた${slot.label}`,
      rarity: "N",
      power: 3,
      level: 1,
      value: 4,
    };
  });

  return {
    userId: getUserId(),
    playerName: "",
    running: false,
    level: 1,
    exp: 0,
    expNext: 30,
    floor: 1,
    gold: 0,
    hp: 100,
    maxHp: 100,
    baseAtk: 9,
    potions: 3,
    enemiesDefeated: 0,
    rareDrops: 0,
    equipment,
    inventory: [],
    enemy: makeEnemy(1, false),
    logs: ["薬屋ダンジョンへようこそ。探索開始を押すと自動で戦います。"],
    lastSubmittedScore: 0,
  };
}

function getUserId() {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID()
      : `u_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

function load() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    state = { ...createInitialState(), ...parsed, userId: getUserId() };
    // 再表示時に「探索中」表示だけ残らないよう、起動直後は必ず停止状態に戻します。
    state.running = false;
    state.enemy = parsed.enemy || makeEnemy(state.floor, false);
    state.logs = Array.isArray(parsed.logs) ? parsed.logs.slice(-60) : [];
  } catch (e) {
    console.warn(e);
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetGame() {
  if (!confirm("セーブデータをリセットします。よろしいですか？")) return;
  stop();
  localStorage.removeItem(STORAGE_KEY);
  const keepName = state.playerName;
  state = createInitialState();
  state.playerName = keepName;
  latestDrop = null;
  log("セーブデータをリセットしました。");
  save();
  render();
}

function toggleRun() {
  if (state.running) {
    stop();
  } else {
    start();
  }
}

function start() {
  if (!state.playerName) {
    state.playerName = sanitizeName(els.playerName.value) || "薬屋さん";
  }
  state.running = true;
  loopId = setInterval(tick, 1000);
  log("探索を開始しました。");
  render();
  save();
}

function stop() {
  state.running = false;
  if (loopId) clearInterval(loopId);
  loopId = null;
  render();
  save();
}

function tick() {
  const dmg = calcAttack();
  state.enemy.hp = Math.max(0, state.enemy.hp - dmg);
  log(`${state.enemy.name}へ${dmg}ダメージ。`);

  if (state.enemy.hp <= 0) {
    defeatEnemy();
  } else {
    const enemyDmg = Math.max(1, state.enemy.atk + randInt(-2, 2) - Math.floor(totalPower() / 85));
    state.hp = Math.max(0, state.hp - enemyDmg);
    if (state.hp <= 0) {
      const penalty = Math.max(1, Math.floor(state.gold * 0.08));
      state.gold = Math.max(0, state.gold - penalty);
      state.hp = Math.ceil(state.maxHp * 0.55);
      log(`倒れてしまいました。治療費として${penalty}Gを支払い復帰しました。`);
    } else if (state.hp < state.maxHp * 0.28 && state.potions > 0) {
      usePotion(true);
    }
  }

  render();
  save();
}

function calcAttack() {
  const variance = randInt(-2, 4);
  return Math.max(1, state.baseAtk + Math.floor(totalPower() / 8) + state.level * 2 + variance);
}

function totalPower() {
  return Object.values(state.equipment).reduce((sum, item) => sum + (item.power || 0), 0);
}

function calcBattlePower() {
  return totalPower() + state.level * 12 + state.maxHp + state.baseAtk * 3;
}

function defeatEnemy() {
  const enemy = state.enemy;
  state.enemiesDefeated += 1;
  state.exp += enemy.exp;
  state.gold += enemy.gold;
  state.hp = Math.min(state.maxHp, state.hp + 5 + Math.floor(state.maxHp * 0.03));

  log(`${enemy.name}を倒しました。EXP+${enemy.exp} / ${enemy.gold}G獲得。`);

  while (state.exp >= state.expNext) {
    state.exp -= state.expNext;
    levelUp();
  }

  if (Math.random() < 0.38 || enemy.isBoss) {
    const drop = generateDrop(enemy.isBoss);
    latestDrop = drop;
    state.inventory.push(drop);
    if (drop.rarity !== "N" && drop.rarity !== "R") state.rareDrops += 1;
    log(`${drop.rarity} ${drop.name} を拾いました。`);
  }

  if (enemy.isBoss) {
    state.floor += 3;
    state.potions += 1;
    log(`ボス撃破。階層が${state.floor}Fまで進み、ポーションを1個補充しました。`);
  } else {
    state.floor += 1;
  }

  state.enemy = makeEnemy(state.floor, false);
}

function levelUp() {
  state.level += 1;
  state.maxHp += 10;
  state.baseAtk += 2;
  state.hp = state.maxHp;
  state.expNext = Math.floor(state.expNext * 1.23 + 12);
  if (state.level % 3 === 0) state.potions += 1;
  log(`レベルアップ！ Lv${state.level}になりました。`);
}

function usePotion(isAuto = false) {
  if (state.potions <= 0) {
    log("ポーションがありません。");
    return;
  }
  const heal = Math.ceil(state.maxHp * 0.52);
  state.potions -= 1;
  state.hp = Math.min(state.maxHp, state.hp + heal);
  log(`${isAuto ? "自動で" : ""}ポーションを使用し、HPを${heal}回復しました。残り${state.potions}個。`);
  render();
  save();
}

function challengeBoss() {
  if (state.enemy?.isBoss) {
    log("すでにボスと戦闘中です。");
    return;
  }
  state.enemy = makeEnemy(state.floor, true);
  log(`${state.enemy.name}が現れました。`);
  render();
  save();
}

function sellWeakItems() {
  if (!state.inventory.length) {
    log("売却できる装備がありません。");
    return;
  }

  let sold = 0;
  let keep = [];
  for (const item of state.inventory) {
    const equipped = state.equipment[item.slot];
    if (item.id === equipped.id || item.power >= equipped.power) {
      keep.push(item);
    } else {
      sold += item.value;
    }
  }
  state.inventory = keep;
  state.gold += sold;
  log(`不要装備を売却し、${sold}Gを獲得しました。`);
  render();
  save();
}

function equipLatestDrop() {
  if (!latestDrop) return;
  state.equipment[latestDrop.slot] = latestDrop;
  log(`${latestDrop.name}を装備しました。`);
  latestDrop = null;
  render();
  save();
}

function makeEnemy(floor, isBoss) {
  if (isBoss) {
    const b = bossTemplates[randInt(0, bossTemplates.length - 1)];
    return {
      ...b,
      isBoss: true,
      maxHp: Math.floor(120 + floor * 36),
      hp: Math.floor(120 + floor * 36),
      atk: Math.floor(14 + floor * 3.2),
      exp: Math.floor(45 + floor * 12),
      gold: Math.floor(40 + floor * 10),
    };
  }

  const t = enemyTemplates[Math.min(enemyTemplates.length - 1, Math.floor(floor / 7))] || enemyTemplates.at(-1);
  const scale = 1 + floor * 0.12;
  const maxHp = Math.floor(t.hp * scale);
  return {
    ...t,
    isBoss: false,
    maxHp,
    hp: maxHp,
    atk: Math.floor(t.atk * scale),
    exp: Math.floor(t.exp * scale),
    gold: Math.floor(t.gold * scale),
  };
}

function generateDrop(isBoss) {
  const slot = slots[randInt(0, slots.length - 1)].key;
  const rarity = pickRarity(isBoss);
  const base = Math.floor(4 + state.floor * 1.8 + state.level * 1.5);
  const power = Math.floor((base + randInt(0, 8)) * rarity.mult * (isBoss ? 1.25 : 1));
  const names = itemNames[slot];
  const name = `${prefixByRarity(rarity.id)}${names[randInt(0, names.length - 1)]}+${Math.floor(power / 12)}`;
  return {
    id: `i_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    slot,
    name,
    rarity: rarity.id,
    power,
    level: state.floor,
    value: Math.max(3, Math.floor(power * rarity.mult * 2)),
  };
}

function pickRarity(isBoss) {
  const bonus = isBoss ? 1.8 : 1.0;
  const table = rarities.map((r) => ({ ...r, chance: r.chance * (r.id === "SSR" || r.id === "UR" ? bonus : 1) }));
  const total = table.reduce((sum, r) => sum + r.chance, 0);
  let roll = Math.random() * total;
  for (const r of table) {
    roll -= r.chance;
    if (roll <= 0) return r;
  }
  return table[0];
}

function prefixByRarity(rarity) {
  return {
    N: "量産型",
    R: "上質な",
    SR: "輝く",
    SSR: "伝説の",
    UR: "神薬の",
  }[rarity] || "";
}

function calcScore() {
  return Math.floor(
    state.floor * 1500 +
    state.level * 800 +
    calcBattlePower() * 16 +
    state.enemiesDefeated * 65 +
    state.rareDrops * 5000 +
    state.gold * 0.15
  );
}

async function submitRanking() {
  state.playerName = sanitizeName(els.playerName.value) || "薬屋さん";
  const payload = {
    key: API_KEY,
    userId: state.userId,
    name: state.playerName,
    level: state.level,
    floor: state.floor,
    power: calcBattlePower(),
    score: calcScore(),
    enemies: state.enemiesDefeated,
    rareDrops: state.rareDrops,
  };

  if (!GAS_WEB_APP_URL) {
    saveLocalRanking(payload);
    state.lastSubmittedScore = payload.score;
    log(`デモランキングに登録しました。スコア: ${payload.score.toLocaleString()}`);
    loadRanking();
    save();
    return;
  }

  try {
    const res = await gasJsonp("submit", payload);
    if (!res.ok) {
      log(`ランキング登録エラー: ${res.message || "登録できませんでした。"}`);
      return;
    }
    state.lastSubmittedScore = payload.score;
    log(`オンラインランキングに登録しました。スコア: ${payload.score.toLocaleString()}`);
    await loadRanking();
    save();
  } catch (e) {
    console.error(e);
    log("ランキング登録に失敗しました。GAS URLや公開設定を確認してください。");
  }
}

async function loadRanking() {
  if (!GAS_WEB_APP_URL) {
    els.rankMessage.textContent = "GAS URL未設定のため、端末内のデモランキングを表示中です。";
    renderRanking(loadLocalRanking());
    return;
  }

  els.rankMessage.textContent = "オンラインランキングを取得中です。";
  try {
    const res = await gasJsonp("ranking", { key: API_KEY, limit: 20 });
    if (!res.ok) {
      els.rankMessage.textContent = res.message || "ランキングを取得できませんでした。";
      return;
    }
    els.rankMessage.textContent = `最終更新: ${new Date().toLocaleString("ja-JP")}`;
    renderRanking(res.items || []);
  } catch (e) {
    console.error(e);
    els.rankMessage.textContent = "ランキング取得に失敗しました。GAS URLや公開設定を確認してください。";
  }
}

function gasJsonp(action, params = {}) {
  return new Promise((resolve, reject) => {
    const callback = `__yakudungeon_cb_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const script = document.createElement("script");
    const url = new URL(GAS_WEB_APP_URL);
    url.searchParams.set("action", action);
    url.searchParams.set("callback", callback);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("GAS request timeout"));
    }, 12000);

    function cleanup() {
      clearTimeout(timer);
      delete window[callback];
      script.remove();
    }

    window[callback] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("GAS request error"));
    };

    script.src = url.toString();
    document.body.appendChild(script);
  });
}

function saveLocalRanking(payload) {
  const items = loadLocalRanking();
  items.push({ ...payload, createdAt: new Date().toISOString() });
  items.sort((a, b) => b.score - a.score);
  localStorage.setItem("yakudungeon.localRanking.v1", JSON.stringify(items.slice(0, 20)));
}

function loadLocalRanking() {
  try {
    return JSON.parse(localStorage.getItem("yakudungeon.localRanking.v1") || "[]");
  } catch {
    return [];
  }
}

function renderRanking(items) {
  els.rankingList.innerHTML = "";
  if (!items.length) {
    els.rankingList.innerHTML = `<li class="muted">まだランキングがありません。</li>`;
    return;
  }

  items.slice(0, 20).forEach((item, idx) => {
    const li = document.createElement("li");
    li.className = "rankItem";
    li.innerHTML = `
      <div class="rankNo">${idx + 1}</div>
      <div>
        <div class="rankName">${escapeHtml(item.name || "薬屋さん")}</div>
        <div class="rankMeta">Lv${Number(item.level || 1)} / ${Number(item.floor || 1)}F / 戦闘力${Number(item.power || 0).toLocaleString()}</div>
      </div>
      <div class="rankScore">${Number(item.score || 0).toLocaleString()}</div>
    `;
    els.rankingList.appendChild(li);
  });
}

function render() {
  els.playerName.value = state.playerName || "";
  els.startBtn.textContent = state.running ? "探索停止" : "探索開始";
  els.stateBadge.textContent = state.running ? "探索中" : "停止中";
  els.stateBadge.style.background = state.running ? "rgba(47, 125, 91, 0.14)" : "rgba(24, 52, 41, 0.08)";

  els.level.textContent = state.level;
  els.floor.textContent = `${state.floor}F`;
  els.power.textContent = calcBattlePower().toLocaleString();
  els.gold.textContent = `${Math.floor(state.gold).toLocaleString()}G`;
  els.hpText.textContent = `${state.hp} / ${state.maxHp}`;
  els.hpBar.style.width = `${percent(state.hp, state.maxHp)}%`;
  els.expText.textContent = `${state.exp} / ${state.expNext}`;
  els.expBar.style.width = `${percent(state.exp, state.expNext)}%`;

  els.enemyIcon.textContent = state.enemy.icon;
  els.enemyName.textContent = state.enemy.name;
  els.enemyHpText.textContent = `${state.enemy.hp} / ${state.enemy.maxHp}`;
  els.enemyHpBar.style.width = `${percent(state.enemy.hp, state.enemy.maxHp)}%`;

  els.equipmentList.innerHTML = "";
  slots.forEach((slot) => {
    const item = state.equipment[slot.key];
    const div = document.createElement("div");
    div.className = "equipItem";
    div.innerHTML = `
      <div class="slot">${slot.label}</div>
      <div>${escapeHtml(item.name)}</div>
      <div><span class="rarity ${item.rarity}">${item.rarity}</span> +${item.power}</div>
    `;
    els.equipmentList.appendChild(div);
  });

  if (latestDrop) {
    const equipped = state.equipment[latestDrop.slot];
    const diff = latestDrop.power - equipped.power;
    els.dropInfo.innerHTML = `<strong class="rarity ${latestDrop.rarity}">${latestDrop.rarity}</strong> ${escapeHtml(latestDrop.name)} / ${slotLabel(latestDrop.slot)} / 戦闘力 +${latestDrop.power} <span class="${diff >= 0 ? "rarity SSR" : "muted"}">(${diff >= 0 ? "+" : ""}${diff})</span>`;
    els.equipDropBtn.classList.remove("hidden");
  } else {
    els.dropInfo.textContent = "まだ装備を拾っていません。";
    els.equipDropBtn.classList.add("hidden");
  }

  els.log.innerHTML = "";
  state.logs.slice(-80).forEach((line) => {
    const p = document.createElement("p");
    p.className = "logLine";
    p.textContent = line;
    els.log.appendChild(p);
  });
}

function slotLabel(key) {
  return slots.find((s) => s.key === key)?.label || key;
}

function log(message) {
  const time = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  state.logs.push(`[${time}] ${message}`);
  state.logs = state.logs.slice(-80);
}

function percent(value, max) {
  if (!max) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

function sanitizeName(name) {
  return String(name || "").trim().replace(/[<>]/g, "").slice(0, 12);
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(console.warn);
  }
}
