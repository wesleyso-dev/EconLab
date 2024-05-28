import NavbarLogo from "../../assets/navbar-logo.png";
import Styles from "./Navbar.module.css";
import { NavLink, Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className={Styles.navbar}>
      <Link to="/home">
        <img src={NavbarLogo} alt="Navbar logo." />
      </Link>
      <ul>
        <li>
          <NavLink to="/ppf/bowed">PPF</NavLink>
        </li>
        <li>
          <NavLink to="/supply-and-demand/price-controls">
            Supply & Demand
          </NavLink>
        </li>
        <li>
          <NavLink to="/perfect-competition">Perfect Competition</NavLink>
        </li>
        <li>
          <NavLink to="/monopoly">Monopoly</NavLink>
        </li>
        <li>
          <NavLink to="/factor-markets/perfect-competition">
            Factor Markets
          </NavLink>
        </li>
        <li>
          <NavLink to="/externalities/negative-externality">
            Externalities
          </NavLink>
        </li>
        {/* <li>
          <NavLink to="/lorenz-curve">Lorenz Curve</NavLink>
        </li> */}
      </ul>
    </nav>
  );
};

export default Navbar;
