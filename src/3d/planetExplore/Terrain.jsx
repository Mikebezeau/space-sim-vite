const Terrain = ({ terrain }) => {
  console.log("Terrain rendered");
  return (
    <mesh
      geometry={terrain.Mesh.geometry}
      material={terrain.Mesh.material}
    ></mesh>
  );
};

export default Terrain;
