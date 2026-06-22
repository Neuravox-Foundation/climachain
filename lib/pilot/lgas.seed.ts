import type { Lga } from "./types"

export const PILOT_STATE = "Yobe"

export const PILOT_LGAS: Lga[] = [
  { code: "YB-DAM", name: "Damaturu", state: "Yobe" },
  { code: "YB-POT", name: "Potiskum", state: "Yobe" },
]

export function getLga(code: string): Lga | undefined {
  return PILOT_LGAS.find((l) => l.code === code)
}
