import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
//import { setCustomData /*, getCustomData*/ } from "r3f-perf";
import useWeaponFireStore from "../stores/weaponFireStore";
import PropTypes from "prop-types";

const red = new THREE.Color("red");
const purple = new THREE.Color("purple");
//const yellow = new THREE.Color("yellow");
const lightgrey = new THREE.Color("lightgrey");

const weaponFireGeometry = {
  beam: new THREE.BoxGeometry(0.2, 0.2, 100),
  proj: new THREE.BoxGeometry(0.3, 0.3, 50),
  missile: new THREE.BoxGeometry(0.5, 0.5, 5),
};

const weaponFireMaterial = {
  beam: new THREE.MeshBasicMaterial({
    color: purple,
    //emissive: purple,
    //emissiveIntensity: 100,
  }),
  proj: new THREE.MeshBasicMaterial({
    color: red,
  }),
  missile: new THREE.MeshBasicMaterial({
    color: lightgrey,
  }),
};

const position = new THREE.Vector3();
const direction = new THREE.Vector3();

const WeaponFire = ({ scale }) => {
  //export default function WeaponFire() {
  const weaponFireList = useWeaponFireStore((state) => state.weaponFireList);
  //const removeWeaponFire = useStore((state) => state.actions.removeWeaponFire);
  const weaponFireGroup = useRef();

  //const { clock } = useStore((state) => state.mutation);

  useFrame(() => {
    //setCustomData(weaponFireList.length); // will update the panel with the current information

    if (!weaponFireGroup.current) return null;
    //weaponFire movement update

    weaponFireList.forEach((weaponFire, i) => {
      const bullet = weaponFireGroup.current.children[i];
      if (weaponFire.firstFrameSpeed !== false) {
        //show the weapons firing out of the guns before moving the bullets the first time
        //move them up to where the ship is now
        weaponFire.object3d.translateZ(weaponFire.firstFrameSpeed * scale);
        weaponFire.firstFrameSpeed = false;
        //move the bullet to it's position on the weapon to to show accuratly what weapon its coming from
      } else weaponFire.object3d.translateZ(weaponFire.velocity * scale);

      bullet.position.copy(weaponFire.object3d.position);
      bullet.rotation.copy(weaponFire.object3d.rotation);

      bullet.getWorldPosition(position);
      bullet.getWorldDirection(direction);

      weaponFire.ray.origin.copy(position);
      weaponFire.ray.direction.copy(direction);

      weaponFire.hitBox.min.copy(position);
      weaponFire.hitBox.max.copy(position);
      weaponFire.hitBox.expandByScalar(scale); // * sceneScale);
    });
  });
  return (
    <>
      <group ref={weaponFireGroup}>
        {weaponFireList.map((weaponFire) => (
          <mesh
            key={weaponFire.id}
            scale={scale}
            geometry={weaponFireGeometry[weaponFire.weapon.data.weaponType]}
            material={weaponFireMaterial[weaponFire.weapon.data.weaponType]}
          />
        ))}
      </group>
    </>
  );
};

WeaponFire.propTypes = {
  scale: PropTypes.number.isRequired,
};

export default WeaponFire;
