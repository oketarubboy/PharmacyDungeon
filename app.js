/* 放置ハクスラ薬屋ダンジョン - PWA sample
 * Diablo4風の「職業差」「敵の特殊能力」「レア装備効果」を参考にした調整版です。
 * Google Apps Script のWebアプリURLを入れるとオンラインランキングが有効になります。
 */
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwfZ6rzQ1XN-LVvCsi9jamdmW4G3xnnwizEdBH-LPY_rUjarhYFwyVyOWYzd67IACQh/exec"; // 例: "https://script.google.com/macros/s/xxxxx/exec"
const API_KEY = "yakudungeon-demo-key"; // gas/Code.gs 側の API_KEY と同じ値にしてください。

const STORAGE_KEY = "yakudungeon.save.v2.class";
const USER_ID_KEY = "yakudungeon.userId.v1";

const classData = {
  blade: {
    id: "blade",
    name: "調剤剣士",
    icon: "⚔️",
    role: "近接・安定型",
    desc: "攻守のバランスがよく、4回に1回「処方斬り」で大ダメージ。",
    hpMult: 1.08,
    atkMult: 1.08,
    critRate: 0.08,
    critDmg: 1.75,
    damageReduction: 0.04,
    regen: 0.00,
    poisonChance: 0.00,
    bossDmg: 1.05,
    dropBonus: 0.00,
    skillEvery: 4,
    skillName: "処方斬り",
    skillMult: 1.85
  },
  alchemist: {
    id: "alchemist",
    name: "爆薬錬金師",
    icon: "🧪",
    role: "範囲火力型",
    desc: "攻撃力が高く、5回に1回「調合爆発」で大ダメージ。防御は低め。",
    hpMult: 0.92,
    atkMult: 1.24,
    critRate: 0.11,
    critDmg: 1.95,
    damageReduction: -0.04,
    regen: 0.00,
    poisonChance: 0.00,
    bossDmg: 1.00,
    dropBonus: 0.02,
    skillEvery: 5,
    skillName: "調合爆発",
    skillMult: 2.55
  },
  poison: {
    id: "poison",
    name: "毒刃薬師",
    icon: "🗡️",
    role: "会心・毒型",
    desc: "会心率が高く、毒で継続ダメージ。ボスの長期戦に強い。",
    hpMult: 0.98,
    atkMult: 1.04,
    critRate: 0.21,
    critDmg: 2.05,
    damageReduction: 0.00,
    regen: 0.00,
    poisonChance: 0.32,
    bossDmg: 1.08,
    dropBonus: 0.00,
    skillEvery: 6,
    skillName: "猛毒投与",
    skillMult: 1.45
  },
  guardian: {
    id: "guardian",
    name: "守護薬士",
    icon: "🛡️",
    role: "耐久・ボス型",
    desc: "HPと軽減が高く、被弾に強い。火力は控えめだがボス戦が安定。",
    hpMult: 1.32,
    atkMult: 0.92,
    critRate: 0.05,
    critDmg: 1.6,
    damageReduction: 0.16,
    regen: 0.012,
    poisonChance: 0.00,
    bossDmg: 1.02,
    dropBonus: 0.00,
    skillEvery: 5,
    skillName: "守護処方",
    skillMult: 1.35
  },
  herbalist: {
    id: "herbalist",
    name: "薬草召喚士",
    icon: "🌿",
    role: "回復・ドロップ型",
    desc: "自然回復とドロップ補正を持つ放置向き職業。瞬間火力は低め。",
    hpMult: 1.04,
    atkMult: 0.98,
    critRate: 0.07,
    critDmg: 1.7,
    damageReduction: 0.06,
    regen: 0.018,
    poisonChance: 0.10,
    bossDmg: 1.00,
    dropBonus: 0.08,
    skillEvery: 4,
    skillName: "薬草の使い魔",
    skillMult: 1.65
  }
};

const slots = [
  { key: "weapon", label: "調剤杖" },
  { key: "armor", label: "白衣" },
  { key: "accessory", label: "薬瓶" },
];

