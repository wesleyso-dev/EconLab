import { useState, useEffect } from "react";
import MonopolyForm from "../../components/Monopoly/MonopolyForm";
import SubNavbar from "../../components/SubNavbar/SubNavbar";
import Styles from "../../components/Styles/Page.module.css";

const Monopoly = () => {
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [elasticRegion, setElasticRegion] = useState("");
  const [unitElasticPoint, setUnitElasticPoint] = useState("");
  const [inelasticRegion, setInelasticRegion] = useState("");
  const [profit, setProfit] = useState("");
  const [amount, setAmount] = useState("");
  const [graph, setGraph] = useState("");

  const fetchData = async (data) => {
    setQuantity(data.quantity);
    setPrice(data.price);
    setElasticRegion(data.elasticRegion);
    setUnitElasticPoint(data.unitElasticPoint);
    setInelasticRegion(data.inelasticRegion);
    setProfit(data.profit);
    setAmount(data.amount);
    setGraph(data.graph);
  };

  return (
    <>
      <SubNavbar links={["Monopoly"]} />
      <div className={Styles.pageContainer}>
        <MonopolyForm updateCallback={(data) => fetchData(data)} />
        {graph === "" ? (
          <></>
        ) : (
          <div className={Styles.outputContainer}>
            <img
              src={`data:image/png;base64,${graph}`}
              alt="Monopoly Graph."
              className={Styles.graph}
            />
            <div className={Styles.textOutputContainer}>
              <div className={Styles.textOutput}>
                <h1>Market/Firm</h1>
                <h2>Quantity: {quantity}</h2>
                <h2>Price: {price}</h2>
                <h2>Elastic Region: {elasticRegion}</h2>
                <h2>Unit Elastic Point: {unitElasticPoint}</h2>
                <h2>Inelastic Region: {inelasticRegion}</h2>
                <h2>Profit: {profit}</h2>
                <h2>Amount: {amount}</h2>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Monopoly;
