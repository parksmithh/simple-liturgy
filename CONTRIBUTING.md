# Contributing to Simple Liturgy

Thanks for helping improve Simple Liturgy. Bug reports, corrections, and focused pull requests are welcome.

## Working in this repository

This repository **is** the production website. A push to `main` deploys [simpleliturgy.com](https://simpleliturgy.com) through GitHub Pages, but only after `node scripts/check-site.mjs` passes.

You do **not** need the private `daily-office-reader` repo to develop here in Cursor Cloud. Reading packs, collects, icons, and the Daily Office engine are already vendored in this tree. Use this repo for website, reader, styling, and copy changes.

Use `daily-office-reader` only when you are regenerating lectionary or firmware data, changing hardware, or cutting an official `build_pages.sh` snapshot from that source pipeline. Cursor Cloud on this repo cannot see that private project, and the production app does not need it at runtime.

### Merge gate

1. Open a pull request. Do not push unverified work straight to `main`.
2. GitHub Actions must report a green **verify** check. That job parses the site, confirms version lockstep, loads today's office, composes Traditional Morning and Evening Prayer, and smoke-tests the Pages file set over HTTP.
3. Run the same gate locally with `node scripts/check-site.mjs`.
4. After merge, Pages deploy runs only if **verify** succeeded on `main`. A failed check leaves the live site on the last good deploy.

Require the **verify** status check on `main` in GitHub branch protection so the gate cannot be skipped.

## Contribution terms

By submitting a contribution, you confirm that you have the right to submit it. You retain ownership of your original contribution and grant Mount Worth Creative LLC a perpetual, worldwide, royalty-free license to use, modify, distribute, sublicense, and relicense it, including under commercial or proprietary terms.

Submitting a contribution does not require Mount Worth Creative LLC to accept or use it. It also does not grant any right to use the Simple Liturgy name, logo, or associated branding.

See the [Terms & Licensing](https://simpleliturgy.com/terms.html) page for the source-code license and commercial-use policy.
