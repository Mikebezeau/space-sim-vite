import Footer from "./ui/Footer";
import Header from "./ui/header/Header";
import Inventory from "./ui/inventory/Inventory";
import ItemDescription from "./ui/itemDescription/ItemDescription";
//import SoundManager from "./sounds/SoundManager";
//import Loader from "./Loader";

const UiMain = () => (
  <div
    id="html-overlay-rotate"
    className="absolute mt-[22vh] inset-0 pt-2 md:px-8 text-white z-10 bg-black bg-opacity-40"
  >
    {/*<SoundManager />*/}
    <Header />
    <div className="flex flex-col md:flex-row h-4/6 overflow-y-scroll no-scrollbar focus:outline-none">
      <Inventory />
      <ItemDescription />
    </div>
    <Footer />
    {/*<Loader />*/}
  </div>
);

export default UiMain;
