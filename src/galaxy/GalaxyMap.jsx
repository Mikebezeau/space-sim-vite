import { useCallback, useEffect, memo, useRef, Suspense } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
//import { CompositionShader } from "./compositionShader.js";
//import { /*BlendFunction,*/ GlitchMode } from "postprocessing";
import {
  EffectComposer,
  //Scanline,
  //Vignette,
  Bloom,
  //Glitch,
  //Noise
} from "@react-three/postprocessing";
import useStore from "../stores/store";
import {
  useMouseUp,
  useMouseDown,
  useMouseMove,
} from "../hooks/controls/useMouseKBControls";
//import { generateGalaxy } from "./galaxyUtils";
import { STAR_DISPLAY_MODE } from "./galaxyConstants";
import StarPoints from "./StarPoints";

/*
function Box(props) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef();
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}
*/

const RAYCAST_THRESHOLD = 1;

const PreGalaxyMap = () => {
  console.log("GalaxyMap rendered");
  const { camera, scene } = useThree();
  const controlsRef = useRef(null);
  const galaxyRef = useRef(null);
  const selectedStarRef = useRef(null);
  const hoveredStarIndexRef = useRef(null);
  const warpToStarIndexRef = useRef(null);
  const lineToPointsRef = useRef([]);
  const lineToWarpPointsRef = useRef([]);

  const resestControlsCameraPosition = useCallback(() => {
    controlsRef.current.reset(); // reset camera controls
    camera.position.set(0, 0, -175);
    camera.lookAt(0, 0, 0);
    galaxyRef.current.position.set(0, 0, 0);
    //galaxyRef.current.rotation.set(Math.PI / 4, -Math.PI / 10, 0);
  }, [camera]);

  const StarPointsWithControls = () => {
    console.log("StarPointsWithControls rendered");
    const { getSelectedStar, setSelectedWarpStar } = useStore(
      (state) => state.actions
    );
    const { starCoordsBuffer, starSelectedBuffer } = useStore(
      (state) => state.galaxy
    );

    const starPointsRef = useRef(null);
    const mouseMoved = useRef(false);
    const mouseButtonDown = useRef(false);

    const getStarBufferPoisition = useCallback(
      (index) => {
        return new THREE.Vector3(
          starCoordsBuffer.array[index * 3],
          starCoordsBuffer.array[index * 3 + 1],
          starCoordsBuffer.array[index * 3 + 2]
        );
      },
      [starCoordsBuffer.array]
    );

    const viewSelectedStar = useCallback(
      (starPointIndex) => {
        resestControlsCameraPosition(); // reset controls, camera and galaxy positions
        const selectedStarPosition = getStarBufferPoisition(starPointIndex);
        galaxyRef.current.position.set(
          -selectedStarPosition.x,
          -selectedStarPosition.y,
          -selectedStarPosition.z
        ); // move galaxy to position selected star at (0,0,0)
        camera.position.setZ(-(RAYCAST_THRESHOLD + 2)); // move camera closer to star to inspect
      },
      [getStarBufferPoisition]
    );

    const setStarSelectionBuffer = (value) => {
      starSelectedBuffer.array = starSelectedBuffer.array.map(() => value);
    };

    const setSecondarySelectedStars = useCallback((starPointIndex) => {
      const selectedStarPosition = getStarBufferPoisition(starPointIndex);
      const secondaryStarPosition = new THREE.Vector3();
      starSelectedBuffer.array.forEach((_, index) => {
        secondaryStarPosition.copy(getStarBufferPoisition(index));
        const distance = selectedStarPosition.distanceTo(secondaryStarPosition);
        if (distance < RAYCAST_THRESHOLD) {
          starSelectedBuffer.array[index] = STAR_DISPLAY_MODE.secondarySelected;
        }
      });
    }, []);

    useEffect(() => {
      const selectedStarIndex = getSelectedStar();
      if (selectedStarIndex !== null) {
        // dim all stars
        setStarSelectionBuffer(STAR_DISPLAY_MODE.dim);
        viewSelectedStar(selectedStarIndex);
        // set secondary selected stars to secondary selected mode
        setSecondarySelectedStars(selectedStarIndex);
        // set players star to selected mode after secondary selected stars are set
        starSelectedBuffer.array[selectedStarIndex] =
          STAR_DISPLAY_MODE.selected;
        // set selectedStarRef to selected star for line drawing
        selectedStarRef.current = { index: selectedStarIndex };
        // update star points aSelected attribute
        updateStarPointsSelectedAttribute();
      } else resestControlsCameraPosition();
    }, []);

    const getRaycasterIntersects = (e, threshold) => {
      const raycaster = new THREE.Raycaster();
      raycaster.params.Points.threshold = threshold;
      const pointer = new THREE.Vector2();
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      return intersects;
    };

    const getClosestIntersect = (
      intersects,
      limitSecondarySelected = false
    ) => {
      if (intersects.length === 0) return null;
      const closest = intersects.reduce((min, intersect) => {
        return intersect.distanceToRay < min.distanceToRay &&
          (!limitSecondarySelected ||
            starSelectedBuffer.array[intersect.index] ===
              STAR_DISPLAY_MODE.secondarySelected)
          ? intersect
          : min;
      });
      if (
        limitSecondarySelected &&
        starSelectedBuffer.array[closest.index] !==
          STAR_DISPLAY_MODE.secondarySelected
      )
        return null;
      else return closest;
    };

    const setStarRaycastSelection = (e) => {
      const intersects = getRaycasterIntersects(e, RAYCAST_THRESHOLD);
      // primary selected star set to star closest to raycaster ray
      selectedStarRef.current = getClosestIntersect(intersects);
      if (selectedStarRef.current) {
        // set all stars to dim mode
        setStarSelectionBuffer(STAR_DISPLAY_MODE.dim);
        starSelectedBuffer.array[selectedStarRef.current.index] =
          STAR_DISPLAY_MODE.selected;
        // secondary selected stars in close proximity
        const selectedStarPosition = getStarBufferPoisition(
          selectedStarRef.current.index
        );
        // check all stars intersecting with raycaster ray for distance to selected star
        // calculated with starCoordsBuffer for accurate coordinates - raycaster ray not achieving accurate results
        const secondaryStarPosition = new THREE.Vector3();
        intersects.forEach((intersect) => {
          secondaryStarPosition.copy(getStarBufferPoisition(intersect.index));
          // secondary star selections are stars close to selected star
          if (intersect.index !== selectedStarRef.current.index) {
            const distance = selectedStarPosition.distanceTo(
              secondaryStarPosition
            );
            if (distance < RAYCAST_THRESHOLD) {
              starSelectedBuffer.array[intersect.index] =
                STAR_DISPLAY_MODE.secondarySelected;
            } /* else {
          //console.log("distance", distance, intersect.point);
          starSelectedBuffer.array[intersect.index] =
            STAR_DISPLAY_MODE.tertiarySelected;
        }*/ // tertiary selection for debugging
          }
        });
        // set view to selected star
        viewSelectedStar(selectedStarRef.current.index);
        // warp ship to selected star system
        //setSelectedStar(selectedStarRef.current.index);
      }
    };

    const updateStarPointsSelectedAttribute = () => {
      // update star points aSelected attribute
      starPointsRef.current.geometry.setAttribute(
        "aSelected",
        starSelectedBuffer
      );
      starPointsRef.current.geometry.attributes.aSelected.needsUpdate = true;
    };

    const handleMouseUp = (e) => {
      // only activate on right/left click, and mouse not moved to control camera
      if ((e.button !== 0 && e.button !== 2) || mouseMoved.current === true)
        return;

      // clear line
      lineToPointsRef.current = [];
      // right click to clear selection
      if (e.button === 2) {
        setStarSelectionBuffer(STAR_DISPLAY_MODE.unselected);
        selectedStarRef.current = null;
        hoveredStarIndexRef.current = null;
        warpToStarIndexRef.current = null;
        lineToWarpPointsRef.current = [];
        resestControlsCameraPosition();
      }
      // only activate selection if left mouse button is clicked
      else {
        if (hoveredStarIndexRef.current !== null) {
          // clear old warp to selection
          if (warpToStarIndexRef.current !== null) {
            starSelectedBuffer.array[warpToStarIndexRef.current] =
              STAR_DISPLAY_MODE.secondarySelected;
          }
          warpToStarIndexRef.current = hoveredStarIndexRef.current;
          // set warp to line
          const warpToStarPosition = getStarBufferPoisition(
            warpToStarIndexRef.current
          );
          console.log(warpToStarIndexRef.current, warpToStarPosition);
          lineToWarpPointsRef.current = [
            [
              warpToStarPosition.x + galaxyRef.current.position.x,
              warpToStarPosition.y + galaxyRef.current.position.y,
              warpToStarPosition.z + galaxyRef.current.position.z,
            ],
          ];
          // new warp to selection
          starSelectedBuffer.array[warpToStarIndexRef.current] =
            STAR_DISPLAY_MODE.selected;
          // set warp target star index
          setSelectedWarpStar(warpToStarIndexRef.current);
        } else {
          setStarRaycastSelection(e);
        }
      }
      // update star points aSelected attribute
      updateStarPointsSelectedAttribute();
    };

    useMouseUp((e) => {
      mouseButtonDown.current = false;
      handleMouseUp(e);
    });

    useMouseDown(() => {
      mouseButtonDown.current = true;
      mouseMoved.current = false;
    });

    useMouseMove((e) => {
      mouseMoved.current = true;
      if (selectedStarRef.current && !mouseButtonDown.current) {
        const intersects = getRaycasterIntersects(e, RAYCAST_THRESHOLD / 4);
        // get hovered over star to draw a line to
        const limitSecondarySelected = true;
        const hoveredStar = getClosestIntersect(
          intersects,
          limitSecondarySelected
        );
        if (hoveredStar) {
          // set hoveredStarIndexRef to hovered star, user can select with mouse click
          hoveredStarIndexRef.current = hoveredStar.index;
          // offest galaxyRef.current.position for when inspecting selected star
          // selected star is moved to (0,0,0) for inspection
          const hoveredStarPosition = getStarBufferPoisition(hoveredStar.index);
          lineToPointsRef.current = [
            [
              hoveredStarPosition.x + galaxyRef.current.position.x,
              hoveredStarPosition.y + galaxyRef.current.position.y,
              hoveredStarPosition.z + galaxyRef.current.position.z,
            ],
          ];
        } else {
          lineToPointsRef.current = [];
        }
      }
    });

    /*
    useFrame((state) => {
      //const { clock } = state;
      //starPointsRef.current.material.uniforms.uTime.value = clock.elapsedTime;
    });
    */

    return <StarPoints ref={starPointsRef} />;
  };

  const Line = ({ color, type }) => {
    console.log("Line rendered");
    const lineRef = useRef();
    const prePoints = useRef([]);

    useFrame(() => {
      const points =
        type === 0 ? lineToPointsRef.current : lineToWarpPointsRef.current;
      // update line geometry if lineToPointsRef has changed and is not empty
      if (prePoints.current !== points) {
        prePoints.current = points;
        // create line vectors from points array
        // this creates a line from selected star to all stars in lineToPointsRef.current array
        const lineVectors = [];
        points.forEach((point) =>
          lineVectors.push(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(...point)
          )
        );
        lineRef.current.geometry.setFromPoints(lineVectors);
      }
    });
    // frustrumCulled={false} is required for line to be visible when camera is close to line
    return (
      <line ref={lineRef} frustrumCulled={false}>
        <bufferGeometry />
        <lineBasicMaterial color={color} />
      </line>
    );
  };

  return (
    <>
      <ambientLight intensity={0.9} />
      {/*<pointLight position={[0, 0, 0]} />*/}
      <TrackballControls ref={controlsRef} rotateSpeed={3} panSpeed={0.5} />
      {/*<Box position={[3, 3, 10]} />*/}
      <group ref={galaxyRef}>
        <Suspense>
          <StarPointsWithControls />
        </Suspense>
      </group>
      <Line color={"hotpink"} type={0} />
      <Line color={"blue"} type={1} />
      <EffectComposer>
        {/*<Glitch
          strength={[0.01, 0.02]} // min and max glitch strength
          mode={GlitchMode.CONSTANT_MILD} // glitch mode
          active // turn on/off the effect (switches between "mode" prop and GlitchMode.DISABLED)
          ratio={0.85} // Threshold for strong glitches, 0 - no weak glitches, 1 - no strong glitches.
        />*/}
        <Bloom
          luminanceThreshold={0}
          luminanceSmoothing={0.9}
          height={400}
          intensity={2}
          radius={2}
        />
      </EffectComposer>
    </>
  );
};

const GalaxyMap = memo(PreGalaxyMap);
export default GalaxyMap;
