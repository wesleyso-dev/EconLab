import { useState, useEffect } from "react";
import BowedForm from "../../../components/PPF/BowedForm";
import Styles from "../../../components/Styles/Page.module.css";

const Bowed = () => {
  const [xLabel, setXLabel] = useState("");
  const [yLabel, setYLabel] = useState("");
  const [graph, setGraph] = useState("");

  const fetchData = async (data) => {
    setXLabel(data.xLabel);
    setYLabel(data.yLabel);
    setGraph(data.graph);
  };

  return (
    <>
      <div className={Styles.pageContainer}>
        <BowedForm updateCallback={(data) => fetchData(data)} />
        {graph === "" ? (
          <></>
        ) : (
          <div className={Styles.outputContainer}>
            <img
              src={`data:image/png;base64,${graph}`}
              alt="Bowed PPF Graph."
              className={Styles.graph}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Bowed;
