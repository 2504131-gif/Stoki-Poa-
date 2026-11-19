/* Stoki Poa Hardware - app logic (small, no libraries) */

/* ====== EDIT THESE SETTINGS ====== */
const CONFIG = {
  // Shop phone in international format, digits only for WhatsApp (e.g. 2547XXXXXXXX)
  phone: "254790331965",
  // Published Google Sheet CSV link. Use the CSV/export URL, not the edit link.
  // Examples:
  // https://docs.google.com/spreadsheets/d/<ID>/export?format=csv&gid=0
  // https://docs.google.com/spreadsheets/d/<ID>/pub?output=csv
  sheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQoh4F98jRGsROxTFHZ2lYvRS26LdMhObCGW0q66gZ3kVmeUhlo2TEkWAAL3ZZPPZc8rn3PxHRhYUDh/pub?gid=0&single=true&output=csv",
  shopName: "Stoki Poa Hardware"
};
/* ================================= */

const TEXT = {
  en: {
    tagline: "Hindi & Mokowe, Lamu County",
    call: "Call Now",
    whatsapp: "Order on WhatsApp",
    listTitle: "Prices & Stock",
    searchLabel: "Search items",
    searchPh: "Search e.g. cement, tap, paint",
    empty: "No items found. Call us to ask.",
    locTitle: "Find the shop",
    locText: "Hindi / Mokowe area, Lamu County. We serve fundis, boat builders and homes.",
    map: "Open in Google Maps",
    hours: "Open: Mon–Sat, 8:00am – 6:00pm",
    all: "All",
    ok: "Available", low: "Few left", out: "Out of stock",
    ask: "Ask",
    updated: "Last checked",
    sheetUpdated: "Google Sheets read at",
    sheetUnavailable: "Google Sheets unavailable; showing saved sample prices.",
    savedCopy: "Offline: showing saved list from",
    noData: "No saved list yet. Connect once to load prices.",
    delivery: "Delivery",
    waGeneral: "Hello Stoki Poa Hardware, I would like to order:",
    waItem: "Hello Stoki Poa Hardware, is this available? "
  },
  sw: {
    tagline: "Hindi na Mokowe, Kaunti ya Lamu",
    call: "Piga Simu",
    whatsapp: "Agiza kwa WhatsApp",
    listTitle: "Bei na Stoki",
    searchLabel: "Tafuta bidhaa",
    searchPh: "Tafuta mfano: cement, bomba, rangi",
    empty: "Hakuna bidhaa. Tupigie ujue.",
    locTitle: "Tupate dukani",
    locText: "Eneo la Hindi / Mokowe, Kaunti ya Lamu. Tunahudumia mafundi, wajenzi wa boti na nyumba.",
    map: "Fungua kwenye Google Maps",
    hours: "Tunafungua: Jumatatu–Jumamosi, 8:00 asubuhi – 6:00 jioni",
    all: "Zote",
    ok: "Ipo", low: "Zimebaki chache", out: "Imeisha",
    ask: "Uliza",
    updated: "Imeangaliwa mara ya mwisho",
    sheetUpdated: "Google Sheets imesomwa saa",
    sheetUnavailable: "Google Sheets haipatikani; tunaonyesha bei za mfano zilizohifadhiwa.",
    savedCopy: "Nje ya mtandao: orodha iliyohifadhiwa ya",
    noData: "Hakuna orodha iliyohifadhiwa. Unganisha mara moja upakie bei.",
    delivery: "Kuleta",
    waGeneral: "Habari Stoki Poa Hardware, naomba kuagiza:",
    waItem: "Habari Stoki Poa Hardware, bidhaa hii ipo? "
  }
};

const $ = (id) => document.getElementById(id);
const SITE_BASE = new URL(".", document.currentScript.src);
let lang = safeGet("lang") || "en";
let items = [];
let updatedAt = null;
let fromCache = false;
let dataSource = "bundled";
let category = "ALL";

function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
const t = (k) => TEXT[lang][k] || k;

