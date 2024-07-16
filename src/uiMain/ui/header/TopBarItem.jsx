import { useEffect, useState } from "react";

const TopBarItem = ({ icon, onClick }) => {
  const [isRead, setIsRead] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsRead(false), 20000);
  }, []);

  const onClickHandler = () => {
    onClick();
    setIsRead(true);
  };

  return (
    <button
      className={`${
        !isRead && "animate-bounce"
      } focus:outline-none relative mr-2`}
      onClick={onClickHandler}
    >
      <img src={`./icons/${icon}.jpg`} />
    </button>
  );
};

export default TopBarItem;
