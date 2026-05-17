/* Pharmacy Dungeon - PWA sample
 * 複数ダンジョン・中ボス・大ボス・周回・職業熟練度・自動装備対応版です。
 * Version: v4.2.0
 */
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwfZ6rzQ1XN-LVvCsi9jamdmW4G3xnnwizEdBH-LPY_rUjarhYFwyVyOWYzd67IACQh/exec";
const API_KEY = "yakudungeon-demo-key"; // gas/Code.gs 側の API_KEY と同じ値にしてください。

const APP_VERSION = "v4.2.0";
const STORAGE_KEY = "pharmacyDungeon.save.v4_2.preparation";
const LEGACY_STORAGE_KEYS = ["pharmacyDungeon.save.v4.dungeons", "yakudungeon.save.v3.mastery", "yakudungeon.save.v2.class", "yakudungeon.save.v1"];
const USER_ID_KEY = "yakudungeon.userId.v1";
const RARITY_ORDER = { N: 1, R: 2, SR: 3, SSR: 4, UR: 5 };

const classData = {
  novice: {
    id: "novice",
    tier: "ノービス",
    name: "新人薬剤師",
    icon: "🔰",
    role: "成長準備型",
    desc: "最初に選べる唯一の職業。熟練度Lv3で基本職へ転職できるようになります。",
    hpMult: 1.00,
    atkMult: 1.00,
    critRate: 0.05,
    critDmg: 1.55,
    damageReduction: 0.02,
    regen: 0.006,
    poisonChance: 0.00,
    bossDmg: 1.00,
    dropBonus: 0.00,
    skillEvery: 5,
    skillName: "新人研修",
    skillMult: 1.45,
    unlock: null
  },
  blade: {
    id: "blade",
    tier: "基本職",
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
    skillMult: 1.85,
    unlock: { floor: 5, mastery: { novice: 3 } }
  },
  alchemist: {
    id: "alchemist",
    tier: "基本職",
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
    skillMult: 2.55,
    unlock: { floor: 5, mastery: { novice: 3 } }
  },
  poison: {
    id: "poison",
    tier: "基本職",
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
    skillMult: 1.45,
    unlock: { floor: 8, mastery: { novice: 4 } }
  },
  guardian: {
    id: "guardian",
    tier: "基本職",
    name: "守護薬士",
    icon: "🛡️",
    role: "耐久・ボス型",
    desc: "HPと軽減が高く、被弾に強い。火力は控えめだがボス戦が安定。",
    hpMult: 1.32,
    atkMult: 0.92,
    critRate: 0.05,
    critDmg: 1.60,
    damageReduction: 0.16,
    regen: 0.012,
    poisonChance: 0.00,
    bossDmg: 1.02,
    dropBonus: 0.00,
    skillEvery: 5,
    skillName: "守護処方",
    skillMult: 1.35,
    unlock: { floor: 8, mastery: { novice: 4 } }
  },
  herbalist: {
    id: "herbalist",
    tier: "基本職",
    name: "薬草召喚士",
    icon: "🌿",
    role: "回復・ドロップ型",
    desc: "自然回復とドロップ補正を持つ放置向き職業。瞬間火力は低め。",
    hpMult: 1.04,
    atkMult: 0.98,
    critRate: 0.07,
    critDmg: 1.70,
    damageReduction: 0.06,
    regen: 0.018,
    poisonChance: 0.10,
    bossDmg: 1.00,
    dropBonus: 0.08,
    skillEvery: 4,
    skillName: "薬草の使い魔",
    skillMult: 1.65,
    unlock: { floor: 10, mastery: { novice: 4 } }
  },
  saintBlade: {
    id: "saintBlade",
    tier: "上級職",
    name: "薬聖剣士",
    icon: "🗡️",
    role: "高耐久・高火力型",
    desc: "調剤剣士と守護薬士の熟練で解放。会心・耐久・ボス火力のバランスが高い上級職。",
    hpMult: 1.18,
    atkMult: 1.22,
    critRate: 0.15,
    critDmg: 2.05,
    damageReduction: 0.12,
    regen: 0.006,
    poisonChance: 0.00,
    bossDmg: 1.16,
    dropBonus: 0.01,
    skillEvery: 4,
    skillName: "薬聖連斬",
    skillMult: 2.25,
    unlock: { floor: 25, mastery: { blade: 5, guardian: 3 } }
  },
  forbiddenAlchemist: {
    id: "forbiddenAlchemist",
    tier: "上級職",
    name: "禁薬錬金術師",
    icon: "⚗️",
    role: "超火力・毒爆発型",
    desc: "爆薬錬金師と毒刃薬師の熟練で解放。高い瞬間火力と毒付与を両立する上級職。",
    hpMult: 0.98,
    atkMult: 1.38,
    critRate: 0.18,
    critDmg: 2.25,
    damageReduction: -0.02,
    regen: 0.00,
    poisonChance: 0.28,
    bossDmg: 1.12,
    dropBonus: 0.03,
    skillEvery: 5,
    skillName: "禁薬爆裂",
    skillMult: 3.05,
    unlock: { floor: 25, mastery: { alchemist: 5, poison: 4 } }
  },
  forestOracle: {
    id: "forestOracle",
    tier: "上級職",
    name: "森羅薬導師",
    icon: "🍃",
    role: "回復・支援・ドロップ型",
    desc: "薬草召喚士と守護薬士の熟練で解放。自然回復とドロップ率に優れる放置向け上級職。",
    hpMult: 1.18,
    atkMult: 1.10,
    critRate: 0.11,
    critDmg: 1.90,
    damageReduction: 0.10,
    regen: 0.026,
    poisonChance: 0.16,
    bossDmg: 1.08,
    dropBonus: 0.13,
    skillEvery: 4,
    skillName: "森羅の薬陣",
    skillMult: 1.95,
    unlock: { floor: 28, mastery: { herbalist: 5, guardian: 3 } }
  },
  abyssAuditor: {
    id: "abyssAuditor",
    tier: "上級職",
    name: "奈落監査官",
    icon: "👁️",
    role: "会心・ボス討伐型",
    desc: "複数の基本職を鍛えると解放。ボス与ダメージと会心性能が高い上級職。",
    hpMult: 1.08,
    atkMult: 1.28,
    critRate: 0.23,
    critDmg: 2.35,
    damageReduction: 0.06,
    regen: 0.004,
    poisonChance: 0.14,
    bossDmg: 1.25,
    dropBonus: 0.04,
    skillEvery: 6,
    skillName: "監査執行",
    skillMult: 3.20,
    unlock: { floor: 40, mastery: { blade: 5, alchemist: 5, poison: 5 } }
  },
  divinePharmacist: {
    id: "divinePharmacist",
    tier: "最上級職",
    name: "神薬調律師",
    icon: "💠",
    role: "万能・最終職",
    desc: "全基本職を高熟練にすると解放。火力・耐久・回復・ドロップの全てが高水準。",
    hpMult: 1.25,
    atkMult: 1.32,
    critRate: 0.20,
    critDmg: 2.25,
    damageReduction: 0.14,
    regen: 0.018,
    poisonChance: 0.18,
    bossDmg: 1.22,
    dropBonus: 0.10,
    skillEvery: 4,
    skillName: "神薬調律",
    skillMult: 2.65,
    unlock: { floor: 60, mastery: { blade: 7, alchemist: 7, poison: 7, guardian: 7, herbalist: 7 } }
  }
};

