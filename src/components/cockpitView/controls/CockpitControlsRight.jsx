import useStore from "../../../stores/store";

const CockpitControlsRight = () => {
  console.log("CockpitControlsRight rendered");
  const shield = 0; //useStore((state) => state.player.shield);
  const currentMechBPindex = useStore(
    (state) => state.player.currentMechBPindex
  );

  const playerMechBP = useStore((state) => state.playerMechBP);

  const weaponList = playerMechBP[currentMechBPindex].weaponList;

  return (
    <>
      <div>
        {weaponList.beam.map((weapon, i) => (
          <p key={i}>{weapon.data.name}</p>
        ))}
        {weaponList.proj.map((weapon, i) => (
          <p key={i}>{weapon.data.name} / AMMO</p>
        ))}
        {weaponList.missile.map((weapon, i) => (
          <p key={i}>{weapon.data.name} / #</p>
        ))}
      </div>

      <div
        className=""
        style={
          {
            //width: ((shield.max - shield.damage) / shield.max) * 100 + "%",
          }
        }
      >
        <span>SHIELDS</span>
      </div>
    </>
  );
};

export default CockpitControlsRight;
