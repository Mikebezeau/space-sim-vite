import useEquipStore from "../stores/equipStore";
import {
  useMouseMove,
  useMouseUp,
  useMouseDown,
} from "../hooks/controls/useMouseKBControls";

const EquipmentMenuControlsMouseKB = () => {
  console.log("KeyboardMouseControls render");

  const basicMenu = useEquipStore((state) => state.equipActions.basicMenu);

  //mouse move
  function handleMouseMove(e) {
    basicMenu.editShipMouseRotation(e);
  }
  useMouseMove(handleMouseMove);

  //mouse down
  function handleMouseDown(e) {
    basicMenu.editSetMouseDown(true, e);
  }
  useMouseDown(handleMouseDown);
  //mouse up
  function handleMouseUp() {
    basicMenu.editSetMouseDown(false);
  }
  useMouseUp(handleMouseUp);

  return null;
};

export default EquipmentMenuControlsMouseKB;
