import React from "react";

import Styles from "./NoPage.module.css";

const NoPage = () => {
  return (
    <div className={Styles.noPageContainer}>
      <h1>Error 404</h1>;
      <h2>Sorry, we couldn't find the page you were looking for...</h2>
    </div>
  );
};

export default NoPage;
