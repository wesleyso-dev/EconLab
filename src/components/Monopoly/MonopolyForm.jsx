import { useState } from "react";
import Styles from "../Styles/Form.module.css";

const MonopolyForm = ({ updateCallback }) => {
  const [name, setName] = useState("Monopoly");
  const [xLabel, setXLabel] = useState("Quantity");
  const [yLabel, setYLabel] = useState("Price");
  const [demandXIntercept, setDemandXIntercept] = useState(10);
  const [marginalRevenueXIntercept, setMarginalRevenueXIntercept] = useState(5);
  const [yIntercept, setYIntercept] = useState(10);
  const [averageTotalCostPrice, setAverageTotalCostPrice] = useState(5);

  const onSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("xLabel", xLabel);
    formData.append("yLabel", yLabel);
    formData.append("demandXIntercept", demandXIntercept);
    formData.append("marginalRevenueXIntercept", marginalRevenueXIntercept);
    formData.append("yIntercept", yIntercept);
    formData.append("averageTotalCostPrice", averageTotalCostPrice);

    const url = "https://smithenes.pythonanywhere.com/api/monopoly";
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
        <label htmlFor="yIntercept">y-intercept:</label>
        <input
          type="text"
          id="yIntercept"
          value={yIntercept}
          onChange={(e) => setYIntercept(e.target.value)}
        />
      </div>

      {/* Marginal Revenue */}
      <legend>Marginal Revenue</legend>
      <div>
        <label htmlFor="marginalRevenueXIntercept">x-intercept:</label>
        <input
          type="text"
          id="marginalRevenueXIntercept"
          value={marginalRevenueXIntercept}
          onChange={(e) => setMarginalRevenueXIntercept(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="yIntercept">y-intercept:</label>
        <input
          type="text"
          id="yIntercept"
          value={yIntercept}
          onChange={(e) => setYIntercept(e.target.value)}
        />
      </div>

      {/* Average Total Cost */}
      <legend>Average Total Cost</legend>
      <div>
        <label htmlFor="averageTotalCostPrice">ATC Price:</label>
        <input
          type="text"
          id="averageTotalCostPrice"
          value={averageTotalCostPrice}
          onChange={(e) => setAverageTotalCostPrice(e.target.value)}
        />
      </div>

      <button type="submit">Generate</button>
    </form>
  );
};

export default MonopolyForm;
