import {
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import BuildMech from "../3d/BuildMech";
import useEnemyStore from "../stores/enemyStore";

export default function EnemyTestScene() {
  console.log("EnemyTest Scene rendered");
  const { camera } = useThree();
  const enemies = useEnemyStore((state) => state.enemies);
  const controlsRef = useRef(null);
  const enemyMechRefs = useRef(new Array());

  const resestControlsCameraPosition = useCallback(() => {
    controlsRef.current.reset(); // reset camera controls
    camera.position.set(0, 0, -750);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useEffect(() => {
    resestControlsCameraPosition();
    enemies.map((enemy) => {
      enemy.object3d.position.set(
        Math.random() * 500 - 250,
        Math.random() * 500 - 250,
        Math.random() * 500 - 250
      );
    });
    //console.log(enemies.current);
  }, []);
  /*
let geoms=[]
let meshes=[]
clone.updateMatrixWorld(true,true)
clone.traverse(e=>e.isMesh && meshes.push(e) && (geoms.push(( e.geometry.index ) ? e.geometry.toNonIndexed() : e.geometry().clone())))
geoms.forEach((g,i)=>g.applyMatrix4(meshes[i].matrixWorld));
let gg = BufferGeometryUtils.mergeBufferGeometries(geoms,true)
gg.applyMatrix4(clone.matrix.clone().invert());
gg.userData.materials = meshes.map(m=>m.material);
*/

  useFrame(() => {
    enemies.map((enemy, index) => {
      enemy.setHitBox(enemyMechRefs.current[index]);
      enemy.object3d.translateZ(0.1);
      enemyMechRefs.current[index].position.copy(enemy.object3d.position);
    });
  });

  return (
    <>
      <ambientLight intensity={1} />
      <fog attach="fog" args={["#2A3C47", 100, 1500]} />
      <TrackballControls ref={controlsRef} rotateSpeed={3} panSpeed={0.5} />
      {enemies.map((enemyMech, index) => (
        <Fragment key={enemyMech.id}>
          {enemyMech.hitBox ? (
            <box3Helper box={enemyMech.hitBox} color={0xffff00} />
          ) : null}
          <EnemyMech
            ref={(mechRef) => (enemyMechRefs.current[index] = mechRef)}
            mechBP={enemyMech.mechBP}
          />
        </Fragment>
      ))}
    </>
  );
}

const EnemyMech = forwardRef(function Enemy(props, buildMechForwardRef) {
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  return (
    <BuildMech
      {...props}
      isWireFrame={clicked}
      ref={buildMechForwardRef}
      handleClick={() => click(!clicked)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
    />
  );
});
