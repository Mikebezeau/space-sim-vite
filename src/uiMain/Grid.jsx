import * as THREE from "three";

const Grid = ({ texture, positions = [], ...props }) => {
  const positionsBuffer = new THREE.BufferAttribute(
    new Float32Array(positions),
    3 // x, y, z values
  );

  return (
    <points {...props}>
      <pointsMaterial
        size={1}
        opacity={0.9}
        color="#316B74"
        alphaMap={texture}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        frustumCulled={false}
      />
      <bufferGeometry>
        <bufferAttribute attach={"attributes-position"} {...positionsBuffer} />
      </bufferGeometry>
    </points>
  );
};

export default Grid;