const rarities = [
  { id: "N", name: "N", label: "通常", mult: 1.0, chance: 52, affixes: 0 },
  { id: "R", name: "R", label: "魔法", mult: 1.35, chance: 30, affixes: 1 },
  { id: "SR", name: "SR", label: "希少", mult: 1.9, chance: 12, affixes: 2 },
  { id: "SSR", name: "SSR", label: "伝説", mult: 2.7, chance: 4.8, affixes: 3 },
  { id: "UR", name: "UR", label: "神話", mult: 4.1, chance: 1.2, affixes: 4 },
];

const enemyTemplates = [
  { name: "眠たいスライム", icon: "🫧", hp: 22, atk: 5, exp: 9, gold: 6 },
  { name: "迷子の薬草ネズミ", icon: "🐭", hp: 31, atk: 6, exp: 12, gold: 8 },
  { name: "湿布ゴブリン", icon: "👺", hp: 44, atk: 9, exp: 16, gold: 12 },
  { name: "カプセルミミック", icon: "💊", hp: 62, atk: 12, exp: 24, gold: 18 },
  { name: "レセプトゴーレム", icon: "🗿", hp: 90, atk: 17, exp: 35, gold: 28 },
  { name: "奈落の在庫番", icon: "👁️", hp: 126, atk: 23, exp: 48, gold: 40 },
];

const bossTemplates = [
  { name: "期限切れドラゴン", icon: "🐉" },
  { name: "棚卸し魔王", icon: "👑" },
  { name: "監査の番人", icon: "🛡️" },
  { name: "奈落処方の支配者", icon: "🕯️" },
];

const enemyAffixes = [
  { id: "barrier", name: "鉄壁", hpMult: 1.34, atkMult: 1.0, rewardMult: 1.12 },
  { id: "swift", name: "迅速", hpMult: 1.0, atkMult: 1.24, rewardMult: 1.10 },
  { id: "vampire", name: "吸血", hpMult: 1.08, atkMult: 1.10, rewardMult: 1.15 },
  { id: "toxic", name: "毒霧", hpMult: 1.05, atkMult: 1.14, rewardMult: 1.15 },
  { id: "treasure", name: "財宝", hpMult: 1.18, atkMult: 1.08, rewardMult: 1.35 },
];

const itemNames = {
  weapon: ["薬研の杖", "計数のロッド", "調剤監査ワンド", "レア錠剤セプター", "奈落の薬刀"],
  armor: ["新人白衣", "防菌エプロン", "守護の白衣", "薬聖ローブ", "災厄避けの外套"],
  accessory: ["小さな薬瓶", "薬歴チャーム", "処方箋リング", "奇跡のアンプル", "古代薬局の印章"],
};

const itemAffixPool = [
  { id: "atkPct", label: "攻撃", unit: "%", min: 4, max: 18 },
  { id: "hpPct", label: "最大HP", unit: "%", min: 4, max: 18 },
  { id: "critPct", label: "会心率", unit: "%", min: 2, max: 9 },
  { id: "critDmgPct", label: "会心ダメ", unit: "%", min: 8, max: 35 },
  { id: "bossPct", label: "ボス与ダメ", unit: "%", min: 5, max: 25 },
  { id: "reductionPct", label: "被ダメ軽減", unit: "%", min: 2, max: 10 },
  { id: "dropPct", label: "ドロップ率", unit: "%", min: 2, max: 9 },
];

const els = {};
let state = createInitialState();
let loopId = null;
let latestDrop = null;
let deferredInstallPrompt = null;

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  populateClasses();
  load();
  bindEvents();
  render();
  loadRanking();
  registerServiceWorker();
});

function bindElements() {
  [
    "installBtn", "playerName", "classSelect", "classInfo", "classIcon", "className", "startBtn", "submitRankBtn", "resetBtn",
    "level", "floor", "power", "gold", "potions", "hpText", "hpBar", "expText", "expBar", "equipmentList", "stateBadge",
    "enemyIcon", "enemyName", "enemyMeta", "enemyHpText", "enemyHpBar", "potionBtn", "bossBtn", "sellBtn", "dropInfo",
    "equipDropBtn", "reloadRankBtn", "rankMessage", "rankingList", "log"
  ].forEach((id) => els[id] = document.getElementById(id));
}

