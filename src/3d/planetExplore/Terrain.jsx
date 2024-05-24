import { memo } from "react";

const PreTerrain = ({ terrain }) => {
  return (
    <mesh
      geometry={terrain.Mesh.geometry}
      material={terrain.Mesh.material}
    ></mesh>
  );
};

const Terrain = memo(PreTerrain);
export default Terrain;
