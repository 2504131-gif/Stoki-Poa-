# Stoki Poa Hardware - Web Page

Lightweight, low-power, mobile-first web page for Stoki Poa Hardware, Hindi/Mokowe, Lamu.
No frameworks, no external fonts, no images. Total size is about 40 KB.

## Features

| Feature | Where it lives |
|---|---|
| Price list with search and category filter | `index.html`, `app.js` |
| Stock badges (In stock / Low stock / Out of stock) | `app.js`, `prices.json` |
| Restock date shown for low and out-of-stock items | `app.js`, `prices.json` (`restock`) |
| "Prices last updated" date (warns if older than 14 days) | `app.js` |
| Shopping list / quote builder (saved on the phone, sent by WhatsApp) | `app.js` |
| Delivery request form (sent by WhatsApp) | `index.html`, `app.js` |
| Customer reviews, English and Kiswahili | `testimonials.json` |
| Install prompt (Android/Chrome button, iPhone hint) | `app.js`, `manifest.webmanifest` |
| Basic analytics (counts only, no personal data) | `app.js`, `apps-script/analytics.gs` |
| English / Kiswahili switch button (remembers the choice) | `index.html`, `app.js` (`I18N` block) |
| Offline use | `sw.js` |
| Offline / back-online message bar | `index.html`, `app.js`, `styles.css` |
| Pochi la Biashara payment section with copy button | `index.html`, `app.js` (`CONFIG.pochi`) |
| Delivery date limited to today or later | `app.js` |
| Call and WhatsApp buttons, dark battery-friendly theme | `index.html`, `styles.css` |

## Before you publish - things you MUST change

1. **Phone number.** In `app.js`, set `CONFIG.phone` (format `2547XXXXXXXX`, no `+`). It is currently a placeholder (`254700000000`).
2. **Prices and stock.** `prices.json` contains SAMPLE prices. Replace them with the shop's real items. Stock values are `in`, `low` or `out`. Update `"updated"` to the date of the change. For low or out-of-stock items, add `"restock": "YYYY-MM-DD"` with the expected restock date (optional).
3. **Kiswahili text.** All page text is in the `I18N` block at the top of `app.js` (English first, Kiswahili second). Please have a Swahili speaker check the wording before you submit.
4. **Reviews.** `testimonials.json` has Ben's review. The reviews from Mohammed and Ali are DRAFT wording marked `"sample": true`, so the page shows a "Sample" label on them. Show each draft to the customer, change it to what they really want to say, then remove the `"sample": true` line. Set `"lang": "sw"` for Kiswahili. Remove the `"sample": true` line from real ones. Do not publish invented reviews.
5. **Opening hours** in `index.html` (footer) are a placeholder. Set the real hours.
6. **Map link (optional).** Put the Google Maps link in `CONFIG.mapsUrl`.
7. **Pochi la Biashara.** The number is set in `CONFIG.pochi` (currently `0790331965`). Check that the name shown when paying is the shop's, and check the M-Pesa menu steps in the payment section of `index.html` and `I18N` (`pay1` to `pay4`).

## Live prices from Google Sheets (optional)

1. Make a sheet with these headers in row 1: `id, name, category, unit, price, stock, restock, updated`
   (`stock` = in / low / out, `restock` = expected restock date like `2026-11-27`, optional, `updated` = date like `2026-11-20`).
2. File > Share > Publish to web > choose the sheet tab and **CSV** > Publish.
3. Paste the link into `CONFIG.sheetCsvUrl` in `app.js`.

Optional extra columns for Kiswahili item names: `name_sw, category_sw, unit_sw` (the same fields exist in `prices.json`: `name_sw`, `cat_sw`, `unit_sw`). If one is empty, the English text is shown.

If the sheet cannot be reached (for example no data bundles), the page falls back to `prices.json`, then to the last saved copy on the phone.

## Basic analytics (optional)

Follow the steps at the top of `apps-script/analytics.gs`, then paste the web app URL into `CONFIG.analyticsUrl`. The page counts visits, call clicks, WhatsApp clicks, quotes sent, delivery requests, installs and which items are added most. It stores no names, phone numbers or cookies, and it respects the browser "Do Not Track" setting. Leave `analyticsUrl` empty to turn it off.

## Running and publishing

- Test locally: open a terminal in this folder and run `python -m http.server 8000`, then open `http://localhost:8000`. (The service worker and install prompt need `localhost` or HTTPS; opening the file by double-click will not enable them.)
- Publish free on GitHub Pages or Netlify. Both give HTTPS.
- After you change any file, increase the version in `sw.js` (`stoki-poa-v3` to `stoki-poa-v4`) so phones pick up the update.

## Notes and limits

- Orders and delivery requests open WhatsApp with the message ready; the customer presses Send. Payment is made outside the site by Pochi la Biashara; the site only shows the number and steps.
- The shopping list total is an estimate. The shop confirms the final price.
- Not yet done: SEO structured data and Google Business Profile link (add after the business profile is verified).
