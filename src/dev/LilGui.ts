import { useEffect } from "react";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import usePlayerControlsStore from "../stores/playerControlsStore";
import useDevStore from "../stores/devStore";
import { PLAYER } from "../constants/constants";

const LilGui = () => {
  const devStoreState = useDevStore((state) => state);
  const setTestScreen = useDevStore((state) => state.setTestScreen);
  const switchScreen = usePlayerControlsStore(
    (state) => state.actions.switchScreen
  );

  const controls = {
    viewTitleScreen: false,
    viewStationScreen: false,
    viewEquipmentScreen: false,
    viewEnemyTest: false,
    summonEnemy: false,
  };

  useEffect(() => {
    const gui = new GUI();

    gui.close();

    const folderPage = gui.addFolder("Page");
    folderPage.open(false);

    folderPage
      .add(controls, "viewTitleScreen")
      .name("View Title Screen")
      .onChange(() => {
        controls.viewTitleScreen = false;
        switchScreen(PLAYER.screen.mainMenu);
      });

    folderPage
      .add(controls, "viewStationScreen")
      .name("View Station Screen")
      .onChange(() => {
        controls.viewStationScreen = false;
        switchScreen(PLAYER.screen.dockedStation);
      });

    folderPage
      .add(controls, "viewEquipmentScreen")
      .name("Build Equipment Screen")
      .onChange(() => {
        controls.viewEquipmentScreen = false;
        switchScreen(PLAYER.screen.equipmentBuild);
      });

    const folderPilot = gui.addFolder("Pilot");
    folderPilot.open(false);

    folderPilot.add(devStoreState, "devPlayerSpeedX1000").onChange((value) => {
      devStoreState.setDevStoreProp("devPlayerSpeedX1000", value ? 1 : 0);
    });

    const folderTesting = gui.addFolder("Testing");
    folderTesting.open(false);

    folderTesting.add(devStoreState, "showObbBox").onChange((value) => {
      devStoreState.setDevStoreProp("showObbBox", value ? 1 : 0);
    });

    folderTesting.add(devStoreState, "showBoidVectors").onChange((value) => {
      devStoreState.setDevStoreProp("showBoidVectors", value ? 1 : 0);
    });

    folderTesting
      .add(devStoreState, "boidAlignmentMod", -0.05, 0.05, 0.01)
      .onChange((value) => {
        devStoreState.setDevStoreProp("boidAlignmentMod", value);
      });

    folderTesting
      .add(devStoreState, "boidSeparationMod", -0.05, 0.05, 0.01)
      .onChange((value) => {
        devStoreState.setDevStoreProp("boidSeparationMod", value);
      });

    folderTesting
      .add(devStoreState, "boidCohesionMod", -0.05, 0.05, 0.01)
      .onChange((value) => {
        devStoreState.setDevStoreProp("boidCohesionMod", value);
      });

    folderTesting.add(controls, "summonEnemy").onChange(() => {
      controls.summonEnemy = false;
      devStoreState.summonEnemy();
    });

    folderTesting
      .add(controls, "viewEnemyTest")
      .name("View Enemy Test Screen")
      .onChange(() => {
        setTestScreen("enemyTest");
      });

    return () => {
      gui.destroy();
    };
  }, []);

  return null;
};

export default LilGui;

/*

gui.add( myObject, 'myBoolean' );  // Checkbox
gui.add( myObject, 'myFunction' ); // Button
gui.add( myObject, 'myString' );   // Text Field
gui.add( myObject, 'myNumber' );   // Number Field

// Add sliders to number fields by passing min and max
gui.add( myObject, 'myNumber', 0, 1 );
gui.add( myObject, 'myNumber', 0, 100, 2 ); // snap to even numbers

// Create dropdowns by passing an array or object of named values
gui.add( myObject, 'myNumber', [ 0, 1, 2 ] );
gui.add( myObject, 'myNumber', { Label1: 0, Label2: 1, Label3: 2 } );

// Chainable methods
gui.add( myObject, 'myProperty' )
	.name( 'Custom Name' )
	.onChange( value => {  } );

// Create color pickers for multiple color formats
const colorFormats = {
	string: '#ffffff',
	int: 0xffffff,
	object: { r: 1, g: 1, b: 1 },
	array: [ 1, 1, 1 ]
};

gui.addColor( colorFormats, 'string' );
*/
