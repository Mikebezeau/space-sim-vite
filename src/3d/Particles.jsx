import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import useParticleStore from "../stores/particleStore";
import { SCALE } from "../constants/constants";

//import { setCustomData } from "r3f-perf";

const Particles = ({ scale = SCALE }) => {
  //console.log("Particles rendered");
  //setCustomData(0);
  const initParticleController = useParticleStore(
    (state) => state.initParticleController
  );
  const particleController = useParticleStore(
    (state) => state.particleController
  );
  const { scene } = useThree();

  useEffect(() => {
    initParticleController();
  }, [initParticleController]);

  useEffect(() => {
    console.log("Particles added to scene");
    if (particleController) scene.add(particleController.particleSystem);

    return () => {
      console.log("Particles cleanup");
      if (particleController) particleController.dispose();
    };
  }, [particleController, scene]);

  useFrame(({ clock }) => {
    if (Math.random() < 0.5) {
      if (particleController) {
        particleController.spawnParticle({
          position: { x: 0, y: 0, z: -600 },
          velocity: {
            x: Math.random(),
            y: Math.random(),
            z: Math.random(),
          },
        });
      }
    }
    if (particleController) particleController.update(clock.getElapsedTime());
  });

  return null;
};

export default Particles;
