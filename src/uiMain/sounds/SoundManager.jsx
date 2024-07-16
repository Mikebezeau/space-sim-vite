import useSound from "use-sound";
import useMainUIStore from "../useMainUIStore";
import likeSound from "./files/like.mp3";
import menuChangeSound from "./files/menu1.mp3";
import menuActionSound from "./files/menu2.mp3";
import menuValidateSound from "./files/menu3.mp3";
import ringtoneSound from "./files/ringtone.wav";
import mail from "./files/mail.wav";

const SoundManager = () => {
  const initSound = useMainUIStore((state) => state.initSound);
  const [playLike] = useSound(likeSound, { volume: 0.4 });
  const [playMenuChange] = useSound(menuChangeSound);
  const [playMenuAction] = useSound(menuActionSound);
  const [playMenuValidate] = useSound(menuValidateSound);
  const [playRingtone] = useSound(ringtoneSound, { volume: 0.4 });
  const [playMail] = useSound(mail, { volume: 0.4 });
  /*initSound({
    playLike,
    playMenuChange,
    playMenuAction,
    playMenuValidate,
    playRingtone,
    playMail,
  });*/
  return null;
};

export default SoundManager;
