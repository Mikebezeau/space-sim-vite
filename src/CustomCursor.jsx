import useMousePosition from "./hooks/useMousePosition";
import "./css/customCursor.css";

const CustomCursor = () => {
  const { x, y } = useMousePosition();
  return (
    <>
      <div style={{ left: `${x}px`, top: `${y}px` }} className="ring" />
      <div className="dot" style={{ left: `${x}px`, top: `${y}px` }} />
    </>
  );
};

export default CustomCursor;
