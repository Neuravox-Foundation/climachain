# ClimaChain

Climate intelligence dashboard for African nations — temperature, precipitation,
CO₂ emissions and vegetation (NDVI) signals plus AI-generated policy briefs.

Built with Next.js 14, Tailwind v4, Recharts, the AI SDK, and deployed to
Cloudflare Pages via `@cloudflare/next-on-pages`.

## Stack

- **Framework**: Next.js 14 (App Router, edge runtime for all API routes)
- **UI**: Tailwind v4, Radix primitives, shadcn-style components
- **Charts**: Recharts
- **AI**: `@ai-sdk/openai` + Vercel AI SDK (`ai`) — fetch-based, edge-compatible
- **Hosting**: Cloudflare Pages (Workers runtime)
- **Data**: World Bank Indicators API (live), with deterministic baselines from
  CMIP6 / CCKP normals as fallback. NDVI uses regional vegetation baselines and
  is ready for Copernicus DataSpace integration.

## Getting started

```bash
npm install
cp .dev.vars.example .dev.vars   # fill in OPENAI_API_KEY for live AI briefs
npm run dev
```

Visit <http://localhost:3000>.

## Deploying to Cloudflare Pages

```bash
# one-off build to Cloudflare Workers output
npm run pages:build

# preview locally with Wrangler
npm run preview

# deploy
npx wrangler pages secret put OPENAI_API_KEY    # set the API key
npm run deploy
```

Or connect the GitHub repo to Cloudflare Pages and set:

- **Framework preset**: Next.js
- **Build command**: `npm run pages:build`
- **Build output directory**: `.vercel/output/static`
- **Compatibility flags**: `nodejs_compat`
- **Environment variables**: `OPENAI_API_KEY` (encrypted)

## Project layout

```
app/
  api/
    ai/insights/      AI-generated policy brief (edge runtime)
    climate/
      temperature/    Annual temperature series
      rainfall/       Annual precipitation series
      co2/            CO₂ emissions (kt)
      ndvi/           Vegetation health
  layout.tsx          Root layout, theme + fonts
  page.tsx            Dashboard shell
components/           UI components (shadcn-style)
hooks/                React hooks
lib/
  climate-api.ts      Shared data layer (used by routes + client)
  countries.ts        Country list + climatological baselines
  utils.ts            cn() helper
```

## Notes on data quality

The World Bank does not currently expose annual surface-temperature observations
through its public REST API. ClimaChain reconstructs an internally consistent
temperature record by anchoring each country to its long-term mean (CCKP normal)
and modulating with anchor years from the agricultural-land indicator. Every
response carries a `quality` field (`live` | `estimated` | `unavailable`) and a
human-readable `source` so downstream consumers can attribute correctly.

For projections through 2050, ClimaChain uses CMIP6 ensemble warming priors at
the country level. Replace with bespoke RCP scenarios when needed.

## License

Apache-2.0 (Neuravox Foundation, 2026).
