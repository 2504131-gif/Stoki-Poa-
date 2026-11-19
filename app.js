"use strict";

/* ============================================================
   SETTINGS - the shop owner / developer edits only this block
   ============================================================ */
var CONFIG = {
  shopName: "Stoki Poa Hardware",
  phone: "254700000000",   // PLACEHOLDER: shop number, international format, no "+"
  sheetCsvUrl: "",         // Optional: Google Sheet "Publish to web" CSV link for live prices
  analyticsUrl: "",        // Optional: Google Apps Script web app URL (see apps-script/analytics.gs)
  mapsUrl: "",             // Optional: Google Maps link to the shop
  currency: "KES",
  staleDays: 14            // warn customers if prices are older than this
};

/* ============================================================
   TEXT IN BOTH LANGUAGES: key: [English, Kiswahili]
   ============================================================ */
var I18N = {
  tag: ["Hindi / Mokowe, Lamu County · Building and hardware supplies", "Hindi / Mokowe, Kaunti ya Lamu · Vifaa vya ujenzi na hardware"],
  call: ["Call us", "Piga simu"],
  install: ["Install app", "Sakinisha programu"],
  iosHint: ["To install this page: tap the Share button, then “Add to Home Screen”.", "Kusakinisha ukurasa huu: bonyeza kitufe cha Share, kisha “Add to Home Screen”."],
  close: ["Close", "Funga"],
  hPrices: ["Prices and stock", "Bei na hali ya hisa"],
  loading: ["Loading prices…", "Inapakia bei…"],
  searchLbl: ["Search items", "Tafuta bidhaa"],
  searchPh: ["Search (cement, nails, paint...)", "Tafuta (saruji, misumari, rangi...)"],
  catLbl: ["Category", "Kundi"],
  allCats: ["All categories", "Makundi yote"],
  updated: ["Prices last updated: {d}", "Bei zilisasishwa mwisho: {d}"],
  stale: [" (a while ago, please call to confirm)", " (zamani kidogo, tafadhali piga simu kuthibitisha)"],
  mayChange: ["Prices may change. Please confirm with the shop.", "Bei zinaweza kubadilika. Tafadhali thibitisha na duka."],
  loadFail: ["Could not load prices. Please call or WhatsApp us.", "Imeshindwa kupakia bei. Tafadhali tupigie simu au tuandikie WhatsApp."],
  noMatch: ["No items match your search.", "Hakuna bidhaa zinazolingana na utafutaji wako."],
  noItems: ["No items yet.", "Hakuna bidhaa bado."],
  stockin: ["In stock", "Ipo"],
  stocklow: ["Low stock", "Inaisha"],
  stockout: ["Out of stock", "Imeisha"],
  add: ["Add", "Ongeza"],
  unavailable: ["Unavailable", "Haipo"],
  askPrice: ["Ask for price", "Uliza bei"],
  per: ["per", "kwa"],
  hQuote: ["My shopping list (quote)", "Orodha yangu ya ununuzi (makadirio)"],
  estTotal: ["Estimated total", "Jumla ya makadirio"],
  plusOnReq: [" + items on request", " + bidhaa zisizo na bei"],
  priceOnReq: ["Price on request", "Bei kwa ombi"],
  each: ["each", "kila moja"],
  emptyList: ["Your list is empty. Tap “Add” on any item above.", "Orodha yako haina kitu. Bonyeza “Ongeza” kwenye bidhaa yoyote hapo juu."],
  removeOne: ["Remove one {n}", "Punguza moja: {n}"],
  addOne: ["Add one {n}", "Ongeza moja: {n}"],
  items: ["{n} item(s)", "bidhaa {n}"],
  sendQuote: ["Send list on WhatsApp", "Tuma orodha kwa WhatsApp"],
  reqDelivery: ["Request delivery", "Omba kufikishiwa"],
  clearList: ["Clear list", "Futa orodha"],
  quoteNote: ["Totals are estimates. Please confirm the final price and stock with the shop.", "Jumla ni makadirio tu. Tafadhali thibitisha bei ya mwisho na upatikanaji na duka."],
  hDel: ["Delivery request", "Ombi la kufikishiwa bidhaa"],
  lName: ["Your name", "Jina lako"],
  lPhone: ["Phone number", "Namba ya simu"],
  lArea: ["Delivery area", "Eneo la kufikishiwa"],
  chooseArea: ["Choose area", "Chagua eneo"],
  areaTown: ["Lamu Town", "Mji wa Lamu"],
  areaOther: ["Other", "Nyingine"],
  lWhere: ["Landmark or directions", "Alama ya karibu au maelekezo"],
  wherePh: ["Near the mosque, blue gate...", "Karibu na msikiti, geti la bluu..."],
  lItems: ["Items needed", "Bidhaa unazohitaji"],
  useList: ["Use my shopping list", "Tumia orodha yangu ya ununuzi"],
  lDate: ["Preferred delivery day (optional)", "Siku unayopendelea (si lazima)"],
  sendDel: ["Send request on WhatsApp", "Tuma ombi kwa WhatsApp"],
  delErr: ["Please fill in your name, a valid phone number, delivery area and the items you need.", "Tafadhali jaza jina lako, namba sahihi ya simu, eneo na bidhaa unazohitaji."],
  hRev: ["What customers say", "Maoni ya wateja"],
  share: ["Share your experience", "Shiriki maoni yako"],
  sampleTag: ["Sample - replace with a real review", "Mfano - badilisha na maoni halisi"],
  footAddr: ["Hindi / Mokowe, Lamu County, Kenya", "Hindi / Mokowe, Kaunti ya Lamu, Kenya"],
  hours: ["Opening hours: Mon–Sat 8:00 am – 6:00 pm", "Saa za kazi: Jumatatu–Jumamosi, 8:00 asubuhi – 6:00 jioni"],
  map: ["Open in Google Maps", "Fungua kwenye Google Maps"],
  viewList: ["View list", "Angalia orodha"],
  /* WhatsApp messages */
  mHello: ["Hello {s}, ", "Habari {s}, "],
  mQuote: ["Hello {s}, I would like a quote for:", "Habari {s}, ningependa makadirio ya bei ya:"],
  mTotal: ["Estimated total: ", "Jumla ya makadirio: "],
  mPrices: ["(Prices from {d})", "(Bei za {d})"],
  mConfirm: ["Please confirm availability and the final price. Thank you.", "Tafadhali thibitisha upatikanaji na bei ya mwisho. Asante."],
  mDel: ["DELIVERY REQUEST", "OMBI LA KUFIKISHIWA BIDHAA"],
  mName: ["Name: ", "Jina: "],
  mPhone: ["Phone: ", "Simu: "],
  mArea: ["Area: ", "Eneo: "],
  mDir: ["Directions: ", "Maelekezo: "],
  mDay: ["Preferred day: ", "Siku: "],
  mItems: ["Items:", "Bidhaa:"],
  mReview: ["Hello {s}, here is my review:", "Habari {s}, haya ni maoni yangu:"]
};

