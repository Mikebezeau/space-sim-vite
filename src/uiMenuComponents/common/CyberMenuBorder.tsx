import React from "react";

interface CyberMenuBorderInt {
  colorBorder?: string;
  colorBg?: string;
  children?: React.ReactNode;
}
const CyberMenuBorder = (props: CyberMenuBorderInt) => {
  const {
    colorBorder = "#fff",
    colorBg = "rgb(15 23 42)",
    children = null,
  } = props;
  return (
    <div
      className="absolute clip-path-cyber w-full h-full"
      style={{ backgroundColor: colorBorder }}
    >
      <div
        className="clip-path-cyber-inner w-full h-full p-8"
        style={{ backgroundColor: colorBg }}
      >
        {children}
      </div>
    </div>
  );
};

export default CyberMenuBorder;
