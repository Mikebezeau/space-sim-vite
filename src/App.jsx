import AppUI from "./AppUI";
import AppCanvas from "./AppCanvas";
import AppUICanvas from "./AppUICanvas";
//import MainUI from "./mainUI/MainUI";

function App() {
  console.log("app render");

  return (
    <>
      {/*<MainUI />*/}
      <AppCanvas />
      <AppUI />
      <AppUICanvas />
    </>
  );
}

export default App;
