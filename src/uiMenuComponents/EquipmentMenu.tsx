import { useEffect, useState } from "react";
import usePlayerControlsStore from "../stores/playerControlsStore";
import useEquipStore from "../stores/equipStore";
import CyberMenuBorder from "./common/CyberMenuBorder";
import ButtonIcon from "./ButtonIcon";
import Mech from "../equipment/equipmentComponents/Mech";
import { Crew, CrewAssignSpaces } from "../equipment/equipmentComponents/Crew";
import Servos from "../equipment/equipmentComponents/Servos";
import PositionPartsList from "../equipment/equipmentDesign/PositionPartsList";
import PositionPartEditButtons from "../equipment/equipmentDesign/PositionPartEditButtons";
//import ServoHydraulics from "./equipment/ServoHydraulics";
import {
  Weapons,
  WeaponsAssignSpaces,
} from "../equipment/equipmentComponents/weapons/Weapons";
import {
  LandingBay,
  LandingBayAssignSpaces,
} from "../equipment/equipmentComponents/LandingBay";
import { PLAYER } from "../constants/constants";
import mechDesigns from "../equipment/data/mechDesigns";
// @ts-ignore
import camera from "../assets/icons/camera-change.svg";
import "../css/equipmentMenu.css";

const EquipmentMenu = () => {
  // updateState is used to force a re-render of the component when
  // the class instance of editorMechBP is updated in the store (useEquipStore)
  const updateState = useEquipStore((state) => state.updateState);
  // editorMechBP class object will not trigger a re-render when updated
  const editorMechBP = useEquipStore((state) => state.editorMechBP);
  const { resetCamera, equipActions } = useEquipStore((state) => state);

  const [mainMenuSelection, setMainMenuSelection] = useState(0);
  const [importExportText, setImportExportText] = useState("");

  useEffect(() => {
    equipActions.blueprintMenu.setBluePrint(mechDesigns.player[0]);
  }, []);

  const handleNewBP = () => {
    equipActions.blueprintMenu.newBlueprint();
    setSubSelection("");
  };

  const handleImportBP = () => {
    equipActions.blueprintMenu.importBlueprint(importExportText);
    setImportExportText("");
  };
  //MAIN DESIGN MENU
  const { switchScreen } = usePlayerControlsStore((state) => state.actions);
  const [subSelection, setSubSelection] = useState(""); //current sub menu

  const menuPositionPartEditButtonsValue = 4; // special case for Position Parts List and Edit Buttons
  const mainMenuItems = [
    "Save / Load",
    "Mech",
    "Design Parts",
    "Assign Part Locations",
    "Position Servo Shapes", // this is the special case
  ];
  const subMenuItems = [
    {
      saveLoad: {
        buttonLable: "Save / Load",
        component: (
          <div>
            <span className="selectedItem">
              <button onClick={handleNewBP}>New BP</button>
            </span>
            <select
              onChange={(e) =>
                equipActions.blueprintMenu.setBluePrint(
                  mechDesigns.player[e.target.value]
                )
              }
            >
              <option>Select Player BP</option>
              {mechDesigns.player.map((bp, i) => (
                <option key={i} value={i}>
                  {bp.name}
                </option>
              ))}
            </select>
            <select
              onChange={(e) =>
                equipActions.blueprintMenu.setBluePrint(
                  mechDesigns.enemy[e.target.value]
                )
              }
            >
              <option>Select Enemy BP</option>
              {mechDesigns.enemy.map((bp, i) => (
                <option key={i} value={i}>
                  {bp.name}
                </option>
              ))}
            </select>
            <select
              onChange={(e) =>
                equipActions.blueprintMenu.setBluePrint(
                  mechDesigns.station[e.target.value]
                )
              }
            >
              <option>Select Station BP</option>
              {mechDesigns.station.map((bp, i) => (
                <option key={i} value={i}>
                  {bp.name}
                </option>
              ))}
            </select>
            <span>
              <button onClick={handleImportBP}>Import BP</button>
            </span>
            <span>
              <button
                onClick={() =>
                  setImportExportText(
                    equipActions.blueprintMenu.exportBlueprint()
                  )
                }
              >
                Export BP
              </button>
            </span>
            <input
              style={{ textTransform: "none" }}
              type="textbox"
              onChange={(e) => setImportExportText(e.target.value)}
              value={importExportText}
            />
          </div>
        ),
      },
    },
    {
      mech: {
        buttonLable: "Mech",
        component: <Mech editorMechBP={editorMechBP} />,
      },
    },
    {
      servos: {
        buttonLable: "Servos",
        component: (
          <Servos
            editorMechBP={editorMechBP}
            heading="Mech parts: Size and Armor"
          />
        ),
      },
      /*
      hydraulics: {
        buttonLable: "Servo Hydraulics",
        component: <ServoHydraulics heading="Servo Hydraulics Power Rating" />,
        },
      propulsion: { buttonLable: "Propulsion" },
      tech: { buttonLable: "Tech" },
      parts: { buttonLable: "Parts" },
      */
      weapons: {
        buttonLable: "Weapons / Shields",
        component: (
          <Weapons
            editorMechBP={editorMechBP}
            heading={"View Weapon List, add weaponry"}
          />
        ),
      },
      /*
      landingBay: {
        buttonLable: "Landing Bay",
        component: (
          <LandingBay
            editorMechBP={editorMechBP}
            heading={"Select Landing Bays"}
          />
        ),
      },
      */
      crew: {
        buttonLable: "Crew / Controls / Passengers",
        component: (
          <Crew
            editorMechBP={editorMechBP}
            heading={"Assign number of crew, control type, and passenger space"}
          />
        ),
      },
    },
    {
      /*
    propulsion: { buttonLable: "Propulsion" },
    tech: { buttonLable: "Tech" },
    parts: { buttonLable: "Parts" },
    */
      weapons: {
        buttonLable: "Weapons / Shields",
        component: (
          <WeaponsAssignSpaces
            editorMechBP={editorMechBP}
            heading={"Select Servo, then select weapon to place"}
          />
        ),
      },
      /*
      landingBay: {
        buttonLable: "Landing Bay",
        component: (
          <LandingBayAssignSpaces
            editorMechBP={editorMechBP}
            heading={"Select Landing Bay Location"}
          />
        ),
      },
      */
      crew: {
        buttonLable: "Crew / Controls / Passengers",
        component: (
          <CrewAssignSpaces
            editorMechBP={editorMechBP}
            heading={"Choose servo to hold compartment"}
          />
        ),
      },
    },
  ];

  return (
    <div id="equipmentMenu">
      <div className="absolute top-8 left-8 right-8 lg:right-auto lg:w-1/2 h-1/2 lg:h-[90vh]">
        <CyberMenuBorder>
          <div className="flex flex-col w-full h-full">
            <ButtonIcon
              onClick={() => switchScreen(PLAYER.screen.flight)}
              iconSrc={camera}
            />
            <div>
              <hr />
              {mainMenuItems.map((value, key) => (
                <span
                  key={"topmenu" + key}
                  className={
                    mainMenuSelection === key
                      ? "selectedItem"
                      : "nonSelectedItem"
                  }
                >
                  <button
                    onClick={() => {
                      // set the main menu selection
                      setMainMenuSelection(key);
                      // if there is only 1 su selection, set it
                      if (Object.entries(subMenuItems[key]).length === 1) {
                        setSubSelection(Object.keys(subMenuItems[key])[0]);
                      } else {
                        setSubSelection("");
                      }
                    }}
                  >
                    {value}
                  </button>
                </span>
              ))}
            </div>
            <hr />
            <div className="overflow-y-scroll">
              <div className="grow w-full ">
                {mainMenuSelection === menuPositionPartEditButtonsValue ? (
                  <PositionPartsList editorMechBP={editorMechBP} />
                ) : (
                  // if submenu selection is length 1 do not show it
                  Object.entries(subMenuItems[mainMenuSelection]).length > 1 &&
                  Object.entries(subMenuItems[mainMenuSelection]).map(
                    ([key, value]) => {
                      return (
                        <span
                          key={"submenu" + key}
                          className={
                            subSelection === key
                              ? "selectedItem"
                              : "nonSelectedItem"
                          }
                        >
                          <button onClick={() => setSubSelection(key)}>
                            {value.buttonLable}
                          </button>
                        </span>
                        //)
                      );
                    }
                  )
                )}

                <hr style={{ clear: "both" }} />
                {mainMenuSelection !== menuPositionPartEditButtonsValue &&
                  subMenuItems[mainMenuSelection][subSelection] &&
                  subMenuItems[mainMenuSelection][subSelection].component}
              </div>
            </div>
          </div>
        </CyberMenuBorder>
      </div>
      {mainMenuSelection === menuPositionPartEditButtonsValue && (
        <PositionPartEditButtons editorMechBP={editorMechBP} />
      )}
      <div className="absolute bottom-4 right-4">
        <div
          className="pointer-events-auto icon-button-cyber w-[10vh] h-[10vh]"
          onClick={() => resetCamera()}
        >
          <span className="icon-button-cyber-content">
            <img src={camera} alt="camera icon" className="w-[10vh] h-[10vh]" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default EquipmentMenu;
