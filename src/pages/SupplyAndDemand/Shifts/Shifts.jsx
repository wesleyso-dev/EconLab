import { useState, useEffect } from "react";
import ShiftsForm from "../../../components/SupplyAndDemand/ShiftsForm";
import SubNavbar from "../../../components/SubNavbar/SubNavbar";
import Styles from "../../../components/Styles/Page.module.css";

const Shifts = () => {
  const [quantityEquilibrium, setQuantityEquilibrium] = useState("");
  const [priceEquilibrium, setPriceEquilibrium] = useState("");
  const [supplyShift, setSupplyShift] = useState("");
  const [demandShift, setDemandShift] = useState("");
  const [quantityChange, setQuantityChange] = useState("");
  const [priceChange, setPriceChange] = useState("");
  const [graph, setGraph] = useState("");

  const fetchData = async (data) => {
    setQuantityEquilibrium(data.quantityEquilibrium);
    setPriceEquilibrium(data.priceEquilibrium);
    setSupplyShift(data.supplyShift);
    setDemandShift(data.demandShift);
    setQuantityChange(data.quantityChange);
    setPriceChange(data.priceChange);
    setGraph(data.graph);
  };

  return (
    <>
      <SubNavbar
        path={"supply-and-demand"}
        links={["Price Controls", "Shifts"]}
      />
      <div className={Styles.pageContainer}>
        <ShiftsForm updateCallback={(data) => fetchData(data)} />
        {graph === "" ? (
          <></>
        ) : (
          <div className={Styles.outputContainer}>
            <img
              src={`data:image/png;base64,${graph}`}
              alt="Supply and Demand Shifts Graph."
              className={Styles.graph}
            />
            <div className={Styles.textOutput}>
              <h1>Market</h1>
              <h2>Qe: {quantityEquilibrium}</h2>
              <h2>Pe: {priceEquilibrium}</h2>
              <h2>Supply: {supplyShift}</h2>
              <h2>Demand: {demandShift}</h2>
              <h2>Quantity: {quantityChange}</h2>
              <h2>Price: {priceChange}</h2>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Shifts;
