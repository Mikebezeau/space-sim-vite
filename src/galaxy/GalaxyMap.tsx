import React, { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { extend, useThree, useFrame } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
// EffectComposer loading 1 texture per time GalaxyMap loaded
// move EffectComposerto AppCanvasScene if necessary
//import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import useStore from "../stores/store";
import useGalaxyMapStore from "../stores/galaxyMapStore";
import {
  useMouseDown,
  useMouseUp,
  useMouseMove,
} from "../hooks/controls/useMouseKBControls";
import useTouchController from "../hooks/controls/useTouchController";
import { GALAXY_CORE_RADIUS } from "./galaxyGen";
import { STAR_DISPLAY_MODE } from "./galaxyConstants";
import { IS_MOBILE } from "../constants/constants";
import StarPoints from "./StarPoints";
import isMouseOverStarInfoCard from "../galaxy/isMouseOverStarInfoCard";

import { setCustomData } from "r3f-perf";

extend({ MeshLineGeometry, MeshLineMaterial });

const RAYCAST_LENGTH = 10;
const RAYCAST_THRESHOLD = 1;

const GalaxyMap = () => {
  useStore.getState().updateRenderInfo("GalaxyMap");

  const { camera, scene } = useThree();

  const galaxy = useStore((state) => state.galaxy);

  const VIEW_MODE = { local: 0, full: 1 };
  const viewMode = useRef<number>(VIEW_MODE.local); // galaxy or star

  const controlsRef = useRef<any | null>(null);
  const galaxyRef = useRef<THREE.Group | null>(null);
  const polarGridHelperRef = useRef<THREE.PolarGridHelper | null>(null);
  const centerOnStarIndexRef = useRef<number | null>(null);
  const hoveredStarIndexRef = useRef<number | null>(null);
  const targetStarIndexRef = useRef<number | null>(null);
  const lineToHoveredStarPointRef = useRef<[number, number, number] | null>(
    null
  );
  const lineToTargetStarPointRef = useRef<[number, number, number] | null>(
    null
  );

  const resestControlsCameraPosition = useCallback(() => {
    if (controlsRef.current !== null && galaxyRef.current !== null) {
      controlsRef.current.reset(); // reset camera controls
      camera.position.set(0, 0, -175);
      camera.lookAt(0, 0, 0);
      galaxyRef.current.position.set(0, 0, 0);
      //galaxyRef.current.rotation.set(Math.PI / 4, -Math.PI / 10, 0);
    }
  }, [camera]);

  const StarPointsWithControls = () => {
    useStore.getState().updateRenderInfo("StarPointsWithControls");

    const { getPlayerCurrentStarIndex } = useStore((state) => state.actions);
    const { starSelectedBuffer } = useStore((state) => state.galaxy);

    const {
      getShowInfoTargetStarIndex,
      setShowInfoHoveredStarIndex,
      setShowInfoTargetStarIndex,
    } = useGalaxyMapStore((state) => state.galaxyMapActions);

    const starPointsRef = useRef<THREE.Points | null>(null);
    const mouseMovedStart = useRef(new THREE.Vector2(0, 0));
    const mouseMovedEnd = useRef(new THREE.Vector2(0, 0));
    const mouseButtonDown = useRef(false);
    const raycaster = useRef(new THREE.Raycaster());
    const fromDistanceCheckVec3 = useRef(new THREE.Vector3());
    const toDistanceCheckVec3 = useRef(new THREE.Vector3());

    const viewSelectedStar = useCallback((starPointIndex: number) => {
      if (galaxyRef.current === null) return;
      resestControlsCameraPosition(); // reset controls, camera and galaxy positions
      const centerOnStarPosition = galaxy.getStarBufferPosition(starPointIndex);
      if (centerOnStarPosition) {
        galaxyRef.current.position.set(
          -centerOnStarPosition.x,
          -centerOnStarPosition.y,
          -centerOnStarPosition.z
        ); // move galaxy relative to selected star position. selected star is shown at pos (0,0,0)

        camera.position.setZ(-(RAYCAST_THRESHOLD + 2)); // move camera closer to star to inspect
      }
    }, []);

    const setStarSelectionBuffer = (starSelectionValue: number) => {
      starSelectedBuffer.array = starSelectedBuffer.array.map(
        () => starSelectionValue
      );
    };

    // these stars are within range of player to select
    const setSecondarySelectedStars = useCallback((starPointIndex) => {
      const centerOnStarPosition = galaxy.getStarBufferPosition(starPointIndex);
      if (!centerOnStarPosition) return;
      fromDistanceCheckVec3.current.copy(centerOnStarPosition);

      starSelectedBuffer.array.forEach((_, index) => {
        const secondaryStarPosition = galaxy.getStarBufferPosition(index);
        if (!secondaryStarPosition) return;
        toDistanceCheckVec3.current.copy(secondaryStarPosition);
        const distance = fromDistanceCheckVec3.current.distanceTo(
          toDistanceCheckVec3.current
        );
        if (distance < RAYCAST_THRESHOLD) {
          starSelectedBuffer.array[index] = STAR_DISPLAY_MODE.secondarySelected;
        }
      });
    }, []);

    const viewPlayerStar = () => {
      const playerCurrentStarIndex = getPlayerCurrentStarIndex();
      if (playerCurrentStarIndex !== null && starPointsRef.current !== null) {
        // dim all stars
        setStarSelectionBuffer(STAR_DISPLAY_MODE.dim);
        viewSelectedStar(playerCurrentStarIndex);
        // set secondary selected stars to secondary selected mode
        // these are stars within close proximity to selected star
        setSecondarySelectedStars(playerCurrentStarIndex);
        // overwrite current selected star (star player is at) to selected mode after secondary selected stars are set
        starSelectedBuffer.array[playerCurrentStarIndex] =
          STAR_DISPLAY_MODE.selected;
        // set centerOnStarIndexRef to selected star for line drawing
        centerOnStarIndexRef.current = playerCurrentStarIndex;
        // reset target star player was looking at last time viewing galaxy map
        targetStarIndexRef.current = getShowInfoTargetStarIndex();
        if (targetStarIndexRef.current) {
          // must set the hovered and target star index
          hoveredStarIndexRef.current = targetStarIndexRef.current;
          // set target star line
          setSelectedTargetStar();
        }
        // update star points aSelected attribute
        updateStarPointsSelectedAttribute();
      } else resestControlsCameraPosition();
    };

    useEffect(() => {
      viewPlayerStar();
    }, [starPointsRef.current]);

    const getRaycasterIntersects = (
      e: { clientX: number; clientY: number },
      threshold: number
    ) => {
      raycaster.current.params.Points.threshold = threshold;
      raycaster.current.far = RAYCAST_LENGTH;
      const pointer = new THREE.Vector2();
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.current.setFromCamera(pointer, camera);
      const intersects = raycaster.current.intersectObjects(
        scene.children,
        true
      );
      return intersects;
    };

    const getClosestIntersect = (
      intersects: any,
      limitPrimarySecondarySelected = false
    ) => {
      if (intersects.length === 0) return null;
      const closest = intersects.reduce((min, intersect) => {
        return intersect.distanceToRay < min.distanceToRay &&
          (!limitPrimarySecondarySelected ||
            starSelectedBuffer.array[intersect.index] ===
              STAR_DISPLAY_MODE.secondarySelected ||
            // if user is hovering over selected star, allow selection
            starSelectedBuffer.array[intersect.index] ===
              STAR_DISPLAY_MODE.selected)
          ? intersect
          : min;
      });
      if (
        limitPrimarySecondarySelected &&
        starSelectedBuffer.array[closest.index] !==
          STAR_DISPLAY_MODE.secondarySelected &&
        starSelectedBuffer.array[closest.index] !== STAR_DISPLAY_MODE.selected
      )
        return null;
      else return closest;
    };

    /*
    // this is to select stars from a full galaxy view
    const setStarRaycastSelection = (e) => {
      const intersects = getRaycasterIntersects(e, RAYCAST_THRESHOLD);
      // primary selected star set to star closest to raycaster ray
      centerOnStarIndexRef.current = getClosestIntersect(intersects);
      if (centerOnStarIndexRef.current) {
        // set all stars to dim mode
        setStarSelectionBuffer(STAR_DISPLAY_MODE.dim);
        starSelectedBuffer.array[centerOnStarIndexRef.current] =
          STAR_DISPLAY_MODE.selected;
        // secondary selected stars in close proximity
        const centerOnStarPosition = galaxy.getStarBufferPosition(
          centerOnStarIndexRef.current
        );
        // check all stars intersecting with raycaster ray for distance to selected star
        // calculated with starCoordsBuffer for accurate coordinates - raycaster ray not achieving accurate results
        const secondaryStarPosition = new THREE.Vector3();
        intersects.forEach((intersect) => {
          secondaryStarPosition.copy(galaxy.getStarBufferPosition(intersect.index));
          // secondary star selections are stars close to selected star
          if (intersect.index !== centerOnStarIndexRef.current) {
            const distance = centerOnStarPosition.distanceTo(
              secondaryStarPosition
            );
            if (distance < RAYCAST_THRESHOLD) {
              starSelectedBuffer.array[intersect.index] =
                STAR_DISPLAY_MODE.secondarySelected;
            }
          // else {
            //console.log("distance", distance, intersect.point);
            //starSelectedBuffer.array[intersect.index] =
            //  STAR_DISPLAY_MODE.tertiarySelected;
          //} // tertiary selection for debugging
          }
        });
        // set view to selected star
        viewSelectedStar(centerOnStarIndexRef.current);
      }
    };
    */

    const updateStarPointsSelectedAttribute = () => {
      // update star points aSelected attribute
      if (starPointsRef.current === null) return;
      starPointsRef.current.geometry.setAttribute(
        "aSelected",
        starSelectedBuffer
      );
      starPointsRef.current.geometry.attributes.aSelected.needsUpdate = true;
    };

    const setHoveredSelectedStar = (e) => {
      if (e && isMouseOverStarInfoCard(e)) {
        hoveredStarIndexRef.current = null;
        setShowInfoHoveredStarIndex(null);
        lineToHoveredStarPointRef.current = null;
        return;
      }
      // stupid way to stop triggering selection event when trying to exit screen
      if (mouseMovedEnd.current.x < 170 && mouseMovedEnd.current.y < 200) {
        return;
      }
      if (centerOnStarIndexRef.current && !mouseButtonDown.current) {
        const intersects = getRaycasterIntersects(e, RAYCAST_THRESHOLD / 4);
        // get hovered over star to draw a line to
        const limitPrimarySecondarySelected = true;
        const hoveredStar = getClosestIntersect(
          intersects,
          limitPrimarySecondarySelected
        );
        if (hoveredStar) {
          // setting hoveredStarIndexRef and lineToHoveredStarPointRef for line drawing
          hoveredStarIndexRef.current = hoveredStar.index;
          setShowInfoHoveredStarIndex(hoveredStar.index); // to show star info card in GalaxyMapHud/StarInfoCard
          // offest galaxyRef.current.position since galaxy is moved so that
          // the main central star (current player position) is moved to (0,0,0) for inspection
          const hoveredStarPosition = galaxy.getStarBufferPosition(
            hoveredStar.index
          );
          if (hoveredStarPosition && galaxyRef.current) {
            lineToHoveredStarPointRef.current = [
              hoveredStarPosition.x + galaxyRef.current.position.x,
              hoveredStarPosition.y + galaxyRef.current.position.y,
              hoveredStarPosition.z + galaxyRef.current.position.z,
            ];
          }
        } else {
          // clear hovered star if no star is hovered over
          hoveredStarIndexRef.current = null;
          // clear star info card (store state)
          setShowInfoHoveredStarIndex(null);
          // clear line if no star is hovered over
          lineToHoveredStarPointRef.current = null;
        }
      }
    };

    // TODO: on hover highlight star, on click select star
    // change hovered star to  selected star
    // on mobile we set and check for hovered star existance before setSelectedTargetStar
    const setSelectedTargetStar = (
      e: { clientX: number; clientY: number } | null = null
    ) => {
      if (e && isMouseOverStarInfoCard(e)) {
        return;
      }
      // clear line to hovered over star position
      lineToHoveredStarPointRef.current = null;
      if (hoveredStarIndexRef.current !== null) {
        // clear old target star selection
        if (targetStarIndexRef.current !== null) {
          starSelectedBuffer.array[targetStarIndexRef.current] =
            STAR_DISPLAY_MODE.secondarySelected;
        }
        targetStarIndexRef.current = hoveredStarIndexRef.current;
        // set target star line
        const targetStarPosition = galaxy.getStarBufferPosition(
          targetStarIndexRef.current
        );
        // offset by galaxy position (centered on current player star position)
        if (targetStarPosition && galaxyRef.current) {
          lineToTargetStarPointRef.current = [
            targetStarPosition.x + galaxyRef.current.position.x,
            targetStarPosition.y + galaxyRef.current.position.y,
            targetStarPosition.z + galaxyRef.current.position.z,
          ];
        }
        // new target star selection (makes star green)
        starSelectedBuffer.array[targetStarIndexRef.current] =
          STAR_DISPLAY_MODE.selected;
        // set target star index
        setShowInfoTargetStarIndex(targetStarIndexRef.current);
      } /* else {
        // this allows player to select a star when viewing full galaxy map
        // select primary and secondary stars with raycaster
        // might not need this at all
        // setStarRaycastSelection(e);
      }*/
      // update star points aSelected buffer attribute
      updateStarPointsSelectedAttribute();
    };

    const viewGalaxy = () => {
      setStarSelectionBuffer(STAR_DISPLAY_MODE.unselected);
      centerOnStarIndexRef.current = null;
      hoveredStarIndexRef.current = null;
      targetStarIndexRef.current = null;
      lineToTargetStarPointRef.current = null;
      resestControlsCameraPosition();
      // update star points aSelected attribute
      updateStarPointsSelectedAttribute();
    };

    const handleMouseDown = (e) => {
      mouseButtonDown.current = true;
      mouseMovedStart.current.set(e.clientX, e.clientY);
    };

    useMouseDown(handleMouseDown);
    useMouseMove((e) => {
      if (isMouseOverStarInfoCard(e)) {
        if (targetStarIndexRef.current !== null) {
          // if a star has been selected, clear the hovered star index and show the selected star data
          setShowInfoHoveredStarIndex(null);
          // also clear the line to hovered star
          lineToHoveredStarPointRef.current = null;
        }
        return;
      }
      mouseMovedEnd.current.set(e.clientX, e.clientY);
      setHoveredSelectedStar(e);
    });

    useMouseUp((e) => {
      // only activate on right/left click
      if (e.button !== 0 && e.button !== 2) return;

      mouseButtonDown.current = false;
      // only activate if mouse/finger not moved to control camera
      mouseMovedEnd.current.set(e.clientX, e.clientY);
      if (mouseMovedStart.current.distanceTo(mouseMovedEnd.current) > 10) {
        return;
      }

      if (e.button === 2) {
        if (viewMode.current === VIEW_MODE.local) {
          // right click to view full galaxy map
          viewMode.current = VIEW_MODE.full;
          viewGalaxy();
        } else {
          // right click to view local star map
          viewMode.current = VIEW_MODE.local;
          viewPlayerStar();
        }
      } else {
        // set selected star if left mouse button is clicked
        setSelectedTargetStar(e);
      }
    });

    useTouchController("root", {
      touchStart: (evt: TouchEvent, touch: Touch) => {
        handleMouseDown(touch);
      },
      touchEnd: (evt: TouchEvent, touch: Touch) => {
        mouseButtonDown.current = false;
        mouseMovedEnd.current.set(touch.clientX, touch.clientY);
        if (mouseMovedStart.current.distanceTo(mouseMovedEnd.current) > 10) {
          // not triggering selection of star if moving finger to rotate view
          return;
        }
        // must set hovered star before setting selected star
        setHoveredSelectedStar(touch);
        setSelectedTargetStar(touch);
      },
    });

    return <StarPoints ref={starPointsRef} />;
  };

  interface LineInt {
    color: string;
    pointRef: React.MutableRefObject<[number, number, number] | null>;
  }
  const Line = (props: LineInt) => {
    const { color, pointRef } = props;
    const lineRef = useRef<MeshLineGeometry>(null);
    const previousPoint = useRef<[number, number, number] | null>(null);

    useFrame(() => {
      if (lineRef.current) {
        const point = pointRef.current;
        // update line geometry if lineToHoveredStarPointRef has changed and is not empty
        if (previousPoint.current !== point) {
          previousPoint.current = point;
          // create line vectors from point array
          // this creates a line from selected star to all stars in lineToHoveredStarPointRef.current array
          const lineVectors: THREE.Vector3[] = [];
          if (point) {
            const centerPoint = new THREE.Vector3(0, 0, 0);
            const endPoint = new THREE.Vector3(...point);
            // setting midPoint to create an diamond arrow shaped line
            const direction = new THREE.Vector3()
              .subVectors(endPoint, centerPoint)
              .normalize();
            const distance = centerPoint.distanceTo(endPoint);
            const midPointDistance = Math.min(0.2, distance / 3);
            const midPoint = new THREE.Vector3().addVectors(
              centerPoint,
              direction.multiplyScalar(midPointDistance)
            );

            lineVectors.push(centerPoint, midPoint, endPoint);
          }
          const midLineWidth = IS_MOBILE ? 2 : 1;
          // p is a decimal percentage of the number of points
          lineRef.current.setPoints(lineVectors, (p) => {
            return p === 0 ? 0 : p === 0.5 ? midLineWidth : 0; // setting width of meshLine at mid point to make an arrow shape
          });
        }
      }
    });
    // frustrumCulled={false} is required for line to be visible when camera is close to line
    //@ts-nocheck
    return (
      <mesh frustumCulled={false}>
        {/*@ts-ignore*/}
        <meshLineGeometry ref={lineRef} />
        {/*@ts-ignore*/}
        <meshLineMaterial
          color={color}
          lineWidth={0.05}
          sizeAttenuation={false}
        />
      </mesh>
    );
  };

  const posZero = new THREE.Vector3(0, 0, 0);
  const fadeDenominator = 500; //GALAXY_CORE_RADIUS / 2.0;
  //const test = 1.0 - dist / fadeDenominator;

  useFrame(() => {
    // test
    const dist = camera.position.distanceTo(posZero);
    setCustomData(1.0 - dist / fadeDenominator);

    if (polarGridHelperRef.current) {
      polarGridHelperRef.current.quaternion.copy(camera.quaternion);
      // rotate polarGridHelper to be perpendicular to camera
      polarGridHelperRef.current.rotateX(Math.PI / 2);
    }
    useStore.getState().starPointsShaderMaterial.uniforms.uCameraDist.value =
      camera.position.distanceTo(posZero); // used in starPointsShader to fade stars based on distance from camera
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      {/*<pointLight position={[0, 0, 0]} />*/}
      <TrackballControls ref={controlsRef} rotateSpeed={3} panSpeed={0.5} />

      <group ref={galaxyRef}>
        <StarPointsWithControls />
      </group>
      <polarGridHelper
        ref={polarGridHelperRef}
        args={[1, 16, 8, 64, 0x333333, 0x666666]}
      />
      <Line color={"grey"} pointRef={lineToHoveredStarPointRef} />
      <Line color={"green"} pointRef={lineToTargetStarPointRef} />
      {/*
      <EffectComposer>
        <Bloom
          luminanceThreshold={0}
          luminanceSmoothing={0.9}
          height={400}
          intensity={2}
          radius={2}
        />
      </EffectComposer>
      */}
    </>
  );
};

export default GalaxyMap;

/*
<EffectComposer>
  <Glitch
    strength={[0.01, 0.02]} // min and max glitch strength
    mode={GlitchMode.CONSTANT_MILD} // glitch mode
    active // turn on/off the effect (switches between "mode" prop and GlitchMode.DISABLED)
    ratio={0.85} // Threshold for strong glitches, 0 - no weak glitches, 1 - no strong glitches.
  />
<EffectComposer/>
*/
