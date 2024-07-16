import { useEffect, useRef, useState } from "react";
import useClickOutside from "../hooks/useClickOutside";
import useMainUIStore from "../useMainUIStore";
import MenuEffect from "./effects/MenuEffect";
import MenuTab from "./MenuTab";
import OuterBox from "./OuterBox";

const actions = [
  {
    label: "Move to Private Locker",
    category: "private",
  },
  {
    label: "Move to Share Locker",
    category: "share",
  },
  {
    label: "Move to Cargo",
    category: "sam",
  },
];

const ActionModal = ({ closeCallback, setSelectedInventoryItem }) => {
  const {
    selectedItem,
    allItems,
    setAllItems,
    itemsPrivateLocker,
    itemsShareLocker,
    selectedCategory,
    playMenuChange,
    playMenuAction,
  } = useMainUIStore((state) => state);
  const [actionSelected, setActionSelected] = useState(0);
  const modalRef = useRef();
  useClickOutside(modalRef, closeCallback);

  const filteredActions = actions.filter(
    (action) => action.category !== selectedCategory
  );

  useEffect(() => {
    modalRef.current.focus();
  }, []);

  const privateLockerAction = () => {
    allItems[selectedItem].category = "private";
    setAllItems(allItems);
    setSelectedInventoryItem(0);
    closeCallback();
  };

  const shareLockerAction = () => {
    allItems[selectedItem].category = "share";
    setAllItems(allItems);
    setSelectedInventoryItem(itemsPrivateLocker.length - 1);
    closeCallback();
  };

  const samCargoAction = () => {
    allItems[selectedItem].category = "sam";
    setAllItems(allItems);
    setSelectedInventoryItem(
      itemsPrivateLocker.length + itemsShareLocker.length - 1
    );
    closeCallback();
  };

  const actionMapping = {
    private: privateLockerAction,
    share: shareLockerAction,
    sam: samCargoAction,
  };

  useEffect(() => playMenuAction(), [playMenuAction]);

  const handleKeyPressed = (event) => {
    event.preventDefault();
    event.stopPropagation();
    let newAction;
    if (event.key === "ArrowUp") {
      newAction =
        actionSelected <= 0 ? filteredActions.length - 1 : actionSelected - 1;
      playMenuChange();
    } else if (event.key === "ArrowDown") {
      newAction = (actionSelected + 1) % filteredActions.length;
      playMenuChange();
    } else if (event.key === "Enter") {
      actionMapping[filteredActions[actionSelected].category]();
    } else if (event.key === "Escape") {
      closeCallback();
    }
    setActionSelected(newAction);
  };

  return (
    <div className="flex justify-center w-full md:w-1/2 relative">
      <div
        className="absolute bg-black bg-opacity-80 w-4/5 mt-18 p-3 z-10 focus:outline-none "
        onKeyDown={handleKeyPressed}
        tabIndex={0}
        ref={modalRef}
      >
        <OuterBox />
        <MenuTab>
          <div>COMMAND</div>
        </MenuTab>
        <ul>
          {filteredActions.map((action, index) => (
            <li key={action.category} className="relative">
              <button
                className="flex focus:outline-none w-full text-left"
                onClick={actionMapping[action.category]}
              >
                <div className="absolute w-full">
                  {actionSelected === index && <MenuEffect />}
                </div>
                <div className="relative z-10 hover:bg-menu-effect w-full">
                  {action.label}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ActionModal;
