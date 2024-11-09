import React, { useState } from "react";
import ColorPicker from "../ColorPicker";
import EditorMechBP from "../../classes/mechBP/EditorMechBP";
import MechServo from "../../classes/mechBP/MechServo";
import MechServoShape from "../../classes/mechBP/MechServoShape";
import useEquipStore, { EDIT_MENU_SELECT } from "../../stores/equipStore";
//import { useKBControls } from "../../hooks/controls/useMouseKBControls";
import { servoShapeDesigns } from "../data/servoShapeDesigns";
import { GEO_SHAPE_TYPE } from "../../constants/geometryConstants";

interface MechServoInt {
  editorMechBP: EditorMechBP;
  part: MechServo | MechServoShape;
}
const PositionPartEditButtons = (props: MechServoInt) => {
  const { editorMechBP, part } = props;
  // for editing servo shapes and groups
  const {
    addServoShapeDesignId,
    copiedPartParsedJSON,
    editPartMenuSelect,
    equipActions,
    toggleUpdateState,
  } = useEquipStore((state) => state);

  const adjustmentBaseVal = 0.1;
  const [adjustmentFactor, setAdjustmentFactor] = useState(1);

  const AXIS = { x: "x", y: "y", z: "z" };
  const AXIS_DIRECTION = { positive: 1, negative: -1 };

  // COLOR PICKER
  const setPartColor = (color: string) => {
    part.color = color;
    toggleUpdateState();
  };

  //position
  const handleMovePart = (axis: string, direction: number) => {
    // TODO landing bay will be replaced
    /*
    const posAdjust = { x: 0, y: 0, z: 0 };
    posAdjust[axis] = adjustmentFactor * adjustmentBaseVal * direction;
    if (editLandingBayId) {
      let bayPosition = mechBP.landingBayPosition;
      bayPosition = {
        x: mechBP.landingBayPosition.x + posAdjust.x,
        y: mechBP.landingBayPosition.y + posAdjust.y,
        z: mechBP.landingBayPosition.z + posAdjust.z,
      };
      equipActions.blueprintMenu.updateMechBPprop("landingBayPosition", bayPosition);
    }
    */
    equipActions.servoMenu.adjustServoOrShapeOffset(
      part.id,
      axis,
      adjustmentBaseVal * adjustmentFactor * direction
    );
    /*
    equipActions.weaponMenu.adjustWeaponOffset(
      posAdjust.x,
      posAdjust.y,
      posAdjust.z
    );
    */
  };

  //position up arow
  const handleMovePartUp = () => {
    handleMovePart(AXIS.y, AXIS_DIRECTION.positive);
  };
  //useKBControls("KeyQ", handleMovePartUp);

  //position down arow
  const handleMovePartDown = () => {
    handleMovePart(AXIS.y, AXIS_DIRECTION.negative);
  };
  //useKBControls("KeyA", handleMovePartDown);

  //position up arow
  const handleMovePartForward = () => {
    handleMovePart(AXIS.z, AXIS_DIRECTION.negative);
  };
  //useKBControls("ArrowUp", handleMovePartForward);

  //position down arow
  const handleMovePartBackward = () => {
    handleMovePart(AXIS.z, AXIS_DIRECTION.positive);
  };
  //useKBControls("ArrowDown", handleMovePartBackward);

  //position left arow
  const handleMovePartLeft = () => {
    handleMovePart(AXIS.x, AXIS_DIRECTION.negative);
  };
  //useKBControls("ArrowLeft", handleMovePartLeft);

  //position right arow
  const handleMovePartRight = () => {
    handleMovePart(AXIS.x, AXIS_DIRECTION.positive);
  };
  //useKBControls("ArrowRight", handleMovePartRight);

  const handleRotateServoShape = (axis: string, direction: number) => {
    equipActions.servoMenu.adjustServoOrShapeRotation(
      part.id,
      axis,
      10 * adjustmentFactor,
      direction
    );
  };

  const handleScaleServoShape = (axis, direction) => {
    const adjustVal = adjustmentBaseVal * adjustmentFactor * direction;
    equipActions.servoMenu.adjustServoScale(part.id, axis, adjustVal);
  };

  const handleSetAdjustmentAmount = (val) => {
    setAdjustmentFactor(val);
  };

  return (
    <div className="fixed top-[5%] right-[5%] clip-path-cyber bg-white">
      <div className="clip-path-cyber-inner bg-black p-8">
        <span className="text-2xl">Editing: {part.label()}</span>
        <div>
          {
            // if has servoShapes is a group, show add shape button
            part.servoShapes.length > 0 ? (
              <button
                onClick={() => {
                  editorMechBP.addServoShape(part.id);
                  toggleUpdateState();
                }}
              >
                + Shape
              </button>
            ) : (
              !(part instanceof MechServo) &&
              part.servoShapes.length === 0 && (
                <select
                  value={part.shape}
                  onChange={(e) => {
                    equipActions.setEditPartId(part.id);
                    part.shape = Number(e.target.value);
                    toggleUpdateState();
                  }}
                >
                  {Object.keys(GEO_SHAPE_TYPE).map(
                    (shapeStringKey, geoListKeyVal) => (
                      <option key={shapeStringKey} value={geoListKeyVal}>
                        {shapeStringKey}
                      </option>
                    )
                  )}
                </select>
              )
            )
          }
          <span
            className={
              editPartMenuSelect === EDIT_MENU_SELECT.adjust
                ? "selectedItem"
                : "nonSelectedItem"
            }
          >
            <button
              onClick={() => {
                equipActions.setEditPartMenuSelect(
                  editPartMenuSelect === EDIT_MENU_SELECT.adjust
                    ? 0
                    : EDIT_MENU_SELECT.adjust
                );
              }}
            >
              Adjust
            </button>
          </span>
          <span
            className={
              editPartMenuSelect === EDIT_MENU_SELECT.edit
                ? "selectedItem"
                : "nonSelectedItem"
            }
          >
            <button
              onClick={() => {
                equipActions.setEditPartMenuSelect(
                  editPartMenuSelect === EDIT_MENU_SELECT.edit
                    ? 0
                    : EDIT_MENU_SELECT.edit
                );
              }}
            >
              Edit
            </button>
          </span>
          <span
            className={
              editPartMenuSelect === EDIT_MENU_SELECT.mirror
                ? "selectedItem"
                : "nonSelectedItem"
            }
          >
            <button
              onClick={() => {
                equipActions.setEditPartMenuSelect(
                  editPartMenuSelect === EDIT_MENU_SELECT.mirror
                    ? 0
                    : EDIT_MENU_SELECT.mirror
                );
              }}
            >
              Mirror
            </button>
          </span>
          <span
            className={
              editPartMenuSelect === EDIT_MENU_SELECT.color
                ? "selectedItem"
                : "nonSelectedItem"
            }
          >
            <button
              onClick={() => {
                equipActions.setEditPartMenuSelect(
                  editPartMenuSelect === EDIT_MENU_SELECT.color
                    ? 0
                    : EDIT_MENU_SELECT.color
                );
              }}
            >
              Color
            </button>
          </span>
          {!(part instanceof MechServo) && part.servoShapes.length === 0 ? (
            <button
              onClick={() => {
                equipActions.servoMenu.addGroup(part);
              }}
            >
              + New Group
            </button>
          ) : (
            <button
              onClick={() => {
                equipActions.setEditPartMenuSelect(
                  editPartMenuSelect === EDIT_MENU_SELECT.addServoShapeDesign
                    ? 0
                    : EDIT_MENU_SELECT.addServoShapeDesign
                );
              }}
            >
              + Part Design
            </button>
          )}
        </div>
        {editPartMenuSelect === EDIT_MENU_SELECT.adjust && (
          <>
            <div>
              Adjustment Factor
              {[0.1, 1, 10, 100].map((thisAdjustmentAmount) => (
                <span
                  key={thisAdjustmentAmount}
                  className={
                    thisAdjustmentAmount === adjustmentFactor
                      ? "selectedItem"
                      : "nonSelectedItem"
                  }
                >
                  <button
                    onClick={() =>
                      handleSetAdjustmentAmount(thisAdjustmentAmount)
                    }
                  >
                    {thisAdjustmentAmount}
                  </button>
                </span>
              ))}
            </div>
            <div>
              Position:
              <button
                onClick={() =>
                  equipActions.servoMenu.resetServoPosition(part.id)
                }
              >
                Reset
              </button>
              <div>
                <button onClick={() => handleMovePartLeft()}>X-</button>
                <span className="inline-block w-8 text-center">
                  {part.offset.x}
                </span>
                <button onClick={() => handleMovePartRight()}>X+</button>
                <span className="inline-block w-8 text-center">/</span>
                <button onClick={() => handleMovePartDown()}>Y-</button>
                <span className="inline-block w-8 text-center">
                  {part.offset.y}
                </span>
                <button onClick={() => handleMovePartUp()}>Y+</button>
                <span className="inline-block w-8 text-center">/</span>
                <button onClick={() => handleMovePartBackward()}>Z-</button>
                <span className="inline-block w-8 text-center">
                  {part.offset.z}
                </span>
                <button onClick={() => handleMovePartForward()}>Z+</button>
              </div>
            </div>
            <div>
              Scale:
              <button
                onClick={() => equipActions.servoMenu.resetServoScale(part.id)}
              >
                Reset
              </button>
              <div>
                <button
                  onClick={() =>
                    handleScaleServoShape(AXIS.x, AXIS_DIRECTION.negative)
                  }
                >
                  X-
                </button>
                <span className="inline-block w-8 text-center">
                  {part.scaleAdjust.x}
                </span>
                <button
                  onClick={() =>
                    handleScaleServoShape(AXIS.x, AXIS_DIRECTION.positive)
                  }
                >
                  X+
                </button>
                <span className="inline-block w-8 text-center">/</span>
                <button
                  onClick={() =>
                    handleScaleServoShape(AXIS.y, AXIS_DIRECTION.negative)
                  }
                >
                  Y-
                </button>
                <span className="inline-block w-8 text-center">
                  {part.scaleAdjust.y}
                </span>
                <button
                  onClick={() =>
                    handleScaleServoShape(AXIS.y, AXIS_DIRECTION.positive)
                  }
                >
                  Y+
                </button>
                <span className="inline-block w-8 text-center">/</span>
                <button
                  onClick={() =>
                    handleScaleServoShape(AXIS.z, AXIS_DIRECTION.negative)
                  }
                >
                  Z-
                </button>
                <span className="inline-block w-8 text-center">
                  {part.scaleAdjust.z}
                </span>
                <button
                  onClick={() =>
                    handleScaleServoShape(AXIS.z, AXIS_DIRECTION.positive)
                  }
                >
                  Z+
                </button>
              </div>
            </div>
            <div>
              Rotate:
              <button
                onClick={() =>
                  equipActions.servoMenu.resetServoRotation(part.id)
                }
              >
                Reset
              </button>
              <div>
                <button
                  onClick={() =>
                    handleRotateServoShape(AXIS.x, AXIS_DIRECTION.negative)
                  }
                >
                  X-
                </button>
                <span className="inline-block w-8 text-center">
                  {part.rotation.x}
                </span>
                <button
                  onClick={() =>
                    handleRotateServoShape(AXIS.x, AXIS_DIRECTION.positive)
                  }
                >
                  X+
                </button>
                <span className="inline-block w-8 text-center">/</span>
                <button
                  onClick={() =>
                    handleRotateServoShape(AXIS.y, AXIS_DIRECTION.negative)
                  }
                >
                  Y-
                </button>
                <span className="inline-block w-8 text-center">
                  {part.rotation.y}
                </span>
                <button
                  onClick={() =>
                    handleRotateServoShape(AXIS.y, AXIS_DIRECTION.positive)
                  }
                >
                  Y+
                </button>
                <span className="inline-block w-8 text-center">/</span>
                <button
                  onClick={() =>
                    handleRotateServoShape(AXIS.z, AXIS_DIRECTION.negative)
                  }
                >
                  Z-
                </button>
                <span className="inline-block w-8 text-center">
                  {part.rotation.z}
                </span>
                <button
                  onClick={() =>
                    handleRotateServoShape(AXIS.z, AXIS_DIRECTION.positive)
                  }
                >
                  Z+
                </button>
              </div>
            </div>
          </>
        )}
        {editPartMenuSelect === EDIT_MENU_SELECT.edit && (
          <>
            {part instanceof MechServo ? (
              <button
                onClick={() => {
                  equipActions.servoMenu.duplicateServo(part);
                }}
              >
                Duplicate Servo
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    equipActions.servoMenu.copyPart(part);
                  }}
                >
                  Copy {part.servoShapes.length > 0 ? <>Group</> : <>Shape</>}
                </button>
              </>
            )}
            {(part.servoShapes.length > 0 || part instanceof MechServo) &&
              copiedPartParsedJSON !== "" && (
                <button
                  onClick={() => {
                    equipActions.servoMenu.pastePartIntoGroup(part.id);
                  }}
                >
                  Paste
                </button>
              )}
            <button
              onClick={() => {
                equipActions.servoMenu.deletePart(part.id);
              }}
            >
              Delete
            </button>
          </>
        )}
        {editPartMenuSelect === EDIT_MENU_SELECT.mirror && (
          <>
            <span
              className={part.mirrorAxis.x ? "selectedItem" : "nonSelectedItem"}
            >
              <button
                onClick={() => {
                  equipActions.servoMenu.mirrorPart(AXIS.x, part.id);
                }}
              >
                X
              </button>
            </span>
            <span
              className={part.mirrorAxis.y ? "selectedItem" : "nonSelectedItem"}
            >
              <button
                onClick={() => {
                  equipActions.servoMenu.mirrorPart(AXIS.y, part.id);
                }}
              >
                Y
              </button>
            </span>
            <span
              className={part.mirrorAxis.z ? "selectedItem" : "nonSelectedItem"}
            >
              <button
                onClick={() => {
                  equipActions.servoMenu.mirrorPart(AXIS.z, part.id);
                }}
              >
                Z
              </button>
            </span>
          </>
        )}
        {editPartMenuSelect === EDIT_MENU_SELECT.color && (
          <ColorPicker color={part.color} setPartColor={setPartColor} />
        )}
        {editPartMenuSelect === EDIT_MENU_SELECT.addServoShapeDesign &&
          (part instanceof MechServo || part.servoShapes.length > 0) && (
            <>
              <select
                value={addServoShapeDesignId}
                onChange={(e) => {
                  equipActions.setAddServoShapeDesignId(e.target.value);
                }}
              >
                <option value="">Select design</option>
                {servoShapeDesigns.map((servoShapeDesign) => (
                  <option key={servoShapeDesign.id} value={servoShapeDesign.id}>
                    {servoShapeDesign.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  equipActions.servoMenu.addServoShapeDesign(part.id)
                }
              >
                + Part
              </button>
            </>
          )}
      </div>
    </div>
  );
};

export default PositionPartEditButtons;
