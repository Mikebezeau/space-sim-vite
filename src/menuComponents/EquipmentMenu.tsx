import React, { useEffect, useState } from "react";
import usePlayerControlsStore from "../stores/playerControlsStore";
import useEquipStore from "../stores/equipStore";
import mechDesigns from "../equipment/data/mechDesigns";
// @ts-ignore
import camera from "../assets/icons/camera-change.svg";
import Mech from "../equipment/equipmentComponents/Mech";
import { Crew, CrewAssignSpaces } from "../equipment/equipmentComponents/Crew";
import { Servos } from "../equipment/equipmentComponents/Servos";
import PositionPartsList from "../equipment/equipmentDesign/PositionPartsList";
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
import "../css/equipmentMenu.css";

const EquipmentMenu = () => {
  // updateState is used to force a re-render of the component when
  // the class is updated in the store (useEquipStore)
  const updateState = useEquipStore((state) => state.updateState);
  //BLUEPRINT SELECTION MENU
  const { resetCamera, equipActions } = useEquipStore((state) => state);

  const [selectedBPid, setSelectedBPid] = useState(""); //top menu
  const [importExportText, setImportExportText] = useState("");

  const handleNewBP = () => {
    equipActions.blueprintMenu.newBlueprint();
    setSelectedBPid("");
    setSubSelection("");
  };
  /*
  const handleSelectBlueprint = (id) => {
    equipActions.blueprintMenu.selectBlueprint(id);
    setSelectedBPid(id);
    setSubSelection(null);
  };
  const handleSaveBlueprint = () => {
    const id = equipActions.blueprintMenu.saveBlueprint(selectedBPid); //returns id of saved Blueprint
    setSelectedBPid(id);
  };
  const handleDeleteBlueprint = (id) => {
    equipActions.blueprintMenu.deleteBlueprint(id);
    handleNewBP();
    setSubSelection(null);
  };
  */
  const handleImportChange = (e) => {
    setImportExportText(e.target.value);
  };
  const handleImportBP = () => {
    equipActions.blueprintMenu.importBlueprint(importExportText);
    setImportExportText("");
  };
  const handleSelectPlayerBP = (i: number) => {
    if (mechDesigns.player[i])
      equipActions.blueprintMenu.importBlueprint(
        JSON.stringify(mechDesigns.player[i])
      );
  };
  const handleSelectEnemyBP = (i: number) => {
    if (mechDesigns.enemy[i])
      equipActions.blueprintMenu.importBlueprint(
        JSON.stringify(mechDesigns.enemy[i])
      );
  };
  const handleSelectStationBP = (i: number) => {
    if (mechDesigns.station[i])
      equipActions.blueprintMenu.importBlueprint(
        JSON.stringify(mechDesigns.station[i])
      );
  };
  const handleExportBP = () => {
    setImportExportText(equipActions.blueprintMenu.exportBlueprint());
  };

  //MAIN DESIGN MENU
  const { switchScreen } = usePlayerControlsStore((state) => state.actions);
  const { mainMenuSelection } = useEquipStore((state) => state); //top menu
  const [subSelection, setSubSelection] = useState(""); //current sub menu

  const topMenuSelection = [
    "Mech Menu",
    "Design Parts",
    "Assign Part Locations",
    "Position Servo Shapes",
  ];
  const subCatagories = [
    {
      saveLoad: {
        buttonLable: "Save / Load",
        component: (
          <div>
            <span
              className={
                selectedBPid === "" ? "selectedItem" : "nonSelectedItem"
              }
            >
              <button onClick={handleNewBP}>New BP</button>
            </span>
            {/*playerMechBP.map((value, index) => (
          <span
            key={"mechbp" + index}
            className={
              selectedBPid === value.id ? "selectedItem" : "nonSelectedItem"
            }
          >
            <button
              key={"select" + index}
              onClick={() => handleSelectBlueprint(value.id)}
            >
              {value.name}
            </button>
            <button
              key={"delete" + index}
              onClick={() => handleDeleteBlueprint(value.id)}
            >
              X
            </button>
          </span>
        ))
        <button onClick={handleSaveBlueprint}>Save Blueprint</button>
        */}
            <select
              onChange={(e) => {
                handleSelectPlayerBP(Number(e.target.value));
              }}
            >
              <option>Select Player BP</option>
              {mechDesigns.player.map((bp, i) => (
                <option key={i} value={i}>
                  {bp.name}
                </option>
              ))}
            </select>
            <select
              onChange={(e) => {
                handleSelectEnemyBP(Number(e.target.value));
              }}
            >
              <option>Select Enemy BP</option>
              {mechDesigns.enemy.map((bp, i) => (
                <option key={i} value={i}>
                  {bp.name}
                </option>
              ))}
            </select>
            <select
              onChange={(e) => {
                handleSelectStationBP(Number(e.target.value));
              }}
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
              <button onClick={handleExportBP}>Export BP</button>
            </span>
            <input
              style={{ textTransform: "none" }}
              type="textbox"
              onChange={(e) => handleImportChange(e)}
              value={importExportText}
            />
          </div>
        ),
      },
      mech: {
        buttonLable: "Mech",
        component: <Mech />,
      },
    },
    {
      //******************************************** */
      //design parts

      servos: {
        buttonLable: "Servos",
        component: <Servos heading="Mech parts: Size and Armor" />,
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
        component: <Weapons heading={"View Weapon List, add weaponry"} />,
      },
      landingBay: {
        buttonLable: "Landing Bay",
        component: <LandingBay heading={"Select Landing Bays"} />,
      },
      crew: {
        buttonLable: "Crew / Controls / Passengers",
        component: (
          <Crew
            heading={"Assign number of crew, control type, and passenger space"}
          />
        ),
      },
    },
    {
      //********************************* */
      //asign spaces

      /*
    propulsion: { buttonLable: "Propulsion" },
    tech: { buttonLable: "Tech" },
    parts: { buttonLable: "Parts" },
    */
      weapons: {
        buttonLable: "Weapons / Shields",
        component: (
          <WeaponsAssignSpaces
            heading={"Select Servo, then select weapon to place"}
          />
        ),
      },
      landingBay: {
        buttonLable: "Landing Bay",
        component: (
          <LandingBayAssignSpaces heading={"Select Landing Bay Location"} />
        ),
      },
      crew: {
        buttonLable: "Crew / Controls / Passengers",
        component: (
          <CrewAssignSpaces heading={"Choose servo to hold compartment"} />
        ),
      },
    },
  ];

  const topSelectionHandler = (key) => {
    equipActions.changeMainMenuSelection(key);
  };
  const subSelectionHandler = (key) => {
    //console.log(key);
    setSubSelection(key);
  };

  return (
    <>
      <div
        id="equipmentMenu"
        className="absolute top-8 mr-20 w-full lg:w-1/2 h-1/2 lg:h-[90vh]"
      >
        <button onClick={() => switchScreen(PLAYER.screen.flight)}>Exit</button>
        <div>
          <hr />
          {topMenuSelection.map((value, key) => (
            <span
              key={"topmenu" + key}
              className={
                mainMenuSelection === key ? "selectedItem" : "nonSelectedItem"
              }
            >
              <button onClick={() => topSelectionHandler(key)}>{value}</button>
            </span>
          ))}
          <hr />
          {mainMenuSelection === 3 ? (
            <PositionPartsList />
          ) : (
            //edit servo/weapon graphical locations
            //will also load the blueprint design 3d interface
            Object.entries(subCatagories[mainMenuSelection]).map(
              ([key, value]) => {
                return (
                  <span
                    key={"submenu" + key}
                    className={
                      subSelection === key ? "selectedItem" : "nonSelectedItem"
                    }
                  >
                    <button onClick={() => subSelectionHandler(key)}>
                      {value.buttonLable}
                    </button>
                  </span>
                  //)
                );
              }
            )
          )}
        </div>
        <hr style={{ clear: "both" }} />
        {mainMenuSelection !== 3 &&
          subCatagories[mainMenuSelection][subSelection] &&
          subCatagories[mainMenuSelection][subSelection].component}
      </div>
      <div className="absolute bottom-0 right-0">
        <div
          className="pointer-events-auto button-cyber w-[10vh] h-[10vh]"
          onClick={() => resetCamera(true)}
        >
          <span className="button-cyber-content">
            <img
              src={camera}
              alt="camera icon"
              className="w-[10vh] h-[10vh] pointer-events-none"
            />
          </span>
        </div>
      </div>
    </>
  );
};

export default EquipmentMenu;