var lang = "en";

function t(k, v) {
  var s = (I18N[k] || [k, k])[lang === "sw" ? 1 : 0], x;
  if (v) for (x in v) s = s.replace("{" + x + "}", v[x]);
  return s;
}

/* Optional Swahili data fields: name_sw, unit_sw, cat_sw (in prices.json or Sheet columns) */
function loc(o, f) { return (lang === "sw" && o[f + "_sw"]) ? o[f + "_sw"] : o[f]; }

/* ---------- small helpers ---------- */
function $(id) { return document.getElementById(id); }

function el(tag, props, kids) {
  var n = document.createElement(tag), k;
  props = props || {};
  for (k in props) {
    if (k === "text") n.textContent = props[k];
    else if (k === "class") n.className = props[k];
    else n.setAttribute(k, props[k]);
  }
  (kids || []).forEach(function (c) { n.appendChild(c); });
  return n;
}

function store(key, val) {
  try {
    if (val === undefined) { return JSON.parse(localStorage.getItem(key)); }
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) { return null; }
}

function money(n) {
  return CONFIG.currency + " " + Math.round(n).toLocaleString("en-KE");
}

function waLink(msg) {
  return "https://wa.me/" + CONFIG.phone + "?text=" + encodeURIComponent(msg);
}

/* ---------- basic analytics (no cookies, no personal data) ---------- */
function track(ev) {
  if (!CONFIG.analyticsUrl || navigator.doNotTrack === "1") return;
  try {
    var body = JSON.stringify({ e: ev, t: Date.now() });
    if (navigator.sendBeacon) navigator.sendBeacon(CONFIG.analyticsUrl, body);
    else fetch(CONFIG.analyticsUrl, { method: "POST", body: body, mode: "no-cors", keepalive: true });
  } catch (e) { /* analytics must never break the page */ }
}

/* ---------- state ---------- */
var items = [];
var updatedRaw = "";
var pricesState = "loading";          // loading | ok | failed
var reviews = [];
var cart = store("sp_cart") || {};   // { itemId: quantity }

