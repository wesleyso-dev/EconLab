import { addLines, intersect, priceAt, toPoly, type Line, type Point } from '../core/line';
import { regionBetween, type Region } from '../core/region';
import { allFinite, fail, ok, type Result } from '../core/result';
import { solveMarket, type Market } from './market';

export type ExternalityKind = 'negative' | 'positive';

export interface ExternalityOutcome {
  readonly kind: ExternalityKind;
  /** Where private demand meets private supply. */
  readonly marketOutcome: Point;
  /** Where the social curve (MSC or MSB) meets the other private curve. */
  readonly socialOptimum: Point;
  /** MSC = supply + external cost, or MSB = demand + external benefit. */
  readonly socialCurve: Line;
  readonly deadweightLoss: Region;
  /** The Pigouvian tax (negative) or subsidy (positive) per unit that restores efficiency. */
  readonly correctiveAmount: number;
}

/**
 * A market with an external cost or benefit per unit, `marginalExternality(q)`.
 * The market over-produces with a negative externality and under-produces with a
 * positive one.
 */
export function solveExternality(
  market: Market,
  kind: ExternalityKind,
  marginalExternality: Line,
): Result<ExternalityOutcome> {
  const { intercept, slope } = marginalExternality;
  if (!allFinite(intercept, slope) || intercept < 0 || slope < 0) {
    return fail(
      'invalid-input',
      'The external cost or benefit must be zero or positive and not falling.',
    );
  }
  const base = solveMarket(market);
  if (!base.ok) return base;

  const marketOutcome = base.value.equilibrium;
  const { demand, supply } = market;
  const socialCurve = addLines(kind === 'negative' ? supply : demand, marginalExternality);
  const socialOptimum = intersect(socialCurve, kind === 'negative' ? demand : supply);
  if (!socialOptimum || socialOptimum.q <= 0) {
    return fail('no-trade', 'At the social optimum nothing would be produced.');
  }

  const deadweightLoss =
    kind === 'negative'
      ? regionBetween(toPoly(socialCurve), toPoly(demand), socialOptimum.q, marketOutcome.q)
      : regionBetween(toPoly(socialCurve), toPoly(supply), marketOutcome.q, socialOptimum.q);

  return ok({
    kind,
    marketOutcome,
    socialOptimum,
    socialCurve,
    deadweightLoss,
    correctiveAmount: priceAt(marginalExternality, socialOptimum.q),
  });
}
