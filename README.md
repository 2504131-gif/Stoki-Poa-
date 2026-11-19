# Stoki Poa Hardware web page

Lightweight, low-power, mobile-first page (HTML, CSS, a little JavaScript). No images, no libraries, no animations.

## Files
- `index.html` – page structure and search data
- `styles.css` – dark, battery-friendly styling
- `app.js` – price list, search, language toggle, WhatsApp links, offline copy
- `sw.js` – service worker (offline access)
- `prices.json` – sample price list (used until the Google Sheet is connected)
- `manifest.webmanifest` – lets phones "Add to Home screen"

## Run in Visual Studio Code
1. Put all files in one folder and open it in VS Code (File > Open Folder).
2. Install the **Live Server** extension, right-click `index.html`, choose **Open with Live Server**.
   (The service worker needs `http://localhost` or HTTPS, so do not just double-click the file.)

## Things to change
In `app.js`, edit `CONFIG`:
- `phone` – the shop number as `2547XXXXXXXX`
- `sheetCsvUrl` – the published CSV link the website reads (see below)

In `index.html`: update the phone in the `tel:` link and the JSON-LD block, the opening hours, and the Google Maps link once the shop has a Maps listing.

## Owner updates prices from a phone (Google Sheet)
1. Create a Google Sheet with this header row: `item, price, status, delivery, category`
2. Status values: `available`, `low`, or `out`.
3. File > Share > Publish to web > choose the sheet and **CSV** > Publish > copy the link.
4. Publish the price-list worksheet to the web as CSV, then paste its published CSV URL into `sheetCsvUrl` in `app.js`. Alternatively, the configured export URL reads the first worksheet if the spreadsheet's general access is set to anyone with the link as a viewer. Only expose information intended to be public.
5. The owner edits prices by opening the Google Sheet directly (keep its link bookmarked on the phone); the website no longer shows an edit button. If using an export URL and prices are in another worksheet tab, add that tab's `gid` to the URL.
6. The page shows when it last read the online list, including seconds in East Africa Time, and keeps the latest copy on the phone for offline use. If the sheet cannot be read, it explicitly shows that it is using the saved sample prices instead.
7. After changing a price, open the published CSV link and confirm that row contains the new value. If it does not, republish the worksheet or enable automatic republishing in the Publish to web settings; the site can only show values present in the published CSV. Then refresh the website.

## Free hosting (HTTPS)
Upload the folder to GitHub Pages, Netlify or Cloudflare Pages.

## Testing against your targets
- Chrome DevTools > Lighthouse (mobile) and Network tab (page size under 500 KB)
- Throttle to "Slow 3G" and check load time under 5 seconds
- DevTools > Application > Service Workers > tick **Offline** and reload
- Also test on a real phone with WebPageTest
