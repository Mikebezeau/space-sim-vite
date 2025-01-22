import React, { useEffect, useRef } from "react";
import { Vector3 } from "three";
import { useThree } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import useDevStore from "../stores/devStore";
import TestPlanet from "../3d/solarSystem/TestPlanet";
import PlanetClass from "../classes/solarSystem/Planet";
import { PLANET_TYPE_DATA } from "../constants/solarSystemConstants";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";

import {
  //PLANET_TYPE_DATA,
  typeTextureMapOptions,
} from "../constants/solarSystemConstants";

const TestPlanetScene = () => {
  console.log("TestPlanetScene rendered");

  const getTestPlanet = useDevStore((state) => state.getTestPlanet);
  const genTestPlanet = useDevStore((state) => state.genTestPlanet);
  const setPlanetType = useDevStore((state) => state.setPlanetType);

  const { camera, gl } = useThree();

  const guiRef = useRef<any>(null);
  const folderLayer1ref = useRef<any>(null);
  const folderLayer2ref = useRef<any>(null);
  const cameraControlsRef = useRef<any>(null);
  const testPlanetRef = useRef<PlanetClass | null>(null);

  const planetTypeSelectOptions = [
    "select",
    ...Object.values(PLANET_TYPE_DATA).map(
      (planetTypeData) => planetTypeData.label
    ),
  ];

  const effectControllerPlanetTypeOptions: any = {
    planetType: "select",
  };

  const effectControllerOptions: typeTextureMapOptions = {
    scale: 0.0,
    octaves: 0,
    amplitude: 0.0,
    persistence: 0.0,
    lacunarity: 0.0,
    isRigid: false,
    stretchX: 1.0,
    stretchY: 1.0,
    isWarp: false,
    baseColor: "#000000",
    secondColor: "#ffffff",
    isClouds: false,
  };

  const valuesChanger = function () {
    getTestPlanet()?.updateTextureOptions(effectControllerOptions);
  };

  const effectUniformControllerOptions: any = {
    u_isClouds: true,
    u_cloudscale: 1.0,
    u_cloudColor: new Vector3(1.0, 1.0, 1.0),
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
      console.log(
        "set testPlanet data",
        testPlanetRef.current.textureMapOptions
      );
      effectControllerPlanetTypeOptions.planetType =
        testPlanetRef.current.data.label;
      // set controller options from planet texture map options
      effectControllerOptions.scale =
        testPlanetRef.current.textureMapOptions.scale || 2.0;
      effectControllerOptions.octaves =
        testPlanetRef.current.textureMapOptions.octaves || 10;
      effectControllerOptions.amplitude =
        testPlanetRef.current.textureMapOptions.amplitude || 0.5;
      effectControllerOptions.persistence =
        testPlanetRef.current.textureMapOptions.persistence || 0.5;
      effectControllerOptions.lacunarity =
        testPlanetRef.current.textureMapOptions.lacunarity || 0.5;

      effectControllerOptions.isRigid =
        testPlanetRef.current.textureMapOptions.isRigid || false;

      effectControllerOptions.stretchX =
        testPlanetRef.current.textureMapOptions.stretchX || 1.0;

      effectControllerOptions.stretchY =
        testPlanetRef.current.textureMapOptions.stretchY || 1.0;

      effectControllerOptions.isWarp =
        testPlanetRef.current.textureMapOptions.isWarp || false;

      effectControllerOptions.baseColor =
        testPlanetRef.current.textureMapOptions.baseColor || "#000000";

      effectControllerOptions.secondColor =
        testPlanetRef.current.textureMapOptions.secondColor || "#ffffff";

      effectControllerOptions.isClouds =
        testPlanetRef.current.textureMapOptions.isClouds || false;

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

  useEffect(() => {
    if (!getTestPlanet() && gl) {
      genTestPlanet(gl);
      testPlanetRef.current = getTestPlanet();
      setGuiData();
    }
  }, []);

  useEffect(() => {
    if (!guiRef.current) {
      console.log("set guiRef");

      guiRef.current = new GUI();

      guiRef.current
        .add(
          effectControllerPlanetTypeOptions,
          "planetType",
          planetTypeSelectOptions
        )
        .name("Planet Type")
        .onChange((value) => {
          const planetTypeData = Object.values(PLANET_TYPE_DATA).find(
            (planetTypeData) => planetTypeData.label === value
          );
          console.log(planetTypeData?.label);
          if (planetTypeData) {
            setPlanetType(planetTypeData);
            testPlanetRef.current = getTestPlanet();
            setGuiData();
            setCameraPosition();
          }
        });

      folderLayer1ref.current = guiRef.current.addFolder("Layer 1");

      folderLayer1ref.current
        .add(effectControllerOptions, "scale", 1.0, 15.0, 1.0)
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
        .add(effectControllerOptions, "isRigid")
        .onChange(valuesChanger);

      folderLayer1ref.current
        .add(effectControllerOptions, "stretchX", 1.0, 5.0, 1.0)
        .onChange(valuesChanger);

      folderLayer1ref.current
        .add(effectControllerOptions, "stretchY", 1.0, 5.0, 1.0)
        .onChange(valuesChanger);

      folderLayer1ref.current
        .add(effectControllerOptions, "isWarp")
        .onChange(valuesChanger);

      folderLayer1ref.current
        .addColor(effectControllerOptions, "baseColor")
        .onChange(valuesChanger);

      folderLayer1ref.current
        .addColor(effectControllerOptions, "secondColor")
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
    }
    return () => {
      if (guiRef.current) {
        console.log("guiRef.current.destroy");
        guiRef.current.destroy();
      }
    };
  }, []);

  const setCameraPosition = () => {
    if (!cameraControlsRef.current || testPlanetRef.current === null) return;
    camera.position.set(0, 0, -testPlanetRef.current.radius * 3);
    cameraControlsRef.current.target.set(0, 0, 0);
  };

  useEffect(() => {
    setCameraPosition();
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
      <pointLight intensity={1} decay={0} />
      <ambientLight intensity={0.4} />
      {testPlanetRef.current && <TestPlanet />}
    </>
  );
};

export default TestPlanetScene;
