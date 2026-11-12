import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
// PPF
import Bowed from "./pages/PPF/Bowed/Bowed";
import Linear from "./pages/PPF/Linear/Linear";
// Supply & Demand
import PriceControls from "./pages/SupplyAndDemand/PriceControls/PriceControls";
import Shifts from "./pages/SupplyAndDemand/Shifts/Shifts";
// Perfect Competition
import PerfectCompetition from "./pages/PerfectCompetition/PerfectCompetition";
// Monopoly
import Monopoly from "./pages/Monopoly/Monopoly";
// Factor Markets
import PerfectlyCompetitiveFactorMarkets from "./pages/FactorMarkets/PerfectCompetition/PerfectCompetition";
import Monopsony from "./pages/FactorMarkets/Monopsony/Monopsony";
// Externalities
import NegativeExternality from "./pages/Externalities/NegativeExternality/NegativeExternality";
import PositiveExternality from "./pages/Externalities/PositiveExternality/PositiveExternality";
// Extra
import NoPage from "./pages/NoPage/NoPage";

function App() {
  return (
    <>
      <Router>
        <div className="container">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/ppf/bowed" element={<Bowed />} />
            <Route path="/ppf/linear" element={<Linear />} />
            <Route
              path="/supply-and-demand/price-controls"
              element={<PriceControls />}
            />
            <Route path="/supply-and-demand/shifts" element={<Shifts />} />
            <Route
              path="/perfect-competition"
              element={<PerfectCompetition />}
            />
            <Route path="/monopoly" element={<Monopoly />} />
            <Route
              path="/factor-markets/perfect-competition"
              element={<PerfectlyCompetitiveFactorMarkets />}
            />
            <Route path="/factor-markets/monopsony" element={<Monopsony />} />
            <Route
              path="/externalities/negative-externality"
              element={<NegativeExternality />}
            />
            <Route
              path="/externalities/positive-externality"
              element={<PositiveExternality />}
            />
            <Route path="*" element={<NoPage />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
