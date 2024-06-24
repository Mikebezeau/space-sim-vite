import screenImage from "../images/screen.png";
import MonitorReadout from "../MonitorReadout";

const CockpitRight = () => {
  console.log("CockpitRight rendered");

  return (
    <>
      <div
        className="absolute top-0 w-full h-full bg-cover scale-x-[-1]"
        style={{ backgroundImage: `url(${screenImage})` }}
      />
      <div className="">
        <MonitorReadout />
      </div>
    </>
  );
};

export default CockpitRight;