const classOrder = [
  "novice",
  "blade", "alchemist", "poison", "guardian", "herbalist",
  "saintBlade", "forbiddenAlchemist", "forestOracle", "abyssAuditor", "divinePharmacist"
];

const dungeonData = {
  herbForest: {
    id: "herbForest",
    name: "薬草の森",
    icon: "🌿",
    floors: 20,
    midBossFloors: [10],
    midBoss: { name: "薬草を守る大鹿", icon: "🦌" },
    finalBoss: { name: "森の調剤獣", icon: "🐺" },
    difficulty: 1.00,
    rewardMult: 1.00,
    desc: "初心者向け。薬草系モンスターが多く、基本職解放に向いたダンジョン。",
    unlock: null
  },
  capsuleCave: {
    id: "capsuleCave",
    name: "調剤地下道",
    icon: "💊",
    floors: 30,
    midBossFloors: [15],
    midBoss: { name: "カプセル監視者", icon: "💊" },
    finalBoss: { name: "地下道の処方竜", icon: "🐉" },
    difficulty: 1.22,
    rewardMult: 1.18,
    desc: "中級向け。敵が硬くなる代わりに、経験値とゴールドが増える。",
    unlock: { clears: { herbForest: 1 }, floor: 18 }
  },
  auditTower: {
    id: "auditTower",
    name: "監査塔",
    icon: "🗼",
    floors: 40,
    midBossFloors: [20],
    midBoss: { name: "監査の双盾", icon: "🛡️" },
    finalBoss: { name: "棚卸し魔王", icon: "👑" },
    difficulty: 1.50,
    rewardMult: 1.42,
    desc: "上級向け。特殊能力付きの敵が増え、上級職育成に向く。",
    unlock: { clears: { capsuleCave: 1 }, floor: 35 }
  },
  abyssPharmacy: {
    id: "abyssPharmacy",
    name: "奈落処方庫",
    icon: "🕯️",
    floors: 50,
    midBossFloors: [25, 40],
    midBoss: { name: "奈落の在庫番", icon: "👁️" },
    finalBoss: { name: "奈落処方の支配者", icon: "🕯️" },
    difficulty: 1.90,
    rewardMult: 1.75,
    desc: "最深部向け。中ボスが複数出現し、最上級職の力を試す高難度ダンジョン。",
    unlock: { clears: { auditTower: 1 }, floor: 55 }
  }
};

const dungeonOrder = ["herbForest", "capsuleCave", "auditTower", "abyssPharmacy"];

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
  load();
  bindEvents();
  render();
  loadRanking();
  registerServiceWorker();
});

function bindElements() {
  [
    "installBtn", "forceUpdateBtn", "playerName", "classSelect", "dungeonSelect", "classInfo", "dungeonInfo", "classIcon", "className", "masteryText", "unlockedCount",
    "startBtn", "submitRankBtn", "resetBtn", "level", "floor", "power", "gold", "potions", "hpText", "hpBar",
    "expText", "expBar", "equipmentList", "stateBadge", "phaseBadge", "enemyIcon", "enemyName", "enemyMeta", "enemyHpText",
    "enemyHpBar", "autoEquipBetter", "potionBtn", "bossBtn", "retireDungeonBtn", "sellBtn", "inventorySelect",
    "inventoryMessage", "inventoryDetail", "equipStockBtn", "sellSelectedBtn", "bulkSellRarity", "bulkSellBtn",
    "dropInfo", "equipDropBtn",
    "reloadRankBtn", "rankMessage", "rankingList", "log"
  ].forEach((id) => els[id] = document.getElementById(id));
}

