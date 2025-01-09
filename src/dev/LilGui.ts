import { useEffect } from "react";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import useDevStore from "../stores/devStore";
import { PLANET_TYPE_DATA } from "../constants/solarSystemConstants";

const LilGui = () => {
  const {
    updateTestTextureOptions,
    updateTestShaderOptions,
    updateTestShaderUniforms,
    setProp,
  } = useDevStore((state) => state);
  const setPlanetType = useDevStore((state) => state.setPlanetType);
  const testTextureOptions = useDevStore((state) => state.testTextureOptions);
  const testShaderOptions = useDevStore((state) => state.testShaderOptions);
  const testShaderUniforms = useDevStore((state) => state.testShaderUniforms);

  type typeTestTextureMapOptions = {
    scale: number;
    octaves: number;
    persistence: number;
    baseColor: string;
    colors: { r: number; g: number; b: number }[];
    isCloudColorWhite: boolean;
    planetTypeMods: { warpX: number; warpY: number; warpZ: number };
    craterIntensity: number;
    grayscale: boolean;
    isNoiseMap: boolean;
    debug: boolean;
  };

  let testController = { planetType: "select" };

  let testTextureMapOptions: typeTestTextureMapOptions | null = null;

  useEffect(() => {
    if (testTextureOptions === null || testTextureMapOptions !== null) return;

    const gui = new GUI();

    testTextureMapOptions = {
      scale: 1,
      octaves: 1,
      persistence: 1,
      baseColor: "#FF0000",
      colors: [],
      isCloudColorWhite: false,
      planetTypeMods: { warpX: 1, warpY: 1, warpZ: 1 },
      craterIntensity: 1,
      grayscale: false,
      isNoiseMap: false,
      debug: false,
    };
    testTextureMapOptions = { ...testTextureMapOptions, ...testTextureOptions };

    console.log("Planet testTextureMapOptions", testTextureMapOptions);

    const planetTypeSelectOptions = [
      "select",
      ...Object.values(PLANET_TYPE_DATA).map(
        (planetTypeData) => planetTypeData.label
      ),
    ];
    gui
      .add(testController, "planetType", planetTypeSelectOptions)
      .name("Planet Type")
      .onChange((value) => {
        const planetTypeData = Object.values(PLANET_TYPE_DATA).find(
          (planetTypeData) => planetTypeData.label === value
        );
        console.log(planetTypeData);
        if (planetTypeData) setPlanetType(planetTypeData);
      });

    gui
      .add(testTextureMapOptions, "scale")
      .name("scale")
      .onChange((value) => {
        updateTestTextureOptions("scale", value);
      });

    gui
      .add(testTextureMapOptions, "octaves")
      .name("octaves")
      .onChange((value) => {
        updateTestTextureOptions("octaves", value);
      });

    gui
      .add(testTextureMapOptions, "persistence")
      .name("persistence")
      .onChange((value) => {
        updateTestTextureOptions("persistence", value);
      });

    gui
      .add(testTextureMapOptions, "craterIntensity")
      .name("craterIntensity")
      .onChange((value) => {
        updateTestTextureOptions("craterIntensity", value);
      });

    gui
      .add(testTextureMapOptions.planetTypeMods, "warpX")
      .name("planetTypeMods X")
      .onChange((value) => {
        updateTestTextureOptions("planetTypeMods", {
          warpX: value,
          warpY: testTextureMapOptions?.planetTypeMods.warpY,
          warpZ: testTextureMapOptions?.planetTypeMods.warpZ,
        });
      });

    gui
      .add(testShaderOptions, "clouds")
      .name("clouds")
      .onChange((value) => {
        updateTestShaderOptions("clouds", value ? 1 : 0);
      });

    gui
      .add(testShaderUniforms.u_cloudscale, "value", 1, 10)
      .name("u_cloudscale")
      .onChange((value) => {
        updateTestShaderUniforms("u_cloudscale", value);
      });
    /*
    gui
      .add(testShaderUniforms.u_cloudDark, "value", 0, 1)
      .name("u_cloudDark")
      .onChange((value) => {
        updateTestShaderUniforms("u_cloudDark", value);
      });
*/
    gui
      .add(testShaderUniforms.u_cloudCover, "value", 0, 1)
      .name("u_cloudCover")
      .onChange((value) => {
        updateTestShaderUniforms("u_cloudCover", value);
      });

    gui
      .add(testShaderUniforms.u_cloudAlpha, "value", 1, 100, 2)
      .name("u_cloudAlpha")
      .onChange((value) => {
        updateTestShaderUniforms("u_cloudAlpha", value);
      });

    gui
      .add(testShaderUniforms.u_speed, "value", 0.001, 0.1)
      .name("u_speed")
      .onChange((value) => {
        updateTestShaderUniforms("u_speed", value);
      });

    gui
      .add(testShaderUniforms.u_rotateX, "value", 0.0, Math.PI)
      .name("u_rotateX")
      .onChange((value) => {
        updateTestShaderUniforms("u_rotateX", value);
      });

    //planetTypeMods: { warpX: 1, warpY: 1, warpZ: 1 },
    /*
    gui.close();
    gui.add(devStoreState, "devEnemyTest").onChange((value) => {
      // not accepting boolean values (even though type is boolean in store)
      setProp("devEnemyTest", value ? 1 : 0);
    });
    gui.add(devStoreState, "devPlayerPilotMech").onChange((value) => {
      setProp("devPlayerPilotMech", value ? 1 : 0);
    });
    gui.add(devStoreState, "devPlayerSpeedX1000").onChange((value) => {
      setProp("devPlayerSpeedX1000", value ? 1 : 0);
    });
    gui.add(devStoreState, "showObbBox").onChange((value) => {
      setProp("showObbBox", value ? 1 : 0);
    });
*/
    return () => {
      gui.destroy();
    };
  }, [testTextureOptions]);

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