function populateClasses() {
  els.classSelect.innerHTML = "";
  Object.values(classData).forEach((cls) => {
    const opt = document.createElement("option");
    opt.value = cls.id;
    opt.textContent = `${cls.icon} ${cls.name} / ${cls.role}`;
    els.classSelect.appendChild(opt);
  });
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
  els.classSelect.addEventListener("change", () => {
    const next = els.classSelect.value;
    if (!classData[next]) return;
    state.classId = next;
    state.maxHp = calcMaxHp();
    state.hp = Math.min(state.hp, state.maxHp);
    log(`${getClass().name}に職業を変更しました。`);
    render();
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
      id: `starter_${slot.key}`,
      slot: slot.key,
      name: `古びた${slot.label}`,
      rarity: "N",
      power: 5,
      level: 1,
      value: 4,
      affixes: [],
    };
  });

  const s = {
    userId: getUserId(),
    playerName: "",
    classId: "blade",
    running: false,
    level: 1,
    exp: 0,
    expNext: 34,
    floor: 1,
    gold: 0,
    hp: 110,
    maxHp: 110,
    baseAtk: 10,
    potions: 3,
    enemiesDefeated: 0,
    rareDrops: 0,
    skillCounter: 0,
    equipment,
    inventory: [],
    enemy: null,
    logs: ["薬屋ダンジョンへようこそ。職業を選んで探索開始を押すと自動で戦います。"],
    lastSubmittedScore: 0,
  };
  s.maxHp = calcMaxHp(s);
  s.hp = s.maxHp;
  s.enemy = makeEnemy(1, false);
  return s;
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
    const initial = createInitialState();
    state = { ...initial, ...parsed, userId: getUserId() };
    state.running = false;
    state.classId = classData[state.classId] ? state.classId : "blade";
    state.equipment = { ...initial.equipment, ...(parsed.equipment || {}) };
    state.enemy = parsed.enemy || makeEnemy(state.floor, false);
    state.logs = Array.isArray(parsed.logs) ? parsed.logs.slice(-80) : [];
    state.maxHp = calcMaxHp();
    state.hp = Math.min(Number(state.hp || state.maxHp), state.maxHp);
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
  const keepClass = state.classId;
  state = createInitialState();
  state.playerName = keepName;
  state.classId = keepClass;
  state.maxHp = calcMaxHp();
  state.hp = state.maxHp;
  latestDrop = null;
  log("セーブデータをリセットしました。");
  save();
  render();
}

function getClass(source = state) {
  return classData[source.classId] || classData.blade;
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
  state.maxHp = calcMaxHp();

  const cls = getClass();
  if (cls.regen > 0 && state.hp > 0) {
    const heal = Math.max(1, Math.floor(state.maxHp * cls.regen));
    state.hp = Math.min(state.maxHp, state.hp + heal);
  }

  applyPoisonDamage();

  const attack = performPlayerAttack();
  state.enemy.hp = Math.max(0, state.enemy.hp - attack.damage);
  let line = `${state.enemy.name}へ${attack.damage}ダメージ。`;
  if (attack.crit) line += " 会心！";
  if (attack.skill) line += ` ${attack.skill}発動！`;
  log(line);

  if (Math.random() < cls.poisonChance) {
    const poisonDamage = Math.max(2, Math.floor((state.level + totalPower() / 10) * 0.45));
    state.enemy.poison = Math.max(state.enemy.poison || 0, 3);
    state.enemy.poisonDamage = Math.max(state.enemy.poisonDamage || 0, poisonDamage);
    log(`${state.enemy.name}に毒を付与しました。`);
  }

  if (state.enemy.hp <= 0) {
    defeatEnemy();
    render();
    save();
    return;
  }

  handleBossPhase();
  enemyAttack();

  render();
  save();
}

function applyPoisonDamage() {
  if (!state.enemy.poison || state.enemy.poison <= 0) return;
  const dmg = Math.max(1, state.enemy.poisonDamage || 1);
  state.enemy.hp = Math.max(0, state.enemy.hp - dmg);
  state.enemy.poison -= 1;
  log(`毒で${state.enemy.name}へ${dmg}ダメージ。`);
}

