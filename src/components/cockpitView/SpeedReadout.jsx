import useStore from "../../stores/store";

const SpeedReadout = () => {
  const speed = useStore((state) => state.player.speed);

  return (
    <>
      <div className="text-xl -mb-2">SPEED</div>
      <div className="text-6xl">{speed}</div>
    </>
  );
};

export default SpeedReadout;
