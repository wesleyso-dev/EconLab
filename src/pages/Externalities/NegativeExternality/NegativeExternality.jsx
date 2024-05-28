import { useState, useEffect } from "react";
import NegativeExternalityForm from "../../../components/Externalities/NegativeExternalityForm";
import SubNavbar from "../../../components/SubNavbar/SubNavbar";
import Styles from "../../../components/Styles/Page.module.css";

const NegativeExternality = () => {
  const [quantityFreeMarket, setQuantityFreeMarket] = useState("");
  const [priceFreeMarket, setPriceFreeMarket] = useState("");
  const [quantitySociallyOptimal, setQuantitySociallyOptimal] = useState("");
  const [priceSociallyOptimal, setPriceSociallyOptimal] = useState("");
  const [deadweightLoss, setDeadweightLoss] = useState("");
  const [graph, setGraph] = useState("");

  const fetchData = async (data) => {
    setQuantityFreeMarket(data.quantityFreeMarket);
    setPriceFreeMarket(data.priceFreeMarket);
    setQuantitySociallyOptimal(data.quantitySociallyOptimal);
    setPriceSociallyOptimal(data.priceSociallyOptimal);
    setDeadweightLoss(data.deadweightLoss);
    setGraph(data.graph);
  };

  return (
    <>
      <SubNavbar
        path={"externalities"}
        links={["Negative Externality", "Positive Externality"]}
      />
      {graph === "" ? (
        <></>
      ) : (
        <div className={Styles.outputContainer}>
          <img
            src={`data:image/png;base64,${graph}`}
            alt="Negative Externality Graph."
            className={Styles.graph}
          />
          <div className={Styles.textOutputContainer}>
            <div className={Styles.textOutput}>
              <h1>Market/Firm</h1>
              <h2>Qfm: {quantityFreeMarket}</h2>
              <h2>Pfm: {priceFreeMarket}</h2>
              <h2>Qso: {quantitySociallyOptimal}</h2>
              <h2>Pso: {priceSociallyOptimal}</h2>
              <h2>Deadweight Loss: {deadweightLoss}</h2>
            </div>
          </div>
        </div>
      )}
      <NegativeExternalityForm updateCallback={(data) => fetchData(data)} />
    </>
  );
};

export default NegativeExternality;