function performPlayerAttack() {
  const cls = getClass();
  state.skillCounter = (state.skillCounter || 0) + 1;

  let damage =
    state.baseAtk * cls.atkMult +
    Math.floor(totalPower() / 7) +
    state.level * 2.4 +
    affixTotal("atkPct") / 100 * (state.baseAtk + totalPower() / 5) +
    randInt(-3, 5);

  if (state.enemy.isBoss) {
    damage *= cls.bossDmg * (1 + affixTotal("bossPct") / 100);
  }

  let skill = "";
  if (cls.skillEvery && state.skillCounter % cls.skillEvery === 0) {
    damage *= cls.skillMult;
    skill = cls.skillName;
  }

  let critRate = cls.critRate + affixTotal("critPct") / 100;
  let critDmg = cls.critDmg + affixTotal("critDmgPct") / 100;
  const crit = Math.random() < Math.min(0.65, critRate);
  if (crit) damage *= critDmg;

  return {
    damage: Math.max(1, Math.floor(damage)),
    crit,
    skill,
  };
}

function handleBossPhase() {
  const enemy = state.enemy;
  if (!enemy.isBoss) return;

  const hpRate = enemy.hp / enemy.maxHp;
  if (hpRate <= 0.35 && !enemy.enraged) {
    enemy.enraged = true;
    enemy.atk = Math.floor(enemy.atk * 1.28);
    log(`${enemy.name}が激怒フェーズに入りました。攻撃力が上昇しました。`);
  } else if (hpRate <= 0.70 && !enemy.phaseTwo) {
    enemy.phaseTwo = true;
    enemy.atk = Math.floor(enemy.atk * 1.12);
    log(`${enemy.name}が第2フェーズに入りました。`);
  }
}

function enemyAttack() {
  const cls = getClass();
  const enemy = state.enemy;

  let enemyDmg = enemy.atk + randInt(-2, 3) - Math.floor(totalPower() / 95);
  if (enemy.affixes?.some((a) => a.id === "toxic")) {
    enemyDmg += Math.max(1, Math.floor(state.maxHp * 0.018));
  }

  const reduction = Math.max(-0.2, Math.min(0.65, cls.damageReduction + affixTotal("reductionPct") / 100));
  enemyDmg = Math.max(1, Math.floor(enemyDmg * (1 - reduction)));

  state.hp = Math.max(0, state.hp - enemyDmg);
  log(`${enemy.name}から${enemyDmg}ダメージを受けました。`);

  if (enemy.affixes?.some((a) => a.id === "vampire")) {
    const heal = Math.max(1, Math.floor(enemyDmg * 0.45));
    enemy.hp = Math.min(enemy.maxHp, enemy.hp + heal);
    log(`${enemy.name}が吸血で${heal}回復しました。`);
  }

  if (state.hp <= 0) {
    const penalty = Math.max(1, Math.floor(state.gold * 0.08));
    state.gold = Math.max(0, state.gold - penalty);
    state.hp = Math.ceil(state.maxHp * 0.55);
    log(`倒れてしまいました。治療費として${penalty}Gを支払い復帰しました。`);
  } else if (state.hp < state.maxHp * 0.28 && state.potions > 0) {
    usePotion(true);
  }
}

function calcMaxHp(source = state) {
  const cls = getClass(source);
  const base = 100 + (source.level || 1) * 10;
  const affixBonus = 1 + affixTotal("hpPct", source) / 100;
  return Math.floor(base * cls.hpMult * affixBonus);
}

function totalPower(source = state) {
  return Object.values(source.equipment || {}).reduce((sum, item) => sum + (Number(item.power) || 0), 0);
}

function affixTotal(id, source = state) {
  return Object.values(source.equipment || {}).reduce((sum, item) => {
    return sum + (item.affixes || []).filter((a) => a.id === id).reduce((s, a) => s + Number(a.value || 0), 0);
  }, 0);
}

