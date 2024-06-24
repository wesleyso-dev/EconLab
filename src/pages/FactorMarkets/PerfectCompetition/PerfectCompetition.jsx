import { useState, useEffect } from "react";
import PerfectCompetitionForm from "../../../components/FactorMarkets/PerfectCompetitionForm";
import SubNavbar from "../../../components/SubNavbar/SubNavbar";
import Styles from "../../../components/Styles/Page.module.css";

const PerfectCompetition = () => {
  const [quantityEquilibrium, setQuantityEquilibrium] = useState("");
  const [wageEquilibrium, setWageEquilibrium] = useState("");
  const [supplyShift, setSupplyShift] = useState("");
  const [demandShift, setDemandShift] = useState("");
  const [quantityChange, setQuantityChange] = useState("");
  const [wageChange, setWageChange] = useState("");
  const [graph, setGraph] = useState("");

  const fetchData = async (data) => {
    setQuantityEquilibrium(data.quantityEquilibrium);
    setWageEquilibrium(data.wageEquilibrium);
    setSupplyShift(data.supplyShift);
    setDemandShift(data.demandShift);
    setQuantityChange(data.quantityChange);
    setWageChange(data.wageChange);
    setGraph(data.graph);
  };

  return (
    <>
      <SubNavbar
        path={"factor-markets"}
        links={["Perfect Competition", "Monopsony"]}
      />
      <div className={Styles.pageContainer}>
        <PerfectCompetitionForm updateCallback={(data) => fetchData(data)} />
        {graph === "" ? (
          <></>
        ) : (
          <div className={Styles.outputContainer}>
            <img
              src={`data:image/png;base64,${graph}`}
              alt="Perfectly Competitive Factor Market Graph."
              className={Styles.graph}
            />
            <div className={Styles.textOutputContainer}>
              <div className={Styles.textOutput}>
                <h1>Market</h1>
                <h2>Qe: {quantityEquilibrium}</h2>
                <h2>We: {wageEquilibrium}</h2>
                <h2>Supply: {supplyShift}</h2>
                <h2>Demand: {demandShift}</h2>
                <h2>Quantity: {quantityChange}</h2>
                <h2>Wage: {wageChange}</h2>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PerfectCompetition;
