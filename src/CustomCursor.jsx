import useStore from "./stores/store";
import "./css/customCursor.css";

const CustomCursor = () => {
  const mouseScreen = useStore((state) => state.mutation.mouseScreen);
  return (
    <>
      <div
        style={{ left: `${mouseScreen.x}px`, top: `${mouseScreen.y}px` }}
        className="ring"
      />
      <div
        className="dot"
        style={{ left: `${mouseScreen.x}px`, top: `${mouseScreen.y}px` }}
      />
    </>
  );
};

export default CustomCursor;
