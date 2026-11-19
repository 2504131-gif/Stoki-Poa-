"use strict";

/* ============================================================
   SETTINGS - the shop owner / developer edits only this block
   ============================================================ */
var CONFIG = {
  shopName: "Stoki Poa Hardware",
  phone: "254790331965",   // PLACEHOLDER: shop number, international format, no "+"
  sheetCsvUrl: "",         // Optional: Google Sheet "Publish to web" CSV link for live prices
  analyticsUrl: "",        // Optional: Google Apps Script web app URL (see apps-script/analytics.gs)
  mapsUrl: "",             // Optional: Google Maps link to the shop
  currency: "KES",
  staleDays: 14            // warn customers if prices are older than this
};

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
var updatedText = "";
var cart = store("sp_cart") || {};   // { itemId: quantity }

/* ---------- loading prices: Sheet -> prices.json -> saved copy ---------- */
function csvRows(t) {
  var rows = [], row = [], f = "", q = false, i, c;
  for (i = 0; i < t.length; i++) {
    c = t[i];
    if (q) {
      if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; }
      else f += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
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
      name: o.name,
      cat: o.category || o.cat || "Other",
      unit: o.unit || "",
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
      store("sp_prices", data);
      showUpdated(data.updated);
      fillCategories();
      renderList();
      renderQuote();
    })
    .catch(function () {
      $("updated").textContent = "Could not load prices. Please call or WhatsApp us.";
    });
}

function showUpdated(d) {
  var dt = d ? new Date(d + "T00:00:00") : null, txt, days;
  if (!dt || isNaN(dt)) { $("updated").textContent = "Prices may change. Please confirm with the shop."; return; }
  txt = dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  days = Math.floor((Date.now() - dt.getTime()) / 86400000);
  updatedText = txt;
  $("updated").textContent = "Prices last updated: " + txt +
    (days > CONFIG.staleDays ? " (a while ago, please call to confirm)" : "");
}

/* ---------- price list ---------- */
function fillCategories() {
  var sel = $("cat"), seen = {};
  items.forEach(function (it) { seen[it.cat] = true; });
  Object.keys(seen).sort().forEach(function (c) {
    sel.appendChild(el("option", { value: c, text: c }));
  });
}

var STOCK_LABEL = { in: "In stock", low: "Low stock", out: "Out of stock" };