function bindEvents() {
  const on = (id, type, handler) => {
    if (!els[id]) {
      console.warn(`[Pharmacy Dungeon] #${id} が見つからないためイベント登録をスキップしました。HTMLキャッシュが古い可能性があります。`);
      return;
    }
    els[id].addEventListener(type, handler);
  };

  on("startBtn", "click", toggleRun);
  on("potionBtn", "click", usePotion);
  on("bossBtn", "click", challengeBoss);
  on("retireDungeonBtn", "click", retireDungeon);
  on("sellBtn", "click", sellWeakItems);
  on("inventorySelect", "change", () => {
    state.selectedInventoryId = els.inventorySelect.value || "";
    render();
    save();
  });
  on("equipStockBtn", "click", equipSelectedStockItem);
  on("sellSelectedBtn", "click", sellSelectedStockItem);
  on("bulkSellBtn", "click", bulkSellByRarity);
  on("equipDropBtn", "click", equipLatestDrop);
  on("submitRankBtn", "click", submitRanking);
  on("reloadRankBtn", "click", loadRanking);
  on("resetBtn", "click", resetGame);
  on("forceUpdateBtn", "click", forceUpdateApp);

  on("playerName", "input", () => {
    state.playerName = sanitizeName(els.playerName.value);
    save();
  });

  on("autoEquipBetter", "change", () => {
    state.autoEquipBetter = els.autoEquipBetter.checked;
    log(state.autoEquipBetter ? "自動装備をONにしました。" : "自動装備をOFFにしました。");
    save();
  });

  on("classSelect", "change", () => {
    const next = els.classSelect.value;
    if (!classData[next]) return;

    if (state.phase !== "preparation") {
      log("探索フェーズ中は転職できません。準備フェーズに戻ってから転職してください。");
      els.classSelect.value = state.classId;
      render();
      return;
    }

    if (!isClassUnlocked(next)) {
      log(`${classData[next].name}はまだ解放されていません。`);
      els.classSelect.value = state.classId;
      render();
      return;
    }

    if (next === state.classId) return;
    state.classId = next;
    state.skillCounter = 0;
    state.maxHp = calcMaxHp();
    state.hp = Math.min(state.hp, state.maxHp);
    log(`${getClass().name}に転職しました。`);
    render();
    save();
  });

  on("dungeonSelect", "change", () => {
    const next = els.dungeonSelect.value;
    if (!dungeonData[next]) return;

    if (state.phase !== "preparation") {
      log("探索フェーズ中はダンジョン変更できません。準備フェーズに戻ってから変更してください。");
      els.dungeonSelect.value = state.dungeonId;
      render();
      return;
    }

    if (!isDungeonUnlocked(next)) {
      log(`${dungeonData[next].name}はまだ解放されていません。`);
      els.dungeonSelect.value = state.dungeonId;
      render();
      return;
    }

    if (next === state.dungeonId) return;
    state.dungeonId = next;
    state.dungeonFloor = 1;
    state.enemy = makeCurrentEnemy();
    log(`${currentDungeon().name}へ移動しました。1Fから探索します。`);
    render();
    save();
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (els.installBtn) els.installBtn.classList.remove("hidden");
  });

  on("installBtn", "click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    if (els.installBtn) els.installBtn.classList.add("hidden");
  });
}


async function forceUpdateApp() {
  const ok = confirm("最新版を取得するため、PWAキャッシュを削除して再読み込みします。セーブデータは残します。");
  if (!ok) return;

  try {
    log("最新版への更新を開始します。キャッシュを削除しています。");
    save();

    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }

    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }

    const url = new URL(window.location.href);
    url.searchParams.set("v", `${APP_VERSION}-${Date.now()}`);
    window.location.replace(url.toString());
  } catch (e) {
    console.error(e);
    alert("自動更新に失敗しました。ブラウザの再読み込み、またはサイトデータ削除を試してください。");
  }
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

  const classMastery = {};
  classOrder.forEach((id) => classMastery[id] = 0);

  const s = {
    userId: getUserId(),
    playerName: "",
    classId: "novice",
    classMastery,
    dungeonId: "herbForest",
    dungeonFloor: 1,
    dungeonClears: { herbForest: 0, capsuleCave: 0, auditTower: 0, abyssPharmacy: 0 },
    autoEquipBetter: true,
    phase: "preparation",
    selectedInventoryId: "",
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
    logs: ["Pharmacy Dungeonへようこそ。準備フェーズで転職・装備変更を行い、探索開始でダンジョンへ進みます。"],
    lastSubmittedScore: 0,
  };
  s.maxHp = calcMaxHp(s);
  s.hp = s.maxHp;
  s.enemy = makeEnemy(1, false, "normal", "herbForest", 1, 0);
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
  let saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    for (const key of LEGACY_STORAGE_KEYS) {
      saved = localStorage.getItem(key);
      if (saved) break;
    }
  }

  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    const initial = createInitialState();
    state = { ...initial, ...parsed, userId: getUserId() };
    state.running = false;
    state.phase = "preparation";
    state.selectedInventoryId = state.selectedInventoryId || "";
    state.inventory = Array.isArray(state.inventory) ? state.inventory : [];

    // 旧版で別職から始まっていた場合も、新仕様では最初は新人薬剤師に戻します。
    // ただし旧職の熟練度は初期値として少しだけ引き継ぎます。
    if (!state.classMastery) {
      state.classMastery = { ...initial.classMastery };
      if (parsed.classId && parsed.classId !== "novice" && classData[parsed.classId]) {
        state.classMastery.novice = Math.max(state.classMastery.novice || 0, masteryExpForLevel(3));
        state.classMastery[parsed.classId] = Math.max(state.classMastery[parsed.classId] || 0, masteryExpForLevel(2));
      }
    } else {
      state.classMastery = { ...initial.classMastery, ...state.classMastery };
    }

    state.dungeonClears = { ...initial.dungeonClears, ...(parsed.dungeonClears || {}) };
    state.dungeonId = dungeonData[state.dungeonId] && isDungeonUnlocked(state.dungeonId) ? state.dungeonId : "herbForest";
    state.dungeonFloor = Math.max(1, Math.min(currentDungeon().floors, Number(state.dungeonFloor || 1)));

    state.classId = classData[state.classId] && isClassUnlocked(state.classId) ? state.classId : "novice";
    state.autoEquipBetter = typeof parsed.autoEquipBetter === "boolean" ? parsed.autoEquipBetter : true;
    state.equipment = { ...initial.equipment, ...(parsed.equipment || {}) };
    state.enemy = parsed.enemy || makeCurrentEnemy();
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
  LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  const keepName = state.playerName;
  state = createInitialState();
  state.playerName = keepName;
  latestDrop = null;
  log("セーブデータをリセットしました。新人薬剤師・薬草の森1Fから再スタートします。");
  save();
  render();
}

