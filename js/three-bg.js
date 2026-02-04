import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

export function initThreeBackground() {
  // --- CONFIGURACIÓN ---
  const STATES = {
    hero: {
      color: new THREE.Color(0xffffff),
      emissive: new THREE.Color(0x000000),
      roughness: 0.1,
      metalness: 1.0,
      waveType: 0,
      freq: 0.2,
      amp: 1.0,
      bloom: 0.55,
      particles: 0.1,
      medical: 0.0,
      noGrid: 0.0,
      showValueBackdrop: 0.0,
    },
    quantum: {
      color: new THREE.Color(0x220011),
      emissive: new THREE.Color(0xff0055),
      roughness: 0.0,
      metalness: 0.8,
      waveType: 1,
      freq: 2.0,
      amp: 0.5,
      bloom: 0.6,
      particles: 0.18,
      medical: 0.0,
      noGrid: 0.0,
      showValueBackdrop: 0.0,
    },
    semi: {
      color: new THREE.Color(0x001133),
      emissive: new THREE.Color(0x00ffff),
      roughness: 0.2,
      metalness: 0.9,
      waveType: 2,
      freq: 0.8,
      amp: 0.4,
      bloom: 0.62,
      particles: 0.22,
      medical: 0.0,
      noGrid: 0.0,
      showValueBackdrop: 0.0,
    },
    extreme: {
      color: new THREE.Color(0x221100),
      emissive: new THREE.Color(0xffaa00),
      roughness: 0.4,
      metalness: 0.6,
      waveType: 0,
      freq: 0.1,
      amp: 2.5,
      bloom: 0.58,
      particles: 0.2,
      medical: 0.0,
      noGrid: 0.0,
      showValueBackdrop: 0.0,
    },
    value: {
      color: new THREE.Color(0x150b22),
      emissive: new THREE.Color(0x8b5cf6),
      roughness: 0.18,
      metalness: 0.75,
      waveType: 1,
      freq: 1.1,
      amp: 0.6,
      bloom: 0.64,
      particles: 0.25,
      medical: 0.0,
      noGrid: 1.0,
      showValueBackdrop: 1.0,
    },
    medical: {
      color: new THREE.Color(0x001408),
      emissive: new THREE.Color(0x35ff6a),
      roughness: 0.12,
      metalness: 0.08,
      waveType: 2,
      freq: 0.7,
      amp: 0.35,
      bloom: 0.85,
      particles: 0.85,
      medical: 1.0,
      noGrid: 1.0,
      showValueBackdrop: 0.0,
    },
  };

  let current = { ...STATES.hero };
  let target = STATES.hero;

  // --- SETUP ---
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020202);
  scene.fog = new THREE.FogExp2(0x020202, 0.02);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    220
  );
  camera.position.set(0, 25, 50);

  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: "high-performance",
    stencil: true, // ✅ para recortar por stencil
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  document.body.appendChild(renderer.domElement);

  // --- LUCES ---
  scene.add(new THREE.AmbientLight(0xffffff, 2.0));
  const mainLight = new THREE.DirectionalLight(0xffffff, 3.0);
  mainLight.position.set(10, 20, 10);
  scene.add(mainLight);

  // =========================================================
  // GRID (MALLA ORIGINAL) — INTACTO
  // =========================================================
  const geometry = new THREE.TetrahedronGeometry(0.15, 0);
  geometry.scale(1, 5, 1);
  geometry.rotateX(Math.PI / 2);

  const material = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.1,
    metalness: 1.0,
    emissive: 0x000000,
    emissiveIntensity: 1.0,
    transparent: true,
    opacity: 1.0,
  });

  const ROWS = 100;
  const COLS = 100;

  const gridMesh = new THREE.InstancedMesh(geometry, material, ROWS * COLS);
  gridMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(gridMesh);

  const dummy = new THREE.Object3D();
  const positions = [];
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      positions.push({
        x: (i - COLS / 2) * 0.7,
        z: (j - ROWS / 2) * 0.7,
      });
      gridMesh.setMatrixAt(i * ROWS + j, dummy.matrix);
    }
  }

  // =========================================================
  // PARTÍCULAS (GENERALES)
  // =========================================================
  const PCOUNT = 1800;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(PCOUNT * 3);
  const pVel = new Float32Array(PCOUNT);

  const rangeX = 80;
  const rangeY = 28;
  const rangeZ = 140;

  for (let i = 0; i < PCOUNT; i++) {
    const ix = i * 3;
    pPos[ix + 0] = (Math.random() - 0.5) * rangeX;
    pPos[ix + 1] = Math.random() * rangeY + 2;
    pPos[ix + 2] = (Math.random() - 0.5) * rangeZ;
    pVel[i] = 6 + Math.random() * 18;
  }

  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));

  const pMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.08,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(pGeo, pMat);
  particles.frustumCulled = false;
  scene.add(particles);

  // =========================================================
  // VALUE BACKDROP (NETWORK)
  // =========================================================
  const valueBackdrop = new THREE.Group();
  valueBackdrop.frustumCulled = false;
  valueBackdrop.visible = false;
  scene.add(valueBackdrop);

  const VALUE_NODES = 170;
  const valueGeo = new THREE.BufferGeometry();
  const valueBasePos = new Float32Array(VALUE_NODES * 3);
  const valuePos = new Float32Array(VALUE_NODES * 3);
  const valueSeeds = new Float32Array(VALUE_NODES);

  const valueRangeX = 78;
  const valueRangeY = 32;
  const valueRangeZ = 120;

  for (let i = 0; i < VALUE_NODES; i++) {
    const ix = i * 3;
    const x = (Math.random() - 0.5) * valueRangeX;
    const y = Math.random() * valueRangeY + 6;
    const z = (Math.random() - 0.5) * valueRangeZ;

    valueBasePos[ix + 0] = x;
    valueBasePos[ix + 1] = y;
    valueBasePos[ix + 2] = z;

    valuePos[ix + 0] = x;
    valuePos[ix + 1] = y;
    valuePos[ix + 2] = z;

    valueSeeds[i] = Math.random() * Math.PI * 2;
  }

  valueGeo.setAttribute("position", new THREE.BufferAttribute(valuePos, 3));

  const valueMat = new THREE.PointsMaterial({
    color: 0x8b5cf6,
    size: 0.07,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.1,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const valuePoints = new THREE.Points(valueGeo, valueMat);
  valuePoints.frustumCulled = false;
  valueBackdrop.add(valuePoints);

  const valueConnections = [];
  const maxConnectionsPerNode = 2;
  const maxDistance = 18;
  const attemptsPerNode = 5;

  for (let i = 0; i < VALUE_NODES; i++) {
    let connectionsForNode = 0;
    for (let attempt = 0; attempt < attemptsPerNode; attempt++) {
      if (connectionsForNode >= maxConnectionsPerNode) break;
      const j = Math.floor(Math.random() * VALUE_NODES);
      if (i === j) continue;
      const ix = i * 3;
      const jx = j * 3;
      const dx = valueBasePos[ix] - valueBasePos[jx];
      const dy = valueBasePos[ix + 1] - valueBasePos[jx + 1];
      const dz = valueBasePos[ix + 2] - valueBasePos[jx + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist <= maxDistance) {
        valueConnections.push([i, j]);
        connectionsForNode++;
      }
    }
  }

  const valueLineGeo = new THREE.BufferGeometry();
  const linePositions = new Float32Array(valueConnections.length * 2 * 3);
  valueLineGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(linePositions, 3)
  );

  const valueLineMat = new THREE.LineBasicMaterial({
    color: 0x8b5cf6,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const valueLines = new THREE.LineSegments(valueLineGeo, valueLineMat);
  valueLines.frustumCulled = false;
  valueBackdrop.add(valueLines);

  // =========================================================
  // MEDICAL GROUP
  // =========================================================
  const medicalGroup = new THREE.Group();
  medicalGroup.frustumCulled = false;
  scene.add(medicalGroup);

  const bubbleUniforms = {
    uTime: { value: 0 },
    uTint: { value: new THREE.Color(0x35ff6a) },
    uOpacity: { value: 0.0 },
    uGlow: { value: 1.0 },
  };

  const bubbleMat = new THREE.ShaderMaterial({
    uniforms: bubbleUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    vertexShader: `
      attribute float aSeed;
      attribute float aDepth;
      varying vec2 vUv;
      varying float vSeed;
      varying float vDepth;
      varying vec2 vScreen;

      void main(){
        vUv = uv;
        vSeed = aSeed;
        vDepth = aDepth;

        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        vec4 clip = projectionMatrix * mvPosition;

        vScreen = clip.xy / clip.w * 0.5 + 0.5;

        gl_Position = clip;
      }
    `,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      varying float vSeed;
      varying float vDepth;
      varying vec2 vScreen;

      uniform float uTime;
      uniform vec3 uTint;
      uniform float uOpacity;
      uniform float uGlow;

      float hash(float n){ return fract(sin(n)*43758.5453123); }

      float noise(vec2 x){
        vec2 p = floor(x);
        vec2 f = fract(x);
        f = f*f*(3.0-2.0*f);
        float n = p.x + p.y*57.0 + vSeed*113.0;
        float a = hash(n+0.0);
        float b = hash(n+1.0);
        float c = hash(n+57.0);
        float d = hash(n+58.0);
        return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
      }

      void main(){
        vec2 uv = vUv*2.0 - 1.0;
        float r = length(uv);

        float mask = smoothstep(1.0, 0.92, r);
        float cut  = smoothstep(1.03, 0.99, r);
        if(cut < 0.01) discard;

        float rim = smoothstep(0.62, 0.98, r);
        rim = pow(rim, 2.3);

        vec2 hl = uv - vec2(-0.24, 0.20);
        float hls = exp(-dot(hl, hl) * 10.0);

        float t = uTime*0.30 + vSeed*10.0;
        vec2 w = uv * (2.2 + vDepth*1.1);
        float n1 = noise(w*3.2 + vec2(t, -t));
        float n2 = noise(w*6.0 + vec2(-t*1.1, t*0.9));
        float liquid = smoothstep(0.35, 0.80, n1*0.55 + n2*0.45);

        float innerShade = smoothstep(0.0, 0.95, r);
        innerShade = 1.0 - innerShade;
        innerShade *= 0.35;

        float depthFade = 0.60 + (1.0 - vDepth) * 0.55;

        vec3 base = mix(vec3(0.02,0.05,0.03), uTint*0.18, 0.45);
        vec3 col  = base;

        col += uTint * (liquid * 0.16) * depthFade;
        col += uTint * (rim * 0.55) * uGlow * depthFade;
        col += vec3(1.0) * (hls * 0.22) * depthFade;
        col -= vec3(0.0,0.06,0.02) * innerShade;

        float alpha = (0.08 + rim*0.25 + hls*0.08 + liquid*0.10) * mask;
        alpha *= uOpacity * depthFade;

        float margin = 0.08;
        float ex = smoothstep(0.0, margin, vScreen.x) * smoothstep(0.0, margin, 1.0 - vScreen.x);
        float ey = smoothstep(0.0, margin, vScreen.y) * smoothstep(0.0, margin, 1.0 - vScreen.y);
        float edgeFade = ex * ey;

        float topCut = smoothstep(0.02, 0.14, vScreen.y);
        edgeFade *= topCut;

        alpha *= edgeFade;

        col = clamp(col, 0.0, 0.95);

        gl_FragColor = vec4(col, alpha);
      }
    `,
  });

  bubbleMat.stencilWrite = true;
  bubbleMat.stencilFunc = THREE.NotEqualStencilFunc;
  bubbleMat.stencilRef = 1;
  bubbleMat.stencilZPass = THREE.KeepStencilOp;

  const bubbleGeo = new THREE.PlaneGeometry(1, 1);
  const BCOUNT = 95;

  const bubbleSeeds = new Float32Array(BCOUNT);
  const bubbleDepth = new Float32Array(BCOUNT);

  const bubbles = new THREE.InstancedMesh(bubbleGeo, bubbleMat, BCOUNT);
  bubbles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  bubbles.frustumCulled = false;
  medicalGroup.add(bubbles);

  const bubbleDummy = new THREE.Object3D();
  const bubbleData = new Array(BCOUNT);

  const areaX = 125;
  const areaY = 62;
  const areaZ = 220;

  for (let i = 0; i < BCOUNT; i++) {
    const depth01 = Math.random();
    const sizeBase =
      i < 10 ? 9 + Math.random() * 13 :
      i < 30 ? 4 + Math.random() * 7 :
               1.6 + Math.random() * 4.2;

    const z = -areaZ * 0.5 + depth01 * areaZ;

    bubbleData[i] = {
      x: (Math.random() - 0.5) * areaX,
      y: (Math.random() - 0.5) * areaY + 14,
      z,
      s: sizeBase, // ✅ sin escalado por profundidad
      a: Math.random() * Math.PI * 2,
      sp: 0.35 + Math.random() * 1.05,
      depth01,
    };

    bubbleSeeds[i] = Math.random();
    bubbleDepth[i] = depth01;
  }

  bubbles.geometry.setAttribute(
    "aSeed",
    new THREE.InstancedBufferAttribute(bubbleSeeds, 1)
  );
  bubbles.geometry.setAttribute(
    "aDepth",
    new THREE.InstancedBufferAttribute(bubbleDepth, 1)
  );

  // Dust microscópico
  const DUST = 2600;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(DUST * 3);
  const dustSpd = new Float32Array(DUST);

  for (let i = 0; i < DUST; i++) {
    const ix = i * 3;
    dustPos[ix + 0] = (Math.random() - 0.5) * 210;
    dustPos[ix + 1] = (Math.random() - 0.5) * 90 + 16;
    dustPos[ix + 2] = -120 + Math.random() * 240;
    dustSpd[i] = 0.6 + Math.random() * 1.6;
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));

  const dustMat = new THREE.PointsMaterial({
    color: 0x35ff6a,
    size: 0.055,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  dustMat.stencilWrite = true;
  dustMat.stencilFunc = THREE.NotEqualStencilFunc;
  dustMat.stencilRef = 1;
  dustMat.stencilZPass = THREE.KeepStencilOp;

  const dustPts = new THREE.Points(dustGeo, dustMat);
  dustPts.frustumCulled = false;
  medicalGroup.add(dustPts);

  // =========================================================
  // STENCIL MASK: marca el área del card
  // =========================================================
  const maskScene = new THREE.Scene();
  const maskCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
  maskCam.position.z = 1;

  const maskMat = new THREE.MeshBasicMaterial({
    colorWrite: false,
    depthWrite: false,
    depthTest: false,
  });
  maskMat.stencilWrite = true;
  maskMat.stencilFunc = THREE.AlwaysStencilFunc;
  maskMat.stencilRef = 1;
  maskMat.stencilZPass = THREE.ReplaceStencilOp;

  const maskMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), maskMat);
  maskScene.add(maskMesh);

  function setMaskFromElement(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;

    const w = window.innerWidth;
    const h = window.innerHeight;

    const ndcW = (r.width / w) * 2;
    const ndcH = (r.height / h) * 2;

    const centerX = (r.left + r.width / 2) / w;
    const centerY = (r.top + r.height / 2) / h;

    const ndcX = centerX * 2 - 1;
    const ndcY = 1 - centerY * 2;

    const pad = 0.06;
    maskMesh.position.set(ndcX, ndcY, 0);
    maskMesh.scale.set(ndcW + pad, ndcH + pad, 1);

    return true;
  }

  // =========================================================
  // POST-PROCESSING
  // =========================================================
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = 0.1;
  bloomPass.strength = 0.6;
  bloomPass.radius = 0.8;
  composer.addPass(bloomPass);

  // =========================================================
  // SCREEN FX (solo Medical)
  // =========================================================
  const fxUniforms = {
    uTime: { value: 0 },
    uIntensity: { value: 0 },
    uTint: { value: new THREE.Color(0x35ff6a) },
    uResolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
  };

  const fxMat = new THREE.ShaderMaterial({
    uniforms: fxUniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform float uIntensity;
      uniform vec3 uTint;

      float hash(vec2 p){
        p = fract(p*vec2(123.34, 456.21));
        p += dot(p,p+45.32);
        return fract(p.x*p.y);
      }

      void main(){
        float I = clamp(uIntensity, 0.0, 1.0);
        if(I < 0.001){
          gl_FragColor = vec4(0.0);
          return;
        }

        vec2 uv = vUv;

        float scan = sin((uv.y * 900.0) + uTime*6.0) * 0.5 + 0.5;
        scan = smoothstep(0.35, 0.65, scan);

        float sweep = sin((uv.y*6.0) - uTime*1.2) * 0.5 + 0.5;
        sweep = smoothstep(0.80, 1.0, sweep);

        float n = hash(uv * vec2(800.0, 450.0) + uTime*vec2(0.3, 0.7));
        n = (n - 0.5);

        vec2 c = uv - 0.5;
        float v = 1.0 - smoothstep(0.12, 0.58, dot(c,c));

        float fx = 0.0;
        fx += scan * 0.10;
        fx += sweep * 0.10;
        fx += n * 0.05;
        fx *= v;

        vec3 col = uTint * fx;
        gl_FragColor = vec4(col, 0.45 * I);
      }
    `,
  });

  fxMat.stencilWrite = true;
  fxMat.stencilFunc = THREE.NotEqualStencilFunc;
  fxMat.stencilRef = 1;
  fxMat.stencilZPass = THREE.KeepStencilOp;

  const fxGeo = new THREE.PlaneGeometry(2, 2);
  const fxMesh = new THREE.Mesh(fxGeo, fxMat);

  const fxScene = new THREE.Scene();
  const fxCam = new THREE.Camera();
  fxScene.add(fxMesh);

  // --- INPUT ---
  const clock = new THREE.Clock();
  const damp = (lambda, dt) => 1 - Math.exp(-lambda * dt);
  let lastT = 0;

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const targetPos = new THREE.Vector3(0, -100, 0);

  const onMouseMove = (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  };
  window.addEventListener("mousemove", onMouseMove, { passive: true });

  // --- API ---
  function setTargetState(name) {
    target = STATES[name] ?? STATES.hero;
  }

  // ---------- ANTI-PETADAS ----------
  let rafId = 0;
  let running = true;
  let contextLost = false;

  function forceResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));

    composer.setSize(window.innerWidth, window.innerHeight);
    bloomPass.setSize(window.innerWidth, window.innerHeight);

    fxUniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  }

  function resetAfterSleep() {
    clock.stop();
    clock.start();
    lastT = 0;
    targetPos.set(0, -100, 0);
    forceResize();
  }

  function stopLoop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  const canvas = renderer.domElement;

  const onContextLost = (e) => {
    e.preventDefault();
    contextLost = true;
    stopLoop();
  };

  const onContextRestored = () => {
    contextLost = false;
    forceResize();
    resetAfterSleep();
    running = true;
    rafId = requestAnimationFrame(animate);
  };

  canvas.addEventListener("webglcontextlost", onContextLost, false);
  canvas.addEventListener("webglcontextrestored", onContextRestored, false);

  const onVisibility = () => {
    if (document.hidden) stopLoop();
    else if (!contextLost) {
      running = true;
      resetAfterSleep();
      rafId = requestAnimationFrame(animate);
    }
  };
  document.addEventListener("visibilitychange", onVisibility);

  const onFocus = () => {
    if (!document.hidden && !contextLost) resetAfterSleep();
  };
  window.addEventListener("focus", onFocus);

  // --- LOOP ---
  function animate() {
    if (!running || contextLost) return;
    rafId = requestAnimationFrame(animate);

    const t = clock.getElapsedTime();

    let dt = t - lastT;
    lastT = t;
    if (!Number.isFinite(dt) || dt < 0) dt = 0;
    dt = Math.min(dt, 1 / 45);

    const lerpState = damp(4.5, dt);
    const lerpMouse = damp(7.5, dt);

    current.color.lerp(target.color, lerpState);
    current.emissive.lerp(target.emissive, lerpState);
    current.roughness += (target.roughness - current.roughness) * lerpState;
    current.metalness += (target.metalness - current.metalness) * lerpState;

    const lerpShape = lerpState * 0.45;
    current.waveType += (target.waveType - current.waveType) * lerpShape;
    current.freq += (target.freq - current.freq) * lerpShape;
    current.amp += (target.amp - current.amp) * lerpShape;

    current.bloom += (target.bloom - current.bloom) * lerpState;
    current.particles += (target.particles - current.particles) * lerpState;
    current.medical += (target.medical - current.medical) * lerpState;
    current.noGrid += (target.noGrid - current.noGrid) * lerpState;
    current.showValueBackdrop +=
      (target.showValueBackdrop - current.showValueBackdrop) * lerpState;

    const m = THREE.MathUtils.smoothstep(current.medical, 0.05, 0.35);

    raycaster.setFromCamera(mouse, camera);
    const intersect = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersect);
    if (intersect) targetPos.lerp(intersect, lerpMouse);

    // ✅ cámara fija
    camera.position.set(0, 25, 50);
    camera.lookAt(0, 0, 0);

    bloomPass.strength = current.bloom;
    bloomPass.radius = 0.75 + m * 0.20;
    bloomPass.threshold = 0.12 - m * 0.02;

    pMat.color.copy(current.emissive);
    pMat.opacity = 0.05 + current.particles * 0.20;

    const inMedical = m > 0.02;
    gridMesh.visible = !(current.noGrid > 0.5);
    valueBackdrop.visible = current.showValueBackdrop > 0.01;

    material.color.copy(current.color);
    material.emissive.copy(current.emissive);
    material.roughness = current.roughness;
    material.metalness = current.metalness;

    // 1) stencil mask del card (solo medical)
    if (inMedical) {
      renderer.clearStencil();
      renderer.state.buffers.stencil.setTest(true);

      const medicalCardEl = document.querySelector("#sec-medical .card");
      const hasMask = setMaskFromElement(medicalCardEl);
      if (hasMask) {
        renderer.render(maskScene, maskCam);
      } else {
        renderer.state.buffers.stencil.setTest(false);
      }
    } else {
      renderer.state.buffers.stencil.setTest(false);
    }

    // grid update
    if (gridMesh.visible) {
      let idx = 0;
      const animTime = t * current.freq;

      for (let i = 0; i < COLS; i++) {
        for (let j = 0; j < ROWS; j++) {
          const p = positions[idx];

          const valWave =
            Math.sin(p.x * 0.2 + animTime) +
            Math.cos(p.z * 0.15 + animTime * 0.8);

          const valJitter =
            Math.sin(p.x * 10 + t * 10) * Math.cos(p.z * 10 + t * 10);

          const rawGrid =
            Math.sin(p.x * 0.3 + animTime) *
            Math.cos(p.z * 0.3 + animTime);

          const valGrid = Math.pow(rawGrid, 3) * 4.0;

          const combo = valWave * 0.2 + valJitter * 0.8;

          const a01 = THREE.MathUtils.smoothstep(current.waveType, 0.0, 1.0);
          const mix01 = THREE.MathUtils.lerp(valWave, combo, a01);

          const a12 = THREE.MathUtils.smoothstep(current.waveType, 1.0, 2.0);
          const finalVal = THREE.MathUtils.lerp(mix01, valGrid, a12);

          let y = finalVal * current.amp;

          const dist = Math.sqrt(
            (p.x - targetPos.x) ** 2 + (p.z - targetPos.z) ** 2
          );
          const influence = Math.max(0, 1 - dist / 15);
          const smoothInf = influence * influence * (3 - 2 * influence);
          y = y * (1 - smoothInf);

          const rotX =
            Math.cos(p.x * 0.2 + t) * 0.5 * (1 - smoothInf) * current.amp;
          const rotZ =
            Math.sin(p.z * 0.2 + t) * 0.5 * (1 - smoothInf) * current.amp;

          dummy.position.set(p.x, y, p.z);
          dummy.rotation.set(rotX, 0, rotZ);

          const s = 1 + smoothInf * 0.5;
          dummy.scale.set(s, s, s);

          dummy.updateMatrix();
          gridMesh.setMatrixAt(idx, dummy.matrix);
          idx++;
        }
      }
      gridMesh.instanceMatrix.needsUpdate = true;
    }

    // flow partículas
    const arrP = pGeo.attributes.position.array;
    for (let i = 0; i < PCOUNT; i++) {
      const ix = i * 3;

      arrP[ix + 0] *= 0.9996;
      arrP[ix + 1] += Math.sin(t * 0.6 + i) * 0.0006;

      arrP[ix + 2] += pVel[i] * dt * (0.45 + current.particles * 0.9);

      if (arrP[ix + 2] > rangeZ * 0.5) {
        arrP[ix + 2] = -rangeZ * 0.5;
        arrP[ix + 0] = (Math.random() - 0.5) * rangeX;
        arrP[ix + 1] = Math.random() * rangeY + 2;
        pVel[i] = 6 + Math.random() * 18;
      }
    }
    pGeo.attributes.position.needsUpdate = true;

    if (valueBackdrop.visible) {
      const vArr = valueGeo.attributes.position.array;
      for (let i = 0; i < VALUE_NODES; i++) {
        const ix = i * 3;
        const seed = valueSeeds[i];
        vArr[ix + 0] =
          valueBasePos[ix + 0] + Math.sin(t * 0.08 + seed) * 0.6;
        vArr[ix + 1] =
          valueBasePos[ix + 1] + Math.cos(t * 0.07 + seed) * 0.4;
        vArr[ix + 2] =
          valueBasePos[ix + 2] + Math.sin(t * 0.06 + seed * 1.3) * 0.5;
      }
      valueGeo.attributes.position.needsUpdate = true;

      const lArr = valueLineGeo.attributes.position.array;
      let lIndex = 0;
      for (let i = 0; i < valueConnections.length; i++) {
        const [a, b] = valueConnections[i];
        const ax = a * 3;
        const bx = b * 3;
        lArr[lIndex++] = vArr[ax + 0];
        lArr[lIndex++] = vArr[ax + 1];
        lArr[lIndex++] = vArr[ax + 2];
        lArr[lIndex++] = vArr[bx + 0];
        lArr[lIndex++] = vArr[bx + 1];
        lArr[lIndex++] = vArr[bx + 2];
      }
      valueLineGeo.attributes.position.needsUpdate = true;
    }

    // medical update
    medicalGroup.visible = m > 0.001;

    if (medicalGroup.visible) {
      medicalGroup.position.set(0, 0, 0);

      bubbleUniforms.uTime.value = t;
      bubbleUniforms.uTint.value.copy(current.emissive);
      bubbleUniforms.uOpacity.value = 0.85 * m;
      bubbleUniforms.uGlow.value = 0.95 + m * 0.15;

      for (let i = 0; i < BCOUNT; i++) {
        const b = bubbleData[i];

        b.z += dt * (6.4 + (1.0 - b.depth01) * 6.0) * (0.32 + m * 1.1) * b.sp;

        if (b.z > areaZ * 0.5) {
          b.z = -areaZ * 0.5;
          b.x = (Math.random() - 0.5) * areaX;
          b.y = (Math.random() - 0.5) * areaY + 14;
          b.a = Math.random() * Math.PI * 2;
          b.sp = 0.35 + Math.random() * 1.05;
        }

        const wob = Math.sin(t * 0.35 + b.a) * (0.7 + (1.0 - b.depth01) * 0.9);
        const wobY = Math.cos(t * 0.30 + b.a) * (0.55 + (1.0 - b.depth01) * 0.75);

        const x = b.x + wob * 2.0;
        const y = b.y + wobY * 1.6;

        bubbleDummy.position.set(x, y, b.z);
        bubbleDummy.quaternion.copy(camera.quaternion);

        // ✅ tamaño PERFECTO fijo en pantalla (solo Z, cero jitter)
        const refDistZ = 75;
        const distZ = Math.abs(camera.position.z - b.z);
        bubbleDummy.scale.setScalar(b.s * (distZ / refDistZ));

        bubbleDummy.updateMatrix();
        bubbles.setMatrixAt(i, bubbleDummy.matrix);
      }
      bubbles.instanceMatrix.needsUpdate = true;

      dustMat.color.copy(current.emissive);
      dustMat.opacity = m * 0.22;

      const dArr = dustGeo.attributes.position.array;
      for (let i = 0; i < DUST; i++) {
        const ix = i * 3;
        dArr[ix + 2] += (9.2 * dt) * (0.22 + m * 1.2) * dustSpd[i];
        dArr[ix + 0] += Math.sin(t * 0.6 + i) * 0.002;
        dArr[ix + 1] += Math.cos(t * 0.5 + i) * 0.002;

        if (dArr[ix + 2] > 120) {
          dArr[ix + 2] = -120;
          dArr[ix + 0] = (Math.random() - 0.5) * 210;
          dArr[ix + 1] = (Math.random() - 0.5) * 90 + 16;
          dustSpd[i] = 0.6 + Math.random() * 1.6;
        }
      }
      dustGeo.attributes.position.needsUpdate = true;
    }

    // overlay scanlines (medical)
    fxUniforms.uTime.value = t;
    fxUniforms.uIntensity.value = m;
    fxUniforms.uTint.value.copy(current.emissive);

    composer.render();

    renderer.autoClear = false;
    renderer.render(fxScene, fxCam);
    renderer.autoClear = true;

    renderer.state.buffers.stencil.setTest(false);
  }

  // Resize
  const onResize = () => forceResize();
  window.addEventListener("resize", onResize, { passive: true });

  // Arranque
  clock.start();
  rafId = requestAnimationFrame(animate);

  // Limpieza
  function dispose() {
    stopLoop();

    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("focus", onFocus);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("mousemove", onMouseMove);

    canvas.removeEventListener("webglcontextlost", onContextLost);
    canvas.removeEventListener("webglcontextrestored", onContextRestored);

    composer?.dispose?.();

    fxGeo.dispose();
    fxMat.dispose();

    maskMesh.geometry.dispose();
    maskMat.dispose();

    dustGeo.dispose();
    dustMat.dispose();

    bubbleGeo.dispose();
    bubbleMat.dispose();

    pGeo.dispose();
    pMat.dispose();

    valueGeo.dispose();
    valueMat.dispose();
    valueLineGeo.dispose();
    valueLineMat.dispose();

    gridMesh.geometry?.dispose?.();
    material.dispose?.();

    renderer.dispose();

    if (renderer.domElement?.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }

  return { setTargetState, dispose };

  // helpers internas
  function forceResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));

    composer.setSize(window.innerWidth, window.innerHeight);
    bloomPass.setSize(window.innerWidth, window.innerHeight);

    fxUniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  }

  function stopLoop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }
}
