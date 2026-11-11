import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, BoxGeometry, CapsuleGeometry,
  TorusGeometry, SphereGeometry, MeshStandardMaterial, LineBasicMaterial, LineSegments,
  EdgesGeometry, AmbientLight, DirectionalLight, BufferGeometry, Line, Vector3,
} from 'three';

const C = { navy: 0x14305f, orange: 0xf28c1e, white: 0xf5f5f2, steel: 0xc9cbc8, ink: 0x16181a };
const canvas = document.getElementById('scene');
const host = canvas.parentElement;
const still = matchMedia('(prefers-reduced-motion: reduce)');

let renderer;
try {
  renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch {
  host.classList.add('no-gl');
}

if (renderer) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.set(0, 0.8, 12);
  scene.add(new AmbientLight(0xffffff, 1.1));
  const key = new DirectionalLight(0xffffff, 2.4);
  key.position.set(3, 4, 5);
  scene.add(key);

  const edge = new LineBasicMaterial({ color: C.ink });
  const part = (geo, color, pos = [0, 0, 0]) => {
    const m = new Mesh(geo, new MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.1 }));
    m.add(new LineSegments(new EdgesGeometry(geo, 30), edge));
    m.position.set(...pos);
    return m;
  };
  const box = (w, h, d, color, pos) => part(new BoxGeometry(w, h, d), color, pos);
  const group = (...parts) => { const g = new Group(); g.add(...parts); return g; };

  const gadgets = [
    group( // earbud case
      part(new CapsuleGeometry(0.34, 0.3, 6, 18), C.white),
      part(new SphereGeometry(0.07, 12, 12), C.orange, [0, 0, 0.34]),
    ),
    group( // 20W charger
      box(0.7, 0.7, 0.4, C.white),
      box(0.08, 0.26, 0.03, C.steel, [-0.16, 0, 0.215]),
      box(0.08, 0.26, 0.03, C.steel, [0.16, 0, 0.215]),
      box(0.22, 0.06, 0.02, C.orange, [0, -0.2, -0.21]),
    ),
    group( // power bank
      box(0.55, 1.05, 0.24, C.navy),
      box(0.1, 0.6, 0.02, C.orange, [0, 0, 0.13]),
    ),
    group( // coiled cable
      part(new TorusGeometry(0.42, 0.035, 8, 40), C.orange),
      box(0.14, 0.2, 0.1, C.ink, [0.42, 0, 0]),
    ),
    group( // smartwatch
      box(0.3, 1.2, 0.06, C.white, [0, 0, -0.05]),
      box(0.5, 0.55, 0.14, C.ink),
      box(0.4, 0.45, 0.02, C.navy, [0, 0, 0.08]),
    ),
  ];

  const root = new Group();
  const hub = group(box(0.9, 0.9, 0.9, C.navy), part(new SphereGeometry(0.55, 24, 24), C.orange));
  root.add(hub);
  const spokeMat = new LineBasicMaterial({ color: C.ink });
  gadgets.forEach((g, i) => {
    const a = (i / gadgets.length) * Math.PI * 2;
    g.position.set(Math.cos(a) * 2.5, (i % 2 ? 0.8 : -0.8), Math.sin(a) * 2.5);
    root.add(g, new Line(new BufferGeometry().setFromPoints([new Vector3(), g.position.clone()]), spokeMat));
  });
  root.rotation.x = 0.28;
  scene.add(root);

  const pointer = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / innerWidth - 0.5);
    pointer.y = (e.clientY / innerHeight - 0.5);
  }, { passive: true });

  const draw = (t = 0) => {
    if (!still.matches) {
      root.rotation.y = t * 0.00018;
      gadgets.forEach((g, i) => { g.rotation.y = t * 0.0006 + i; g.rotation.x = Math.sin(t * 0.0004 + i) * 0.3; });
      hub.rotation.y = -t * 0.0004;
      root.rotation.x += (0.28 + pointer.y * 0.25 - root.rotation.x) * 0.05;
    }
    renderer.render(scene, camera);
  };

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    draw();
  };
  new ResizeObserver(resize).observe(host);

  new IntersectionObserver(([e]) => {
    renderer.setAnimationLoop(e.isIntersecting && !still.matches ? draw : null);
  }).observe(host);
}