function getClass(source = state) {
  return classData[source.classId] || classData.novice;
}

function masteryLevel(id, source = state) {
  const exp = Number((source.classMastery || {})[id] || 0);
  return masteryLevelFromExp(exp);
}

function masteryLevelFromExp(exp) {
  // Lv0->1:5, Lv1->2:15, Lv2->3:30, Lv3->4:50...という緩やかな上昇
  return Math.max(0, Math.floor((Math.sqrt(8 * Math.max(0, exp) / 5 + 1) - 1) / 2));
}

function masteryExpForLevel(level) {
  return Math.floor((level * (level + 1) / 2) * 5);
}

function addMastery(enemy) {
  const id = state.classId;
  const before = masteryLevel(id);
  const gain = enemy.isBoss ? 6 : 1 + (enemy.affixes?.length || 0);
  state.classMastery[id] = Number(state.classMastery[id] || 0) + gain;
  const after = masteryLevel(id);

  if (after > before) {
    log(`${getClass().name}の熟練度がLv${after}になりました。`);
    announceNewUnlocks();
  }
}

function announceNewUnlocks() {
  const newly = classOrder
    .filter((id) => id !== state.classId && isClassUnlocked(id))
    .map((id) => classData[id].name);
  if (newly.length) {
    log(`転職可能: ${newly.join(" / ")}`);
  }
}

function isClassUnlocked(classId) {
  const cls = classData[classId];
  if (!cls) return false;
  if (!cls.unlock) return true;

  const req = cls.unlock;
  if (req.floor && state.floor < req.floor) return false;

  return Object.entries(req.mastery || {}).every(([id, level]) => masteryLevel(id) >= Number(level));
}

function unlockText(classId) {
  const cls = classData[classId];
  if (!cls?.unlock) return "最初から選択可能";

  const parts = [];
  if (cls.unlock.floor) {
    parts.push(`${cls.unlock.floor}F到達`);
  }
  Object.entries(cls.unlock.mastery || {}).forEach(([id, level]) => {
    parts.push(`${classData[id]?.name || id}熟練Lv${level}`);
  });
  return parts.join("、");
}

function unlockedClassCount() {
  return classOrder.filter((id) => isClassUnlocked(id)).length;
}

function currentDungeon(source = state) {
  return dungeonData[source.dungeonId] || dungeonData.herbForest;
}

function dungeonClearCount(id) {
  return Number(state.dungeonClears?.[id] || 0);
}

function isDungeonUnlocked(dungeonId) {
  const dungeon = dungeonData[dungeonId];
  if (!dungeon) return false;
  if (!dungeon.unlock) return true;

  if (dungeon.unlock.floor && state.floor < dungeon.unlock.floor) return false;

  return Object.entries(dungeon.unlock.clears || {}).every(([id, count]) => dungeonClearCount(id) >= Number(count));
}

function dungeonUnlockText(dungeonId) {
  const dungeon = dungeonData[dungeonId];
  if (!dungeon?.unlock) return "最初から選択可能";

  const parts = [];
  if (dungeon.unlock.floor) parts.push(`総合到達${dungeon.unlock.floor}F`);
  Object.entries(dungeon.unlock.clears || {}).forEach(([id, count]) => {
    parts.push(`${dungeonData[id]?.name || id}${count}周クリア`);
  });
  return parts.join("、");
}

function dungeonProgressLabel() {
  const dungeon = currentDungeon();
  return `${dungeon.name}${state.dungeonFloor || 1}F`;
}

function populateDungeons() {
  const previous = els.dungeonSelect.value || state.dungeonId;
  els.dungeonSelect.innerHTML = "";

  dungeonOrder.forEach((id) => {
    const dungeon = dungeonData[id];
    const unlocked = isDungeonUnlocked(id);
    const clears = dungeonClearCount(id);
    const opt = document.createElement("option");
    opt.value = id;
    opt.disabled = !unlocked;
    opt.textContent = unlocked
      ? `${dungeon.icon} ${dungeon.name} / ${dungeon.floors}F / ${clears}周クリア`
      : `🔒 ${dungeon.name} / 条件: ${dungeonUnlockText(id)}`;
    els.dungeonSelect.appendChild(opt);
  });

  els.dungeonSelect.value = dungeonData[previous] && isDungeonUnlocked(previous) ? previous : state.dungeonId;
}

function makeCurrentEnemy() {
  const dungeon = currentDungeon();
  const floor = Math.max(1, Math.min(dungeon.floors, Number(state.dungeonFloor || 1)));
  const clears = dungeonClearCount(dungeon.id);

  if (floor === dungeon.floors) {
    return makeEnemy(state.floor, true, "final", dungeon.id, floor, clears);
  }

  if ((dungeon.midBossFloors || []).includes(floor)) {
    return makeEnemy(state.floor, true, "mid", dungeon.id, floor, clears);
  }

  return makeEnemy(state.floor, false, "normal", dungeon.id, floor, clears);
}

