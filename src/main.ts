import './style.css';
import * as THREE from 'three';
import { lessons } from './lessons';
import { LessonRuntime } from './types';
import { fullLessonPlan, ontology, structuralRules } from './content/ontology';

const app = document.getElementById('app');
if (!app) throw new Error('App container missing');

app.innerHTML = `
  <div class="layout">
    <div class="viewer-wrap">
      <canvas id="viewer"></canvas>
      <div class="hud">
        <strong>Интерактив</strong>
        <div id="controls" class="controls"></div>
      </div>
    </div>
    <aside class="panel">
      <h1>Структурная механика христианского храма</h1>
      <div id="lessonList" class="lesson-list"></div>
      <h2 id="lessonTitle"></h2>
      <p><strong>Концепт:</strong> <span id="concept"></span></p>
      <p id="explanation"></p>
      <p><strong>Вывод:</strong> <span id="insight"></span></p>
      <div class="ontology">
        <h3>Онтология (структурная логика)</h3>
        <p><strong>Силы:</strong> ${ontology.structuralForces.join(', ')}.</p>
        <p><strong>Элементы:</strong> ${ontology.structuralElements.join(', ')}.</p>
        <p><strong>Связи:</strong></p>
        <ul>${ontology.relations.map((r) => `<li>${r}</li>`).join('')}</ul>
        <p><strong>Правила модели:</strong></p>
        <ul>${structuralRules.map((r) => `<li>${r}</li>`).join('')}</ul>
        <p><strong>Полная образовательная траектория:</strong></p>
        <ol>${fullLessonPlan.map((r) => `<li>${r}</li>`).join('')}</ol>
      </div>
    </aside>
  </div>
`;

const canvas = document.getElementById('viewer') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdfe7f4);

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
camera.position.set(10, 7, 11);

const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(8, 10, 6);
scene.add(light, new THREE.AmbientLight(0xffffff, 0.55));

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40),
  new THREE.MeshStandardMaterial({ color: 0xd3dae8 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const grid = new THREE.GridHelper(40, 40, 0x9ba7bd, 0xb4bed3);
scene.add(grid);

const forceGroup = new THREE.Group();
scene.add(forceGroup);

let azimuth = 0.8;
let polar = 1.1;
let radius = 17;
let dragging = false;
let lx = 0;
let ly = 0;
const target = new THREE.Vector3(0, 2.8, 0);

const updateCamera = () => {
  const x = radius * Math.sin(polar) * Math.cos(azimuth);
  const z = radius * Math.sin(polar) * Math.sin(azimuth);
  const y = radius * Math.cos(polar);
  camera.position.set(x, y + 1.5, z);
  camera.lookAt(target);
};
updateCamera();

canvas.addEventListener('pointerdown', (e) => {
  dragging = true;
  lx = e.clientX;
  ly = e.clientY;
});
window.addEventListener('pointerup', () => (dragging = false));
window.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const dx = e.clientX - lx;
  const dy = e.clientY - ly;
  lx = e.clientX;
  ly = e.clientY;
  azimuth -= dx * 0.006;
  polar = Math.min(Math.PI - 0.2, Math.max(0.3, polar + dy * 0.006));
  updateCamera();
});
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  radius = Math.min(28, Math.max(8, radius + e.deltaY * 0.01));
  updateCamera();
});

const lessonList = document.getElementById('lessonList')!;
const controls = document.getElementById('controls')!;
const lessonTitle = document.getElementById('lessonTitle')!;
const concept = document.getElementById('concept')!;
const explanation = document.getElementById('explanation')!;
const insight = document.getElementById('insight')!;

let runtime: LessonRuntime | null = null;
let active = lessons[0];
const params: Record<string, number> = {};

const mountControls = () => {
  controls.innerHTML = '';
  active.controls.forEach((c) => {
    params[c.id] = c.initial;
    const row = document.createElement('div');
    row.className = 'control';
    const label = document.createElement('label');
    label.textContent = c.label;
    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(c.min);
    input.max = String(c.max);
    input.step = String(c.step);
    input.value = String(c.initial);
    const value = document.createElement('span');
    const updateValue = () => {
      params[c.id] = Number(input.value);
      value.textContent = `${input.value}${c.unit ?? ''}`;
      runtime?.update(params);
    };
    input.addEventListener('input', updateValue);
    updateValue();
    row.append(label, input, value);
    controls.appendChild(row);
  });
};

const mountLesson = (id: string) => {
  active = lessons.find((l) => l.id === id) ?? lessons[0];
  runtime?.dispose();
  forceGroup.clear();
  runtime = active.build({ scene, forceGroup });
  lessonTitle.textContent = active.title;
  concept.textContent = active.concept;
  explanation.textContent = active.explanation;
  insight.textContent = active.insight;
  mountControls();

  [...lessonList.querySelectorAll('button')].forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-id') === active.id);
  });
};

lessons.forEach((l) => {
  const btn = document.createElement('button');
  btn.className = 'lesson-btn';
  btn.textContent = l.title;
  btn.setAttribute('data-id', l.id);
  btn.onclick = () => mountLesson(l.id);
  lessonList.appendChild(btn);
});
mountLesson(lessons[0].id);

const resize = () => {
  const { clientWidth, clientHeight } = canvas;
  renderer.setSize(clientWidth, clientHeight, false);
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
};
new ResizeObserver(resize).observe(canvas);
resize();

const tick = () => {
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
};
tick();
