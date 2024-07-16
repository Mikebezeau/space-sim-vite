import { memo } from "react";

const PreMenuCategory = ({ name }) => (
  <div className="w-full md:w-1/2">
    <div className="p-1 bg-menu-category bg-opacity-90 border-menu-category edge-corner">
      {name}
    </div>
  </div>
);
const MenuCategory = memo(PreMenuCategory);
export default MenuCategory;
