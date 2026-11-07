# Falafelverse — complete replacement source

This package is based on the newer `falafelverse-part3-blog-ready.html`, not the obsolete repository index.

## Files
- `index.html` — complete page markup and existing site sections.
- `styles.css` — extracted site styling, animated vector flourishes, visible dangling Miku, and the new calendar design.
- `app.js` — original site JavaScript plus Worker-backed shared blog, comments, likes, Sparkle Codes, and calendar behavior.
- `worker.js` — Cloudflare Worker preserving shared profile/blinkie/recipe settings and adding blog and calendar routes.

## Deploy
1. In Cloudflare, open `falafelverseapi` and replace its code with `worker.js`. Keep `SITE_CONFIG` KV and `ADMIN_PASSWORD` secret. Set `ALLOWED_ORIGIN` to `https://falafelwithfeelings.github.io` (optional but recommended). Deploy.
2. In GitHub, replace `index.html` with this `index.html`, and add `styles.css` and `app.js` at the repository root. Commit all files together.
3. Open the Worker `/config`, `/blog`, and `/calendar` routes to confirm they return JSON.

## Admin
Triple-click the site title and enter your password. The password is held only in memory and sent to the Worker for protected actions. Never put the password in HTML or GitHub.

## Calendar
Automatic month/year calculation; previous/next controls; double-click date to add events; touchscreen add button; events shared for visitors; authoritative ADMIN badge determined by Worker password validation.

## Storage note
Each calendar event has its own KV key; blog state is one shared KV document. Cloudflare KV is eventually consistent and not transactional. It is suitable for a small community site, but may take time to propagate and concurrent blog updates can conflict. Durable Objects or D1 would be the next upgrade for transaction-safe multi-user writes.

## Migration note
The previous public HTML contained a legacy JSONBin master key. This new HTML no longer calls JSONBin. If old JSONBin posts are still needed, they must be exported/imported once using a secret kept on the server; rotate/revoke the exposed legacy key. The Worker starts with empty blog data unless you import a backup.