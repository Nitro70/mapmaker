# Where am I

A floor plan compass that runs in the browser. Open a picture of a floor plan (or a
whole stack of them, one per floor), drop a pin where you are standing, and the
arrow shows which way you are facing, either from the phone's compass or set by hand.

**Use it here:** https://nitro70.github.io/mapmaker/

## Your plans stay on your device

- Plans, pins, names and alignment are saved automatically in your browser
  (IndexedDB) on the device you are using. Nothing is uploaded; the page has no
  server behind it and its security policy (`connect-src 'none'`) stops it from
  sending anything anywhere.
- Every device and every browser keeps its own copy. To move plans to another
  device or share them with someone, use **Maps > Save all maps to a file**, then
  **Open a saved file** on the other device. Opening a file lets you add its plans to
  yours or replace yours.
- **Maps > Delete everything on this device** erases all of it.
- Browsers keep saved data per web address. Every GitHub Pages site of one account
  shares the address `nitro70.github.io`, so another Pages site published from this
  account could read these plans in the same browser. There is none today; if that
  ever matters, give this app its own domain.
- If two tabs of the app are open, the one you are not using steps aside and reloads,
  so it can never save an old copy over your latest changes.

## iPhone and iPad

Works in Safari. For the best experience tap **Share > Add to Home Screen** before
you add your plans, and use it from the Home Screen from then on:

- it opens full screen and works with no signal (handy indoors);
- Safari clears saved website data for sites you have not opened in about a week,
  but it does not do that to Home Screen apps, so your plans are kept.

The Home Screen app has its own storage, separate from Safari's. If you already
added plans in Safari, move them across with **Maps > Save all maps to a file** in
Safari, then **Open a saved file** in the Home Screen app.

The compass asks for permission the first time you tap **Compass**. If you said no,
close the page completely and open it again to be asked again, or use
**Set facing** to point the arrow by hand. Compass readings need the page to be
opened over https, which the link above is.

On a Mac, Safari's **File > Add to Dock** does the same job.

## How to use it

1. **Open floor plans** and pick one or more images. Several at once become floors,
   sorted by file name; tap a name at the bottom to switch floors, tap it again to
   rename it.
2. **Set position**: pan and pinch the plan until the crosshair is on you, then
   **Drop pin here**.
3. **Compass** turns on the phone's compass. **Align map** then lines the plan up
   with real north: face something you can find on the plan, point the arrow at it,
   confirm. Floors of one building can share one alignment.
4. No compass? **Set facing** lets you drag the arrow round by hand.
5. **Track up** turns the plan so the way you face is always up. **Centre** jumps
   back to your pin.

## Running it yourself

It is plain static files with no build step. Serve the folder over http(s), for example:

```bash
python -m http.server 8765
```

then open http://localhost:8765. Opening `index.html` straight from disk also works,
minus offline mode (service workers need http or https).

| File | What it is |
|---|---|
| `index.html` | the whole app |
| `sw.js` | offline copy of the app's own files (never your plans) |
| `manifest.webmanifest`, `icons/` | Home Screen name and icons |

Installed copies pick up a changed `index.html` by themselves: the service worker
opens the cached page instantly and fetches the new one in the background, so it
shows from the next launch. If you change the icons or the manifest, bump the
version in `CACHE` in `sw.js` as well.
