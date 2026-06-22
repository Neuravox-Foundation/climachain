import type { Facility } from "./types"

// MOCK pilot registry — 12 facilities across the two pilot LGAs (Yobe State).
// Schema is real; values are placeholders until the SPHCDA data-sharing agreement
// lands. Profiles are deliberately differentiated so the ICRI engine shows range:
//
//   Damaturu (YB-DAM) — state coordination / supervision case. Bias toward
//     intermittent grid power, mixed outreach, stressed-but-present cold-chain,
//     medium catchment. Skews "High", no "Severe".
//   Potiskum (YB-POT) — field disruption / outreach case. Bias toward road/access
//     vulnerability, outreach-heavy posts, weaker cold-chain, and (with the
//     flood-dominant hazard profile) a couple of "Severe" facilities.
//
// IDs follow YB-DAM-00n / YB-POT-00n.

export const PILOT_FACILITIES: Facility[] = [
  // ---- Damaturu (YB-DAM) — supervision / cold-chain verification case ----
  {
    id: "YB-DAM-001", name: "Damaturu Central PHC", lgaCode: "YB-DAM",
    lat: 11.7466, lon: 11.9608, type: "phc",
    powerSource: "grid_intermittent", coldChainEquip: "ilr", coldChainStatus: "intermittent",
    outreachReliance: "mixed", accessTier: "ok", under1Catchment: 1850,
  },
  {
    id: "YB-DAM-002", name: "Gabai Health Post", lgaCode: "YB-DAM",
    lat: 11.8123, lon: 12.0411, type: "outreach_post",
    powerSource: "generator", coldChainEquip: "gas_fridge", coldChainStatus: "intermittent",
    outreachReliance: "outreach_heavy", accessTier: "road_only", under1Catchment: 920,
  },
  {
    id: "YB-DAM-003", name: "Nayinawa Clinic", lgaCode: "YB-DAM",
    lat: 11.7012, lon: 11.9133, type: "clinic",
    powerSource: "solar", coldChainEquip: "sdd", coldChainStatus: "functional",
    outreachReliance: "fixed", accessTier: "ok", under1Catchment: 1320,
  },
  {
    id: "YB-DAM-004", name: "Pawari PHC", lgaCode: "YB-DAM",
    lat: 11.7689, lon: 11.8842, type: "phc",
    powerSource: "grid_intermittent", coldChainEquip: "ilr", coldChainStatus: "intermittent",
    outreachReliance: "mixed", accessTier: "road_only", under1Catchment: 1410,
  },
  {
    id: "YB-DAM-005", name: "Maisandari Outreach Post", lgaCode: "YB-DAM",
    lat: 11.7321, lon: 12.0102, type: "outreach_post",
    powerSource: "none", coldChainEquip: "gas_fridge", coldChainStatus: "unknown",
    outreachReliance: "outreach_heavy", accessTier: "checkpoint", under1Catchment: 760,
  },
  {
    id: "YB-DAM-006", name: "Damaturu General Hospital", lgaCode: "YB-DAM",
    lat: 11.7450, lon: 11.9667, type: "hospital",
    powerSource: "grid_reliable", coldChainEquip: "sdd", coldChainStatus: "functional",
    outreachReliance: "fixed", accessTier: "ok", under1Catchment: 2600,
  },

  // ---- Potiskum (YB-POT) — outreach rescheduling / pre-positioning case ----
  {
    id: "YB-POT-001", name: "Potiskum Central PHC", lgaCode: "YB-POT",
    lat: 11.7104, lon: 11.0792, type: "phc",
    powerSource: "grid_intermittent", coldChainEquip: "ilr", coldChainStatus: "functional",
    outreachReliance: "mixed", accessTier: "road_only", under1Catchment: 1980,
  },
  {
    id: "YB-POT-002", name: "Mamudo Health Post", lgaCode: "YB-POT",
    lat: 11.7522, lon: 11.1503, type: "outreach_post",
    powerSource: "none", coldChainEquip: "none", coldChainStatus: "non_functional",
    outreachReliance: "outreach_heavy", accessTier: "checkpoint", under1Catchment: 1040,
  },
  {
    id: "YB-POT-003", name: "Bukarti Clinic", lgaCode: "YB-POT",
    lat: 11.6688, lon: 11.0321, type: "clinic",
    powerSource: "solar", coldChainEquip: "sdd", coldChainStatus: "functional",
    outreachReliance: "fixed", accessTier: "road_only", under1Catchment: 1190,
  },
  {
    id: "YB-POT-004", name: "Dogo Nini PHC", lgaCode: "YB-POT",
    lat: 11.7345, lon: 11.1188, type: "phc",
    powerSource: "generator", coldChainEquip: "ilr", coldChainStatus: "intermittent",
    outreachReliance: "mixed", accessTier: "road_only", under1Catchment: 1530,
  },
  {
    id: "YB-POT-005", name: "Yerimaram Outreach Post", lgaCode: "YB-POT",
    lat: 11.6901, lon: 11.1402, type: "outreach_post",
    powerSource: "none", coldChainEquip: "none", coldChainStatus: "non_functional",
    outreachReliance: "outreach_heavy", accessTier: "severe", under1Catchment: 690,
  },
  {
    id: "YB-POT-006", name: "Potiskum Cottage Hospital", lgaCode: "YB-POT",
    lat: 11.7140, lon: 11.0705, type: "hospital",
    powerSource: "grid_reliable", coldChainEquip: "sdd", coldChainStatus: "functional",
    outreachReliance: "fixed", accessTier: "ok", under1Catchment: 2450,
  },
]

export function getFacility(id: string): Facility | undefined {
  return PILOT_FACILITIES.find((f) => f.id === id)
}

export function facilitiesByLga(lgaCode: string): Facility[] {
  return PILOT_FACILITIES.filter((f) => f.lgaCode === lgaCode)
}

// Largest catchment in the pilot set — used to normalize the stakes sub-score.
export const PILOT_MAX_CATCHMENT = Math.max(...PILOT_FACILITIES.map((f) => f.under1Catchment))
