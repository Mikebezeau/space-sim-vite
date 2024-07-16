import useMainUIStore from "../../useMainUIStore";
import TopBarItem from "./TopBarItem";

const TopBar = () => {
  const { playMail, playRingtone } = useMainUIStore((state) => state);
  return (
    <div className="flex justify-end mx-2">
      <TopBarItem icon="mail" onClick={playMail} />
      <TopBarItem icon="call" onClick={playRingtone} />
    </div>
  );
};
export default TopBar;
