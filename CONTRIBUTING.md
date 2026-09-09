# Contributing to Simple Liturgy

Thanks for helping improve Simple Liturgy. Bug reports, corrections, and focused pull requests are welcome.

## Working in this repository

This repository **is** the production website source. Merging to `main` does **not** update [simpleliturgy.com](https://simpleliturgy.com). Live deploys happen only when someone pushes to prod by tagging the tip of `main`.

You do **not** need the private `daily-office-reader` repo to develop here in Cursor Cloud. Reading packs, collects, icons, and the Daily Office engine are already vendored in this tree. Use this repo for website, reader, styling, and copy changes.

Use `daily-office-reader` only when you are regenerating lectionary or firmware data, changing hardware, or cutting an official `build_pages.sh` snapshot from that source pipeline. Cursor Cloud on this repo cannot see that private project, and the production app does not need it at runtime.

### Merge gate

1. Open a pull request. Do not push unverified work straight to `main`.
2. GitHub Actions must report a green **verify** check. That job parses the site, confirms version lockstep, loads today's office, composes Traditional Morning and Evening Prayer, and smoke-tests the Pages file set over HTTP.
3. Run the same gate locally with `node scripts/check-site.mjs`.
4. After merge, `main` is the ready pile. The live site stays on the last GitHub Release / `vX.Y.Z` tag until the next promote.

Require the **verify** status check on `main` in GitHub branch protection so the gate cannot be skipped.

### Look at stacked `main` before promoting

The prescribed pre-promote look is localhost in Cursor, not a hosted staging URL.

1. Check out current `main`.
2. From the repo root, serve the site: `python3 -m http.server 4173`
3. Forward that port in Cursor and open the reader.
4. Use Cursor screenshots to walk the office, settings, and install surfaces that the piled changes touch.

This does not replace a later phone check of an already-installed PWA. It is the look that happens before the tag.

### Push to prod

Promote only the tip of `main`. Do not tag an older commit.

Bump the installed-app version only when the promote would change files the home-screen PWA loads (reader, CSS, worker, icons, office or reading data). Docs, CI, and scripts the phone never loads do not need a bump, and they do not need a promote.

Several app PRs may share one later version. When a bump is needed:

```bash
node scripts/bump-version.mjs 0.3.144
node scripts/check-site.mjs
```

Then merge that bump to `main` if it is not already there, and push to prod:

1. Tag current `main` as `vX.Y.Z`, matching `APP_VERSION` in `version.js`.
2. Publish a GitHub Release for that tag, or push the tag.
3. Actions runs **verify** on the tagged commit, then deploys Pages. A tag that does not match `v${APP_VERSION}` fails the gate.

## Contribution terms

By submitting a contribution, you confirm that you have the right to submit it. You retain ownership of your original contribution and grant Mount Worth Creative LLC a perpetual, worldwide, royalty-free license to use, modify, distribute, sublicense, and relicense it, including under commercial or proprietary terms.

Submitting a contribution does not require Mount Worth Creative LLC to accept or use it. It also does not grant any right to use the Simple Liturgy name, logo, or associated branding.

See the [Terms & Licensing](https://simpleliturgy.com/terms.html) page for the source-code license and commercial-use policy.
