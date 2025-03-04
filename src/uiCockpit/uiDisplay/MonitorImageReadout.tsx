import React from "react";
// @ts-ignore
import screenCityInfo from "/images/sreenWindowImages/screenCityInfo.png";
// @ts-ignore
import screenKeyboard from "/images/sreenWindowImages/screenKeyboard.png";
// @ts-ignore
import screenMenuBlank from "/images/sreenWindowImages/screenMenuBlank.png";
// @ts-ignore
import screenMenuCharacterHead from "/images/sreenWindowImages/screenMenuCharacterHead.png";
// @ts-ignore
import screenMenuCharacterTorso from "/images/sreenWindowImages/screenMenuCharacterTorso.png";
// @ts-ignore
import screenMenuCharacterUpgrades from "/images/sreenWindowImages/screenMenuCharacterUpgrades.png";
// @ts-ignore
import screenMenuDesignMain from "/images/sreenWindowImages/screenMenuDesignMain.png";
// @ts-ignore
import screenMenuEquipAmount from "/images/sreenWindowImages/screenMenuEquipAmount.png";
// @ts-ignore
import screenMenuEquipCircles from "/images/sreenWindowImages/screenMenuEquipCircles.png";
// @ts-ignore
import screenMenuMainSelect from "/images/sreenWindowImages/screenMenuMainSelect.png";
// @ts-ignore
import screenMenuMainSelect2 from "/images/sreenWindowImages/screenMenuMainSelect2.png";
// @ts-ignore
import screenMenuOptions from "/images/sreenWindowImages/screenMenuOptions.png";
// @ts-ignore
import screenMenuSubSelect from "/images/sreenWindowImages/screenMenuSubSelect.png";
// @ts-ignore
import screenMenuSymbols from "/images/sreenWindowImages/screenMenuSymbols.png";
// @ts-ignore
import screenMenuTabletCircles from "/images/sreenWindowImages/screenMenuTabletCircles.png";
// @ts-ignore
import screenMenuTactics from "/images/sreenWindowImages/screenMenuTactics.png";
// @ts-ignore
import screenMenuTactics2 from "/images/sreenWindowImages/screenMenuTactics2.png";
// @ts-ignore
import screenMenuTactics3 from "/images/sreenWindowImages/screenMenuTactics3.png";
// @ts-ignore
import screenMiniGame from "/images/sreenWindowImages/screenMiniGame.png";
// @ts-ignore
import screenMiniGameConnect from "/images/sreenWindowImages/screenMiniGameConnect.png";
// @ts-ignore
import screenStreetView from "/images/sreenWindowImages/screenStreetView.png";
// @ts-ignore
import screenViewScores from "/images/sreenWindowImages/screenViewScores.png";
// @ts-ignore
import screenViewShips from "/images/sreenWindowImages/screenViewShips.png";
// @ts-ignore
import selectShip from "/images/sreenWindowImages/selectShip.png";
// @ts-ignore
import solarMap from "/images/sreenWindowImages/solarMap.png";
// @ts-ignore
import solarMap2 from "/images/sreenWindowImages/solarMap2.png";

const imageSrcArrayRight = [
  screenMenuSymbols,
  screenMenuTabletCircles,
  screenMenuTactics,
  screenMenuTactics2,
  screenMenuTactics3,
];

const MonitorImageReadout = () => {
  const screenImageRef = React.useRef<HTMLImageElement | null>(null);
  const timeoutRef = React.useRef<number | null>(null);

  const ChangeRandomImage = () => {
    const randomImage =
      imageSrcArrayRight[Math.floor(Math.random() * imageSrcArrayRight.length)];
    if (screenImageRef.current !== null)
      screenImageRef.current.src = randomImage;

    timeoutRef.current = setTimeout(() => {
      ChangeRandomImage();
    }, Math.random() * 2000 + 3000);
  };

  React.useEffect(() => {
    if (timeoutRef.current === null) ChangeRandomImage();
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    };
  }, []);

  return (
    <img
      ref={screenImageRef}
      src={screenMenuSymbols}
      className="absolute w-full h-full"
      alt="digital display"
    />
  );
};

export default React.memo(MonitorImageReadout);
