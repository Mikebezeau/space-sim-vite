import * as THREE from "three";

const SoftParticlesShader = {
  defines: {
    USE_SIZEATTENUATION: true,
  },

  uniforms: {
    diffuse: {
      value: new THREE.Color(1, 1, 1),
    },
    map: {
      value: null,
    },
    opacity: {
      value: 1,
    },
    scale: {
      value: 329,
    },
    size: {
      value: 1,
    },
    uvTransform: {
      value: new THREE.Matrix3().set(1, 0, 0, 0, 1, 0, 0, 0, 1),
    },
    fCamNear: {
      value: 0.1,
    },
    fCamFar: {
      value: 1000,
    },
    sceneDepthTexture: {
      value: null,
    },
    screenSize: {
      value: null,
    },
    sizeAttenuation: {
      value: true,
    },
  },

  vertexShader: [
    "uniform float size;",
    "uniform float scale;",

    "void main() {",
    "#include <begin_vertex>",
    "#include <project_vertex>",

    "gl_PointSize = size;",
    "#ifdef USE_SIZEATTENUATION",
    "bool isPerspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 );",
    "if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );",
    "#endif",
    "}",
  ].join("\n"),

  fragmentShader: [
    "uniform vec3 diffuse;",
    "uniform float opacity;",

    "#include <map_particle_pars_fragment>",

    "uniform sampler2D sceneDepthTexture;",
    "uniform vec2 screenSize;",
    "uniform float fCamNear;",
    "uniform float fCamFar;",

    "float fadeEdge( float particleDepth, float sceneDepth ){",
    // margin makes it blend through the solid objects a little bit more, creating illusion of density
    "float extraMargin = 0.015; ",
    "float a = ( sceneDepth+extraMargin - particleDepth ) * 120.0;",
    "if( a <= 0.0 ) return 0.0;",
    "if( a >= 1.0 ) return 1.0;",

    "if( a < 0.5 ) a = 2.0 * a * a;",
    "else a = -2.0 * pow( a - 1.0 , 2.0 ) + 1.0;",

    "return a;",
    "}",

    "#include <packing>",
    "float getLinearDepth( float fragCoordZ ) {",

    "float viewZ = perspectiveDepthToViewZ( fragCoordZ, fCamNear, fCamFar );",
    "return viewZToOrthographicDepth( viewZ, fCamNear, fCamFar );",
    "}",

    "void main() {",
    "vec3 outgoingLight = vec3( 0.0 );",
    "vec4 diffuseColor = vec4( diffuse, opacity );",

    "#include <map_particle_fragment>",
    "outgoingLight = diffuseColor.rgb;",

    "vec2 screenCoords = gl_FragCoord.xy / screenSize;",
    "float thisDepth = getLinearDepth( gl_FragCoord.z );",
    "float solidsDepth = texture2D( sceneDepthTexture , screenCoords ).r;",
    "solidsDepth = getLinearDepth( solidsDepth );",
    "float alphaScale = fadeEdge( thisDepth, solidsDepth );",
    "diffuseColor.a *= alphaScale;",

    "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
    "}",
  ].join("\n"),
};

class DepthParticleController {
  constructor(options) {
    options = options || {};
    this.smokeTexture = options.particleSpriteTex || null;
    this.smokeGeo = new THREE.BufferGeometry();
    this.target = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );
  }

  initParticles(camera) {
    var numOfParticles = 20; // 20
    var spreadX = 18,
      spreadY = 4,
      spreadZ = 18; // 18 4 18
    var origin = new THREE.Vector3(0, 0, -630); // 0 1 0

    var posArr = [];

    for (var i = 0; i < numOfParticles; i++) {
      var x = Math.random() * spreadX - spreadX / 2.0 + origin.x;
      var y = Math.random() * spreadY - spreadY / 2.0 + origin.y;
      var z = Math.random() * spreadZ - spreadZ / 2.0 + origin.z;

      posArr.push(x, y, z);
    }

    this.smokeGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(posArr, 3)
    );
    var softParticlesMaterial = new THREE.ShaderMaterial({
      defines: Object.assign({}, SoftParticlesShader.defines),
      uniforms: THREE.UniformsUtils.clone(SoftParticlesShader.uniforms),
      vertexShader: SoftParticlesShader.vertexShader,
      fragmentShader: SoftParticlesShader.fragmentShader,

      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });

    var uniforms = softParticlesMaterial.uniforms;

    uniforms.map.value = this.smokeTexture;
    uniforms.diffuse.value = new THREE.Color(1, 1, 1);
    uniforms.size.value = 25;
    uniforms.opacity.value = 0.1;
    uniforms.sizeAttenuation.value = true;
    uniforms.fCamNear.value = camera.near;
    uniforms.fCamFar.value = camera.far;
    uniforms.screenSize.value = new THREE.Vector2(
      window.innerWidth,
      window.innerHeight
    );

    softParticlesMaterial.map = this.smokeTexture;

    this.smokeParticles = new THREE.Points(
      this.smokeGeo,
      softParticlesMaterial
    );
    this.smokeParticles.frustumCulled = false;

    var depthTexture = new THREE.DepthTexture();
    depthTexture.type = THREE.UnsignedShortType;
    depthTexture.minFilter = THREE.NearestFilter;
    depthTexture.maxFilter = THREE.NearestFilter;

    this.target.texture.format = THREE.RGBFormat;
    this.target.texture.minFilter = THREE.NearestFilter;
    this.target.texture.magFilter = THREE.NearestFilter;
    this.target.texture.generateMipmaps = false;
    this.target.stencilBuffer = false;
    this.target.depthBuffer = true;
    this.target.depthTexture = new THREE.DepthTexture();
    this.target.depthTexture.type = THREE.UnsignedShortType;

    this.smokeParticles.material.uniforms.sceneDepthTexture.value =
      depthTexture;
  }

  animate(renderer, scene, camera) {
    //this.smokeParticles.rotation.y += 0.02;
    renderer.setRenderTarget(this.target);
    //renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    //renderer.render(scene, camera);
  }

  dispose() {
    this.smokeParticles.dispose();
    this.smokeTexture.dispose();
  }
}

export default DepthParticleController;
