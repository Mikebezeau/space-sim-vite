import AppUI from "./AppUI";
import AppCanvas from "./AppCanvas";
import AppUICanvas from "./AppUICanvas";

function App() {
  console.log("app render");

  return (
    <>
      <AppCanvas />
      <AppUI />
      <AppUICanvas />
    </>
  );
}

export default App;
