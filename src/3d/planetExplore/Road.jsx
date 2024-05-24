import { memo } from "react";

const PreRoad = ({ road }) => {
  return (
    <mesh geometry={road.mesh.geometry} material={road.mesh.material}></mesh>
  );
};

const Road = memo(PreRoad);
export default Road;
