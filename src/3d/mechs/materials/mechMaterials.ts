import {
  Color,
  FrontSide,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  ShaderMaterial,
} from "three";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";

const mechMaterialColor = {};

export const getMechMaterialColor = (color?: string) => {
  if (!color) {
    color = "#FFFFFF";
  }
  if (!mechMaterialColor[color]) {
    mechMaterialColor[color] = new MeshPhysicalMaterial({
      color: new Color(color),
      flatShading: true,
      side: FrontSide,
    });
  }
  return mechMaterialColor[color]!;
};

export const mechMaterial = {
  hitMaterial: getMechMaterialColor("#006"),
  selectMaterial: getMechMaterialColor("#CCCCFF"),
  readoutMaterial_0: getMechMaterialColor("#666699"),
  readoutMaterial_25: getMechMaterialColor("#996666"),
  readoutMaterial_75: getMechMaterialColor("#990000"),
  readoutMaterial_100: getMechMaterialColor("#000000"),
  wireFrameMaterial: new MeshBasicMaterial({
    color: new Color("#00Ff00"),
    wireframe: true,
  }),
};

// instanced mechs use special shader material to hide when destroyed
const mechInstancedMaterialColor = {};

export const getMechInstancedMaterialColor = (color: Color) => {
  if (!mechInstancedMaterialColor[color.getHexString()]) {
    mechInstancedMaterialColor[color.getHexString()] = new CustomShaderMaterial<
      typeof ShaderMaterial
    >({
      // @ts-ignore
      color: color,
      flatShading: true,
      side: FrontSide,
      // @ts-ignore
      baseMaterial: MeshPhysicalMaterial,
      vertexShader: `
attribute float isDead;

void main() {
  if(isDead > 0.0) csm_Position = vec3( 0, 0, -1 );
}
`,
      fragmentShader: ``,
    });
  }
  return mechInstancedMaterialColor[color.getHexString()]!;
};

export const mechInstancedMaterialHitDetect = new CustomShaderMaterial<
  typeof ShaderMaterial
>({
  // @ts-ignore
  baseMaterial: MeshBasicMaterial,
  vertexShader: `
void main() {
csm_Position = vec3( 0, 0, -1 );//hide all instances (only used for hit detection)
}
`,
  fragmentShader: ``,
});
