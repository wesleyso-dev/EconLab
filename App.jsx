import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./src/components/Navbar/Navbar";
import Home from "./src/pages/Home/Home";
// PPF
import Bowed from "./src/pages/PPF/Bowed/Bowed";
import Linear from "./src/pages/PPF/Linear/Linear";
// Supply & Demand
import PriceControls from "./src/pages/SupplyAndDemand/PriceControls/PriceControls";
import Shifts from "./src/pages/SupplyAndDemand/Shifts/Shifts";
// Perfect Competition
import PerfectCompetition from "./src/pages/PerfectCompetition/PerfectCompetition";
// Monopoly
import Monopoly from "./src/pages/Monopoly/Monopoly";
// Factor Markets
import PerfectlyCompetitiveFactorMarkets from "./src/pages/FactorMarkets/PerfectCompetition/PerfectCompetition";
import Monopsony from "./src/pages/FactorMarkets/Monopsony/Monopsony";
// Externalities
import NegativeExternality from "./src/pages/Externalities/NegativeExternality/NegativeExternality";
import PositiveExternality from "./src/pages/Externalities/PositiveExternality/PositiveExternality";
// Extra
import Footer from "./src/components/Footer/Footer";
import NoPage from "./src/pages/NoPage/NoPage";

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
          <Footer />
        </div>
      </Router>
    </>
  );
}

export default App;
