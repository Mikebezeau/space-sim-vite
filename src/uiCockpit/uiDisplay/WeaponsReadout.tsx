import { memo, useLayoutEffect } from "react";
import useStore from "../../stores/store";
import useHudTargetingStore from "../../stores/hudTargetingStore";
import { IS_TOUCH_SCREEN } from "../../constants/constants";

const WeaponsReadout = () => {
  const weaponList = useStore((state) => state.player.mechBP.weaponList);
  const weaponsHudReadout = useHudTargetingStore(
    (state) => state.weaponsHudReadout
  );
  useLayoutEffect(() => {
    // if not all weapons are initialized, re-initialize
    if (
      weaponsHudReadout.length === 0 ||
      weaponList.length !== weaponsHudReadout.length
    ) {
      useHudTargetingStore.getState().initWeaponsHudReadout();
    }
  }, [weaponList, weaponsHudReadout]);

  return (
    <div
      ref={(ref) => {
        useHudTargetingStore.getState().weaponsReadoutDivElement = ref;
      }}
    >
      {weaponsHudReadout.map((weaponHud, i) => (
        <div
          key={i}
          className={`absolute px-2 flex ${
            i % 2 === 0 ? "flex-row" : "flex-row-reverse justify-start" //justify reversed
          } text-white w-[300px] text-[12px] font-bold uppercase`}
          style={{
            bottom: `${
              (IS_TOUCH_SCREEN ? 350 : 200) - Math.ceil((i + 1) / 2) * 30
            }px`,
            left: i % 2 === 0 ? "0" : "calc(100% - 300px)", // Adjust 200px to the width of the text if needed
            textAlign: i % 2 === 0 ? "left" : "right",
          }}
        >
          <span
            ref={(ref) => {
              // turns red when empty ammo in updatePlayerWeaponsHudReadout
              weaponHud.labelDiv = ref;
            }}
          >
            {weaponHud.label}
            <span
              ref={(ref) => {
                // textContent filled in by updatePlayerWeaponsHudReadout
                weaponHud.ammoCountDiv = ref;
              }}
              className="ml-1.5"
            />
          </span>
          <span className="relative w-2.5 h-2.5 m-1 align-middle">
            <span
              ref={(ref) => {
                // updated in updatePlayerWeaponsHudReadout
                // multiple overlays using opacity to show / hide
                // this default is always visible, blue for ready weapon
                weaponHud.weaponReadyCircleDiv = ref;
              }}
              className="absolute top-0 left-0 right-0 bottom-0 rounded-full bg-blue-500"
            />
            <span
              ref={(ref) => {
                // yellow circle displayed for firing weapon
                weaponHud.weaponFiringCircleDiv = ref;
              }}
              className="absolute top-0 left-0 right-0 bottom-0 rounded-full bg-yellow-500"
            />
            <span
              ref={(ref) => {
                // red circle displayed when weapon has no ammo
                weaponHud.weaponNoAmmoCircleDiv = ref;
              }}
              className="absolute top-0 left-0 right-0 bottom-0 rounded-full bg-red-500"
            />
          </span>
        </div>
      ))}
    </div>
  );
};

export default memo(WeaponsReadout);
