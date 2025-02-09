import * as THREE from "three";
import { GPU_PARTICLE_SHADER } from "../constants/particleConstants";

const UPDATEABLE_ATTRIBUTES = [
  "aSprite",
  "aDesign",
  "positionStart",
  "startTime",
  "velocity",
  "acceleration",
  "aAngle",
  "color",
  "endColor",
  "aSize",
  "lifeTime",
];

export interface ParticleControllerInt {
  geometryUpdate(): void;
  random(): void;
  spawnParticle(options: any): void;
  update(ttime: number): void;
  dispose(): void;
}

class ParticleController implements ParticleControllerInt {
  blending: any;
  PARTICLE_COUNT: number;
  PARTICLE_CURSOR: number;
  time: number;
  offset: number;
  count: number;
  DPR: number;
  particleUpdate: boolean;
  particleNeedClearUpdateRanges: boolean;
  onTick: any;
  reverseTime: boolean;
  fadeIn: number;
  fadeOut: number;
  rand: number[];
  i: number;
  sprite: THREE.Texture;
  sprite1: THREE.Texture;
  material: THREE.ShaderMaterial;
  geometry: THREE.BufferGeometry;
  particleSystem: THREE.Points;
  newParticle: {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    acceleration: THREE.Vector3;
    color: THREE.Color;
    endColor: THREE.Color;
  };

