import React, { useEffect, useCallback, useRef, Fragment } from "react";
import { useThree } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import useEquipStore, { EDIT_MENU_SELECT } from "../../stores/equipStore";
//import BuildMech from "./BuildMech";
//import { fitCameraToObject } from "../../util/gameUtil";

const MechDisplay = () => {
  // seperate component to display the mech and update on changes
  // updateState is used to force a re-render of the component when
  // the class is updated in the store (useEquipStore)
  const updateState = useEquipStore((state) => state.updateState);
  // do not delete ^
  const { gl, size } = useThree();
  const editorMechBP = useEquipStore((state) => state.editorMechBP);
  const editPartId = useEquipStore((state) => state.editPartId);
  const editPartMenuSelect = useEquipStore((state) => state.editPartMenuSelect);

  useEffect(() => {
    // Define the scissor and viewport to half of the screen
    if (size.width >= 1024) {
      gl.setViewport(size.width / 4, 0, size.width, size.height);
    } else {
      gl.setViewport(0, -size.height / 4, size.width, size.height);
    }

    return () => {
      gl.setViewport(0, 0, size.width, size.height);
    };
  }, [size]);

  return (
    <>
      {editorMechBP ? (
        <>
          {/*}
          <BuildMech
            mechBP={editorMechBP}
            editPartId={
              // show real part color when changing color in edit menu
              editPartMenuSelect === EDIT_MENU_SELECT.color ? "" : editPartId
            }
            editMode={true}
          />*/}
          <object3D
            ref={(mechRef) => {
              if (mechRef) {
                editorMechBP.buildObject3d(
                  mechRef,
                  // if changing part color - do not pass editPartId
                  // so that the color selection is reflected in build
                  // instead of part selection highlight color
                  editPartMenuSelect === EDIT_MENU_SELECT.color
                    ? ""
                    : editPartId
                );
              }
            }}
          />
          <axesHelper args={[editorMechBP.size() * 2]} />
          {editorMechBP.weaponList.map((weapon) => (
            // weapon fire position / direction lines for selected weapon
            // check if child part is selected
            <Fragment key={weapon.id}>
              {(editPartId === weapon.id ||
                editorMechBP.isPartContainsId(weapon, editPartId)) && (
                <axesHelper
                  key={weapon.id}
                  args={[weapon.size()]}
                  position={[weapon.offset.x, weapon.offset.y, weapon.offset.z]}
                />
              )}
            </Fragment>
          ))}
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default function BuildMechEquipment() {
  const isResetCamera = useEquipStore((state) => state.isResetCamera);
  const resetCamera = useEquipStore((state) => state.resetCamera);
  const cameraZoom = useEquipStore((state) => state.cameraZoom);
  const { camera } = useThree();
  const cameraControlsRef = useRef<any>(null);

  // callback to reset camera position
  const resestControlsCameraPosition = useCallback(() => {
    if (cameraControlsRef.current !== null) {
      cameraControlsRef.current.reset();
      //fitCameraToObject(camera, cameraControlsRef.current, 0.5);
      camera.position.set(0, 0, cameraZoom);
      camera.lookAt(0, 0, 0);
      resetCamera(false);
    }
  }, [camera, cameraZoom, isResetCamera, resetCamera]);

  useEffect(() => {
    resestControlsCameraPosition();
  }, [resestControlsCameraPosition]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight intensity={0.5} decay={0} position={[-10000, 10000, 0]} />
      <pointLight intensity={0.5} decay={0} position={[10000, -10000, 0]} />
      <TrackballControls
        ref={(controlsRef) => {
          cameraControlsRef.current = controlsRef;
          resestControlsCameraPosition();
        }}
        rotateSpeed={1.5}
        panSpeed={0.5}
      />
      <group
        position={[0, 0, 0]}
        rotation={[-Math.PI * 0.25, Math.PI * 1.25, 0]}
      >
        <MechDisplay />
      </group>
    </>
  );
}
