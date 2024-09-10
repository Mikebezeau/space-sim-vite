import { useState } from "react";
import { Scene } from "three";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import StarPoints from "../galaxy/StarPoints";

const StarsBackgroundScene = () => {
  console.log("StarsBackgroundScene rendered");
  const [scene] = useState(() => new Scene());
  const { camera } = useThree();
  //const { gl, size, camera } = useThree();

  useFrame(
    ({ gl }) =>
      void (
        ((gl.autoClear = true),
        gl.render(scene, camera)) /*, composer.current.render()*/ // if using effect composer replace gl.render with composer.current.render
      ),
    1
  );

  return createPortal(
    <group position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <StarPoints viewAsBackground={true} />
    </group>,
    scene
  );
};

export default StarsBackgroundScene;
