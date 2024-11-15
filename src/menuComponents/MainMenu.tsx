import React, { useEffect, useState } from "react";
import usePlayerControlsStore from "../stores/playerControlsStore";
import CyberMenuBorder from "./common/CyberMenuBorder";
import ButtonIcon from "./ButtonIcon";
import { PLAYER } from "../constants/constants";
// @ts-ignore
import titleSrc from "/images/title.jpg";
// @ts-ignore
import camera from "../assets/icons/camera-change.svg";

const MainMenu = () => {
  const [menuSelection, setMenuSelection] = useState("");

  const { switchScreen } = usePlayerControlsStore((state) => state.actions);

  const menuAction = (menuTitle, screen) => {
    setMenuSelection(menuTitle);
    setTimeout(() => switchScreen(screen), 250);
  };

  const menuItems = [
    {
      title: "Launch",
      onClick: () => {
        menuAction("Launch", PLAYER.screen.flight);
      },
    },
  ];

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="top-0 right-0 left-0 bottom-0">
      <img
        src={titleSrc}
        alt="title screen image"
        className={`absolute transition-opacity duration-1000 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="absolute w-1/2 h-1/2 ml-[25%] mt-[25vh]">
        <CyberMenuBorder>
          <div className="px-8">
            {menuItems.map((menuItem) => (
              <div
                key={menuItem.title}
                className={`cybr-btn ${
                  menuSelection === menuItem.title && "cyber-button-glitch"
                }`}
                onClick={menuItem.onClick}
              >
                {menuItem.title}
                {menuSelection === menuItem.title && (
                  <span aria-hidden className="cybr-btn__glitch">
                    {menuItem.title}
                  </span>
                )}
                <span aria-hidden className="cybr-btn__tag">
                  R25
                </span>
              </div>
            ))}
          </div>
        </CyberMenuBorder>
      </div>
    </div>
  );
};

export default MainMenu;
