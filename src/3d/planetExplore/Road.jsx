const Road = ({ road }) => {
  return (
    <mesh geometry={road.mesh.geometry} material={road.mesh.material}></mesh>
  );
};

export default Road;
