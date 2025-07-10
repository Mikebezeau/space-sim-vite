import { forwardRef } from "react";
import { useEffect } from "react";
import useStore from "../stores/store";

interface NebulaPointsProps {
  viewAsBackground?: boolean;
}
const NebulaPoints = forwardRef(function NebulaPoints(
  props: NebulaPointsProps,
  nebulaPointsForwardRef: any
) {
  const componentName = "NebulaPoints";
  useStore.getState().updateRenderInfo(componentName);
  useEffect(() => {
    useStore.getState().updateRenderDoneInfo(componentName);
  }, []);

  const { viewAsBackground = false } = props;

  const galaxy = useStore((state) => state.galaxy);
  const isGalaxyInit = useStore((state) => state.isGalaxyInit);

  if (!isGalaxyInit) return null;

  return (
    <points ref={nebulaPointsForwardRef} frustumCulled={viewAsBackground}>
      <bufferGeometry>
        <bufferAttribute
          attach={"attributes-position"}
          {...galaxy.nebulaCoordsBuffer}
        />
        <bufferAttribute
          attach={"attributes-aColor"}
          {...galaxy.nebulaColorBuffer}
        />
      </bufferGeometry>
      <pointsMaterial
        //transparent
        //opacity={0.5}
        size={3}
        color="#a0c4ff"
        depthWrite={false}
      />
    </points>
  );
});

export default NebulaPoints;
