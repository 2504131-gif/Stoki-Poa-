# Stoki Poa Hardware - Web Page

Lightweight, low-power, mobile-first web page for Stoki Poa Hardware, Hindi/Mokowe, Lamu.
No frameworks, no external fonts, no images. Total size is about 40 KB.

## Features

| Feature | Where it lives |
|---|---|
| Price list with search and category filter | `index.html`, `app.js` |
| Stock badges (In stock / Low stock / Out of stock) | `app.js`, `prices.json` |
| "Prices last updated" date (warns if older than 14 days) | `app.js` |
| Shopping list / quote builder (saved on the phone, sent by WhatsApp) | `app.js` |
| Delivery request form (sent by WhatsApp) | `index.html`, `app.js` |
| Customer reviews, English and Kiswahili | `testimonials.json` |
| Install prompt (Android/Chrome button, iPhone hint) | `app.js`, `manifest.webmanifest` |
| Basic analytics (counts only, no personal data) | `app.js`, `apps-script/analytics.gs` |
| Offline use | `sw.js` |
| Call and WhatsApp buttons, dark battery-friendly theme | `index.html`, `styles.css` |

## Before you publish - things you MUST change

1. **Phone number.** In `app.js`, set `CONFIG.phone` (format `2547XXXXXXXX`, no `+`). It is currently a placeholder (`254700000000`).
2. **Prices and stock.** `prices.json` contains SAMPLE prices. Replace them with the shop's real items. Stock values are `in`, `low` or `out`. Update `"updated"` to the date of the change.
3. **Reviews.** `testimonials.json` contains two SAMPLE entries, shown with a "Sample" label. Replace them with real comments from customers who agreed to share them. Set `"lang": "sw"` for Kiswahili. Remove the `"sample": true` line from real ones. Do not publish invented reviews.
4. **Opening hours** in `index.html` (footer) are a placeholder. Set the real hours.
5. **Map link (optional).** Put the Google Maps link in `CONFIG.mapsUrl`.

## Live prices from Google Sheets (optional)

1. Make a sheet with these headers in row 1: `id, name, category, unit, price, stock, updated`
   (`stock` = in / low / out, `updated` = date like `2026-11-19`).
2. File > Share > Publish to web > choose the sheet tab and **CSV** > Publish.
3. Paste the link into `CONFIG.sheetCsvUrl` in `app.js`.

If the sheet cannot be reached (for example no data bundles), the page falls back to `prices.json`, then to the last saved copy on the phone.

## Basic analytics (optional)

Follow the steps at the top of `apps-script/analytics.gs`, then paste the web app URL into `CONFIG.analyticsUrl`. The page counts visits, call clicks, WhatsApp clicks, quotes sent, delivery requests, installs and which items are added most. It stores no names, phone numbers or cookies, and it respects the browser "Do Not Track" setting. Leave `analyticsUrl` empty to turn it off.

## Running and publishing

- Test locally: open a terminal in this folder and run `python -m http.server 8000`, then open `http://localhost:8000`. (The service worker and install prompt need `localhost` or HTTPS; opening the file by double-click will not enable them.)
- Publish free on GitHub Pages or Netlify. Both give HTTPS.
- After you change any file, increase the version in `sw.js` (`stoki-poa-v1` to `stoki-poa-v2`) so phones pick up the update.

## Notes and limits

- Orders and delivery requests open WhatsApp with the message ready; the customer presses Send. The site does not take payments.
- The shopping list total is an estimate. The shop confirms the final price.
- Not yet done: SEO structured data and Google Business Profile link (add after the business profile is verified).
