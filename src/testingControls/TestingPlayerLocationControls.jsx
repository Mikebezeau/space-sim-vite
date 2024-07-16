import useStore from "../stores/store";
import "../css/toggleControl.css";

export function TestingPlayerLocationControls() {
  //testing
  const { testing } = useStore((state) => state);

  return (
    <>
      <button onClick={testing.changeLocationSpace}>Space Flight</button>
      <button onClick={testing.warpToStation}>To Station</button>
      <button onClick={testing.changeLocationPlanet}>Planet Walk</button>
      <button onClick={testing.changeLocationCity}>To City</button>
    </>
  );
}
