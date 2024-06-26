const Road = ({ road }) => {
  console.log("Road rendered");
  return (
    <mesh geometry={road.mesh.geometry} material={road.mesh.material}></mesh>
  );
};

export default Road;
