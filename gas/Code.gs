/**
 * Pharmacy Dungeon - Google Apps Script ランキングAPI
 * 職業・複数ダンジョン対応版
 */

const SPREADSHEET_ID = ""; // 空欄なら、このスクリプトに紐づくスプレッドシートを使用
const RANKING_SHEET_NAME = "ranking";
const LOG_SHEET_NAME = "logs";
const API_KEY = "yakudungeon-demo-key"; // app.js の API_KEY と同じ値にする
const MAX_RANKING_ROWS = 3000;

const HEADERS = [
  "createdAt",
  "userId",
  "name",
  "classId",
  "className",
  "dungeonId",
  "dungeonName",
  "dungeonFloor",
  "dungeonClears",
  "level",
  "floor",
  "power",
  "score",
  "enemies",
  "rareDrops",
  "ua"
];

function setup() {
  const ss = getSpreadsheet_();
  const ranking = getOrCreateSheet_(ss, RANKING_SHEET_NAME);
  if (ranking.getLastRow() === 0) {
    ranking.appendRow(HEADERS);
  } else {
    const current = ranking.getRange(1, 1, 1, Math.max(ranking.getLastColumn(), HEADERS.length)).getValues()[0];
    const isEmpty = current.join("") === "";
    if (isEmpty) {
      ranking.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    } else {
      HEADERS.forEach((header, idx) => {
        if (current[idx] !== header) {
          ranking.getRange(1, idx + 1).setValue(header);
        }
      });
    }
  }

  const logs = getOrCreateSheet_(ss, LOG_SHEET_NAME);
  if (logs.getLastRow() === 0) {
    logs.appendRow(["createdAt", "action", "ok", "message", "userId", "name", "score"]);
  }

  ranking.setFrozenRows(1);
  logs.setFrozenRows(1);
}

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const action = String(params.action || "ranking");
  const callback = sanitizeCallback_(params.callback);

  let result;
  try {
    if (params.key !== API_KEY) {
      result = { ok: false, message: "API_KEYが一致しません。" };
    } else if (action === "submit") {
      result = submit_(params, e);
    } else if (action === "ranking") {
      result = ranking_(params);
    } else {
      result = { ok: false, message: "未対応のactionです。" };
    }
  } catch (err) {
    result = { ok: false, message: String(err && err.message ? err.message : err) };
  }

  const body = callback
    ? `${callback}(${JSON.stringify(result)});`
    : JSON.stringify(result);

  return ContentService
    .createTextOutput(body)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function submit_(params, event) {
  const lock = LockService.getScriptLock();
  lock.waitLock(8000);

  try {
    setup();

    const userId = cleanText_(params.userId, 80);
    const name = cleanText_(params.name || "薬屋さん", 12);
    const classId = cleanText_(params.classId || "", 40);
    const className = cleanText_(params.className || "", 20);
    const dungeonId = cleanText_(params.dungeonId || "", 40);
    const dungeonName = cleanText_(params.dungeonName || "", 30);
    const dungeonFloor = toInt_(params.dungeonFloor, 1, 999999);
    const dungeonClears = toInt_(params.dungeonClears, 0, 999999);
    const level = toInt_(params.level, 1, 9999);
    const floor = toInt_(params.floor, 1, 999999);
    const power = toInt_(params.power, 0, 99999999);
    const score = toInt_(params.score, 0, 999999999);
    const enemies = toInt_(params.enemies, 0, 99999999);
    const rareDrops = toInt_(params.rareDrops, 0, 99999999);

    if (!userId) {
      return { ok: false, message: "userIdが空です。" };
    }

    if (!name) {
      return { ok: false, message: "名前が空です。" };
    }

    const maxReasonableScore =
      floor * 3200 +
      dungeonFloor * 2200 +
      dungeonClears * 25000 +
      level * 1800 +
      power * 38 +
      enemies * 200 +
      rareDrops * 11000 +
      180000;

    if (score > maxReasonableScore) {
      appendLog_("submit", false, "score validation error", userId, name, score);
      return { ok: false, message: "スコアが異常値のため登録しませんでした。" };
    }

    if (isRateLimited_(userId)) {
      appendLog_("submit", false, "rate limited", userId, name, score);
      return { ok: false, message: "短時間に連続登録されています。少し時間を空けてください。" };
    }

    const sheet = getSpreadsheet_().getSheetByName(RANKING_SHEET_NAME);
    sheet.appendRow([
      new Date(),
      userId,
      name,
      classId,
      className,
      dungeonId,
      dungeonName,
      dungeonFloor,
      dungeonClears,
      level,
      floor,
      power,
      score,
      enemies,
      rareDrops,
      event && event.parameter ? cleanText_(event.parameter.ua || "", 160) : ""
    ]);

    trimSheet_(sheet, MAX_RANKING_ROWS);
    appendLog_("submit", true, "registered", userId, name, score);

    return {
      ok: true,
      message: "登録しました。",
      item: { name, classId, className, dungeonId, dungeonName, dungeonFloor, dungeonClears, level, floor, power, score, enemies, rareDrops }
    };
  } finally {
    lock.releaseLock();
  }
}

