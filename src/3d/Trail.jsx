import { forwardRef, useEffect, useRef } from "react";
import {
  BufferAttribute,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  Vector3,
} from "three";
import { extend, useFrame } from "@react-three/fiber";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { useTrailVector3 } from "../hooks/useTrailVector3";
import { useTrailFloat32Array } from "../hooks/useTrailFloat32Array";
//import { setCustomData } from "r3f-perf";

extend({ MeshLineGeometry, MeshLineMaterial });

// still having issues with length of trails over 1000 units long
// due to limitations of BufferAttribute float32 precision

// try scaling down the trail positions to 1/10th or 1/100th of the actual position in useTrail
// and increase scale of the trail line to 10x in output trail component

export const LineTrail = ({ followRef }) => {
  const lineBufferGeometryRef = useRef();

  const [trailPositions] = useTrailFloat32Array(followRef);

  useEffect(() => {
    const buffer = new BufferAttribute(trailPositions, 3);
    buffer.setUsage(DynamicDrawUsage);

    lineBufferGeometryRef.current.setAttribute("position", buffer);
  }, [trailPositions]);

  useFrame(() => {
    if (lineBufferGeometryRef.current?.getAttribute("position"))
      lineBufferGeometryRef.current.getAttribute("position").needsUpdate = true;
  });

  return (
    <line>
      <bufferGeometry ref={lineBufferGeometryRef}></bufferGeometry>
      <lineBasicMaterial size={10} />
    </line>
  );
};

export const MeshLineTrail = forwardRef(function MeshLineTrail(
  { followObject3d },
  trailForwardRef
) {
  const lineRef = useRef();
  const trailPositions = useTrailVector3(followObject3d);

  useFrame(() => {
    lineRef.current.setPoints(trailPositions, (i) => {
      return 8 - i * 8; // i = 1 to 0 depending how far along the line the point is
    });
  });

  return (
    <group ref={trailForwardRef}>
      <mesh>
        <meshLineGeometry ref={lineRef} />
        <meshLineMaterial
          lineWidth={1}
          color={new Color("red")}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
});