function toggleRun() {
  if (state.phase === "exploration" || state.running) {
    stop();
  } else {
    start();
  }
}

function start() {
  if (!state.playerName) {
    state.playerName = sanitizeName(els.playerName.value) || "薬屋さん";
  }

  state.phase = "exploration";
  state.running = true;
  if (loopId) clearInterval(loopId);
  loopId = setInterval(tick, 1000);
  log("準備フェーズから探索フェーズへ移行しました。");
  render();
  save();
}

function stop() {
  state.running = false;
  state.phase = "preparation";
  if (loopId) clearInterval(loopId);
  loopId = null;
  log("探索を停止し、準備フェーズへ戻りました。");
  render();
  save();
}

function tick() {
  if (state.phase !== "exploration") return;
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

  const masteryBonus = 1 + Math.min(0.35, masteryLevel(state.classId) * 0.018);

  let damage =
    state.baseAtk * cls.atkMult +
    Math.floor(totalPower() / 7) +
    state.level * 2.4 +
    affixTotal("atkPct") / 100 * (state.baseAtk + totalPower() / 5) +
    randInt(-3, 5);

  damage *= masteryBonus;

  if (state.enemy.isBoss) {
    damage *= cls.bossDmg * (1 + affixTotal("bossPct") / 100);
  }

  let skill = "";
  if (cls.skillEvery && state.skillCounter % cls.skillEvery === 0) {
    damage *= cls.skillMult;
    skill = cls.skillName;
  }

  let critRate = cls.critRate + affixTotal("critPct") / 100 + Math.min(0.08, masteryLevel(state.classId) * 0.003);
  let critDmg = cls.critDmg + affixTotal("critDmgPct") / 100;
  const crit = Math.random() < Math.min(0.70, critRate);
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

  const reduction = Math.max(-0.2, Math.min(0.68, cls.damageReduction + affixTotal("reductionPct") / 100));
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
  const masteryBonus = 1 + Math.min(0.20, masteryLevel(source.classId || "novice", source) * 0.006);
  return Math.floor(base * cls.hpMult * affixBonus * masteryBonus);
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
    masteryLevel(state.classId) * 35 +
    affixTotal("critPct") * 24 +
    affixTotal("bossPct") * 9 +
    affixTotal("reductionPct") * 18
  );
}

function defeatEnemy() {
  const enemy = state.enemy;
  const reward = enemy.rewardMult || 1;
  const dungeon = currentDungeon();

  state.enemiesDefeated += 1;
  state.exp += Math.floor(enemy.exp * reward);
  state.gold += Math.floor(enemy.gold * reward);
  state.hp = Math.min(state.maxHp, state.hp + 5 + Math.floor(state.maxHp * 0.03));
  addMastery(enemy);

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

    const equipped = state.equipment[drop.slot];
    const diff = itemScore(drop) - itemScore(equipped);

    if (state.autoEquipBetter && diff > 0) {
      state.equipment[drop.slot] = drop;
      state.maxHp = calcMaxHp();
      state.hp = Math.min(state.hp, state.maxHp);
      latestDrop = null;
      log(`${drop.rarity} ${drop.name} を拾いました。今より強いため自動装備しました。`);
    } else {
      log(`${drop.rarity} ${drop.name} を拾いました。${diff > 0 ? "今より強い装備です。" : "現在装備より弱い装備です。"}`);
    }
  }

  if (enemy.isBoss && enemy.bossKind === "final") {
    state.floor += 3;
    state.potions += 2;
    state.dungeonClears[dungeon.id] = dungeonClearCount(dungeon.id) + 1;
    const clearCount = dungeonClearCount(dungeon.id);
    log(`${dungeon.name}をクリアしました。次は${clearCount + 1}周目として${dungeon.name}1Fから再挑戦できます。`);
    state.dungeonFloor = 1;
    announceDungeonUnlocks();
  } else if (enemy.isBoss && enemy.bossKind === "mid") {
    state.floor += 2;
    state.potions += 1;
    log(`${dungeon.name}の中ボスを撃破しました。ポーションを1個補充しました。`);
    state.dungeonFloor = Math.min(dungeon.floors, state.dungeonFloor + 1);
  } else if (enemy.isBoss && enemy.bossKind === "elite") {
    state.floor += 2;
    state.potions += 1;
    log(`乱入強敵を撃破しました。探索は${dungeonProgressLabel()}から続きます。`);
  } else {
    state.floor += 1;
    state.dungeonFloor = Math.min(dungeon.floors, state.dungeonFloor + 1);
  }

  state.enemy = makeCurrentEnemy();
}

function announceDungeonUnlocks() {
  const unlocked = dungeonOrder
    .filter((id) => id !== state.dungeonId && isDungeonUnlocked(id))
    .map((id) => dungeonData[id].name);
  if (unlocked.length) {
    log(`新しいダンジョン解放: ${unlocked.join(" / ")}`);
  }
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
  if (state.phase !== "exploration") {
    log("強敵挑戦は探索フェーズ中のみ実行できます。");
    return;
  }

  if (state.enemy?.isBoss) {
    log("すでに強敵と戦闘中です。");
    return;
  }
  state.enemy = makeEnemy(state.floor, true, "elite", state.dungeonId, state.dungeonFloor, dungeonClearCount(state.dungeonId));
  log(`${state.enemy.name}が乱入しました。通常進行とは別の強敵です。`);
  render();
  save();
}

