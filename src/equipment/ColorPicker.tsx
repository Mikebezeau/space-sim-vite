import React, { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

interface ColorPickerInt {
  color: string | null;
  setPartColor: (color: string | null) => void;
}
const ColorPicker = (props: ColorPickerInt) => {
  const { color, setPartColor } = props;

  // COLOR PICKER
  const [openColorPicker, setOpenColorPicker] = useState(false);
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
  }, [colorPickerRef]);

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
        <span className="relative">
          <div className="absolute -top-1 -left-52">
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
