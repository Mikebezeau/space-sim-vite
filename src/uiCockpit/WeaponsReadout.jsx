import useStore from "../stores/store";
import usePlayerControlStore from "../stores/playerControlsStore";
import { PLAYER } from "../constants/constants";
import "../css/glitch.css";

const WeaponsReadout = () => {
  const playerMechBP = useStore((state) => state.playerMechBP);
  const currentMechBPindex = useStore(
    (state) => state.player.currentMechBPindex
  );
  const weaponList = playerMechBP[currentMechBPindex].weaponList;
  const playerControlMode = usePlayerControlStore(
    (state) => state.playerControlMode
  );
  return (
    <>
      {playerControlMode === PLAYER.controls.combat && (
        <div className="text-white">
          {weaponList.beam.map((weapon, i) => (
            <p key={i}>{weapon.data.name}</p>
          ))}
          {weaponList.proj.map((weapon, i) => (
            <p key={i}>{weapon.data.name}</p>
          ))}
          {weaponList.missile.map((weapon, i) => (
            <p key={i}>{weapon.data.name}</p>
          ))}
        </div>
      )}
    </>
  );
};

export default WeaponsReadout;
