import React, { useState } from "react";
import "./styles.scss";

const ZabbixMenu = (props) => {
  const toggleModal = () => setHideModal(!hideModal);

  const configModal = {
    hideModal,
    toggleModal,
  };

  const resetForm = () => {
    setHideModal(true);
    setSensorDescription("");
    // setProjectCompany("");
    // setProjectContact("");
  };
  return;
};

export default ZabbixMenu;
