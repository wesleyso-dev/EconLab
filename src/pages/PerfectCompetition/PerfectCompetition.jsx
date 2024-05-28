import { useState, useEffect } from "react";
import PerfectCompetitionForm from "../../components/PerfectCompetition/PerfectCompetitionForm";
import SubNavbar from "../../components/SubNavbar/SubNavbar";
import Styles from "../../components/Styles/Page.module.css";

const PerfectCompetition = () => {
  const [quantityEquilibrium, setQuantityEquilibrium] = useState("");
  const [priceEquilibrium, setPriceEquilibrium] = useState("");
  const [supplyShift, setSupplyShift] = useState("");
  const [demandShift, setDemandShift] = useState("");
  const [quantityChange, setQuantityChange] = useState("");
  const [priceChange, setPriceChange] = useState("");
  const [profit, setProfit] = useState("");
  const [amount, setAmount] = useState("");
  const [graph, setGraph] = useState("");

  const fetchData = async (data) => {
    setQuantityEquilibrium(data.quantityEquilibrium);
    setPriceEquilibrium(data.priceEquilibrium);
    setSupplyShift(data.supplyShift);
    setDemandShift(data.demandShift);
    setQuantityChange(data.quantityChange);
    setPriceChange(data.priceChange);
    setProfit(data.profit);
    setAmount(data.amount);
    setGraph(data.graph);
  };

  return (
    <>
      <SubNavbar links={["Perfect Competition"]} />
      {graph === "" ? (
        <></>
      ) : (
        <div className={Styles.outputContainer}>
          <img
            src={`data:image/png;base64,${graph}`}
            alt="Perfect Competition Graph."
            className={Styles.graph}
          />
          <div className={Styles.textOutputContainer}>
            <div className={Styles.textOutput}>
              <h1>Market</h1>
              <h2>Qe: {quantityEquilibrium}</h2>
              <h2>Pe: {priceEquilibrium}</h2>
              <h2>Supply: {supplyShift}</h2>
              <h2>Demand: {demandShift}</h2>
              <h2>Quantity: {quantityChange}</h2>
              <h2>Price: {priceChange}</h2>
            </div>
            <div className={Styles.textOutput}>
              <h1>Firm</h1>
              <h2>Profit: {profit}</h2>
              <h2>Amount: {amount}</h2>
            </div>
          </div>
        </div>
      )}
      <PerfectCompetitionForm updateCallback={(data) => fetchData(data)} />
    </>
  );
};

export default PerfectCompetition;
