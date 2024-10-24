import { forwardRef } from "react";
import { MeshBasicMaterial, Color, RepeatWrapping } from "three";
import useEquipStore from "../../stores/equipStore";
import { ServoShapes, WeaponShapes } from "./equipShapes";

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
    flatShading = true,
    damageReadoutMode = false,
    servoHitNames = [],
    drawDistanceLevel = 0,
    editPartId = null,
    weaponEditId = null,
    editMode = false,
    isWireFrame = false,
    isLeader = false,
    handleClick = () => {},
  },
  buildMechForwardRef
) {
  console.log("BuildMech rendered");
  const texture = useEquipStore((state) => state.greySpeckleBmp);
  texture.wrapS = RepeatWrapping; // MirroredRepeatWrapping
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(10, 10);

  const directionPointerMaterial = isLeader
    ? directionPointerLeaderMaterial
    : directionPointerFollowerMaterial;
  //const axesHelper = new THREE.AxesHelper( 5 );

  return (
    <group ref={buildMechForwardRef} onClick={handleClick}>
      {mechBP.servoList.map((servo, index) => (
        <group
          key={index}
          position={[servo.offset.x, servo.offset.y, servo.offset.z]}
        >
          <ServoShapes
            name={servo.id + "_servo"}
            color={mechBP.color}
            texture={texture}
            flatShading={flatShading}
            damageReadoutMode={damageReadoutMode}
            isWireFrame={isWireFrame}
            isHit={servoHitNames.find((name) => name === servo.id + "_servo")}
            servo={servo}
            drawDistanceLevel={drawDistanceLevel}
            editMode={editMode}
            editPartId={editPartId}
          />
          {mechBP.servoWeaponList(servo.id).map((weapon, j) => (
            <group
              key={j}
              position={[weapon.offset.x, weapon.offset.y, weapon.offset.z]}
            >
              <WeaponShapes
                name={weapon.id + "_weapon"}
                flatShading={flatShading}
                damageReadoutMode={damageReadoutMode}
                isWireFrame={isWireFrame}
                isHit={servoHitNames.find(
                  (name) => name === weapon.id + "_weapon"
                )}
                weapon={weapon}
                drawDistanceLevel={drawDistanceLevel}
                editMode={editMode}
                weaponEditId={weaponEditId}
              />
            </group>
          ))}
        </group>
      ))}
      {editMode && (
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