function retireDungeon() {
  const ok = confirm(`${currentDungeon().name}をリタイアして1Fからやり直します。よろしいですか？`);
  if (!ok) return;

  state.running = false;
  state.phase = "preparation";
  if (loopId) clearInterval(loopId);
  loopId = null;
  state.dungeonFloor = 1;
  state.enemy = makeCurrentEnemy();
  state.hp = Math.max(1, Math.min(state.maxHp, Math.ceil(state.maxHp * 0.75)));
  latestDrop = null;
  log(`${currentDungeon().name}をリタイアしました。準備フェーズに戻り、1Fからやり直します。`);
  render();
  save();
}

function sellWeakItems() {
  if (state.phase !== "preparation") {
    log("装備の整理・売却は準備フェーズ中のみ実行できます。");
    return;
  }

  if (!state.inventory.length) {
    log("売却できる装備がありません。");
    return;
  }

  let sold = 0;
  let count = 0;
  let keep = [];
  for (const item of state.inventory) {
    const equipped = state.equipment[item.slot];
    if (isEquippedItem(item) || itemScore(item) >= itemScore(equipped)) {
      keep.push(item);
    } else {
      sold += item.value;
      count += 1;
    }
  }
  state.inventory = keep;
  state.gold += sold;
  if (state.selectedInventoryId && !state.inventory.some((i) => i.id === state.selectedInventoryId)) {
    state.selectedInventoryId = "";
  }
  log(`現在装備より弱い装備を${count}個売却し、${sold}Gを獲得しました。`);
  render();
  save();
}

function equipLatestDrop() {
  if (!latestDrop) return;

  if (state.phase !== "exploration") {
    log("最新ドロップの即時付け替えは探索フェーズ中のみ可能です。準備フェーズでは装備ストックから付け替えてください。");
    return;
  }

  state.equipment[latestDrop.slot] = latestDrop;
  state.maxHp = calcMaxHp();
  state.hp = Math.min(state.hp, state.maxHp);
  log(`${latestDrop.name}を装備しました。`);
  latestDrop = null;
  render();
  save();
}

function selectedInventoryItem() {
  const id = state.selectedInventoryId || els.inventorySelect?.value || "";
  return state.inventory.find((item) => item.id === id) || null;
}

function equipSelectedStockItem() {
  if (state.phase !== "preparation") {
    log("ストック装備の付け替えは準備フェーズ中のみ可能です。探索フェーズ中は最新ドロップのみ付け替えできます。");
    return;
  }

  const item = selectedInventoryItem();
  if (!item) {
    log("装備するストック装備を選択してください。");
    return;
  }

  state.equipment[item.slot] = item;
  state.maxHp = calcMaxHp();
  state.hp = Math.min(state.hp, state.maxHp);
  log(`ストックから${item.name}を装備しました。`);
  render();
  save();
}

function sellSelectedStockItem() {
  if (state.phase !== "preparation") {
    log("装備の売却は準備フェーズ中のみ可能です。");
    return;
  }

  const item = selectedInventoryItem();
  if (!item) {
    log("売却する装備を選択してください。");
    return;
  }

  if (isEquippedItem(item)) {
    log("現在装備中の装備は売却できません。先に別の装備へ付け替えてください。");
    return;
  }

  const ok = confirm(`${item.rarity} ${item.name}を${item.value}Gで売却します。よろしいですか？`);
  if (!ok) return;

  state.inventory = state.inventory.filter((i) => i.id !== item.id);
  state.gold += item.value;
  state.selectedInventoryId = "";
  log(`${item.name}を売却し、${item.value}Gを獲得しました。`);
  render();
  save();
}

function bulkSellByRarity() {
  if (state.phase !== "preparation") {
    log("装備の一括売却は準備フェーズ中のみ可能です。");
    return;
  }

  const rarity = els.bulkSellRarity?.value || "N";
  const threshold = RARITY_ORDER[rarity] || 1;
  const targets = state.inventory.filter((item) => !isEquippedItem(item) && (RARITY_ORDER[item.rarity] || 0) <= threshold);

  if (!targets.length) {
    log(`${rarity}以下で売却できる装備がありません。`);
    return;
  }

  const total = targets.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const ok = confirm(`${rarity}以下の未装備アイテム${targets.length}個をまとめて売却し、${total}Gを獲得します。よろしいですか？`);
  if (!ok) return;

  const sellIds = new Set(targets.map((item) => item.id));
  state.inventory = state.inventory.filter((item) => !sellIds.has(item.id));
  state.gold += total;
  if (state.selectedInventoryId && !state.inventory.some((i) => i.id === state.selectedInventoryId)) {
    state.selectedInventoryId = "";
  }

  log(`${rarity}以下の装備を${targets.length}個まとめて売却し、${total}Gを獲得しました。`);
  render();
  save();
}