function calcBattlePower() {
  const cls = getClass();
  return Math.floor(
    totalPower() +
    state.level * 14 +
    state.maxHp +
    state.baseAtk * cls.atkMult * 4 +
    affixTotal("critPct") * 24 +
    affixTotal("bossPct") * 9 +
    affixTotal("reductionPct") * 18
  );
}

function defeatEnemy() {
  const enemy = state.enemy;
  const reward = enemy.rewardMult || 1;
  state.enemiesDefeated += 1;
  state.exp += Math.floor(enemy.exp * reward);
  state.gold += Math.floor(enemy.gold * reward);
  state.hp = Math.min(state.maxHp, state.hp + 5 + Math.floor(state.maxHp * 0.03));

  log(`${enemy.name}を倒しました。EXP+${Math.floor(enemy.exp * reward)} / ${Math.floor(enemy.gold * reward)}G獲得。`);

  while (state.exp >= state.expNext) {
    state.exp -= state.expNext;
    levelUp();
  }

  const cls = getClass();
  const dropRate = Math.min(0.85, 0.33 + cls.dropBonus + affixTotal("dropPct") / 100);
  if (Math.random() < dropRate || enemy.isBoss) {
    const drop = generateDrop(enemy.isBoss, enemy.affixes?.some((a) => a.id === "treasure"));
    latestDrop = drop;
    state.inventory.push(drop);
    if (drop.rarity !== "N" && drop.rarity !== "R") state.rareDrops += 1;
    log(`${drop.rarity} ${drop.name} を拾いました。`);
  }

  if (enemy.isBoss) {
    state.floor += 3;
    state.potions += 1;
    log(`エリートボス撃破。階層が${state.floor}Fまで進み、ポーションを1個補充しました。`);
  } else {
    state.floor += 1;
  }

  state.enemy = makeEnemy(state.floor, false);
}

function levelUp() {
  state.level += 1;
  state.baseAtk += 2.3;
  state.maxHp = calcMaxHp();
  state.hp = state.maxHp;
  state.expNext = Math.floor(state.expNext * 1.25 + 14);
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
    log("すでにエリートボスと戦闘中です。");
    return;
  }
  state.enemy = makeEnemy(state.floor, true);
  log(`${state.enemy.name}が現れました。ボスはHP70%・35%で強化されます。`);
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
    if (item.id === equipped.id || itemScore(item) >= itemScore(equipped)) {
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
  state.maxHp = calcMaxHp();
  state.hp = Math.min(state.hp, state.maxHp);
  log(`${latestDrop.name}を装備しました。`);
  latestDrop = null;
  render();
  save();
}

function itemScore(item) {
  if (!item) return 0;
  return Number(item.power || 0) +
    (item.affixes || []).reduce((sum, a) => {
      const weight = {
        atkPct: 2.1,
        hpPct: 1.3,
        critPct: 5.0,
        critDmgPct: 1.0,
        bossPct: 1.5,
        reductionPct: 3.0,
        dropPct: 2.5,
      }[a.id] || 1;
      return sum + a.value * weight;
    }, 0);
}

function makeEnemy(floor, isBoss) {
  if (isBoss) {
    const b = bossTemplates[randInt(0, bossTemplates.length - 1)];
    const affixes = pickEnemyAffixes(Math.max(2, Math.floor(floor / 18) + 1));
    const mult = applyEnemyAffixMult(affixes);
    const hp = Math.floor((160 + floor * 44) * mult.hpMult);
    return {
      ...b,
      isBoss: true,
      affixes,
      maxHp: hp,
      hp,
      atk: Math.floor((18 + floor * 3.6) * mult.atkMult),
      exp: Math.floor(60 + floor * 14),
      gold: Math.floor(55 + floor * 12),
      rewardMult: mult.rewardMult * 1.25,
      poison: 0,
      poisonDamage: 0,
      phaseTwo: false,
      enraged: false,
    };
  }

  const index = Math.min(enemyTemplates.length - 1, Math.floor((floor - 1) / 7));
  const t = enemyTemplates[index] || enemyTemplates.at(-1);
  const affixCount = floor >= 35 ? 2 : floor >= 10 ? 1 : 0;
  const affixes = pickEnemyAffixes(affixCount);
  const mult = applyEnemyAffixMult(affixes);
  const scale = 1 + floor * 0.105 + Math.floor(floor / 25) * 0.18;
  const maxHp = Math.floor(t.hp * scale * mult.hpMult);
  return {
    ...t,
    isBoss: false,
    affixes,
    maxHp,
    hp: maxHp,
    atk: Math.floor(t.atk * scale * mult.atkMult),
    exp: Math.floor(t.exp * scale),
    gold: Math.floor(t.gold * scale),
    rewardMult: mult.rewardMult,
    poison: 0,
    poisonDamage: 0,
  };
}

