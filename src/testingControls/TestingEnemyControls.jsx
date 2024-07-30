import useEnemyStore from "../stores/enemyStore";
import "../css/toggleControl.css";

export function TestingEnemyControls() {
  //testing
  const { summonEnemy, toggleShowLeaders } = useEnemyStore(
    (state) => state.testing
  );
  const showLeaders = useEnemyStore((state) => state.showLeaders);
  return (
    <>
      <button onClick={summonEnemy}>Summon Enemy</button>
      <div className="toggleContainer">
        <span>Show Leaders</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={showLeaders}
            value={1}
            onChange={toggleShowLeaders}
          />
          <span className="toggleslider"></span>
        </label>
      </div>
    </>
  );
}
