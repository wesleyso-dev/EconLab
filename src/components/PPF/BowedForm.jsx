import { useState } from "react";
import Styles from "../Styles/Form.module.css";

const BowedForm = ({ updateCallback }) => {
  const [name, setName] = useState("Bowed PPF");
  const [xLabel, setXLabel] = useState("Good X");
  const [xInt, setXInt] = useState(10);
  const [yLabel, setYLabel] = useState("Good Y");
  const [yInt, setYInt] = useState(10);

  const onSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("xLabel", xLabel);
    formData.append("yLabel", yLabel);
    formData.append("xInt", xInt);
    formData.append("yInt", yInt);

    const url = "http://127.0.0.1:5000/api/ppf/bowed";
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
      {/* Labels */}
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

      {/* Intercepts */}
      <legend>Intercepts</legend>
      <div>
        <label htmlFor="xInt">xInt:</label>
        <input
          type="text"
          id="xInt"
          value={xInt}
          onChange={(e) => setXInt(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="yInt">yInt:</label>
        <input
          type="text"
          id="yInt"
          value={yInt}
          onChange={(e) => setYInt(e.target.value)}
        />
      </div>
      <button type="submit">Generate</button>
    </form>
  );
};

export default BowedForm;
