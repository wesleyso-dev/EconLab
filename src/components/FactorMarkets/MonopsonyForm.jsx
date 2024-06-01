import { useState } from "react";
import Styles from "../Styles/Form.module.css";

const MonopsonyForm = ({ updateCallback }) => {
  const [name, setName] = useState("Monopsony");
  const [xLabel, setXLabel] = useState("Quantity");
  const [yLabel, setYLabel] = useState("Price");
  const [yIntercept, setYIntercept] = useState(2);
  const [supplyX2, setSupplyX2] = useState(10);
  const [supplyY2, setSupplyY2] = useState(8);
  const [marginalResourceCostX2, setMarginalResourceCostX2] = useState(6);
  const [marginalResourceCostY2, setMarginalResourceCostY2] = useState(10);
  const [demandXIntercept, setDemandXIntercept] = useState(10);
  const [demandYIntercept, setDemandYIntercept] = useState(10);

  const onSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("xLabel", xLabel);
    formData.append("yLabel", yLabel);
    formData.append("yIntercept", yIntercept);
    formData.append("supplyX2", supplyX2);
    formData.append("supplyY2", supplyY2);
    formData.append("marginalResourceCostX2", marginalResourceCostX2);
    formData.append("marginalResourceCostY2", marginalResourceCostY2);
    formData.append("demandXIntercept", demandXIntercept);
    formData.append("demandYIntercept", demandYIntercept);

    const url =
      "http://smithenes.pythonanywhere.com/api/factor_markets/monopsony";
    const options = {
      method: "POST",
      body: formData,
    };
    const response = await fetch(url, options);
    const data = await response.json();
    updateCallback(data);
  };

  return (
    <form onSubmit={onSubmit} className={Styles.formContainer}>
      {/* Label */}
      <legend>Labels</legend>
      <div>
        <label htmlFor="xLabel">xLabel:</label>
        <input
          type="text"
          id="xLabel"
          value={xLabel}
          onChange={(e) => setXLabel(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="yLabel">yLabel:</label>
        <input
          type="text"
          id="yLabel"
          value={yLabel}
          onChange={(e) => setYLabel(e.target.value)}
        />
      </div>

      {/* Supply */}
      <legend>Supply</legend>
      <div>
        <label htmlFor="yIntercept">y-intercept:</label>
        <input
          type="text"
          id="yIntercept"
          value={yIntercept}
          onChange={(e) => setYIntercept(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="supplyX2">X2:</label>
        <input
          type="text"
          id="supplyX2"
          value={supplyX2}
          onChange={(e) => setSupplyX2(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="supplyY2">Y2:</label>
        <input
          type="text"
          id="supplyY2"
          value={supplyY2}
          onChange={(e) => setSupplyY2(e.target.value)}
        />
      </div>

      {/* Marginal Revenue */}
      <legend>Marginal Revenue Cost</legend>
      <div>
        <label htmlFor="yIntercept">y-intercept:</label>
        <input
          type="text"
          id="yIntercept"
          value={yIntercept}
          onChange={(e) => yIntercept(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="marginalResourceCostX2">X2:</label>
        <input
          type="text"
          id="marginalResourceCostX2"
          value={marginalResourceCostX2}
          onChange={(e) => setMarginalResourceCostX2(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="marginalResourceCostY2">Y2:</label>
        <input
          type="text"
          id="marginalResourceCostY2"
          value={marginalResourceCostY2}
          onChange={(e) => setMarginalResourceCostY2(e.target.value)}
        />
      </div>

      {/* Demand */}
      <legend>Demand</legend>
      <div>
        <label htmlFor="demandXIntercept">x-intercept:</label>
        <input
          type="text"
          id="demandXIntercept"
          value={demandXIntercept}
          onChange={(e) => setDemandXIntercept(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="demandYIntercept">y-intercept:</label>
        <input
          type="text"
          id="demandYIntercept"
          value={demandYIntercept}
          onChange={(e) => setDemandYIntercept(e.target.value)}
        />
      </div>

      <button type="submit">Generate</button>
    </form>
  );
};

export default MonopsonyForm;
