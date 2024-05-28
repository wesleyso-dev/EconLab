import { useState, useEffect } from "react";
import LinearForm from "../../../components/PPF/LinearForm";
import SubNavbar from "../../../components/SubNavbar/SubNavbar";
import Styles from "../../../components/Styles/Page.module.css";

const Linear = () => {
  const [xLabel, setXLabel] = useState("");
  const [yLabel, setYLabel] = useState("");
  const [goodXOpportunityCost, setGoodXOpportunityCost] = useState("");
  const [goodYOpportunityCost, setGoodYOpportunityCost] = useState("");
  const [graph, setGraph] = useState("");

  const fetchData = async (data) => {
    setXLabel(data.xLabel);
    setYLabel(data.yLabel);
    setGoodXOpportunityCost(data.goodXOpportunityCost);
    setGoodYOpportunityCost(data.goodYOpportunityCost);
    setGraph(data.graph);
  };

  return (
    <>
      <SubNavbar path={"ppf"} links={["Bowed", "Linear"]} />
      {graph === "" ? (
        <></>
      ) : (
        <div className={Styles.outputContainer}>
          <img
            src={`data:image/png;base64,${graph}`}
            alt="Linear PPF Graph."
            className={Styles.graph}
          />
          <div className={Styles.textOutputContainer}>
            <div className={Styles.textOutput}>
              <h1>{xLabel}</h1>
              <h2>Opportunity Cost: {goodXOpportunityCost}</h2>
            </div>
            <div className={Styles.textOutput}>
              <h1>{yLabel}</h1>
              <h2>Opportunity Cost: {goodYOpportunityCost}</h2>
            </div>
          </div>
        </div>
      )}
      <LinearForm updateCallback={(data) => fetchData(data)} />
    </>
  );
};

export default Linear;
