import screenBImage from "../images/screenB.png";
import MonitorReadout from "../MonitorReadout";

const CockpitRight = () => {
  console.log("CockpitRight rendered");

  return (
    <>
      <div
        className="absolute top-0 w-full h-full bg-cover scale-x-[-1]"
        style={{ backgroundImage: `url(${screenBImage})` }}
      />
      <div className="absolute top-16 left-8 border-l-8 border-cyan-800">
        <MonitorReadout />
      </div>
    </>
  );
};

export default CockpitRight;
