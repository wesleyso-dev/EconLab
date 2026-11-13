import { createContext, useContext } from 'react';
import type { AreaTone } from '../graph';

/** One measure of the current scenario, e.g. "Deadweight loss" = 1.11. */
export interface ScenarioRow {
  readonly label: string;
  readonly value: number | null;
  readonly tone?: AreaTone;
}

/** Result tables report their current values here so the page can compare scenarios. */
export const ScenarioContext = createContext<
  (id: string, rows: readonly ScenarioRow[] | null) => void
>(() => {});

export function useScenarioRegistry() {
  return useContext(ScenarioContext);
}
