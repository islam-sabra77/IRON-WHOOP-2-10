# Launch checklist

Steps that can only be done outside the code, in your Netlify, WHOOP and Anthropic accounts.

## 1. Netlify environment variables

Netlify → Site configuration → Environment variables:

| Variable | Needed for | Notes |
| --- | --- | --- |
| `WHOOP_CLIENT_ID` | WHOOP connect | From your WHOOP developer app. Set it explicitly; the code's built-in fallback is your personal test app. |
| `WHOOP_CLIENT_SECRET` | WHOOP connect | Never commit it. |
| `ANTHROPIC_API_KEY` | InBody reading, Arabic translations | Without it those features turn themselves off. |
| `AI_MONTHLY_CAP` | Cost control | Max paid AI calls per month across all users (default 3000). |
| `ERROR_LOG_KEY` | Reading error reports and feedback | Any long random string. Read with `/api/log-error?key=…` and `/api/feedback?key=…`. |

## 2. WHOOP (before other people connect)

1. In the WHOOP developer dashboard, open your app and check how many members it allows and whether it needs review before public use. Read WHOOP's current developer terms; they change.
2. Add your live site's address to the app's redirect URLs: `https://<your-site>/api/whoop-callback`.
3. Make sure the app asks for the scopes IRON uses: recovery, cycles, sleep, workout, profile and body measurements, plus offline access.
4. Fill in the app's privacy policy URL (`https://<your-site>/privacy.html`) and terms URL (`https://<your-site>/terms.html`).
5. Test with a WHOOP account that isn't yours.

## 3. Anthropic

Set a monthly spend limit in the Anthropic console as a second safety net, on top of `AI_MONTHLY_CAP`.

## 4. Before announcing

- Read `terms.html` and `privacy.html` and adjust them to your situation (your name or company, country, contact email). For a paid or large public launch, have a lawyer review them.
- On an iPhone: add IRON to the Home Screen, turn on alerts, run "Test in 10 s", and connect WHOOP.
- Turn on cloud backup on your own phone before any big update.

## Built-in protections (no action needed)

- Rate limits on every server route, per device, by hashed IP (`netlify/lib/guard.mjs`).
- Monthly AI budget (`AI_MONTHLY_CAP`).
- Security headers and a content security policy (`netlify.toml`): only IRON's own scripts, Google Fonts and YouTube are allowed.
- Storage persistence request, a loud warning if a save fails, and a Home reminder until cloud backup is on.