function renderList() {
  var q = $("search").value.trim().toLowerCase(), cat = $("cat").value, ul = $("list");
  ul.textContent = "";
  var shown = items.filter(function (it) {
    return (!cat || it.cat === cat) && (!q || it.name.toLowerCase().indexOf(q) !== -1);
  });
  if (!shown.length) {
    ul.appendChild(el("li", { class: "mute", text: items.length ? "No items match your search." : "No items yet." }));
    return;
  }
  shown.forEach(function (it) {
    var btn = el("button", { class: "btn", type: "button", text: "Add" });
    if (it.stock === "out") { btn.disabled = true; btn.textContent = "Unavailable"; }
    btn.addEventListener("click", function () { addToCart(it.id); });
    var name = el("div", { class: "nm" }, [
      document.createTextNode(it.name),
      el("span", { class: "badge b-" + it.stock, text: STOCK_LABEL[it.stock] })
    ]);
    var meta = el("div", { class: "meta" }, [
      el("span", { class: "price", text: it.price ? money(it.price) : "Ask for price" }),
      document.createTextNode(it.unit ? " per " + it.unit : "")
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
    var minus = el("button", { type: "button", "aria-label": "Remove one " + l.it.name, text: "−" });
    var plus = el("button", { type: "button", "aria-label": "Add one " + l.it.name, text: "+" });
    minus.addEventListener("click", function () { changeQty(l.it.id, -1); });
    plus.addEventListener("click", function () { changeQty(l.it.id, 1); });
    var info = el("div", {}, [
      el("div", { class: "nm", text: l.it.name }),
      el("div", { class: "meta", text: l.it.price ? money(l.it.price) + " each = " + money(l.sub) : "Price on request" })
    ]);
    var qty = el("div", { class: "qty" }, [minus, el("span", { text: String(l.qty) }), plus]);
    body.appendChild(el("div", { class: "qline" }, [info, qty]));
  });

  var has = c.lines.length > 0;
  $("quoteActions").hidden = !has;
  $("bar").hidden = !has;
  if (has) {
    body.appendChild(el("div", { class: "total" }, [
      el("span", { text: "Estimated total" }),
      el("span", { text: money(c.total) + (c.unpriced ? " + items on request" : "") })
    ]));
    $("barText").textContent = count + " item" + (count === 1 ? "" : "s") + " · " + money(c.total);
  } else {
    body.appendChild(el("p", { class: "mute", text: "Your list is empty. Tap “Add” on any item above." }));
  }
}

function listAsText() {
  var c = cartLines();
  return c.lines.map(function (l) {
    return "- " + l.qty + " x " + l.it.name + (l.it.price ? " (" + money(l.it.price) + " each)" : "");
  }).join("\n");
}

function sendQuote() {
  var c = cartLines();
  if (!c.lines.length) return;
  var msg = "Hello " + CONFIG.shopName + ", I would like a quote for:\n" + listAsText() +
    "\n\nEstimated total: " + money(c.total) + (c.unpriced ? " + items on request" : "") +
    (updatedText ? "\n(Prices from " + updatedText + ")" : "") +
    "\n\nPlease confirm availability and the final price. Thank you.";
  track("send_quote");
  window.open(waLink(msg), "_blank", "noopener");
}

/* ---------- delivery request ---------- */
function fillDeliveryItems() {
  var t = listAsText();
  if (t) $("dItems").value = t;
}

function submitDelivery(e) {
  e.preventDefault();
  var f = e.target, err = $("dErr");
  var name = f.name.value.trim(), phone = f.phone.value.replace(/[^0-9+]/g, ""),
      place = f.place.value, where = f.where.value.trim(), list = f.items.value.trim();
  if (!name || phone.replace(/\D/g, "").length < 9 || !place || !list) {
    err.textContent = "Please fill in your name, a valid phone number, delivery area and the items you need.";
    err.hidden = false;
    return;
  }
  err.hidden = true;
  var msg = "DELIVERY REQUEST\nName: " + name + "\nPhone: " + phone + "\nArea: " + place +
    (where ? "\nDirections: " + where : "") +
    (f.date.value ? "\nPreferred day: " + f.date.value : "") +
    "\n\nItems:\n" + list;
  track("delivery");
  window.open(waLink(msg), "_blank", "noopener");
}

/* ---------- customer reviews (English / Swahili) ---------- */
function loadReviews() {
  fetch("testimonials.json").then(function (r) { return r.json(); }).then(function (list) {
    if (!list || !list.length) return;
    var box = $("revList");
    list.forEach(function (t) {
      var tags = [];
      if (t.lang === "sw") tags.push(el("span", { class: "tagline", text: "Kiswahili" }));
      if (t.sample) tags.push(el("span", { class: "tagline sample", text: "Sample - replace with a real review" }));
      var quote = el("p", { text: "“" + t.text + "”" });
      if (t.lang) quote.setAttribute("lang", t.lang);
      var who = el("div", { class: "who" }, [document.createTextNode((t.name || "Customer") + (t.place ? ", " + t.place : ""))].concat(tags));
      box.appendChild(el("div", { class: "rev" }, [quote, who]));
    });
    $("reviews").hidden = false;
  }).catch(function () { /* reviews are optional */ });
  $("revShare").href = waLink("Hello " + CONFIG.shopName + ", here is my review / Maoni yangu:\n");
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

/* ---------- start ---------- */
function init() {
  var tel = "tel:+" + CONFIG.phone;
  $("callBtn").href = tel;
  $("waBtn").href = waLink("Hello " + CONFIG.shopName + ", ");
  $("callBtn").addEventListener("click", function () { track("call_click"); });
  $("waBtn").addEventListener("click", function () { track("whatsapp_click"); });
  if (CONFIG.mapsUrl) { $("mapLink").href = CONFIG.mapsUrl; $("mapLink").hidden = false; }

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

  renderQuote();
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
