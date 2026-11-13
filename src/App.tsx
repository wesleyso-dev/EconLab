import type { ReactElement } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './app/AppShell';
import { TOPICS } from './app/topics';
import NegativeExternality from './pages/Externalities/NegativeExternality/NegativeExternality';
import PositiveExternality from './pages/Externalities/PositiveExternality/PositiveExternality';
import Monopsony from './pages/FactorMarkets/Monopsony/Monopsony';
import CompetitiveFactorMarket from './pages/FactorMarkets/PerfectCompetition/PerfectCompetition';
import Home from './pages/Home/Home';
import Monopoly from './pages/Monopoly/Monopoly';
import NoPage from './pages/NoPage/NoPage';
import PerfectCompetition from './pages/PerfectCompetition/PerfectCompetition';
import Bowed from './pages/PPF/Bowed/Bowed';
import Linear from './pages/PPF/Linear/Linear';
import PriceControls from './pages/SupplyAndDemand/PriceControls/PriceControls';
import Shifts from './pages/SupplyAndDemand/Shifts/Shifts';
import Subsidy from './pages/SupplyAndDemand/Subsidy/Subsidy';
import Tax from './pages/SupplyAndDemand/Tax/Tax';

/** The component for each model page listed in TOPICS. */
const PAGES: Record<string, ReactElement> = {
  '/supply-and-demand/shifts': <Shifts />,
  '/supply-and-demand/tax': <Tax />,
  '/supply-and-demand/subsidy': <Subsidy />,
  '/supply-and-demand/price-controls': <PriceControls />,
  '/perfect-competition': <PerfectCompetition />,
  '/monopoly': <Monopoly />,
  '/factor-markets/perfect-competition': <CompetitiveFactorMarket />,
  '/factor-markets/monopsony': <Monopsony />,
  '/externalities/negative-externality': <NegativeExternality />,
  '/externalities/positive-externality': <PositiveExternality />,
  '/ppf/bowed': <Bowed />,
  '/ppf/linear': <Linear />,
};

export function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        {TOPICS.flatMap((topic) => [
          ...topic.pages.map((page) => (
            <Route key={page.path} path={page.path} element={PAGES[page.path]} />
          )),
          // A topic's own path (e.g. /ppf) opens its first model.
          topic.pages.length > 1 && topic.pages[0] ? (
            <Route
              key={topic.id}
              path={`/${topic.id}`}
              element={<Navigate to={topic.pages[0].path} replace />}
            />
          ) : null,
        ])}
        <Route path="*" element={<NoPage />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
