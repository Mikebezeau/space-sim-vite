import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

interface ColorPickerInt {
  color: string | null;
  setPartColor: (color: string | null) => void;
}
const ColorPicker = (props: ColorPickerInt) => {
  const { color, setPartColor } = props;

  // COLOR PICKER
  const [openColorPicker, setOpenColorPicker] = useState(false);
  const colorPickerPopupRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target)
      ) {
        setOpenColorPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (colorPickerPopupRef.current) {
      // make sure the color picker popup is positioned correctly fully visible on screen
      const rect = colorPickerPopupRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const offsetX = rect.width / 2;
      const offsetY = rect.height / 2;
      if (rect.left < 0) {
        colorPickerPopupRef.current.style.left = "0px";
      }
      if (rect.right > windowWidth) {
        colorPickerPopupRef.current.style.left = `${
          windowWidth - rect.width
        }px`;
      }
      if (rect.top < 0) {
        colorPickerPopupRef.current.style.top = "0px";
      }
      if (rect.bottom > windowHeight) {
        colorPickerPopupRef.current.style.top = `${
          windowHeight - rect.height
        }px`;
      }
      colorPickerPopupRef.current.style.transform = `translate(-${offsetX}px, -${offsetY}px)`;
    }
  }, [colorPickerPopupRef.current]);

  return (
    <>
      <span className={openColorPicker ? "selectedItem" : "nonSelectedItem"}>
        <button
          onClick={() => {
            setOpenColorPicker(true);
          }}
        >
          Color Picker
        </button>
      </span>
      {openColorPicker && (
        <span ref={colorPickerPopupRef} className="relative">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div ref={colorPickerRef}>
              <HexColorPicker
                color={color || undefined}
                onChange={setPartColor}
              />
            </div>
            <div className="w-full bg-black text-center">CLOSE</div>
          </div>
        </span>
      )}
      {color && (
        <span className="selectedItem">
          <button style={{ backgroundColor: color }}>C</button>
        </span>
      )}
      <span className="nonSelectedItem">
        <button
          onClick={() => {
            setPartColor(null);
          }}
        >
          Clear
        </button>
      </span>
    </>
  );
};

export default ColorPicker;
