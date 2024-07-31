import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import { PLAYER } from "../constants/constants";
import "../css/glitch.css";

const ShieldsReadout = () => {
  const shield = useStore((state) => state.player.shield);
  const playerControlMode = usePlayerControlsStore(
    (state) => state.playerControlMode
  );
  return (
    <>
      {playerControlMode === PLAYER.controls.combat && shield.max > 0 && (
        <div className="glitch w-32 h-6 bg-blue-100">
          <div
            className="h-full bg-blue-500"
            style={{
              width: ((shield.max - shield.damage) / shield.max) * 100 + "%",
            }}
          >
            <div className="w-full font-['tomorrow'] text-center text-md ">
              SHIELDS
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShieldsReadout;
