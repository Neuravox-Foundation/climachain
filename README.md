# ClimaChain

Climate intelligence dashboard for African nations - temperature, precipitation,
CO₂ emissions and vegetation (NDVI) signals paired with policy briefs that are
**computed deterministically from the loaded data**, then optionally refined by
DeepSeek for tone.

A [Neuravox Foundation](https://github.com/Neuravox-Foundation) platform.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Hosting**: Cloudflare Workers via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) - single-Worker bundle with `nodejs_compat`
- **UI**: Tailwind v4, Radix primitives, shadcn-style components
- **Typography**: Manrope (display) · Inter (body) · Space Grotesk (numeric)
- **Charts**: Recharts
- **AI**: DeepSeek via the [Vercel AI SDK](https://sdk.vercel.ai/) (OpenAI-compatible endpoint at `https://api.deepseek.com/v1`)
- **Data**: World Bank Indicators API (live), deterministically reconstructed
  from CCKP / CMIP6 baselines when the live source is unavailable. NDVI uses
  regional vegetation baselines and is ready for Copernicus DataSpace integration.

## Getting started

```bash
npm install
cp .dev.vars.example .dev.vars   # optional: add DEEPSEEK_API_KEY
npm run dev
```

Visit <http://localhost:3000>.

The AI briefs work **without a key** - the route synthesises a 4-5 sentence
data-grounded policy memo from the loaded series. Adding a `DEEPSEEK_API_KEY`
only enables a DeepSeek pass to tighten the prose. Get a key at
<https://platform.deepseek.com>.

## Deploying to Cloudflare

```bash
# build the Worker bundle
npm run preview          # builds + runs locally on Wrangler
# or
npm run deploy           # builds + deploys to Cloudflare
```

For repo-driven deploys via the Cloudflare dashboard:

- **Framework preset**: Next.js
- **Build command**: `npx opennextjs-cloudflare build`
- **Output directory**: `.open-next`
- **Compatibility flags**: `nodejs_compat`
- **Secrets**: `npx wrangler secret put DEEPSEEK_API_KEY` (optional)

## Design system

Implements the **Institutional Authority** design system: light-first canvas
(`#f8f9ff`), institutional navy primary (`#00236f`), action blue secondary
(`#0058be`) and heritage teal tertiary (`#00312c`). Sectioning uses
surface-container tonal layering, not 1px borders. No glassmorphism, no glow
effects. See `app/globals.css` for the full token system.

## Project layout

```
app/
  api/
    ai/insights/      Policy brief synthesis + DeepSeek refinement
    climate/
      temperature/    Annual temperature series
      rainfall/       Annual precipitation series
      co2/            CO₂ emissions (kt)
      ndvi/           Vegetation health
  layout.tsx          Root layout, fonts + theme provider
  page.tsx            Dashboard shell
components/           UI components (shadcn-style)
hooks/                React hooks
lib/
  climate-api.ts      Shared data layer (used by routes + client)
  countries.ts        Country list + climatological baselines
  insight-synthesis.ts  Deterministic policy-brief generator
  utils.ts            cn() helper
```

## Data quality

The World Bank does not currently expose annual surface-temperature observations
through its public REST API. ClimaChain reconstructs an internally consistent
temperature record by anchoring each country to its long-term mean (CCKP normal,
1991-2020) and modulating with anchor years from the agricultural-land
indicator. Every series carries a `quality` field (`live` | `estimated` |
`unavailable`) and a human-readable `source` so downstream consumers can
attribute correctly.

For projections through 2050, ClimaChain uses CMIP6 ensemble warming priors at
the country level. Replace with bespoke RCP scenarios when needed.

## License

Apache-2.0 (Neuravox Foundation, 2026).