/* ---------- loading prices: Sheet -> prices.json -> saved copy ---------- */
function csvRows(s) {
  var rows = [], row = [], f = "", q = false, i, c;
  for (i = 0; i < s.length; i++) {
    c = s[i];
    if (q) {
      if (c === '"') { if (s[i + 1] === '"') { f += '"'; i++; } else q = false; }
      else f += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(f); f = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else f += c;
  }
  row.push(f);
  if (row.length > 1 || row[0] !== "") rows.push(row);
  return rows;
}

function normStock(s) {
  s = String(s || "").toLowerCase();
  if (s.indexOf("out") === 0 || s === "0" || s === "no") return "out";
  if (s.indexOf("low") === 0) return "low";
  return "in";
}

function parseCsv(text) {
  var rows = csvRows(text), head, out = [], latest = "";
  if (rows.length < 2) throw new Error("empty sheet");
  head = rows[0].map(function (h) { return h.trim().toLowerCase(); });
  rows.slice(1).forEach(function (r, i) {
    var o = {};
    head.forEach(function (h, j) { o[h] = (r[j] || "").trim(); });
    if (!o.name) return;
    var up = o.updated || "";
    if (up > latest) latest = up;
    out.push({
      id: o.id || ("row" + i),
      name: o.name, name_sw: o.name_sw || "",
      cat: o.category || o.cat || "Other", cat_sw: o.category_sw || o.cat_sw || "",
      unit: o.unit || "", unit_sw: o.unit_sw || "",
      price: parseFloat(String(o.price).replace(/[^0-9.]/g, "")) || 0,
      stock: normStock(o.stock)
    });
  });
  return { updated: latest, items: out };
}

function loadPrices() {
  var fromSheet = CONFIG.sheetCsvUrl
    ? fetch(CONFIG.sheetCsvUrl).then(function (r) { if (!r.ok) throw new Error("sheet"); return r.text(); }).then(parseCsv)
    : Promise.reject(new Error("no sheet"));

  fromSheet
    .catch(function () { return fetch("prices.json").then(function (r) { if (!r.ok) throw new Error("json"); return r.json(); }); })
    .catch(function () { var c = store("sp_prices"); if (c && c.items) return c; throw new Error("none"); })
    .then(function (data) {
      items = data.items || [];
      updatedRaw = data.updated || "";
      pricesState = "ok";
      store("sp_prices", data);
      showUpdated();
      fillCategories();
      renderList();
      renderQuote();
    })
    .catch(function () {
      pricesState = "failed";
      showUpdated();
    });
}

function showUpdated() {
  var box = $("updated"), dt, txt, days;
  if (pricesState === "loading") { box.textContent = t("loading"); return; }
  if (pricesState === "failed") { box.textContent = t("loadFail"); return; }
  dt = updatedRaw ? new Date(updatedRaw + "T00:00:00") : null;
  if (!dt || isNaN(dt)) { box.textContent = t("mayChange"); return; }
  txt = dt.toLocaleDateString(lang === "sw" ? "sw-KE" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  days = Math.floor((Date.now() - dt.getTime()) / 86400000);
  box.textContent = t("updated", { d: txt }) + (days > CONFIG.staleDays ? t("stale") : "");
}

function dateText() {
  var dt = updatedRaw ? new Date(updatedRaw + "T00:00:00") : null;
  if (!dt || isNaN(dt)) return "";
  return dt.toLocaleDateString(lang === "sw" ? "sw-KE" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/* ---------- price list ---------- */
function fillCategories() {
  var sel = $("cat"), cur = sel.value, map = {}, keys;
  while (sel.options.length > 1) sel.remove(1);
  items.forEach(function (it) { map[it.cat] = loc(it, "cat") ; });
  keys = Object.keys(map).sort(function (a, b) { return map[a].localeCompare(map[b]); });
  keys.forEach(function (k) { sel.appendChild(el("option", { value: k, text: map[k] })); });
  sel.value = cur;
}

function renderList() {
  var q = $("search").value.trim().toLowerCase(), cat = $("cat").value, ul = $("list");
  ul.textContent = "";
  var shown = items.filter(function (it) {
    var hay = (it.name + " " + (it.name_sw || "")).toLowerCase();
    return (!cat || it.cat === cat) && (!q || hay.indexOf(q) !== -1);
  });
  if (!shown.length) {
    if (pricesState === "ok") ul.appendChild(el("li", { class: "mute", text: items.length ? t("noMatch") : t("noItems") }));
    return;
  }
  shown.forEach(function (it) {
    var btn = el("button", { class: "btn", type: "button", text: t("add") });
    if (it.stock === "out") { btn.disabled = true; btn.textContent = t("unavailable"); }
    btn.addEventListener("click", function () { addToCart(it.id); });
    var name = el("div", { class: "nm" }, [
      document.createTextNode(loc(it, "name")),
      el("span", { class: "badge b-" + it.stock, text: t("stock" + it.stock) })
    ]);
    var unit = loc(it, "unit");
    var meta = el("div", { class: "meta" }, [
      el("span", { class: "price", text: it.price ? money(it.price) : t("askPrice") }),
      document.createTextNode(unit ? " " + t("per") + " " + unit : "")
    ]);
    ul.appendChild(el("li", { class: "item" }, [name, btn, meta]));
  });
}

/* ---------- shopping list / quote builder ---------- */
function findItem(id) {
  for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
  return null;
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  store("sp_cart", cart);
  track("add:" + id);
  renderQuote();
}

function changeQty(id, d) {
  cart[id] = (cart[id] || 0) + d;
  if (cart[id] <= 0) delete cart[id];
  store("sp_cart", cart);
  renderQuote();
}

function cartLines() {
  var lines = [], total = 0, unpriced = false;
  Object.keys(cart).forEach(function (id) {
    var it = findItem(id);
    if (!it) return;
    var sub = it.price * cart[id];
    if (!it.price) unpriced = true;
    total += sub;
    lines.push({ it: it, qty: cart[id], sub: sub });
  });
  return { lines: lines, total: total, unpriced: unpriced };
}

function renderQuote() {
  var c = cartLines(), body = $("quoteBody"), count = 0;
  body.textContent = "";
  c.lines.forEach(function (l) {
    count += l.qty;
    var nm = loc(l.it, "name");
    var minus = el("button", { type: "button", "aria-label": t("removeOne", { n: nm }), text: "−" });
    var plus = el("button", { type: "button", "aria-label": t("addOne", { n: nm }), text: "+" });
    minus.addEventListener("click", function () { changeQty(l.it.id, -1); });
    plus.addEventListener("click", function () { changeQty(l.it.id, 1); });
    var info = el("div", {}, [
      el("div", { class: "nm", text: nm }),
      el("div", { class: "meta", text: l.it.price ? money(l.it.price) + " " + t("each") + " = " + money(l.sub) : t("priceOnReq") })
    ]);
    var qty = el("div", { class: "qty" }, [minus, el("span", { text: String(l.qty) }), plus]);
    body.appendChild(el("div", { class: "qline" }, [info, qty]));
  });

  var has = c.lines.length > 0;
  $("quoteActions").hidden = !has;
  $("bar").hidden = !has;
  if (has) {
    body.appendChild(el("div", { class: "total" }, [
      el("span", { text: t("estTotal") }),
      el("span", { text: money(c.total) + (c.unpriced ? t("plusOnReq") : "") })
    ]));
    $("barText").textContent = t("items", { n: count }).replace("item(s)", count === 1 ? "item" : "items") + " · " + money(c.total);
  } else {
    body.appendChild(el("p", { class: "mute", text: t("emptyList") }));
  }
}

function listAsText() {
  var c = cartLines();
  return c.lines.map(function (l) {
    return "- " + l.qty + " x " + loc(l.it, "name") + (l.it.price ? " (" + money(l.it.price) + " " + t("each") + ")" : "");
  }).join("\n");
}

function sendQuote() {
  var c = cartLines(), d = dateText();
  if (!c.lines.length) return;
  var msg = t("mQuote", { s: CONFIG.shopName }) + "\n" + listAsText() +
    "\n\n" + t("mTotal") + money(c.total) + (c.unpriced ? t("plusOnReq") : "") +
    (d ? "\n" + t("mPrices", { d: d }) : "") +
    "\n\n" + t("mConfirm");
  track("send_quote");
  window.open(waLink(msg), "_blank", "noopener");
}

/* ---------- delivery request ---------- */
function fillDeliveryItems() {
  var s = listAsText();
  if (s) $("dItems").value = s;
}

function submitDelivery(e) {
  e.preventDefault();
  var f = e.target, err = $("dErr");
  var name = f.name.value.trim(), phone = f.phone.value.replace(/[^0-9+]/g, ""),
      place = f.place.value, where = f.where.value.trim(), list = f.items.value.trim();
  if (!name || phone.replace(/\D/g, "").length < 9 || !place || !list) {
    err.textContent = t("delErr");
    err.hidden = false;
    return;
  }
  err.hidden = true;
  var msg = t("mDel") + "\n" + t("mName") + name + "\n" + t("mPhone") + phone + "\n" + t("mArea") + place +
    (where ? "\n" + t("mDir") + where : "") +
    (f.date.value ? "\n" + t("mDay") + f.date.value : "") +
    "\n\n" + t("mItems") + "\n" + list;
  track("delivery");
  window.open(waLink(msg), "_blank", "noopener");
}

/* ---------- customer reviews (each review keeps its own language) ---------- */
function loadReviews() {
  fetch("testimonials.json").then(function (r) { return r.json(); }).then(function (list) {
    reviews = list || [];
    renderReviews();
  }).catch(function () { /* reviews are optional */ });
}

function renderReviews() {
  var box = $("revList");
  box.textContent = "";
  if (!reviews.length) return;
  reviews.forEach(function (r) {
    var tags = [];
    if (r.lang === "sw") tags.push(el("span", { class: "tagline", text: "Kiswahili" }));
    if (r.sample) tags.push(el("span", { class: "tagline sample", text: t("sampleTag") }));
    var quote = el("p", { text: "“" + r.text + "”" });
    if (r.lang) quote.setAttribute("lang", r.lang);
    var who = el("div", { class: "who" }, [document.createTextNode((r.name || "") + (r.place ? ", " + r.place : ""))].concat(tags));
    box.appendChild(el("div", { class: "rev" }, [quote, who]));
  });
  $("reviews").hidden = false;
}

/* ---------- install prompt ---------- */
var deferredInstall = null;

function setupInstall() {
  var standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  if (standalone) return;

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredInstall = e;
    $("installBtn").hidden = false;
  });
  $("installBtn").addEventListener("click", function () {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    deferredInstall.userChoice.then(function (r) {
      if (r.outcome === "accepted") track("install");
      deferredInstall = null;
      $("installBtn").hidden = true;
    });
  });
  window.addEventListener("appinstalled", function () { $("installBtn").hidden = true; });

  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (ios && !store("sp_ios_hint")) {
    $("iosHint").hidden = false;
    $("iosClose").addEventListener("click", function () {
      $("iosHint").hidden = true;
      store("sp_ios_hint", 1);
    });
  }
}

/* ---------- language switch ---------- */
function applyLang() {
  var i, n, a;
  document.documentElement.lang = lang;
  a = document.querySelectorAll("[data-i18n]");
  for (i = 0; i < a.length; i++) a[i].textContent = t(a[i].getAttribute("data-i18n"));
  a = document.querySelectorAll("[data-i18n-ph]");
  for (i = 0; i < a.length; i++) a[i].setAttribute("placeholder", t(a[i].getAttribute("data-i18n-ph")));

  n = $("langBtn");
  n.textContent = lang === "sw" ? "English" : "Kiswahili";
  n.setAttribute("lang", lang === "sw" ? "en" : "sw");

  $("waBtn").href = waLink(t("mHello", { s: CONFIG.shopName }));
  $("revShare").href = waLink(t("mReview", { s: CONFIG.shopName }) + "\n");
  if (pricesState === "loading") $("updated").textContent = t("loading"); else showUpdated();
  fillCategories();
  renderList();
  renderQuote();
  renderReviews();
}

function setLang(l, save) {
  lang = l;
  if (save) store("sp_lang", l);
  applyLang();
}

/* ---------- start ---------- */
function init() {
  var saved = store("sp_lang");
  lang = saved === "sw" || saved === "en" ? saved
    : ((navigator.language || "").toLowerCase().indexOf("sw") === 0 ? "sw" : "en");

  $("callBtn").href = "tel:+" + CONFIG.phone;
  $("callBtn").addEventListener("click", function () { track("call_click"); });
  $("waBtn").addEventListener("click", function () { track("whatsapp_click"); });
  if (CONFIG.mapsUrl) { $("mapLink").href = CONFIG.mapsUrl; $("mapLink").hidden = false; }

  $("langBtn").addEventListener("click", function () {
    setLang(lang === "sw" ? "en" : "sw", true);
    track("lang:" + lang);
  });
  $("search").addEventListener("input", renderList);
  $("cat").addEventListener("change", renderList);
  $("sendQuote").addEventListener("click", sendQuote);
  $("clearList").addEventListener("click", function () { cart = {}; store("sp_cart", cart); renderQuote(); });
  $("toDelivery").addEventListener("click", function () {
    fillDeliveryItems();
    $("delivery").scrollIntoView();
    $("dName").focus();
  });
  $("useList").addEventListener("click", fillDeliveryItems);
  $("delForm").addEventListener("submit", submitDelivery);

  applyLang();
  loadPrices();
  loadReviews();
  setupInstall();
  track("view");

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () { /* offline mode is optional */ });
    });
  }
}

init();
