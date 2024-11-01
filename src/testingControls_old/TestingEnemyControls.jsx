import useEnemyStore from "../stores/enemyStore";
import "../css/toggleControl.css";

export function TestingEnemyControls() {
  //testing
  const { summonEnemy } = useEnemyStore((state) => state.testing);
  return <button onClick={summonEnemy}>Summon Enemy</button>;
}
