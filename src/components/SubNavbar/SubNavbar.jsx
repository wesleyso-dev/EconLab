import Styles from "./SubNavbar.module.css";
import { Link, useNavigate } from "react-router-dom";

/** @param {{ path?: string, links: string[] }} props */
const SubNavbar = ({ path, links }) => {
  return (
    <nav className={Styles.subNavbar}>
      <ul>
        {links.map((link, index) => (
          <li key={index}>
            <Link
              to={
                path !== undefined
                  ? `/${path}/${link.toLowerCase().replace(/ /g, "-")}`
                  : `/${link.toLowerCase().replace(/ /g, "-")}`
              }
            >
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SubNavbar;
