import React from "react";
//@ts-ignore
import consoleImage from "../../images/blue/console.png";
//@ts-ignore
import consoleFrontImage from "../../images/blue/console-front.png";

const CockpitConsole = () => {
  //console.log("CockpitConsole rendered");

  return (
    <>
      <div
        className="face console-top bg-cover bg-center"
        style={{
          backgroundImage: `url(${consoleImage})`,
        }}
      />
      <div
        className="face console-front bg-cover bg-center"
        style={{
          backgroundImage: `url(${consoleFrontImage})`,
        }}
      />
    </>
  );
};

export default CockpitConsole;
