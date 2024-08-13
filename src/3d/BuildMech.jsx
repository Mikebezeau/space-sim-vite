import { forwardRef } from "react";
import { MeshBasicMaterial, Color } from "three";
import { ServoShapes, WeaponShapes } from "../equipment/data/equipShapes";
import { equipList } from "../equipment/data/equipData";

const blueMaterial = new MeshBasicMaterial({
  color: new Color("lightblue"),
});

const directionPointerLeaderMaterial = new MeshBasicMaterial({
  color: new Color("green"),
});

const directionPointerFollowerMaterial = new MeshBasicMaterial({
  color: new Color("red"),
});

const BuildMech = forwardRef(function BuildMech(
  {
    mechBP,
    damageReadoutMode,
    servoHitNames = [],
    drawDistanceLevel = 0,
    servoEditId = null,
    weaponEditId = null,
    editMode = false,
    showAxisLines = false,
    isWireFrame = false,
    isLeader = false,
    handleClick = () => {},
  },
  buildMechForwardRef
) {
  console.log("BuildMech rendered");
  const directionPointerMaterial = isLeader
    ? directionPointerLeaderMaterial
    : directionPointerFollowerMaterial;
  //const axesHelper = new THREE.AxesHelper( 5 );

  /*
  const bmap = useLoader(TextureLoader, "images/maps/mechBumpMap.jpg");
  bmap.repeat.set(1, 1);
  bmap.wrapS = THREE.RepeatWrapping;
  bmap.wrapT = THREE.RepeatWrapping;
  */
  //bmap={mechBP.scale > 3 ? bmap : undefined}
  return (
    <group
      ref={buildMechForwardRef}
      onClick={handleClick}
      scale={editMode ? 2 / equipList.scale.weightMult[mechBP.scale] : 1}
    >
      {mechBP.servoList.map((servo, index) => (
        <group
          key={index}
          position={[servo.offset.x, servo.offset.y, servo.offset.z]}
        >
          <ServoShapes
            name={servo.id + "_servo"}
            damageReadoutMode={damageReadoutMode}
            isWireFrame={isWireFrame}
            isHit={servoHitNames.find((name) => name === servo.id + "_servo")}
            servo={servo}
            drawDistanceLevel={drawDistanceLevel}
            landingBay={mechBP.landingBay}
            landingBayServoLocationId={mechBP.landingBayServoLocationId}
            landingBayPosition={mechBP.landingBayPosition}
            servoEditId={servoEditId}
          />
          {mechBP.servoWeaponList(servo.id).map((weapon, j) => (
            <group
              key={j}
              position={[weapon.offset.x, weapon.offset.y, weapon.offset.z]}
            >
              <WeaponShapes
                name={weapon.id + "_weapon"}
                damageReadoutMode={damageReadoutMode}
                isWireFrame={isWireFrame}
                isHit={servoHitNames.find(
                  (name) => name === weapon.id + "_weapon"
                )}
                weapon={weapon}
                drawDistanceLevel={drawDistanceLevel}
                weaponEditId={weaponEditId}
              />
            </group>
          ))}
        </group>
      ))}
      {(showAxisLines || editMode) && (
        <group scale={mechBP.size() * 0.1}>
          <mesh
            position={[0, 0, 150]}
            rotation={[Math.PI / 2, 0, 0]}
            material={directionPointerMaterial}
          >
            <cylinderGeometry attach="geometry" args={[0.25, 0.25, 300, 4]} />
          </mesh>
          {editMode && (
            <>
              <mesh
                position={[0, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
                material={blueMaterial}
              >
                <cylinderGeometry
                  attach="geometry"
                  args={[0.25, 0.25, 150, 4]}
                />
              </mesh>
              <mesh
                position={[0, 0, 0]}
                rotation={[0, 0, Math.PI / 2]}
                material={blueMaterial}
              >
                <cylinderGeometry
                  attach="geometry"
                  args={[0.25, 0.25, 150, 4]}
                />
              </mesh>
            </>
          )}
        </group>
      )}
    </group>
  );
});

export default BuildMech;
