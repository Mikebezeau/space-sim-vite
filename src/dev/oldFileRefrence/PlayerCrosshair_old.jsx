import { useEffect, useRef } from "react";
import * as THREE from "three";
import useStore from "../../../stores/store";
import usePlayerControlsStore from "../../../stores/playerControlsStore";
import { setVisible } from "../../../util/gameUtil";
import { PLAYER } from "../../../constants/constants";

const lightgreen = new THREE.Color("lightgreen");
//const hotpink = new THREE.Color("hotpink");
const crossMaterial = new THREE.MeshBasicMaterial({
  color: lightgreen,
  fog: false,
});

const PlayerCrossHair = () => {
  useStore.getState().updateRenderInfo("PlayerCrossHair");
  const playerActionMode = usePlayerControlsStore(
    (state) => state.playerActionMode
  );

  const cross = useRef();
  //const target = useRef();

  useEffect(() => {
    const isVisible = playerActionMode !== PLAYER.action.inspect;
    setVisible(cross.current, isVisible);
    //setVisible(target, isVisible);
  }, [playerActionMode]);

  return (
    <>
      <group ref={cross} position={[0, 0, 300]} name="cross">
        <mesh renderOrder={1000} material={crossMaterial}>
          <boxGeometry attach="geometry" args={[20, 1, 1]} />
        </mesh>
        <mesh renderOrder={1000} material={crossMaterial}>
          <boxGeometry attach="geometry" args={[1, 20, 1]} />
        </mesh>
      </group>
      {/*
      <group ref={target} position={[0, 0, 300]} name="target">
        <mesh position={[0, 20, 0]} renderOrder={1000} material={crossMaterial}>
          <boxGeometry attach="geometry" args={[40, 1, 1]} />
        </mesh>
        <mesh
          position={[0, -20, 0]}
          renderOrder={1000}
          material={crossMaterial}
        >
          <boxGeometry attach="geometry" args={[40, 1, 1]} />
        </mesh>
        <mesh position={[20, 0, 0]} renderOrder={1000} material={crossMaterial}>
          <boxGeometry attach="geometry" args={[1, 40, 1]} />
        </mesh>
        <mesh
          position={[-20, 0, 0]}
          renderOrder={1000}
          material={crossMaterial}
        >
          <boxGeometry attach="geometry" args={[1, 40, 1]} />
        </mesh>
      </group>
      */}
    </>
  );
};

export default PlayerCrossHair;
