import { Suspense } from "react";
import Briefcase from "./Briefcase";
import useMainUIStore from "./useMainUIStore";
import { getPositionExternalGrid } from "./utils/getPositionExternalGrid";

const ExternalGrid = ({ items, position }) => {
  const selectedId = useMainUIStore((state) => state.selectedId);
  return (
    <group position={position}>
      <Suspense fallback="loading...">
        {items.map((item, index) => {
          return (
            <Briefcase
              isSelected={item.id === selectedId}
              key={item.id}
              position={getPositionExternalGrid(index)}
            />
          );
        })}
      </Suspense>
    </group>
  );
};

export default ExternalGrid;
