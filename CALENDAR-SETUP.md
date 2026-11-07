# Falafelverse full-page replacement + shared calendar

- index.html is based on the newer generated falafelverse-part3-blog-ready.html, not the outdated repository index.
- calendar.css and calendar.js power the shared monthly calendar.
- worker.js preserves existing /config, /admin/login and /admin/config routes and adds /calendar.

Deploy: replace the falafelverseapi Worker source with worker.js; keep SITE_CONFIG KV and ADMIN_PASSWORD secret. Optionally set ALLOWED_ORIGIN=https://falafelwithfeelings.github.io. Add calendar.css and calendar.js at the repository root. Merge this PR into main for GitHub Pages.

Visitors can add shared community events by double-clicking a date or using the add button. Authenticated webmaster events are labelled ADMIN; only the admin can delete. Month/year calculate from local date, with automatic rollover and 30-second refresh.

KV is eventually consistent, so cross-region updates can take time. The legacy JSONBin blog posts/comments/likes/Sparkle Codes have NOT yet been migrated by this calendar update; do not assume those sync. Rotate any JSONBin master key that was previously exposed.
