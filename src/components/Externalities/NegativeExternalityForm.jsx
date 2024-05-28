import { useState } from "react";
import Styles from "../Styles/Form.module.css";

const NegativeExternalityForm = ({ updateCallback }) => {
  const [name, setName] = useState("Negative Externality");
  const [xLabel, setXLabel] = useState("Quantity");
  const [yLabel, setYLabel] = useState("Price");
  const [supplyX1, setSupplyX1] = useState(0);
  const [supplyY1, setSupplyY1] = useState(0);
  const [supplyX2, setSupplyX2] = useState(10);
  const [supplyY2, setSupplyY2] = useState(10);
  const [demandX1, setDemandX1] = useState(0);
  const [demandY1, setDemandY1] = useState(10);
  const [demandX2, setDemandX2] = useState(10);
  const [demandY2, setDemandY2] = useState(0);
  const [marginalSocialCostX1, setMarginalSocialCostX1] = useState(0);
  const [marginalSocialCostY1, setMarginalSocialCostY1] = useState(2);
  const [marginalSocialCostX2, setMarginalSocialCostX2] = useState(10);
  const [marginalSocialCostY2, setMarginalSocialCostY2] = useState(12);

  const onSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("xLabel", xLabel);
    formData.append("yLabel", yLabel);
    formData.append("supplyX1", supplyX1);
    formData.append("supplyY1", supplyY1);
    formData.append("supplyX2", supplyX2);
    formData.append("supplyY2", supplyY2);
    formData.append("demandX1", demandX1);
    formData.append("demandY1", demandY1);
    formData.append("demandX2", demandX2);
    formData.append("demandY2", demandY2);
    formData.append("marginalSocialCostX1", marginalSocialCostX1);
    formData.append("marginalSocialCostY1", marginalSocialCostY1);
    formData.append("marginalSocialCostX2", marginalSocialCostX2);
    formData.append("marginalSocialCostY2", marginalSocialCostY2);

    const url = "http://127.0.0.1:5000/api/externalities/negative_externality";
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
        <label htmlFor="supplyX1">X1:</label>
        <input
          type="text"
          id="supplyX1"
          value={supplyX1}
          onChange={(e) => setSupplyX1(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="supplyY1">Y1:</label>
        <input
          type="text"
          id="supplyY1"
          value={supplyY1}
          onChange={(e) => setSupplyY1(e.target.value)}
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

      {/* Demand */}
      <legend>Demand</legend>
      <div>
        <label htmlFor="demandX1">X1:</label>
        <input
          type="text"
          id="demandX1"
          value={demandX1}
          onChange={(e) => setDemandX1(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="demandY1">Y1:</label>
        <input
          type="text"
          id="demandY1"
          value={demandY1}
          onChange={(e) => setDemandY1(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="demandX2">X2:</label>
        <input
          type="text"
          id="demandX2"
          value={demandX2}
          onChange={(e) => setDemandX2(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="demandY2">Y2:</label>
        <input
          type="text"
          id="demandY2"
          value={demandY2}
          onChange={(e) => setDemandY2(e.target.value)}
        />
      </div>

      {/* Marginal Social Cost */}
      <legend>Marginal Social Cost</legend>
      <div>
        <label htmlFor="marginalSocialCostX1">X1:</label>
        <input
          type="text"
          id="marginalSocialCostX1"
          value={marginalSocialCostX1}
          onChange={(e) => setMarginalSocialCostX1(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="marginalSocialCostY1">Y1:</label>
        <input
          type="text"
          id="marginalSocialCostY1"
          value={marginalSocialCostY1}
          onChange={(e) => setMarginalSocialCostY1(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="marginalSocialCostX2">X2:</label>
        <input
          type="text"
          id="marginalSocialCostX2"
          value={marginalSocialCostX2}
          onChange={(e) => setMarginalSocialCostX2(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="marginalSocialCostY2">Y2:</label>
        <input
          type="text"
          id="marginalSocialCostY2"
          value={marginalSocialCostY2}
          onChange={(e) => setMarginalSocialCostY2(e.target.value)}
        />
      </div>

      <button type="submit">Generate</button>
    </form>
  );
};

export default NegativeExternalityForm;
