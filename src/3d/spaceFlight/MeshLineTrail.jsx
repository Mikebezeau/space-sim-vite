import { useRef /*, useState*/ } from "react";
//import { BufferAttribute, DynamicDrawUsage, Object3D } from "three";
import { extend, useFrame } from "@react-three/fiber";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { useTrail } from "../../hooks/useTrail";
//import { setCustomData } from "r3f-perf";

extend({ MeshLineGeometry, MeshLineMaterial });
/*
function EngineTrailLine({ followRef }) {
  //function WithLine({ n, lerp, minDist, ...props }) {
  const n = 10,
    lerp = 1,
    minDist = 1;

  const lineBufferGeometryRef = useRef();
  //const ref = useRef()

  const [trailPositions] = useTrail(n, followRef, {
    lerp,
    minDist: minDist / 10,
  });

  useEffect(() => {
    const buffer = new BufferAttribute(trailPositions, 3);
    buffer.setUsage(DynamicDrawUsage);

    lineBufferGeometryRef.current.setAttribute("position", buffer);
  }, [trailPositions]);

  useFrame(() => {
    if (lineBufferGeometryRef.current)
      lineBufferGeometryRef.current.getAttribute("position").needsUpdate = true;
  });

  return (
    <line>
      <bufferGeometry ref={lineBufferGeometryRef}></bufferGeometry>
      <lineBasicMaterial size={1} />
    </line>
  );
}
*/
/*
function EngineTrailInstanced({ followRef }) {
  const instancesRef = useRef();
  //const ref = useRef(); //followRef
  const n = 100,
    lerp = 1,
    minDist = 0.1;

  const [trailPositions] = useTrail(n, followRef, {
    lerp,
    minDist: minDist / 10,
  });

  useEffect(() => {
    const buffer = new BufferAttribute(trailPositions, 3);
    buffer.setUsage(DynamicDrawUsage);
  }, [trailPositions]);

  const [o] = useState(() => new Object3D());
  function updateInstances() {
    for (let i = 0; i < n; i++) {
      o.position.set(...trailPositions.slice(i * 3, i * 3 + 3));

      o.scale.setScalar((1 - i / n) * 0.5);
      o.updateMatrixWorld();

      instancesRef.current.setMatrixAt(i, o.matrixWorld);
    }

    instancesRef.current.count = trailPositions.length / 3;
    instancesRef.current.instanceMatrix.needsUpdate = true;
  }

  useFrame(updateInstances);

  return (
    <instancedMesh ref={instancesRef} args={[null, null, n]}>
      <octahedronGeometry args={[0.1, 1]} />
      <meshNormalMaterial />
    </instancedMesh>
  );
}
*/

//function WithMeshLine({ n, lerp, minDist, ...props }) {
function MeshLineTrail({ followRef }) {
  const n = 10,
    lerp = 1,
    minDist = 1;
  const line = useRef();
  //const ref = useRef();

  const [trailPositions] = useTrail(n, followRef, {
    lerp,
    minDist: minDist / 10,
  });

  useFrame(() => {
    line.current.setPoints(trailPositions, (i) => {
      return (1 - Math.pow(i, 3)) * 2;
    });
  });

  return (
    <mesh>
      <meshLineGeometry ref={line} />
      <meshLineMaterial lineWidth={0.1} sizeAttenuation={false} />
    </mesh>
  );
}

export default MeshLineTrail;
