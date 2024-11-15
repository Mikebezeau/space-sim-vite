import React from "react";

interface CyberMenuBorderInt {
  children?: React.ReactNode;
}
const CyberMenuBorder = (props: CyberMenuBorderInt) => {
  const { children = null } = props;
  return (
    <div className="absolute clip-path-cyber bg-white w-full h-full">
      <div className="clip-path-cyber-inner bg-black w-full h-full p-8">
        {children}
      </div>
    </div>
  );
};

export default CyberMenuBorder;
