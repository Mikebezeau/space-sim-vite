import * as THREE from "three";
import MechServo from "../../classes/mechBP/MechServo";
import MechServoShape from "../../classes/mechBP/MechServoShape";
import { getMaterial } from "../../util/materialUtil";

interface ServoShapeInt {
  servoShape: MechServoShape;
  material: THREE.Material;
}
const ServoShape = (props: ServoShapeInt) => {
  const { servoShape, material } = props;
  return (
    <mesh
      position={[servoShape.offset.x, servoShape.offset.y, servoShape.offset.z]}
      rotation={[
        servoShape.rotationRadians().x,
        servoShape.rotationRadians().y,
        servoShape.rotationRadians().z,
      ]}
      scale={[
        (1 + servoShape.scaleAdjust.x) * (servoShape.mirrorAxis.x ? -1 : 1),
        (1 + servoShape.scaleAdjust.y) * (servoShape.mirrorAxis.y ? -1 : 1),
        (1 + servoShape.scaleAdjust.z) * (servoShape.mirrorAxis.z ? -1 : 1),
      ]}
      geometry={servoShape.geometry()}
      material={material}
    />
  );
};

interface ServoShapesInt {
  servo: MechServo | MechServoShape;
  parentServo?: MechServo;
  color: string | null;
  texture: THREE.Texture;
  flatShading?: boolean;
  damageReadoutMode?: boolean;
  editMode?: boolean;
  editPartId?: string;
  isWireFrame?: boolean;
  //textureScaleAdjust?: { x: number; y: number; z: number };
}
const ServoShapes = (props: ServoShapesInt) => {
  const {
    servo,
    color,
    texture,
    flatShading = true,
    damageReadoutMode,
    editMode,
    editPartId,
    isWireFrame,
  } = props;
  let parentServo: MechServo | undefined = props.parentServo;
  if (!props.parentServo && servo instanceof MechServo) parentServo = servo;

  const thisColor = servo.color || color || "#ffffff";

  return (
    <group scale={servo instanceof MechServo ? servo.size() : 1}>
      <group
        position={[servo.offset.x, servo.offset.y, servo.offset.z]}
        rotation={[
          servo.rotationRadians().x,
          servo.rotationRadians().y,
          servo.rotationRadians().z,
        ]}
        scale={[
          (1 + servo.scaleAdjust.x) * (servo.mirrorAxis.x ? -1 : 1),
          (1 + servo.scaleAdjust.y) * (servo.mirrorAxis.y ? -1 : 1),
          (1 + servo.scaleAdjust.z) * (servo.mirrorAxis.z ? -1 : 1),
        ]}
      >
        {servo.servoShapes.map((servoShape) => (
          <group key={servoShape.id}>
            {servoShape.servoShapes.length === 0 ? (
              <ServoShape
                servoShape={servoShape}
                material={getMaterial(
                  parentServo,
                  servoShape,
                  thisColor,
                  flatShading,
                  damageReadoutMode,
                  editMode,
                  editPartId,
                  isWireFrame
                )}
              />
            ) : (
              <ServoShapes
                servo={servoShape} // passing servoShape as servo to build children
                parentServo={parentServo} // passing parentServo to children for calculating damageReadoutMode meterial color
                color={thisColor || servoShape.color || null}
                texture={texture}
                flatShading={flatShading}
                damageReadoutMode={damageReadoutMode}
                isWireFrame={isWireFrame}
                editMode={editMode}
                editPartId={editPartId}
                //textureScaleAdjust={textureScaleAdjust}
              />
            )}
          </group>
        ))}
      </group>
    </group>
  );
};

export default ServoShapes;
