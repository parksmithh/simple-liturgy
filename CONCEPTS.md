# Concepts

Shared domain vocabulary for this project — entities, named processes, and status concepts with project-specific meaning. Seeded with core domain vocabulary, then accretes as ce-compound and ce-compound-refresh process learnings; direct edits are fine. Glossary only, not a spec or catch-all.

## Release path

### Ready pile
`main` after a verified merge: work that is allowed to ship, but is not yet what visitors see. Merging onto the ready pile does not change the live website.

### Promote
The explicit act of tagging the current tip of the ready pile as a version release so production can update. A promote is not a merge, and it is not finished when Actions turns green.

### Pre-promote look
The required localhost walk of the ready pile in Cursor before anyone tags. It answers whether the piled commit is what we intend to ship. It is not a hosted staging site, and it is not proof that production has updated.

### Live-site check
The required open of the public website after a promote’s publish job succeeds. It confirms the new version and the shipped surface on the hostname people actually use. A port-forward, a GitHub Pages preview URL, a curl of a version file, or an installed home-screen app is not this check.

### Publish Pages
The follow-up deploy job that publishes a tagged ready-pile commit to GitHub Pages after tag verify succeeds. A green Publish Pages run is necessary for a promote and is not the live-site check.

## Offices

### Simple Prayer
The default daily office the reader composes as a short sequence of opening prayer, appointed readings, The Lord’s Prayer, and Gloria. User-visible Simple Prayer changes must be confirmed on that overview during a live-site check.

### Traditional Prayer
The longer Rite II Morning or Evening office assembled from the full Daily Office corpus. It is a different surface from Simple Prayer; a Simple Prayer promote is not proven by opening Traditional Prayer.

## Flagged ambiguities

- "Look at it" had been used for the localhost pre-promote walk, a green Actions run, an installed PWA, and the public website — these are four different checks. The live-site check is only the public hostname.
