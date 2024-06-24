import { useState, useEffect } from "react";
import PriceControlsForm from "../../../components/SupplyAndDemand/PriceControlsForm";
import SubNavbar from "../../../components/SubNavbar/SubNavbar";
import Styles from "../../../components/Styles/Page.module.css";

const PriceControls = () => {
  const [quantityEquilibrium, setQuantityEquilibrium] = useState("");
  const [priceEquilibrium, setPriceEquilibrium] = useState("");
  const [type, setType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [graph, setGraph] = useState("");

  const fetchData = async (data) => {
    setQuantityEquilibrium(data.quantityEquilibrium);
    setPriceEquilibrium(data.priceEquilibrium);
    setType(data.type);
    setQuantity(data.quantity);
    setGraph(data.graph);
  };

  return (
    <>
      <SubNavbar
        path={"supply-and-demand"}
        links={["Price Controls", "Shifts"]}
      />
      <div className={Styles.pageContainer}>
        <PriceControlsForm updateCallback={(data) => fetchData(data)} />
        {graph === "" ? (
          <></>
        ) : (
          <div className={Styles.outputContainer}>
            <img
              src={`data:image/png;base64,${graph}`}
              alt="Price Controls Graph."
              className={Styles.graph}
            />
            <div className={Styles.textOutput}>
              <h1>Market</h1>
              <h2>Qe: {quantityEquilibrium}</h2>
              <h2>Pe: {priceEquilibrium}</h2>
              <h2>Type: {type}</h2>
              <h2>Quantity: {quantity}</h2>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PriceControls;
