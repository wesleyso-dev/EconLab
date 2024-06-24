import { useState, useEffect } from "react";
import MonopsonyForm from "../../../components/FactorMarkets/MonopsonyForm";
import SubNavbar from "../../../components/SubNavbar/SubNavbar";
import Styles from "../../../components/Styles/Page.module.css";

const Monopsony = () => {
  const [quantity, setQuantity] = useState("");
  const [wage, setWage] = useState("");
  const [deadweightLoss, setDeadweightLoss] = useState("");
  const [graph, setGraph] = useState("");

  const fetchData = async (data) => {
    setQuantity(data.quantity);
    setWage(data.wage);
    setDeadweightLoss(data.deadweightLoss);
    setGraph(data.graph);
  };

  return (
    <>
      <SubNavbar
        path={"factor-markets"}
        links={["Perfect Competition", "Monopsony"]}
      />
      <div className={Styles.pageContainer}>
        <MonopsonyForm updateCallback={(data) => fetchData(data)} />
        {graph === "" ? (
          <></>
        ) : (
          <div className={Styles.outputContainer}>
            <img
              src={`data:image/png;base64,${graph}`}
              alt="Monopsony Graph."
              className={Styles.graph}
            />
            <div className={Styles.textOutputContainer}>
              <div className={Styles.textOutput}>
                <h1>Market/Firm</h1>
                <h2>Quantity: {quantity}</h2>
                <h2>Wage: {wage}</h2>
                <h2>Deadweight Loss: {deadweightLoss}</h2>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Monopsony;
