import Styles from "./Home.module.css";
import Background from "../../assets/background.png";

import Display1 from "../../assets/display1.png";
import Display2 from "../../assets/display2.png";
import Display3 from "../../assets/display3.png";
import Display4 from "../../assets/display4.png";

const Home = () => {
  return (
    <div
      className={Styles.mainPage}
      style={{
        backgroundImage: `url(${Background})`,
      }}
    >
      <h1>
        AP Microeconomics
        <br />
        Graphing Calculator
        <br />
      </h1>

      <div className={Styles.graphsContainer}>
        <h2>Example Graphs</h2>
        <div className={Styles.graphs}>
          <div className={Styles.graph}>
            <img src={Display1} />
            <h3>PPF Curve</h3>
          </div>
          <div className={Styles.graph}>
            <img src={Display2} />
            <h3>Shifts in Supply & Demand</h3>
          </div>
          <div className={Styles.graph}>
            <img src={Display3} />
            <h3>Monopsony</h3>
          </div>
          <div className={Styles.graph}>
            <img src={Display4} />
            <h3>Externalities</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
