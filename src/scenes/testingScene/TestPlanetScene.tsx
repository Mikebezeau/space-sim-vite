import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import useStore from "../../stores/store";
import useDevStore from "../../stores/devStore";
import TestPlanet from "../../3d/solarSystem/TestPlanet";
import StarClass from "../../classes/solarSystem/Star";
import PlanetClass from "../../classes/solarSystem/Planet";
import { PLANET_TYPE_DATA } from "../../constants/planetDataConstants";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";

import {
  //PLANET_TYPE_DATA,
  typeTextureMapOptions,
} from "../../constants/planetTextureClassTypeLayers";

const TestPlanetScene = () => {
  useStore.getState().updateRenderInfo("TestPlanetScene");

  let uiCurrentShaderLayer = 0;

  const getTestPlanet = useDevStore((state) => state.getTestPlanet);
  const genTestPlanet = useDevStore((state) => state.genTestPlanet);
  const setPlanetType = useDevStore((state) => state.setPlanetType);

  const { camera, gl } = useThree();
  const guiRef = useRef<any>(null);
  const folderLayer1ref = useRef<any>(null);
  const folderLayer2ref = useRef<any>(null);
  const cameraControlsRef = useRef<any>(null);

  const testPlanetRef = useRef<StarClass | PlanetClass | null>(null);

  const planetTypeSelectOptions = [
    "select",
    ...Object.values(PLANET_TYPE_DATA).map(
      (planetTypeData) => planetTypeData.class
    ),
  ];

  const effectControllerPlanetTypeOptions: any = {
    planetType: "select",
  };

  const effectControllerLayerOptions: any = {
    layer: 0,
  };

  const effectControllerOptions: typeTextureMapOptions = {
    isLayerActive: false,
    isBumpMap: true,
    isFlipNegative: false,
    layerOpacity: 1.0,
    flatSurfaceNorm: 0.0,
    rangeStart: 0.0,
    rangeEnd: 1.0,
    scale: 0.0,
    octaves: 0,
    amplitude: 0.0,
    persistence: 0.0,
    lacunarity: 0.0,
    isDoubleNoise: false,
    stretchX: 1.0,
    stretchY: 1.0,
    isRigid: false,
    isWarp: false,
    lowAltColor: "#000000",
    hightAltColor: "#ffffff",
    isClouds: false,
  };

  const valuesChanger = function () {
    getTestPlanet()?.updateTextureLayer(
      uiCurrentShaderLayer,
      effectControllerOptions
    );
  };

  const effectUniformControllerOptions: any = {
    u_isClouds: true,
    u_cloudscale: 1.0,
    u_cloudColor: new THREE.Vector3(1.0, 1.0, 1.0),
    u_cloudCover: 0.0,
    u_cloudAlpha: 20.0,
    u_rotateX: 0.0,
  };

  const valuesUniformChanger = function (uniform: any) {
    // gets updated in 2 places (animated shader material uniforms & FBO shader uniforms)
    getTestPlanet()?.updateCloudShaderUniform(uniform);
  };

  const setGuiData = () => {
    if (testPlanetRef.current) {
      // set default values if not set
      effectControllerPlanetTypeOptions.planetType =
        testPlanetRef.current instanceof PlanetClass
          ? testPlanetRef.current.data.class
          : "sun";
      // set controller options from planet texture map options
      effectControllerLayerOptions.layer = uiCurrentShaderLayer;

      effectControllerOptions.isLayerActive =
        testPlanetRef.current.textureMapLayerOptions[uiCurrentShaderLayer]
          .isLayerActive || false;
      effectControllerOptions.isBumpMap =
        testPlanetRef.current.textureMapLayerOptions[uiCurrentShaderLayer]
          .isBumpMap || true;
      effectControllerOptions.isFlipNegative =
        testPlanetRef.current.textureMapLayerOptions[uiCurrentShaderLayer]
          .isFlipNegative || false;
      effectControllerOptions.layerOpacity =
        testPlanetRef.current.textureMapLayerOptions[uiCurrentShaderLayer]
          .layerOpacity || 1.0;
      effectControllerOptions.flatSurfaceNorm =
        testPlanetRef.current.textureMapLayerOptions[uiCurrentShaderLayer]
          .flatSurfaceNorm || 0.0;
      effectControllerOptions.rangeStart =
        testPlanetRef.current.textureMapLayerOptions[uiCurrentShaderLayer]
          .rangeStart || 0.0;
      effectControllerOptions.rangeEnd =
        testPlanetRef.current.textureMapLayerOptions[uiCurrentShaderLayer]
          .rangeEnd || 1.0;

      effectControllerOptions.scale =
        testPlanetRef.current.textureMapLayerOptions[uiCurrentShaderLayer]
          .scale || 2.0;
      effectControllerOptions.octaves =
        testPlanetRef.current.textureMapLayerOptions[uiCurrentShaderLayer]
          .octaves || 10;
      effectControllerOptions.amplitude =
        testPlanetRef.current.textureMapLayerOptions[uiCurrentShaderLayer]
          .amplitude || 0.5;
      effectControllerOptions.persistence =
        testPlanetRef.current.textureMapLayerOptions[uiCurrentShaderLayer]
          .persistence || 0.5;
      effectControllerOptions.lacunarity =
        testPlanetRef.current.textureMapLayerOptions[uiCurrentShaderLayer]
          .lacunarity || 0.5;

      effectControllerOptions.isDoubleNoise =
        testPlanetRef.current.textureMapLayerOptions[uiCurrentShaderLayer]
          .isDoubleNoise || false;

      effectControllerOptions.stretchX =
        testPlanetRef.current.textureMapLayerOptions[uiCurrentShaderLayer]
          .stretchX || 1.0;

      effectControllerOptions.stretchY =
        testPlanetRef.current.textureMapLayerOptions[uiCurrentShaderLayer]
          .stretchY || 1.0;

      effectControllerOptions.isWarp =
        testPlanetRef.current.textureMapLayerOptions[uiCurrentShaderLayer]
          .isWarp || false;
      effectControllerOptions.isRigid =
        testPlanetRef.current.textureMapLayerOptions[uiCurrentShaderLayer]
          .isRigid || false;

      effectControllerOptions.lowAltColor =
        testPlanetRef.current.textureMapLayerOptions[uiCurrentShaderLayer]
          .lowAltColor || "#000000";

      effectControllerOptions.hightAltColor =
        testPlanetRef.current.textureMapLayerOptions[uiCurrentShaderLayer]
          .hightAltColor || "#ffffff";

      effectControllerOptions.isClouds =
        testPlanetRef.current.textureMapLayerOptions[uiCurrentShaderLayer]
          .isClouds || false;

      // TODO effectUniformControllerOptions
    }
    // if need to update current controls
    if (guiRef.current?.controllers) {
      guiRef.current.controllers.forEach((controller: any) => {
        controller.updateDisplay();
      });
    }
    // if need to update current folder controls
    if (folderLayer1ref.current?.controllers) {
      folderLayer1ref.current.controllers.forEach((controller: any) => {
        controller.updateDisplay();
      });
    }
    // if need to update current folder controls
    if (folderLayer2ref.current?.controllers) {
      folderLayer2ref.current.controllers.forEach((controller: any) => {
        controller.updateDisplay();
      });
    }
  };

  const resetCameraPosition = () => {
    if (!cameraControlsRef.current || testPlanetRef.current === null) return;
    cameraControlsRef.current.reset();
    cameraControlsRef.current.target.set(0, 0, 400);
    //const distance = r / Math.sin(THREE.MathUtils.degToRad(fov / 2))
    //camera.position.set(0, 0, -distance);
    camera.position.set(0, 0, -testPlanetRef.current.radius * 3 + 400);
    //console.log("resetCameraPosition", camera.position.z);
    //console.log("getTestPlanet z", -testPlanetRef.current.radius * 3 + 400);
  };

  useEffect(() => {
    //if (!guiRef.current) {
    guiRef.current = new GUI();

    guiRef.current
      .add(
        effectControllerPlanetTypeOptions,
        "planetType",
        planetTypeSelectOptions
      )
      .name("Planet Type")
      .onChange((planetTypeSelectValue) => {
        const planetTypeData = Object.values(PLANET_TYPE_DATA).find(
          (planetTypeData) => planetTypeData.class === planetTypeSelectValue
        );
        if (planetTypeData) {
          setPlanetType(planetTypeData);
          testPlanetRef.current = getTestPlanet();
          setGuiData();
          resetCameraPosition();
        }
      });

    // LAYER
    guiRef.current
      .add(
        effectControllerLayerOptions,
        "layer",
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      )
      .name("Layer")
      .onChange((layerSelectValue) => {
        uiCurrentShaderLayer = layerSelectValue;

        setGuiData();
      });

    folderLayer1ref.current = guiRef.current.addFolder("Layer 1");

    folderLayer1ref.current
      .add(effectControllerOptions, "isLayerActive")
      .onChange(valuesChanger);

    folderLayer1ref.current
      .add(effectControllerOptions, "isBumpMap")
      .onChange(valuesChanger);

    folderLayer1ref.current
      .add(effectControllerOptions, "isFlipNegative")
      .onChange(valuesChanger);

    folderLayer1ref.current
      .add(effectControllerOptions, "layerOpacity", 0.0, 1.0, 0.1)
      .onChange(valuesChanger);

    folderLayer1ref.current
      .add(effectControllerOptions, "flatSurfaceNorm", 0.0, 1.0, 0.1)
      .onChange(valuesChanger);

    folderLayer1ref.current
      .add(effectControllerOptions, "rangeStart", 0.0, 1.0, 0.1)
      .onChange(valuesChanger);

    folderLayer1ref.current
      .add(effectControllerOptions, "rangeEnd", 0.0, 1.0, 0.1)
      .onChange(valuesChanger);

    folderLayer1ref.current
      .add(effectControllerOptions, "scale", 0.1, 5.0, 0.1)
      .onChange(valuesChanger);

    folderLayer1ref.current
      .add(effectControllerOptions, "octaves", 5.0, 25.0, 1.0)
      .onChange(valuesChanger);

    folderLayer1ref.current
      .add(effectControllerOptions, "amplitude", 0.1, 5.0, 0.1)
      .onChange(valuesChanger);

    folderLayer1ref.current
      .add(effectControllerOptions, "persistence", 0.1, 2.0, 0.1)
      .onChange(valuesChanger);

    folderLayer1ref.current
      .add(effectControllerOptions, "lacunarity", 0.1, 4.0, 0.1)
      .onChange(valuesChanger);

    folderLayer1ref.current
      .add(effectControllerOptions, "isDoubleNoise")
      .onChange(valuesChanger);

    folderLayer1ref.current
      .add(effectControllerOptions, "stretchX", 0.1, 5.0, 0.1)
      .onChange(valuesChanger);

    folderLayer1ref.current
      .add(effectControllerOptions, "stretchY", 0.1, 5.0, 0.1)
      .onChange(valuesChanger);

    folderLayer1ref.current
      .add(effectControllerOptions, "isWarp")
      .onChange(valuesChanger);

    folderLayer1ref.current
      .add(effectControllerOptions, "isRigid")
      .onChange(valuesChanger);

    folderLayer1ref.current
      .addColor(effectControllerOptions, "lowAltColor")
      .onChange(valuesChanger);

    folderLayer1ref.current
      .addColor(effectControllerOptions, "hightAltColor")
      .onChange(valuesChanger);

    const folderLayer2 = guiRef.current.addFolder("Layer 2");
    folderLayer2.open(false); // close

    guiRef.current
      .add(effectControllerOptions, "isClouds")
      .onChange(valuesChanger);

    guiRef.current
      .add(effectUniformControllerOptions, "u_isClouds")
      .onChange((value: boolean) => {
        valuesUniformChanger({ name: "u_isClouds", value });
      });

    guiRef.current
      .add(effectUniformControllerOptions, "u_cloudscale", 0.1, 5.0, 0.1)
      .onChange((value: number) => {
        valuesUniformChanger({ name: "u_cloudscale", value });
      });

    guiRef.current
      .add(effectUniformControllerOptions, "u_cloudCover", 0.0, 1.0, 0.1)
      .onChange((value: number) => {
        valuesUniformChanger({ name: "u_cloudCover", value });
      });

    guiRef.current
      .add(effectUniformControllerOptions, "u_cloudAlpha", 0.0, 100.0, 10.0)
      .onChange((value: number) => {
        valuesUniformChanger({ name: "u_cloudAlpha", value });
      });

    guiRef.current
      .add(effectUniformControllerOptions, "u_rotateX", 0.1, 3.4, 0.1)
      .onChange((value: number) => {
        valuesUniformChanger({ name: "u_rotateX", value });
      });
    //}

    if (!getTestPlanet() && gl) {
      genTestPlanet(gl);
      testPlanetRef.current = getTestPlanet();
    }
    setGuiData();
    resetCameraPosition();

    return () => {
      if (guiRef.current) {
        guiRef.current.destroy();
      }
    };
  }, []);

  return (
    <>
      <TrackballControls
        ref={(controlsRef) => {
          cameraControlsRef.current = controlsRef;
        }}
        rotateSpeed={3}
        panSpeed={0.5}
      />
      <pointLight intensity={1} decay={0} position={[0, 0, -1000000]} />
      <ambientLight intensity={0.4} />
      {testPlanetRef.current && <TestPlanet />}
    </>
  );
};

export default TestPlanetScene;
