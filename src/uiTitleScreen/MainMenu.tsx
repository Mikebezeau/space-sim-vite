import React, { useEffect, useState } from "react";
import usePlayerControlsStore from "../stores/playerControlsStore";
import CyberMenuBorder from "../uiMenuComponents/common/CyberMenuBorder";
import CyberButton from "../uiMenuComponents/common/CyberButton";
//import ButtonIcon from "./ButtonIcon";
import { PLAYER } from "../constants/constants";
import TitleScreenBackground from "./TitleScreenBackground";
// @ts-ignore
import titleDeath from "/images/titleDeath2.png";
// @ts-ignore
import stationSrc from "/images/station.jpg";
// @ts-ignore
//import camera from "../assets/icons/camera-change.svg";

const MainMenu = () => {
  const { switchScreen } = usePlayerControlsStore((state) => state.actions);

  const menuItems = [
    {
      title: "New Campaign",
      onClick: () => {
        switchScreen(PLAYER.screen.newCampaign);
      },
    },
    {
      title: "Space Flight",
      onClick: () => {
        switchScreen(PLAYER.screen.flight);
      },
    },
    /*
    {
      title: "Battle",
      onClick: () => {
        switchScreen(PLAYER.screen.flight);
      },
    },
    */
    {
      title: "Design",
      onClick: () => {
        switchScreen(PLAYER.screen.equipmentBuild);
      },
    },
  ];

  const [isInitLoaded, setIsInitLoaded] = useState(false);
  const [isTitleImgLoaded, setIsTitleImgLoaded] = useState(false);
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
      <TitleScreenBackground isTitleImgLoaded={isTitleImgLoaded}>
        <img
          src={titleDeath}
          onLoad={() => {
            setIsTitleImgLoaded(true);
          }}
          className="absolute top-[40%] -mt-[200px] sm:-mt-[60px] sm:top-20 left-[5%] sm:left-[50%] sm:-ml-[37vh] w-[90%] sm:w-[75vh] transition-opacity duration-1000"
        />
        {/*
        <div className="absolute top-[calc(60vw+50px)] sm:top-[50vh] left-1/2 h-2 w-fit transition-opacity duration-1000">
          <div
            className="-ml-[50%] glitch text-black opacity-80 text-[#0083a3] tracking-wide text-5xl sm:text-7xl"
            data-text="MACHINE"
          >
            MACHINE
          </div>
        </div>
        */}
        <div className="absolute w-80 bottom-[15%] left-1/2 -ml-40">
          <CyberButton
            title={"Start"}
            tagClassName={"text-black"}
            onClick={() => setIsShowMenu(true)}
          />
        </div>
      </TitleScreenBackground>

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
                  <CyberButton
                    key={menuItem.title}
                    title={menuItem.title}
                    mainClassName="mb-6"
                    index={index}
                    onClick={menuItem.onClick}
                  />
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