function normalizeSheetCsvUrl(url) {
  if (!url || typeof url !== "string") return "";
  try {
    const parsed = new URL(url);
    const isGoogleSheet = parsed.hostname.includes("docs.google.com") && parsed.pathname.includes("/spreadsheets/d/");
    if (!isGoogleSheet) return url.trim();
    if (parsed.pathname.includes("/pub") && parsed.searchParams.get("output") === "csv") return url.trim();

    const match = parsed.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
    if (!match) return url.trim();

    const sheetId = match[1];
    const params = new URLSearchParams();
    params.set("format", "csv");
    const gid = parsed.searchParams.get("gid") || parsed.hash.match(/gid=([^&]+)/)?.[1];
    if (gid) params.set("gid", gid);

    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?${params.toString()}`;
  } catch (e) {
    return url.trim();
  }
}

/* ---- Contact links ---- */
function waLink(message) {
  return "https://wa.me/" + CONFIG.phone + "?text=" + encodeURIComponent(message);
}
function setupContact() {
  $("callBtn").href = "tel:+" + CONFIG.phone;
  $("waBtn").href = waLink(t("waGeneral") + " ");
}

/* ---- Translations ---- */
function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  $("langBtn").textContent = lang === "en" ? "SW" : "EN";
  setupContact();
  renderChips();
  render();
  renderStatus();
}

/* ---- CSV parsing (handles quoted values) ---- */
function parseCsv(text) {
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
/* Sheet columns: item, price, status (available/low/out), delivery, category */
function csvToItems(text) {
  const rows = parseCsv(text).filter((r) => r.some((c) => c.trim()));
  rows.shift(); // header row
  return rows.map((r) => ({
    item: (r[0] || "").trim(),
    price: (r[1] || "").trim(),
    status: (r[2] || "available").trim().toLowerCase(),
    delivery: (r[3] || "").trim(),
    category: (r[4] || "Other").trim()
  })).filter((x) => x.item);
}

/* ---- Load data: online first, then saved copy, then bundled file ---- */
async function loadData() {
  try {
    let data, stamp, source = "bundled";
    const sheetUrl = normalizeSheetCsvUrl(CONFIG.sheetCsvUrl);
    if (sheetUrl) {
      try {
        const freshUrl = new URL(sheetUrl);
        freshUrl.searchParams.set("_", Date.now().toString());
        const res = await fetch(freshUrl, { cache: "no-store" });
        if (!res.ok) throw new Error("sheet");
        const csvText = await res.text();
        if (!csvText || csvText.includes("<html") || csvText.includes("<!DOCTYPE html>")) {
          throw new Error("sheet");
        }
        data = csvToItems(csvText);
        if (!data.length) throw new Error("empty sheet");
        stamp = new Date().toISOString();
        source = "sheet";
      } catch (sheetError) {
        const res = await fetch(new URL("prices.json", SITE_BASE), { cache: "no-cache" });
        if (!res.ok) throw new Error("json");
        const j = await res.json();
        data = j.items; stamp = new Date().toISOString();
      }
    } else {
      const res = await fetch(new URL("prices.json", SITE_BASE), { cache: "no-cache" });
      if (!res.ok) throw new Error("json");
      const j = await res.json();
      data = j.items; stamp = new Date().toISOString();
    }
    items = data; updatedAt = stamp; fromCache = false; dataSource = source;
    safeSet("stokiList", JSON.stringify({ items, updatedAt }));
  } catch (e) {
    const saved = safeGet("stokiList");
    if (saved) {
      const s = JSON.parse(saved);
      items = s.items; updatedAt = s.updatedAt; fromCache = true; dataSource = "cache";
    } else {
      items = []; updatedAt = null; fromCache = true; dataSource = "cache";
    }
  }
  renderChips(); render(); renderStatus();
}

/* ---- Rendering ---- */
function fmtDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleString(lang === "sw" ? "sw-KE" : "en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Africa/Nairobi",
    timeZoneName: "short"
  });
}
function renderStatus() {
  const el = $("status");
  const offline = !navigator.onLine || fromCache || dataSource !== "sheet";
  el.classList.toggle("offline", offline);
  if (!updatedAt) { el.textContent = t("noData"); return; }
  if (dataSource === "sheet") el.textContent = t("sheetUpdated") + " " + fmtDate(updatedAt);
  else if (dataSource === "bundled") el.textContent = t("sheetUnavailable") + " " + fmtDate(updatedAt);
  else el.textContent = t("savedCopy") + " " + fmtDate(updatedAt);
}
function renderChips() {
  const cats = ["ALL"].concat([...new Set(items.map((i) => i.category))]);
  const box = $("chips"); box.textContent = "";
  cats.forEach((c) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (c === category ? " on" : "");
    b.textContent = c === "ALL" ? t("all") : c;
    b.onclick = () => { category = c; renderChips(); render(); };
    box.appendChild(b);
  });
}
function statusKey(s) {
  if (s.startsWith("out") || s.includes("imeisha")) return "out";
  if (s.startsWith("low") || s.includes("few")) return "low";
  return "ok";
}
function render() {
  const q = $("search").value.trim().toLowerCase();
  const list = $("list"); list.textContent = "";
  const shown = items.filter((i) =>
    (category === "ALL" || i.category === category) &&
    (!q || i.item.toLowerCase().includes(q))
  );
  shown.forEach((i) => {
    const li = document.createElement("li"); li.className = "item";
    const name = document.createElement("span"); name.className = "name"; name.textContent = i.item;
    const price = document.createElement("span"); price.className = "price";
    price.textContent = i.price ? "KES " + i.price : "—";
    const meta = document.createElement("span"); meta.className = "meta";
    const k = statusKey(i.status);
    const badge = document.createElement("span"); badge.className = "badge " + k; badge.textContent = t(k);
    meta.appendChild(badge);
    if (i.delivery) meta.appendChild(document.createTextNode(" · " + t("delivery") + ": " + i.delivery));
    const ask = document.createElement("a"); ask.className = "ask"; ask.textContent = t("ask");
    ask.href = waLink(t("waItem") + i.item); ask.target = "_blank"; ask.rel = "noopener";
    li.append(name, price, meta, ask);
    list.appendChild(li);
  });
  $("empty").hidden = shown.length > 0;
}

/* ---- Events ---- */
$("search").addEventListener("input", render);
$("langBtn").addEventListener("click", () => {
  lang = lang === "en" ? "sw" : "en"; safeSet("lang", lang); applyLang();
});
window.addEventListener("online", loadData);
window.addEventListener("offline", renderStatus);
$("year").textContent = new Date().getFullYear();

applyLang();
loadData();

/* ---- Offline support ---- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register(new URL("sw.js", SITE_BASE)));
}
