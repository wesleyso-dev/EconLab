import { useState } from "react";
import Styles from "../Styles/Form.module.css";

const ShiftsForm = ({ updateCallback }) => {
  const [name, setName] = useState("Shifts in Supply and Demand");
  const [xLabel, setXLabel] = useState("Quantity");
  const [yLabel, setYLabel] = useState("Price");
  const [supplyX1, setSupplyX1] = useState(0);
  const [supplyY1, setSupplyY1] = useState(0);
  const [supplyX2, setSupplyX2] = useState(10);
  const [supplyY2, setSupplyY2] = useState(10);
  const [supplyShifter, setSupplyShifter] = useState("None");
  const [demandX1, setDemandX1] = useState(0);
  const [demandY1, setDemandY1] = useState(10);
  const [demandX2, setDemandX2] = useState(10);
  const [demandY2, setDemandY2] = useState(0);
  const [demandShifter, setDemandShifter] = useState("None");

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
    formData.append("supplyShifter", supplyShifter);
    formData.append("demandX1", demandX1);
    formData.append("demandY1", demandY1);
    formData.append("demandX2", demandX2);
    formData.append("demandY2", demandY2);
    formData.append("demandShifter", demandShifter);

    const url = "http://10.0.2.15:80/api/supply_and_demand/shifts";
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
      <div>
        <label htmlFor="supplyShifter">Supply Shifter:</label>
        <select
          id="supplyShifter"
          name="supplyShifter"
          onChange={(e) => setSupplyShifter(e.target.value)}
        >
          <option value="none">None</option>
          <option value="increasedPricesOfResourcesOrInputs">
            Increased Prices of Resources or Inputs
          </option>
          <option value="taxes">Taxes</option>
          <option value="decreasedCompetition">Decreased Competition</option>
          <option value="decreasedPricesOfResourcesOrInputs">
            Decreased Prices of Resources or Inputs
          </option>
          <option value="subsidies">Subsidies</option>
          <option value="increasedCompetition">Increased Competition</option>
        </select>
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
      <div>
        <label htmlFor="demandShifter">Demand Shifter:</label>
        <select
          id="demandShifter"
          name="demandShifter"
          onChange={(e) => setDemandShifter(e.target.value)}
        >
          <option value="none">None</option>
          <option value="decreasedMarketSize">Decreased Market Size</option>
          <option value="decreasedPriceOfASubstitute">
            Decreased Price of a Substitute
          </option>
          <option value="increasedPriceOfAComplement">
            Increased Price of a Complement
          </option>
          <option value="increasedMarketSize">Increased Market Size</option>
          <option value="increasedPriceOfASubstitute">
            Increased Price of a Substitute
          </option>
          <option value="decreasedPriceOfAComplement">
            Decreased Price of a Complement
          </option>
        </select>
      </div>
      <button type="submit">Generate</button>
    </form>
  );
};

export default ShiftsForm;
