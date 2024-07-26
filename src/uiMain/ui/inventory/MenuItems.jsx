import MenuCategory from "../MenuCategory";
import MenuEffect from "../effects/MenuEffect";

const MenuItems = ({
  items,
  menuCategoryName,
  onClick,
  selectedItem,
  baseIndex = 0,
}) => {
  return (
    <>
      <MenuCategory name={menuCategoryName} />
      {items.map((item, index) => (
        <div key={item.id}>
          <div
            onClick={() => onClick(index + baseIndex)}
            className={`
              ${
                index + baseIndex === selectedItem &&
                "transition-colors ease-in delay-300"
              }
             pointer-events-auto flex relative cursor-pointer z-0`}
          >
            <div className="relative w-full md:w-1/2 h-6 mb-2 flex hover:bg-menu-item select-none">
              <div className="absolute w-full">
                {index + baseIndex === selectedItem && <MenuEffect />}
              </div>
              <div className="flex items-center relative z-10 py-1 px-2 w-4/6 truncate">
                {item.name}
              </div>
              <div className="flex items-center relative z-10 py-1 px-2 w-1/6">
                {item.likes}
              </div>
              <div className="flex items-center relative z-10 py-1 px-2 w-1/6">
                {item.weight?.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default MenuItems;
