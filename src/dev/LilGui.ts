import { useEffect } from "react";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import usePlayerControlsStore from "../stores/playerControlsStore";
import useDevStore from "../stores/devStore";
import { PLAYER } from "../constants/constants";

const LilGui = () => {
  const devStoreState = useDevStore((state) => state);
  const switchScreen = usePlayerControlsStore(
    (state) => state.actions.switchScreen
  );

  const controls = { toggleTitleScreen: false };

  useEffect(() => {
    const gui = new GUI();

    gui.close();
    /*
    gui.add(devStoreState, "showObbBox").onChange((value) => {
      devStoreState.setProp("showObbBox", value ? 1 : 0);
    });
*/

    const folderPage = gui.addFolder("Page");
    folderPage.open(false);

    folderPage
      .add(controls, "toggleTitleScreen")
      .name("View Title Screen")
      .onChange(() => {
        controls.toggleTitleScreen = false;
        switchScreen(PLAYER.screen.mainMenu);
      });

    const pilotPage = gui.addFolder("Pilot");
    pilotPage.open(false);

    pilotPage.add(devStoreState, "devPlayerSpeedX1000").onChange((value) => {
      devStoreState.setProp("devPlayerSpeedX1000", value ? 1 : 0);
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
	.onChange( value => {
		console.log( value );
	} );

// Create color pickers for multiple color formats
const colorFormats = {
	string: '#ffffff',
	int: 0xffffff,
	object: { r: 1, g: 1, b: 1 },
	array: [ 1, 1, 1 ]
};

gui.addColor( colorFormats, 'string' );
*/
