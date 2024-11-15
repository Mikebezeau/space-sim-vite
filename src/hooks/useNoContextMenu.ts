import { useEffect } from "react";

const useNoContextMenu = () => {
  useEffect(() => {
    // define a custom handler function
    // for the contextmenu event
    const handleContextMenu = (e) => {
      // prevent the right-click menu from appearing
      e.preventDefault();
      e.stopPropagation();
    };
    // attach the event listener to
    // the document object
    document.addEventListener("contextmenu", handleContextMenu);
    // clean up the event listener when
    // the component unmounts
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);
};

export default useNoContextMenu;