  constructor(options: any) {
    options = options || {};
    this.blending = options.blending ? options.blending : THREE.NormalBlending;
    this.PARTICLE_COUNT = options.maxParticles || 300000;
    this.PARTICLE_CURSOR = 0;
    this.time = 0;
    this.offset = 0;
    this.count = 0;
    this.DPR = window.devicePixelRatio;
    this.particleUpdate = false;
    this.particleNeedClearUpdateRanges = false;
    this.onTick = options.onTick;

    this.reverseTime = options.reverseTime;
    this.fadeIn = options.fadeIn || 1;
    if (this.fadeIn === 0) this.fadeIn = 0.001;
    this.fadeOut = options.fadeOut || 1;
    if (this.fadeOut === 0) this.fadeOut = 0.001;

    // preload a 10_000 random numbers from -0.5 to 0.5
    this.rand = [];
    let i: number;
    for (i = 1e5; i > 0; i--) {
      this.rand.push(Math.random() - 0.5);
    }
    this.i = i;

    //setup the texture
    this.sprite = options.particleSpriteTex || null;
    this.sprite1 = options.particleSpriteTex1 || null;
    if (!this.sprite) throw new Error("No particle sprite texture specified");

    //setup the shader material
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthTest: true, // default is true
      depthWrite: false, // default is true
      uniforms: {
        uTime: {
          value: 0.0,
        },
        uScale: {
          value: 1.0,
        },
        tSprite: {
          value: this.sprite,
        },
        uSprite1: {
          value: this.sprite1,
        },
        reverseTime: {
          value: this.reverseTime,
        },
        fadeIn: {
          value: this.fadeIn,
        },
        fadeOut: {
          value: this.fadeOut,
        },
      },
      blending: this.blending,
      vertexShader: GPU_PARTICLE_SHADER.vertexShader,
      fragmentShader: GPU_PARTICLE_SHADER.fragmentShader,
    });

    // geometry
    this.geometry = new THREE.BufferGeometry();

    // attributes
    // what sprite or design to use
    this.geometry.setAttribute(
      "aSprite",
      new THREE.BufferAttribute(
        new Float32Array(this.PARTICLE_COUNT),
        1
      ).setUsage(THREE.DynamicDrawUsage)
    );
    this.geometry.setAttribute(
      "aDesign",
      new THREE.BufferAttribute(
        new Float32Array(this.PARTICLE_COUNT),
        1
      ).setUsage(THREE.DynamicDrawUsage)
    );
    //vec3 attributes
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array(this.PARTICLE_COUNT * 3),
        3
      ).setUsage(THREE.DynamicDrawUsage)
    );
    this.geometry.setAttribute(
      "positionStart",
      new THREE.BufferAttribute(
        new Float32Array(this.PARTICLE_COUNT * 3),
        3
      ).setUsage(THREE.DynamicDrawUsage)
    );
    this.geometry.setAttribute(
      "velocity",
      new THREE.BufferAttribute(
        new Float32Array(this.PARTICLE_COUNT * 3),
        3
      ).setUsage(THREE.DynamicDrawUsage)
    );
    this.geometry.setAttribute(
      "acceleration",
      new THREE.BufferAttribute(
        new Float32Array(this.PARTICLE_COUNT * 3),
        3
      ).setUsage(THREE.DynamicDrawUsage)
    );
    this.geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(
        new Float32Array(this.PARTICLE_COUNT * 3),
        3
      ).setUsage(THREE.DynamicDrawUsage)
    );
    this.geometry.setAttribute(
      "endColor",
      new THREE.BufferAttribute(
        new Float32Array(this.PARTICLE_COUNT * 3),
        3
      ).setUsage(THREE.DynamicDrawUsage)
    );

    //scalar attributes
    this.geometry.setAttribute(
      "aAngle",
      new THREE.BufferAttribute(
        new Float32Array(this.PARTICLE_COUNT),
        1
      ).setUsage(THREE.DynamicDrawUsage)
    );
    this.geometry.setAttribute(
      "startTime",
      new THREE.BufferAttribute(
        new Float32Array(this.PARTICLE_COUNT),
        1
      ).setUsage(THREE.DynamicDrawUsage)
    );
    this.geometry.setAttribute(
      "aSize",
      new THREE.BufferAttribute(
        new Float32Array(this.PARTICLE_COUNT),
        1
      ).setUsage(THREE.DynamicDrawUsage)
    );
    this.geometry.setAttribute(
      "lifeTime",
      new THREE.BufferAttribute(
        new Float32Array(this.PARTICLE_COUNT),
        1
      ).setUsage(THREE.DynamicDrawUsage)
    );

    this.particleSystem = new THREE.Points(this.geometry, this.material);
    this.particleSystem.frustumCulled = false;

    // reusable vectors and colors for adding new particles
    this.newParticle = {
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      acceleration: new THREE.Vector3(),
      color: new THREE.Color(),
      endColor: new THREE.Color(),
    };
  }

  /*
  This updates the geometry on the shader if at least one particle has been spawned.
  It uses the offset and the count to determine which part of the data needs to actually
  be sent to the GPU. This ensures no more data than necessary is sent.
  */
  geometryUpdate() {
    if (this.particleUpdate === true) {
      this.particleUpdate = false;
      this.particleNeedClearUpdateRanges = true;
      UPDATEABLE_ATTRIBUTES.forEach((name) => {
        if (this.offset + this.count < this.PARTICLE_COUNT) {
          const attr = this.geometry.getAttribute(name);
          // @ts-ignore: Property 'addUpdateRange' does not exist on type 'InterleavedBufferAttribute'.ts(2339)
          attr.addUpdateRange(
            this.offset * attr.itemSize,
            this.count * attr.itemSize
          );
          attr.needsUpdate = true;
        }
      });
      this.offset = 0;
      this.count = 0;
    } else if (this.particleNeedClearUpdateRanges) {
      this.particleNeedClearUpdateRanges = false;
      UPDATEABLE_ATTRIBUTES.forEach((name) => {
        const attr = this.geometry.getAttribute(name);
        // @ts-ignore: Property 'clearUpdateRanges' does not exist on type 'InterleavedBufferAttribute'.ts(2339)
        attr.clearUpdateRanges();
      });
    }
  }

  //use one of the random numbers
  random() {
    return ++this.i >= this.rand.length
      ? this.rand[(this.i = 1)]
      : this.rand[this.i];
  }

  update(delta: number) {
    this.time += delta;
    this.material.uniforms.uTime.value = this.time;
    if (this.onTick) this.onTick(this, this.time);
    this.geometryUpdate();
  }

  dispose() {
    this.material.dispose();
    this.sprite.dispose();
    this.geometry.dispose();
  }

  /* spawn a particle

    This works by updating values inside of
    the attribute arrays, then updates the count and the PARTICLE_CURSOR and
    sets particleUpdate to true.

    This if spawnParticle is called three times in a row before rendering,
    then count will be 3 and the cursor will have moved by three.
  */
  spawnParticle(options: {
    position?: THREE.Vector3 | { x: number; y: number; z: number };
    velocity?: THREE.Vector3 | { x: number; y: number; z: number };
    acceleration?: THREE.Vector3 | { x: number; y: number; z: number };
    color?: THREE.Color;
    endColor?: THREE.Color;
    lifetime?: number;
    size?: number;
    sizeRandomness?: number;
    sprite?: number;
    design?: number;
    angle?: number;
  }) {
    const spriteAttribute = this.geometry.getAttribute("aSprite");
    const designAttribute = this.geometry.getAttribute("aDesign");
    const positionStartAttribute = this.geometry.getAttribute("positionStart");
    const startTimeAttribute = this.geometry.getAttribute("startTime");
    const velocityAttribute = this.geometry.getAttribute("velocity");
    const accelerationAttribute = this.geometry.getAttribute("acceleration");
    const angleAttribute = this.geometry.getAttribute("aAngle");
    const colorAttribute = this.geometry.getAttribute("color");
    const endcolorAttribute = this.geometry.getAttribute("endColor");
    const sizeAttribute = this.geometry.getAttribute("aSize");
    const lifeTimeAttribute = this.geometry.getAttribute("lifeTime");

    options = options || {};

    this.newParticle.position =
      options.position !== undefined
        ? this.newParticle.position.copy(options.position)
        : this.newParticle.position.set(0, 0, 0);
    this.newParticle.velocity =
      options.velocity !== undefined
        ? this.newParticle.velocity.copy(options.velocity)
        : this.newParticle.velocity.set(0, 0, 0);
    this.newParticle.acceleration =
      options.acceleration !== undefined
        ? this.newParticle.acceleration.copy(options.acceleration)
        : this.newParticle.acceleration.set(0, 0, 0);
    this.newParticle.color =
      options.color !== undefined
        ? this.newParticle.color.copy(options.color)
        : this.newParticle.color.set(0xffffff);
    this.newParticle.endColor =
      options.endColor !== undefined
        ? this.newParticle.endColor.copy(options.endColor)
        : this.newParticle.endColor.copy(this.newParticle.color);

    const lifetime = options.lifetime !== undefined ? options.lifetime : 5;
    let aSize = options.size !== undefined ? options.size : 500;
    const sizeRandomness =
      options.sizeRandomness !== undefined ? options.sizeRandomness : 0;
    if (this.DPR !== undefined) aSize *= this.DPR;
    const i = this.PARTICLE_CURSOR;

    // what sprite or 'shader drawn' design to use
    spriteAttribute.array[i] = options.sprite || 0;
    designAttribute.array[i] = options.design || 0;

    positionStartAttribute.array[i * 3 + 0] = this.newParticle.position.x;
    positionStartAttribute.array[i * 3 + 1] = this.newParticle.position.y;
    positionStartAttribute.array[i * 3 + 2] = this.newParticle.position.z;

    velocityAttribute.array[i * 3 + 0] = this.newParticle.velocity.x;
    velocityAttribute.array[i * 3 + 1] = this.newParticle.velocity.y;
    velocityAttribute.array[i * 3 + 2] = this.newParticle.velocity.z;

    accelerationAttribute.array[i * 3 + 0] = this.newParticle.acceleration.x;
    accelerationAttribute.array[i * 3 + 1] = this.newParticle.acceleration.y;
    accelerationAttribute.array[i * 3 + 2] = this.newParticle.acceleration.z;

    colorAttribute.array[i * 3 + 0] = this.newParticle.color.r;
    colorAttribute.array[i * 3 + 1] = this.newParticle.color.g;
    colorAttribute.array[i * 3 + 2] = this.newParticle.color.b;

    endcolorAttribute.array[i * 3 + 0] = this.newParticle.endColor.r;
    endcolorAttribute.array[i * 3 + 1] = this.newParticle.endColor.g;
    endcolorAttribute.array[i * 3 + 2] = this.newParticle.endColor.b;

    angleAttribute.array[i] = options.angle !== undefined ? options.angle : 0;

    //aSize, lifetime and starttime
    sizeAttribute.array[i] = aSize + this.random() * sizeRandomness;
    lifeTimeAttribute.array[i] = lifetime;
    startTimeAttribute.array[i] = this.time;
    // offset
    if (this.offset === 0) this.offset = this.PARTICLE_CURSOR;
    // counter and cursor
    this.count++;
    this.PARTICLE_CURSOR++;
    //wrap the cursor around
    if (this.PARTICLE_CURSOR >= this.PARTICLE_COUNT) this.PARTICLE_CURSOR = 0;
    this.particleUpdate = true;
  }
}

export default ParticleController;
