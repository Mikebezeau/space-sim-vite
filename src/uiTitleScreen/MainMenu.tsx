import React, { useEffect, useState } from "react";
import usePlayerControlsStore from "../stores/playerControlsStore";
import CyberMenuBorder from "../uiMenuComponents/common/CyberMenuBorder";
import CyberButton from "../uiMenuComponents/common/CyberButton";
//import ButtonIcon from "./ButtonIcon";
import { PLAYER } from "../constants/constants";
import TitleScreenContainer from "./TitleScreenContainer";
// @ts-ignore
import titleDeath from "/images/titleDeath2.png";
// @ts-ignore
import stationSrc from "/images/station.jpg";
// @ts-ignore
//import camera from "../assets/icons/camera-change.svg";

const MainMenu = () => {
  const { switchScreen } = usePlayerControlsStore((state) => state.actions);

  const delayedSwitchScreen = (screenConstNum: number) => {
    setTimeout(() => {
      switchScreen(screenConstNum);
    }, 250);
  };

  const menuItems = [
    {
      title: "New Campaign",
      onClick: () => {
        delayedSwitchScreen(PLAYER.screen.newCampaign);
      },
    },
    {
      title: "Space Flight",
      onClick: () => {
        delayedSwitchScreen(PLAYER.screen.flight);
      },
    },
    /*
    {
      title: "Battle",
      onClick: () => {
        delayedSwitchScreen(PLAYER.screen.flight);
      },
    },
    */
    {
      title: "Design",
      onClick: () => {
        delayedSwitchScreen(PLAYER.screen.equipmentBuild);
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
      className={`absolute top-0 right-0 left-0 bottom-0 bg-white 
        transition-opacity duration-200 ${
          /* fade in initially */ isInitLoaded ? "opacity-100" : "opacity-0"
        }`}
    >
      <TitleScreenContainer isTitleImgLoaded={isTitleImgLoaded}>
        <img
          src={titleDeath}
          onLoad={() => {
            setIsTitleImgLoaded(true);
          }}
          className="hidden absolute top-[40%] -mt-[200px] sm:-mt-[60px] sm:top-20 left-[5%] sm:left-[50%] sm:-ml-[37vh] w-[90%] sm:w-[75vh] 
          transition-opacity duration-300"
        />
        <div className="z-10 absolute w-80 bottom-[35%] left-1/2 -ml-40">
          <CyberButton
            title={"Start"}
            tagStyle={{ color: "black" }}
            onClickCallback={() => setIsShowMenu(true)}
          />
        </div>
      </TitleScreenContainer>

      <div
        className={`z-20 absolute top-0 right-0 left-0 bottom-0 bg-black transition-opacity duration-1000 ${
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
                    mainStyle={{ marginBottom: "24px" }}
                    index={index}
                    onClickCallback={menuItem.onClick}
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
      <div
        style={{ marginTop: isShowMenu ? "-16vh" : 0 }}
        className="z-50 absolute top-[calc(40vw+50px)] sm:top-[30vh] left-1/2 h-2 w-fit 
           transition-all duration-1000"
      >
        <div
          /*
            395equalizer2 - old dos font
            ARCADE - dot matrix
            CyberAlert - cyberpunk awesome
            quadaptor - cyberpunk flowing
            */
          className={`${
            isShowMenu ? "glitch" : ""
          } font-['CyberAlert'] opacity-80 -ml-[50%] 
            text-slate-600 tracking-wide text-5xl md:text-[10vw]`}
          data-text="MACHINE"
        >
          MACHINE
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
