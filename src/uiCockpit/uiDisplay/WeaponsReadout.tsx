import React from "react";
import useStore from "../../stores/store";
import usePlayerControlStore from "../../stores/playerControlsStore";
import { PLAYER } from "../../constants/constants";
//import { equipData } from "../equipment/data/equipData";

const WeaponsReadout = ({ isAlwaysDisplay = false }) => {
  const weaponList = useStore((state) => state.player.mechBP.weaponList);
  const playerControlMode = usePlayerControlStore(
    (state) => state.playerControlMode
  );
  const weaponUpdateToggle = usePlayerControlStore(
    (state) => state.weaponUpdateToggle
  );

  return (
    <>
      {isAlwaysDisplay ||
        (playerControlMode === PLAYER.controls.combat &&
          weaponList.map((weapon, i) => (
            <div
              key={i}
              className={`absolute px-2 flex ${
                i % 2 === 0 ? "flex-row" : "flex-row-reverse justify-start" //justify reversed
              } text-white w-[300px] text-[12px] font-bold uppercase`}
              style={{
                bottom: `${200 - Math.ceil((i + 1) / 2) * 60}px`,
                left: i % 2 === 0 ? "0" : "calc(100% - 300px)", // Adjust 200px to the width of the text if needed
                textAlign: i % 2 === 0 ? "left" : "right",
              }}
            >
              <span
                className={`${weapon.getAmmoCount() <= 0 && "text-red-500"}`}
              >
                {weapon.name}
                {weapon.isProjectile && (
                  <span className="ml-1.5 text green">
                    {weapon.getAmmoCount()}
                  </span>
                )}
              </span>

              <span className="mx-1.5">
                {/*weapon.currentAmmo currentHeat*/}
              </span>
              <span
                className={`inline-block box-border w-2.5 h-2.5 ${
                  weapon.getAmmoCount() === 0
                    ? "bg-red-500"
                    : weapon.weaponFireData.isReady
                    ? "bg-blue-500"
                    : "border-2"
                } border-blue-500 rounded-full m-1 align-middle`}
              />
            </div>
          )))}
    </>
  );
};

export default React.memo(WeaponsReadout);
