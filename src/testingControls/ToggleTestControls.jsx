import useStore from "../stores/store";
import "../css/toggleControl.css";

export function ToggleTestControls() {
  //testing
  const showTestControls = useStore((state) => state.showTestControls);
  const toggleTestControls = useStore(
    (state) => state.testing.toggleTestControls
  );

  return (
    <>
      <div className="toggleContainer">
        <span>Testing</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={showTestControls}
            value={true}
            onChange={toggleTestControls}
          />
          <span className="toggleslider"></span>
        </label>
      </div>
    </>
  );
}
