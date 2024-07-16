import useMainUIStore from "../useMainUIStore";
import AnimatedOuterBox from "./AnimatedOuterBox";

const Footer = () => {
  const totalWeight = useMainUIStore((state) => state.totalWeight);
  const weight = totalWeight();
  return (
    <div className="pointer-events-none relative flex flex-col m-4 text-white">
      <AnimatedOuterBox />
      <div className="flex mb-4 text-xs items-center">
        <div className="flex items-center justify-center h-8 w-32 mr-4 bg-red-500">
          1000/1000ml
        </div>
        <div className="flex items-center justify-center h-8 w-32 mr-4 bg-yellow-500">
          1000/1000ml
        </div>
        <div
          className={`${weight > 15 && "text-yellow-600"} ${
            weight > 25 && "text-red-500"
          } mr-4 text-lg`}
        >
          {weight}kg
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex w-32 mr-4 bg-blue-900 bg-opacity-50">
          <div className="w-full h-8 mr-1 bg-blue-600" />
          <div className="w-full h-8 mr-1 bg-blue-600" />
          <div className="w-full h-8 mr-1 bg-blue-600" />
          <div className="w-full h-8 mr-1 bg-blue-600" />
        </div>
        <div className="flex items-center justify-center h-8 w-32 mr-4 bg-blue-300" />
      </div>
    </div>
  );
};

export default Footer;
