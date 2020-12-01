import React from "react";
import homeBackground from "./../../assets/datacenter_bg.png";
import "./styles.scss";

const Directory = (props) => {
  return (
    <div className="directory">
      <div className="wrap">
        <div
          className="item"
          style={{
            backgroundImage: `url(${homeBackground})`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default Directory;