function pickEnemyAffixes(count) {
  const pool = [...enemyAffixes];
  const result = [];
  for (let i = 0; i < count && pool.length; i++) {
    const idx = randInt(0, pool.length - 1);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

function applyEnemyAffixMult(affixes) {
  return affixes.reduce((m, a) => ({
    hpMult: m.hpMult * a.hpMult,
    atkMult: m.atkMult * a.atkMult,
    rewardMult: m.rewardMult * a.rewardMult,
  }), { hpMult: 1, atkMult: 1, rewardMult: 1 });
}

function generateDrop(isBoss, treasureBonus = false) {
  const slot = slots[randInt(0, slots.length - 1)].key;
  const rarity = pickRarity(isBoss, treasureBonus);
  const base = Math.floor(6 + state.floor * 2.15 + state.level * 1.75);
  const power = Math.floor((base + randInt(0, 10)) * rarity.mult * (isBoss ? 1.35 : 1));
  const names = itemNames[slot];
  const name = `${prefixByRarity(rarity.id)}${names[randInt(0, names.length - 1)]}+${Math.floor(power / 14)}`;
  const affixes = generateItemAffixes(rarity.affixes + (isBoss && rarity.id !== "N" ? 1 : 0));

  return {
    id: `i_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    slot,
    name,
    rarity: rarity.id,
    label: rarity.label,
    power,
    level: state.floor,
    value: Math.max(5, Math.floor(power * rarity.mult * 2.4 + affixes.length * 15)),
    affixes,
  };
}

function pickRarity(isBoss, treasureBonus = false) {
  const cls = getClass();
  const bonus = isBoss ? 2.15 : 1.0;
  const treasure = treasureBonus ? 1.35 : 1.0;
  const classDrop = 1 + cls.dropBonus;
  const table = rarities.map((r) => {
    let chance = r.chance;
    if (r.id === "SR" || r.id === "SSR" || r.id === "UR") {
      chance *= bonus * treasure * classDrop;
    }
    return { ...r, chance };
  });

  const total = table.reduce((sum, r) => sum + r.chance, 0);
  let roll = Math.random() * total;
  for (const r of table) {
    roll -= r.chance;
    if (roll <= 0) return r;
  }
  return table[0];
}

function generateItemAffixes(count) {
  const pool = [...itemAffixPool];
  const result = [];
  for (let i = 0; i < count && pool.length; i++) {
    const idx = randInt(0, pool.length - 1);
    const def = pool.splice(idx, 1)[0];
    result.push({
      id: def.id,
      label: def.label,
      value: randInt(def.min, def.max),
      unit: def.unit,
    });
  }
  return result;
}

function prefixByRarity(rarity) {
  return {
    N: "量産型",
    R: "上質な",
    SR: "希少な",
    SSR: "伝説の",
    UR: "神話級",
  }[rarity] || "";
}

function calcScore() {
  return Math.floor(
    state.floor * 1700 +
    state.level * 850 +
    calcBattlePower() * 18 +
    state.enemiesDefeated * 70 +
    state.rareDrops * 5500 +
    state.gold * 0.15
  );
}

async function submitRanking() {
  state.playerName = sanitizeName(els.playerName.value) || "薬屋さん";
  const cls = getClass();
  const payload = {
    key: API_KEY,
    userId: state.userId,
    name: state.playerName,
    classId: cls.id,
    className: cls.name,
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
  localStorage.setItem("yakudungeon.localRanking.v2", JSON.stringify(items.slice(0, 20)));
}

function loadLocalRanking() {
  try {
    return JSON.parse(localStorage.getItem("yakudungeon.localRanking.v2") || "[]");
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
        <div class="rankName">${escapeHtml(item.name || "薬屋さん")} <span class="rankMeta">${escapeHtml(item.className || "")}</span></div>
        <div class="rankMeta">Lv${Number(item.level || 1)} / ${Number(item.floor || 1)}F / 戦闘力${Number(item.power || 0).toLocaleString()}</div>
      </div>
      <div class="rankScore">${Number(item.score || 0).toLocaleString()}</div>
    `;
    els.rankingList.appendChild(li);
  });
}

function render() {
  const cls = getClass();
  state.maxHp = calcMaxHp();
  els.playerName.value = state.playerName || "";
  els.classSelect.value = cls.id;
  els.classIcon.textContent = cls.icon;
  els.className.textContent = cls.name;
  els.classInfo.innerHTML = `<strong>${cls.icon} ${cls.name}</strong>：${escapeHtml(cls.desc)}`;
  els.startBtn.textContent = state.running ? "探索停止" : "探索開始";
  els.stateBadge.textContent = state.running ? "探索中" : "停止中";
  els.stateBadge.style.background = state.running ? "rgba(47, 125, 91, 0.14)" : "rgba(24, 52, 41, 0.08)";

  els.level.textContent = state.level;
  els.floor.textContent = `${state.floor}F`;
  els.power.textContent = calcBattlePower().toLocaleString();
  els.gold.textContent = `${Math.floor(state.gold).toLocaleString()}G`;
  els.potions.textContent = `${state.potions}個`;
  els.hpText.textContent = `${Math.floor(state.hp)} / ${state.maxHp}`;
  els.hpBar.style.width = `${percent(state.hp, state.maxHp)}%`;
  els.expText.textContent = `${state.exp} / ${state.expNext}`;
  els.expBar.style.width = `${percent(state.exp, state.expNext)}%`;

  els.enemyIcon.textContent = state.enemy.icon;
  els.enemyName.textContent = state.enemy.name;
  const affixText = state.enemy.affixes?.length ? state.enemy.affixes.map((a) => a.name).join(" / ") : "通常";
  els.enemyMeta.textContent = `${state.enemy.isBoss ? "エリートボス" : "通常敵"}：${affixText}`;
  els.enemyHpText.textContent = `${Math.floor(state.enemy.hp)} / ${state.enemy.maxHp}`;
  els.enemyHpBar.style.width = `${percent(state.enemy.hp, state.enemy.maxHp)}%`;

  els.equipmentList.innerHTML = "";
  slots.forEach((slot) => {
    const item = state.equipment[slot.key];
    const div = document.createElement("div");
    div.className = "equipItem";
    div.innerHTML = `
      <div class="slot">${slot.label}</div>
      <div>
        ${escapeHtml(item.name)}
        <small>${formatAffixes(item)}</small>
      </div>
      <div><span class="rarity ${item.rarity}">${item.rarity}</span> +${item.power}</div>
    `;
    els.equipmentList.appendChild(div);
  });

  if (latestDrop) {
    const equipped = state.equipment[latestDrop.slot];
    const diff = Math.floor(itemScore(latestDrop) - itemScore(equipped));
    els.dropInfo.innerHTML = `<strong class="rarity ${latestDrop.rarity}">${latestDrop.rarity}</strong> ${escapeHtml(latestDrop.name)} / ${slotLabel(latestDrop.slot)} / 装備力 +${latestDrop.power}<br><span class="muted">${formatAffixes(latestDrop)}</span><br><span class="${diff >= 0 ? "rarity SSR" : "muted"}">評価差 ${diff >= 0 ? "+" : ""}${diff}</span>`;
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

function formatAffixes(item) {
  const affixes = item.affixes || [];
  if (!affixes.length) return "追加効果なし";
  return affixes.map((a) => `${a.label}+${a.value}${a.unit}`).join(" / ");
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
