import consoleImage from "../images/console.png";
import consoleFrontImage from "../images/console-front.png";

const CockpitConsole = () => {
  console.log("CockpitConsole rendered");

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
