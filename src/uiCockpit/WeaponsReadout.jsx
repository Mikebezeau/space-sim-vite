import useStore from "../stores/store";
import usePlayerControlStore from "../stores/playerControlsStore";
import { PLAYER } from "../constants/constants";

const WeaponsReadout = ({ isAlwaysDisplay = false }) => {
  const weaponList = useStore((state) => state.player.mechBP.weaponList);
  const playerControlMode = usePlayerControlStore(
    (state) => state.playerControlMode
  );

  return (
    <>
      {(isAlwaysDisplay || playerControlMode === PLAYER.controls.combat) && (
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
