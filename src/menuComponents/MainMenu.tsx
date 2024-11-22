import React, { useEffect, useState } from "react";
import usePlayerControlsStore from "../stores/playerControlsStore";
import CyberMenuBorder from "./common/CyberMenuBorder";
import ButtonIcon from "./ButtonIcon";
import { PLAYER } from "../constants/constants";
// @ts-ignore
import titleDeath from "/images/titleDeath2.png";
// @ts-ignore
import skeleton from "/images/skeleton.jpg";
// @ts-ignore
import robot from "/images/robot2.jpg";
// @ts-ignore
import stationSrc from "/images/station.jpg";
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
      title: "New Campaign",
      onClick: () => {
        menuAction("New Campaign", PLAYER.screen.newCampaign);
      },
    },
    {
      title: "Continue",
      onClick: () => {
        menuAction("Continue", PLAYER.screen.flight);
      },
    },
    {
      title: "Design",
      onClick: () => {
        menuAction("Design", PLAYER.screen.equipmentBuild);
      },
    },
  ];

  const [isInitLoaded, setIsInitLoaded] = useState(false);
  const [isTitleImgLoaded, setisTitleImgLoaded] = useState(false);
  const [isStartClciked, setIsStartClciked] = useState(false);
  const [isShowMenu, setIsShowMenu] = useState(false);

  useEffect(() => {
    setIsInitLoaded(true);
  }, []);

  return (
    <div
      className={`absolute top-0 right-0 left-0 bottom-0 bg-white transition-opacity duration-500 ${
        /* fade in initially */ isInitLoaded ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`absolute top-0 right-0 left-0 bottom-0 bg-white transition-opacity duration-1000 ${
          /* fade out on */ isShowMenu ? "opacity-0" : "opacity-100"
        }`}
      >
        <div
          className={`absolute w-full h-full transition-opacity duration-1000 
      ${/* fade in on */ isTitleImgLoaded ? "opacity-100" : "opacity-0"}`}
        >
          <div className="absolute top-[calc(60vw+50px)] sm:top-[50vh] left-1/2 h-2 w-fit transition-opacity duration-1000">
            <div
              className="-ml-[50%] glitch text-black opacity-80 font-black text-[#0083a3] tracking-wide text-5xl sm:text-7xl"
              data-text="MACHINE"
            >
              MACHINE
            </div>
          </div>
          <img
            src={robot}
            className="invert rotate-[-7deg] opacity-0 md:opacity-50 absolute top-1/2 md:-right-[62vh] min-w-[140vh] w-[140vh] -mt-[55vh]"
          />
          <img
            src={skeleton}
            className="invert opacity-30 absolute top-1/2 -left-[45vh] min-w-[110vh] w-[110vh] -mt-[59vh]"
          />
          <img
            src={titleDeath}
            onLoad={() => {
              setisTitleImgLoaded(true);
            }}
            className="absolute top-[40%] -mt-[200px] sm:-mt-[60px] sm:top-20 left-[5%] sm:left-[50%] sm:-ml-[37vh] w-[90%] sm:w-[75vh] transition-opacity duration-1000"
          />
          <div className="clip-path-cyber-inner w-80 h-40 absolute p-10 bottom-[5%] left-1/2 -ml-40">
            <div
              className="w-full text-center cybr-btn"
              onClick={() => {
                setIsStartClciked(true);
                setTimeout(() => {
                  setIsShowMenu(true);
                }, 250);
              }}
            >
              Start
              {isStartClciked && (
                <span aria-hidden className="cybr-btn__glitch">
                  Start
                </span>
              )}
              <span aria-hidden className="cybr-btn__tag text-black">
                X11
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`absolute top-0 right-0 left-0 bottom-0 bg-black transition-opacity duration-1000 ${
          isShowMenu ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute w-[140%] h-full -right-[40%] md:-right-[200px] md:w-[1000px]">
          <div
            style={{ backgroundImage: `url(${stationSrc}` }}
            className="absolute w-full h-full scale-x-[-1] bg-cover bg-no-repeat"
          />
          <div className="absolute left-0 top-0 w-1/4 h-full bg-gradient-to-r from-black" />
        </div>

        {isShowMenu && (
          <div className="absolute w-[90%] sm:w-[500px] h-60 ml-[5%] sm:ml-[15%] bottom-[5vh] sm:bottom-[20vh]">
            <CyberMenuBorder>
              <div className="px-3 relative">
                {menuItems.map((menuItem, index) => (
                  <div
                    key={menuItem.title}
                    className="w-full pl-[10%] mb-6 cybr-btn"
                    onClick={menuItem.onClick}
                  >
                    {menuItem.title}
                    {menuSelection === menuItem.title && (
                      <span aria-hidden className="cybr-btn__glitch">
                        {menuItem.title}
                      </span>
                    )}
                    <span aria-hidden className="cybr-btn__tag">
                      X{index + 12}
                    </span>
                  </div>
                ))}
              </div>
              <div className="relative text-slate-700 align-top bottom-[2px] -left-3 bg-slate-900">
                <div className="relative -top-1 left-1">
                  EC-392-F-4K-34I3-34K
                </div>
              </div>
            </CyberMenuBorder>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainMenu;
