import useStore from "../../../../stores/store";

const SpeedReadout = () => {
  const speed = useStore((state) => state.player.speed);

  return (
    <>
      <div className="text-2xl">SPEED</div>
      <div className="text-6xl">{speed}</div>
    </>
  );
};

export default SpeedReadout;