function isEquippedItem(item) {
  if (!item) return false;
  return Object.values(state.equipment || {}).some((equipped) => equipped && equipped.id === item.id);
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

function makeEnemy(floor, isBoss, bossKind = "elite", dungeonId = "herbForest", dungeonFloor = 1, clearCount = 0) {
  const dungeon = dungeonData[dungeonId] || dungeonData.herbForest;
  const loopMult = 1 + clearCount * 0.16;
  const dungeonMult = dungeon.difficulty || 1;
  const floorPower = floor + dungeonFloor * dungeonMult + clearCount * 8;

  if (isBoss) {
    const bossBase =
      bossKind === "final" ? dungeon.finalBoss :
      bossKind === "mid" ? dungeon.midBoss :
      bossTemplates[randInt(0, bossTemplates.length - 1)];

    const isFirstMidBoss = bossKind === "mid" && dungeonId === "herbForest" && dungeonFloor === 10 && clearCount === 0;
    const affixBase = bossKind === "final" ? 3 : bossKind === "mid" ? (isFirstMidBoss ? 1 : 2) : 2;
    let affixes = pickEnemyAffixes(Math.max(affixBase, Math.floor(floor / 20) + affixBase - 1));

    // 最初の中ボス「薬草を守る大鹿」は、鉄壁＋吸血が同時に付くと詰みやすいため抑制します。
    if (isFirstMidBoss) {
      const hasBarrier = affixes.some((a) => a.id === "barrier");
      const hasVampire = affixes.some((a) => a.id === "vampire");
      if (hasBarrier && hasVampire) {
        affixes = affixes.filter((a) => a.id !== "vampire");
      }
      affixes = affixes.slice(0, 1);
    }

    const mult = applyEnemyAffixMult(affixes);
    const kindMult = bossKind === "final" ? 1.85 : bossKind === "mid" ? (isFirstMidBoss ? 0.92 : 1.20) : 1.0;
    const hp = Math.floor((150 + floorPower * 36) * mult.hpMult * dungeonMult * loopMult * kindMult);

    return {
      ...bossBase,
      isBoss: true,
      bossKind,
      dungeonId,
      dungeonFloor,
      affixes,
      maxHp: hp,
      hp,
      atk: Math.floor((16 + floorPower * 2.85) * mult.atkMult * dungeonMult * loopMult * (bossKind === "final" ? 1.25 : isFirstMidBoss ? 0.82 : 1.0)),
      exp: Math.floor((60 + floorPower * 12) * dungeon.rewardMult * kindMult),
      gold: Math.floor((55 + floorPower * 10) * dungeon.rewardMult * kindMult),
      rewardMult: mult.rewardMult * dungeon.rewardMult * (bossKind === "final" ? 1.75 : bossKind === "mid" ? 1.32 : 1.20),
      poison: 0,
      poisonDamage: 0,
      phaseTwo: false,
      enraged: false,
    };
  }

  const index = Math.min(enemyTemplates.length - 1, Math.floor((floorPower - 1) / 7));
  const t = enemyTemplates[index] || enemyTemplates.at(-1);
  const affixCount = floor >= 35 ? 2 : floor >= 10 ? 1 : 0;
  const affixes = pickEnemyAffixes(affixCount);
  const mult = applyEnemyAffixMult(affixes);
  const scale = (1 + floorPower * 0.095 + Math.floor(floorPower / 25) * 0.18) * dungeonMult * loopMult;
  const maxHp = Math.floor(t.hp * scale * mult.hpMult);

  return {
    ...t,
    isBoss: false,
    bossKind: "normal",
    dungeonId,
    dungeonFloor,
    affixes,
    maxHp,
    hp: maxHp,
    atk: Math.floor(t.atk * scale * mult.atkMult),
    exp: Math.floor(t.exp * scale * dungeon.rewardMult),
    gold: Math.floor(t.gold * scale * dungeon.rewardMult),
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
    state.dungeonFloor * 1200 +
    Object.values(state.dungeonClears || {}).reduce((s, v) => s + Number(v || 0), 0) * 12000 +
    state.level * 850 +
    calcBattlePower() * 18 +
    state.enemiesDefeated * 70 +
    state.rareDrops * 5500 +
    totalMasteryLevel() * 900 +
    state.gold * 0.15
  );
}

function totalMasteryLevel() {
  return classOrder.reduce((sum, id) => sum + masteryLevel(id), 0);
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
    dungeonId: state.dungeonId,
    dungeonName: currentDungeon().name,
    dungeonFloor: state.dungeonFloor,
    dungeonClears: dungeonClearCount(state.dungeonId),
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
  localStorage.setItem("yakudungeon.localRanking.v3", JSON.stringify(items.slice(0, 20)));
}

function loadLocalRanking() {
  try {
    return JSON.parse(localStorage.getItem("yakudungeon.localRanking.v3") || "[]");
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
        <div class="rankMeta">Lv${Number(item.level || 1)} / ${escapeHtml(item.dungeonName || "")}${item.dungeonFloor ? Number(item.dungeonFloor) + "F" : Number(item.floor || 1) + "F"} / 戦闘力${Number(item.power || 0).toLocaleString()}</div>
      </div>
      <div class="rankScore">${Number(item.score || 0).toLocaleString()}</div>
    `;
    els.rankingList.appendChild(li);
  });
}

function populateClasses() {
  const previous = els.classSelect.value || state.classId;
  els.classSelect.innerHTML = "";

  classOrder.forEach((id) => {
    const cls = classData[id];
    const unlocked = isClassUnlocked(id);
    const level = masteryLevel(id);
    const opt = document.createElement("option");
    opt.value = id;
    opt.disabled = !unlocked;
    opt.textContent = unlocked
      ? `${cls.icon} [${cls.tier}] ${cls.name} / 熟練Lv${level}`
      : `🔒 [${cls.tier}] ${cls.name} / 条件: ${unlockText(id)}`;
    els.classSelect.appendChild(opt);
  });

  els.classSelect.value = classData[previous] && isClassUnlocked(previous) ? previous : state.classId;
}

function render() {
  const requiredIds = ["classSelect", "dungeonSelect", "startBtn", "hpBar", "expBar", "floor", "inventorySelect", "phaseBadge"];
  const missing = requiredIds.filter((id) => !els[id]);
  if (missing.length) {
    console.error("[Pharmacy Dungeon] 必須HTML部品が不足しています。GitHub上のindex.htmlが古い可能性があります:", missing);
    return;
  }

  const cls = getClass();
  state.maxHp = calcMaxHp();

  populateClasses();
  populateDungeons();

  els.playerName.value = state.playerName || "";
  els.autoEquipBetter.checked = !!state.autoEquipBetter;
  const isPreparation = state.phase === "preparation";
  els.classSelect.disabled = !isPreparation;
  els.dungeonSelect.disabled = !isPreparation;
  els.inventorySelect.disabled = !isPreparation || state.inventory.length === 0;
  els.equipStockBtn.disabled = !isPreparation || state.inventory.length === 0;
  els.sellSelectedBtn.disabled = !isPreparation || state.inventory.length === 0;
  els.bulkSellRarity.disabled = !isPreparation;
  els.bulkSellBtn.disabled = !isPreparation;
  els.sellBtn.disabled = !isPreparation;
  els.classSelect.value = cls.id;
  els.classIcon.textContent = cls.icon;
  els.className.textContent = cls.name;
  els.masteryText.textContent = `Lv${masteryLevel(cls.id)}`;
  els.unlockedCount.textContent = `${unlockedClassCount()}職`;
  els.classInfo.innerHTML = `<strong>${cls.icon} ${cls.name}（${cls.tier}）</strong>：${escapeHtml(cls.desc)}<br><span class="muted">現在熟練Lv${masteryLevel(cls.id)} / 解放条件: ${escapeHtml(unlockText(cls.id))}</span>`;
  const dungeon = currentDungeon();
  els.dungeonInfo.innerHTML = `<strong>${dungeon.icon} ${dungeon.name}</strong>：${escapeHtml(dungeon.desc)}<br><span class="muted">現在 ${dungeonProgressLabel()} / 中ボス ${dungeon.midBossFloors.join("F・")}F / 最下層 ${dungeon.floors}F / ${dungeonClearCount(dungeon.id)}周クリア</span>`;

  els.startBtn.textContent = state.phase === "exploration" ? "探索停止して準備へ" : "探索開始";
  els.stateBadge.textContent = state.phase === "exploration" ? "探索中" : "準備中";
  els.phaseBadge.textContent = state.phase === "exploration" ? "探索フェーズ" : "準備フェーズ";
  els.stateBadge.style.background = state.phase === "exploration" ? "rgba(47, 125, 91, 0.14)" : "rgba(24, 52, 41, 0.08)";
  els.phaseBadge.style.background = state.phase === "exploration" ? "rgba(245, 184, 75, 0.24)" : "rgba(47, 125, 91, 0.12)";
  els.inventoryMessage.textContent = state.phase === "exploration"
    ? "探索フェーズ中です。ストック装備の付け替え・売却はできません。最新ドロップのみ即時装備できます。"
    : "準備フェーズ中です。転職、ダンジョン変更、ストック装備の付け替え・売却ができます。";

  els.level.textContent = state.level;
  els.floor.textContent = dungeonProgressLabel();
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
  const bossLabel = state.enemy.bossKind === "final" ? "大ボス" : state.enemy.bossKind === "mid" ? "中ボス" : state.enemy.bossKind === "elite" ? "乱入強敵" : "通常敵";
  els.enemyMeta.textContent = `${dungeonProgressLabel()} / ${bossLabel}：${affixText}`;
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
    els.equipDropBtn.disabled = state.phase !== "exploration";
  } else {
    els.dropInfo.textContent = "まだ装備を拾っていません。";
    els.equipDropBtn.classList.add("hidden");
  }

  renderInventory();

  els.log.innerHTML = "";
  state.logs.slice(-80).forEach((line) => {
    const p = document.createElement("p");
    p.className = "logLine";
    p.textContent = line;
    els.log.appendChild(p);
  });
}

function renderInventory() {
  if (!els.inventorySelect || !els.inventoryDetail) return;

  const items = [...(state.inventory || [])].sort((a, b) => {
    const eqDiff = Number(isEquippedItem(b)) - Number(isEquippedItem(a));
    if (eqDiff) return eqDiff;
    return itemScore(b) - itemScore(a);
  });

  els.inventorySelect.innerHTML = "";

  if (!items.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "ストック装備なし";
    els.inventorySelect.appendChild(opt);
    els.inventoryDetail.textContent = "まだストック装備がありません。探索で装備を拾うとここに保存されます。";
    return;
  }

  if (!state.selectedInventoryId || !items.some((item) => item.id === state.selectedInventoryId)) {
    state.selectedInventoryId = items[0].id;
  }

  items.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item.id;
    const equipped = isEquippedItem(item) ? "【装備中】" : "";
    opt.textContent = `${equipped}${item.rarity} ${slotLabel(item.slot)} ${item.name} / 評価${Math.floor(itemScore(item))}`;
    els.inventorySelect.appendChild(opt);
  });

  els.inventorySelect.value = state.selectedInventoryId;

  const item = selectedInventoryItem() || items[0];
  const equipped = isEquippedItem(item);
  const current = state.equipment[item.slot];
  const diff = Math.floor(itemScore(item) - itemScore(current));
  els.inventoryDetail.innerHTML = `
    <strong class="rarity ${item.rarity}">${item.rarity}</strong> ${escapeHtml(item.name)} ${equipped ? "<span class='badge'>装備中</span>" : ""}<br>
    ${slotLabel(item.slot)} / 装備力 +${item.power} / 売却 ${item.value}G<br>
    <span class="muted">${formatAffixes(item)}</span><br>
    <span class="${diff >= 0 ? "rarity SSR" : "muted"}">現在装備との差 ${diff >= 0 ? "+" : ""}${diff}</span>
  `;
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
