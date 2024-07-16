import AppUI from "./AppUI";
import AppCanvas from "./AppCanvas";
//import MainUI from "./mainUI/MainUI";

function App() {
  console.log("app render");

  return (
    <>
      {/*<MainUI />*/}
      <AppCanvas />
      <AppUI />
    </>
  );
}

export default App;
