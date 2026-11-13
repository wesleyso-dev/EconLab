import { useUrlState } from '../../app/useUrlState';
import type { CostFunction } from '../../econ/models/cost';
import { DEFAULT_COST } from './cost';

/** URL keys for TC = F + aQ + bQ² + cQ³. */
export const COST_DEFAULTS = {
  cf: DEFAULT_COST.fixed,
  ca: DEFAULT_COST.linear,
  cb: DEFAULT_COST.quadratic,
  cc: DEFAULT_COST.cubic,
};

type CostKeys = typeof COST_DEFAULTS;

export function costFromState(state: CostKeys): CostFunction {
  return { fixed: state.cf, linear: state.ca, quadratic: state.cb, cubic: state.cc };
}

export function costToState(cost: CostFunction): CostKeys {
  return { cf: cost.fixed, ca: cost.linear, cb: cost.quadratic, cc: cost.cubic };
}

/** A firm's cost function, kept in the URL so the configuration can be shared. */
export function useCost(): [CostFunction, (cost: CostFunction) => void] {
  const [state, update] = useUrlState(COST_DEFAULTS);
  return [costFromState(state), (cost) => update(costToState(cost))];
}