function ranking_(params) {
  setup();

  const limit = Math.min(toInt_(params.limit, 20, 100), 100);
  const sheet = getSpreadsheet_().getSheetByName(RANKING_SHEET_NAME);
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { ok: true, items: [] };
  }

  const values = sheet.getRange(2, 1, lastRow - 1, Math.max(sheet.getLastColumn(), HEADERS.length)).getValues();
  const bestByUser = {};

  values.forEach((row) => {
    const item = parseRankingRow_(row);
    if (!item.userId) return;
    if (!bestByUser[item.userId] || item.score > bestByUser[item.userId].score) {
      bestByUser[item.userId] = item;
    }
  });

  const items = Object.values(bestByUser)
    .sort((a, b) => b.score - a.score || b.floor - a.floor || b.level - a.level)
    .slice(0, limit)
    .map((item) => ({
      name: item.name,
      classId: item.classId,
      className: item.className,
      dungeonId: item.dungeonId,
      dungeonName: item.dungeonName,
      dungeonFloor: item.dungeonFloor,
      dungeonClears: item.dungeonClears,
      level: item.level,
      floor: item.floor,
      power: item.power,
      score: item.score,
      enemies: item.enemies,
      rareDrops: item.rareDrops
    }));

  return { ok: true, items };
}

function parseRankingRow_(row) {
  // v4形式: classId/className/dungeonId/dungeonName/dungeonFloor...
  if (row.length >= 16 && String(row[5] || "") !== "" && String(row[9] || "") !== "") {
    return {
      createdAt: row[0],
      userId: String(row[1] || ""),
      name: String(row[2] || "薬屋さん"),
      classId: String(row[3] || ""),
      className: String(row[4] || ""),
      dungeonId: String(row[5] || ""),
      dungeonName: String(row[6] || ""),
      dungeonFloor: Number(row[7] || 1),
      dungeonClears: Number(row[8] || 0),
      level: Number(row[9] || 1),
      floor: Number(row[10] || 1),
      power: Number(row[11] || 0),
      score: Number(row[12] || 0),
      enemies: Number(row[13] || 0),
      rareDrops: Number(row[14] || 0)
    };
  }

  // v3形式: classId/className/level/floor/power...
  if (row.length >= 12 && String(row[3] || "") !== "" && isNaN(Number(row[3])) && !isNaN(Number(row[5]))) {
    return {
      createdAt: row[0],
      userId: String(row[1] || ""),
      name: String(row[2] || "薬屋さん"),
      classId: String(row[3] || ""),
      className: String(row[4] || ""),
      dungeonId: "",
      dungeonName: "",
      dungeonFloor: 0,
      dungeonClears: 0,
      level: Number(row[5] || 1),
      floor: Number(row[6] || 1),
      power: Number(row[7] || 0),
      score: Number(row[8] || 0),
      enemies: Number(row[9] || 0),
      rareDrops: Number(row[10] || 0)
    };
  }

  // v1/v2形式: class情報なし
  return {
    createdAt: row[0],
    userId: String(row[1] || ""),
    name: String(row[2] || "薬屋さん"),
    classId: "",
    className: "",
    dungeonId: "",
    dungeonName: "",
    dungeonFloor: 0,
    dungeonClears: 0,
    level: Number(row[3] || 1),
    floor: Number(row[4] || 1),
    power: Number(row[5] || 0),
    score: Number(row[6] || 0),
    enemies: Number(row[7] || 0),
    rareDrops: Number(row[8] || 0)
  };
}

function isRateLimited_(userId) {
  const sheet = getSpreadsheet_().getSheetByName(LOG_SHEET_NAME);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;

  const lookback = Math.min(lastRow - 1, 30);
  const rows = sheet.getRange(lastRow - lookback + 1, 1, lookback, 7).getValues();
  const now = Date.now();

  return rows.some((row) => {
    const createdAt = row[0] instanceof Date ? row[0].getTime() : new Date(row[0]).getTime();
    return row[1] === "submit" && row[2] === true && row[4] === userId && now - createdAt < 10000;
  });
}

function appendLog_(action, ok, message, userId, name, score) {
  const sheet = getSpreadsheet_().getSheetByName(LOG_SHEET_NAME);
  sheet.appendRow([new Date(), action, ok, message, userId || "", name || "", score || 0]);
}

function trimSheet_(sheet, maxRows) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= maxRows) return;

  const deleteCount = lastRow - maxRows;
  if (deleteCount > 0) {
    sheet.deleteRows(2, deleteCount);
  }
}

function getSpreadsheet_() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function toInt_(value, min, max) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function cleanText_(value, maxLength) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/[\r\n\t]/g, " ")
    .trim()
    .slice(0, maxLength);
}

function sanitizeCallback_(callback) {
  const cb = String(callback || "");
  return /^[a-zA-Z0-9_.$]+$/.test(cb) ? cb : "";
}
