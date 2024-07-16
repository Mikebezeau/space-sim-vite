import useStore from "../stores/store";
import "../css/glitch.css";

const SpeedReadout = () => {
  const speed = useStore((state) => state.player.speed);

  return (
    <>
      <div className="glitch text-xl -mb-2" data-text="SPEED">
        SPEED
      </div>
      <div className="glitch text-6xl" data-text={speed}>
        {speed}
      </div>
    </>
  );
};

export default SpeedReadout;
