import { Suspense, useMemo } from "react";
import * as THREE from "three";
import Briefcase from "./Briefcase";
import Grid from "./Grid";
import useMainUIStore from "./useMainUIStore";
import smallCrossSrc from "../sprites/smallCross.png";
import largeCrossSrc from "../sprites/largeCross.png";

const textureLoader = new THREE.TextureLoader();
const smallCrossTexture = textureLoader.load(smallCrossSrc);
const largeCrossTexture = textureLoader.load(largeCrossSrc);

const LINES_NUMBER = 3;
export const LINE_SPACING = 0.5;

const POINTS_COUNT = 500;
const POINTS_PER_LINE = 3 * 20;
const POINTS_PER_LAYER = POINTS_PER_LINE * LINES_NUMBER;

export const COLUMN_SPACING = 0.4;
const COLUMN_OFFSET = 10;
const SUITCASE_X_SPACING = 0.3;
const SUITCASE_Y_SPACING = 0.1;
const SUITCASE_Z_SPACING = 0.2;

const GridsContainer = ({ briefcases }) => {
  const selectedId = useMainUIStore((state) => state.selectedId);

  const [positionsSmallCross, positionsBigCross, positionsBriefcases] =
    useMemo(() => {
      let positionsSmallCross = [];
      let positionsBigCross = [];
      let positionsBriefcases = [];

      const placeholderArray = [...new Array(POINTS_COUNT * 3)];
      placeholderArray.map((value, index) => {
        const axe = index % 3;
        const column = index % POINTS_PER_LINE;
        const line = Math.floor(index / POINTS_PER_LINE);
        const layer = Math.floor(index / POINTS_PER_LAYER);

        let smallCross = 0;
        let bigCross = 0;
        let briefcase = 0;

        if (axe === 0) {
          smallCross =
            column * COLUMN_SPACING -
            COLUMN_OFFSET -
            (column % 2 ? 0 : SUITCASE_X_SPACING);
          bigCross = smallCross + COLUMN_SPACING * 2;
          briefcase = bigCross;
        }
        if (axe === 1) {
          smallCross =
            (line % LINES_NUMBER) * LINE_SPACING -
            ((line % LINES_NUMBER) % 2 ? 0 : SUITCASE_Y_SPACING);
          bigCross = smallCross + LINE_SPACING / 2;
          briefcase = bigCross;
        }
        if (axe === 2) {
          smallCross =
            layer % 2 ? layer * -1.5 : layer * -1.5 - SUITCASE_Z_SPACING;
          bigCross = smallCross;
          briefcase = smallCross - 0.75;
        }

        positionsSmallCross.push(smallCross);
        positionsBigCross.push(bigCross);
        positionsBriefcases.push(briefcase);
      });

      //console.log(positionsSmallCross);

      positionsBigCross = positionsBigCross.filter((value, index) => {
        // Filtering odd points on X and Y
        return index % 6 <= 2 && index % 120 <= 59;
      });

      positionsBriefcases = positionsBriefcases.filter((value, index) => {
        // Filtering odd points on X and Y and Z
        // Also only display briefcase in the center
        return (
          index % 6 <= 2 &&
          index % 120 < 60 &&
          index % 720 < 360 &&
          15 < index % POINTS_PER_LINE &&
          index % POINTS_PER_LINE < 35
        );
      });

      return [
        new Float32Array(positionsSmallCross),
        new Float32Array(positionsBigCross),
        new Float32Array(positionsBriefcases),
      ];
    }, []);

  return (
    <group position={[-1, -1, 5]}>
      {/*
      <Suspense fallback="loading...">
        {briefcases.map((item, index) => {
          const x = positionsBriefcases[index * 3];
          const y = positionsBriefcases[index * 3 + 1];
          const z = positionsBriefcases[index * 3 + 2];

          return (
            <Briefcase
              key={item.id}
              position={[x, y, z]}
              isSelected={item.id === selectedId}
            />
          );
        })}
      </Suspense>
*/}
      <Grid texture={smallCrossTexture} positions={positionsSmallCross} />
      <Grid texture={largeCrossTexture} positions={positionsBigCross} />
    </group>
  );
};

export default GridsContainer;
