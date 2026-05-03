"use client"

import { useEffect, useReducer, useRef } from "react"
import {
  ClimateDataService,
  analyzeTemperatureData,
  type ClimateDataResponse,
  type TemperatureData,
  type RainfallData,
  type CO2Data,
  type NDVIResponse,
  type TemperatureAnalysis,
} from "@/lib/climate-api"

export interface ExtendedClimateData {
  temperature: {
    historical: ClimateDataResponse<TemperatureData> | null
    projection: ClimateDataResponse<TemperatureData> | null
    analysis: TemperatureAnalysis | null
  }
  rainfall: {
    historical: ClimateDataResponse<RainfallData> | null
    projection: ClimateDataResponse<RainfallData> | null
  }
  co2: ClimateDataResponse<CO2Data> | null
  ndvi: NDVIResponse | null
  loading: { temperature: boolean; rainfall: boolean; co2: boolean; ndvi: boolean }
  error: { temperature: string | null; rainfall: string | null; co2: string | null; ndvi: string | null }
}

const initialState: ExtendedClimateData = {
  temperature: { historical: null, projection: null, analysis: null },
  rainfall: { historical: null, projection: null },
  co2: null,
  ndvi: null,
  loading: { temperature: false, rainfall: false, co2: false, ndvi: false },
  error: { temperature: null, rainfall: null, co2: null, ndvi: null },
}

type Action =
  | { type: "RESET" }
  | { type: "SET_LOADING"; key: keyof ExtendedClimateData["loading"]; value: boolean }
  | { type: "SET_ERROR"; key: keyof ExtendedClimateData["error"]; value: string | null }
  | { type: "SET_TEMPERATURE"; payload: ExtendedClimateData["temperature"] }
  | { type: "SET_RAINFALL"; payload: ExtendedClimateData["rainfall"] }
  | { type: "SET_CO2"; payload: ExtendedClimateData["co2"] }
  | { type: "SET_NDVI"; payload: ExtendedClimateData["ndvi"] }

function reducer(state: ExtendedClimateData, action: Action): ExtendedClimateData {
  switch (action.type) {
    case "RESET":
      return initialState
    case "SET_LOADING":
      return { ...state, loading: { ...state.loading, [action.key]: action.value } }
    case "SET_ERROR":
      return { ...state, error: { ...state.error, [action.key]: action.value } }
    case "SET_TEMPERATURE":
      return { ...state, temperature: action.payload }
    case "SET_RAINFALL":
      return { ...state, rainfall: action.payload }
    case "SET_CO2":
      return { ...state, co2: action.payload }
    case "SET_NDVI":
      return { ...state, ndvi: action.payload }
    default:
      return state
  }
}

export function useExtendedClimateData(countryCode: string | null): ExtendedClimateData {
  const [state, dispatch] = useReducer(reducer, initialState)
  const reqIdRef = useRef(0)

  useEffect(() => {
    if (!countryCode) {
      dispatch({ type: "RESET" })
      return
    }

    const reqId = ++reqIdRef.current
    const safeDispatch = (action: Action) => {
      if (reqId === reqIdRef.current) dispatch(action)
    }

    safeDispatch({ type: "RESET" })

    void (async () => {
      // Temperature
      safeDispatch({ type: "SET_LOADING", key: "temperature", value: true })
      try {
        const [historical, projection] = await Promise.all([
          ClimateDataService.getTemperatureData(countryCode, "historical"),
          ClimateDataService.getTemperatureData(countryCode, "projection"),
        ])
        safeDispatch({
          type: "SET_TEMPERATURE",
          payload: {
            historical,
            projection,
            analysis: analyzeTemperatureData(historical.data),
          },
        })
      } catch (err) {
        safeDispatch({
          type: "SET_ERROR",
          key: "temperature",
          value: err instanceof Error ? err.message : "Temperature fetch failed",
        })
      } finally {
        safeDispatch({ type: "SET_LOADING", key: "temperature", value: false })
      }
    })()

    void (async () => {
      safeDispatch({ type: "SET_LOADING", key: "rainfall", value: true })
      try {
        const [historical, projection] = await Promise.all([
          ClimateDataService.getRainfallData(countryCode, "historical"),
          ClimateDataService.getRainfallData(countryCode, "projection"),
        ])
        safeDispatch({ type: "SET_RAINFALL", payload: { historical, projection } })
      } catch (err) {
        safeDispatch({
          type: "SET_ERROR",
          key: "rainfall",
          value: err instanceof Error ? err.message : "Rainfall fetch failed",
        })
      } finally {
        safeDispatch({ type: "SET_LOADING", key: "rainfall", value: false })
      }
    })()

    void (async () => {
      safeDispatch({ type: "SET_LOADING", key: "co2", value: true })
      try {
        const co2 = await ClimateDataService.getCO2Data(countryCode)
        safeDispatch({ type: "SET_CO2", payload: co2 })
      } catch (err) {
        safeDispatch({
          type: "SET_ERROR",
          key: "co2",
          value: err instanceof Error ? err.message : "CO₂ fetch failed",
        })
      } finally {
        safeDispatch({ type: "SET_LOADING", key: "co2", value: false })
      }
    })()

    void (async () => {
      safeDispatch({ type: "SET_LOADING", key: "ndvi", value: true })
      try {
        const ndvi = await ClimateDataService.getNDVIData(countryCode)
        safeDispatch({ type: "SET_NDVI", payload: ndvi })
      } catch (err) {
        safeDispatch({
          type: "SET_ERROR",
          key: "ndvi",
          value: err instanceof Error ? err.message : "NDVI fetch failed",
        })
      } finally {
        safeDispatch({ type: "SET_LOADING", key: "ndvi", value: false })
      }
    })()
  }, [countryCode])

  return state
}
