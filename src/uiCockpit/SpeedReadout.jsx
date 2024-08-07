import useStore from "../stores/store";
import "../css/glitch.css";

const SpeedReadout = () => {
  const speed = useStore((state) => state.player.speed);

  return (
    <div
      className="font-['tomorrow']"
      style={{
        color: "rgb(61 224 61)",
      }}
    >
      <div className="glitch text-xl -mb-2">SPEED</div>
      <div className="glitch text-6xl" data-text={speed}>
        {speed}
      </div>
    </div>
  );
};

export default SpeedReadout;
