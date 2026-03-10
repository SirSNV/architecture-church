import * as THREE from 'three';
import { LessonDef, LessonContext, LessonRuntime } from '../types';
import { archThrust, beamRisk, buttressRelief, columnRisk, domeThrust, forceColor, vaultThrust } from '../sim/structuralRules';

const clearGroup = (g: THREE.Group) => { while (g.children.length) g.remove(g.children[0]); };

const arrow = (from: THREE.Vector3, to: THREE.Vector3, color: number) => {
  const dir = to.clone().sub(from).normalize();
  const len = from.distanceTo(to);
  return new THREE.ArrowHelper(dir, from, len, color, 0.18, 0.08);
};

const mkStone = () => new THREE.MeshStandardMaterial({ color: 0xd8d0c4 });

function beamVsColumn(ctx: LessonContext): LessonRuntime {
  const root = new THREE.Group();
  const material = mkStone();
  const beam = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 0.8), material);
  beam.position.set(-4, 2.6, 0);
  const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 4, 20), material);
  const c2 = c1.clone();
  c1.position.set(-6.7, 1.8, 0);
  c2.position.set(-1.3, 1.8, 0);

  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 5, 20), material);
  col.position.set(4, 2.5, 0);

  root.add(beam, c1, c2, col);
  ctx.scene.add(root);

  const update = (p: Record<string, number>) => {
    beam.scale.x = p.span / 8;
    beam.position.y = 2 + p.thickness * 0.7;
    beam.scale.y = p.thickness;
    col.scale.y = p.height / 5;
    col.scale.x = p.thickness;
    col.scale.z = p.thickness;
    col.position.y = (5 * col.scale.y) / 2;

    clearGroup(ctx.forceGroup);
    const br = beamRisk(p.span, p.thickness);
    const cr = columnRisk(p.height, p.thickness);
    ctx.forceGroup.add(arrow(new THREE.Vector3(-4, 5, 0), new THREE.Vector3(-4, 3, 0), forceColor(br.level)));
    ctx.forceGroup.add(arrow(new THREE.Vector3(4, 6, 0), new THREE.Vector3(4, 3.5, 0), forceColor(cr.level)));
  };

  update({ span: 8, height: 5, thickness: 1 });
  return { root, update, dispose: () => ctx.scene.remove(root) };
}

function archLesson(ctx: LessonContext): LessonRuntime {
  const root = new THREE.Group();
  const material = mkStone();
  const left = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4, 1.2), material);
  const right = left.clone();
  left.position.set(-2.8, 2, 0);
  right.position.set(2.8, 2, 0);
  const archMesh = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.5, 12, 36, Math.PI), material);
  archMesh.rotation.z = Math.PI;
  archMesh.position.y = 4;
  root.add(left, right, archMesh);
  ctx.scene.add(root);

  const update = (p: Record<string, number>) => {
    const span = p.span;
    left.position.x = -span / 2;
    right.position.x = span / 2;
    archMesh.geometry.dispose();
    archMesh.geometry = new THREE.TorusGeometry(span / 2, p.thickness * 0.45, 12, 42, Math.PI);
    archMesh.position.y = p.rise + 2.2;

    const thr = archThrust(span, p.rise);
    clearGroup(ctx.forceGroup);
    const color = forceColor(thr.level);
    ctx.forceGroup.add(arrow(new THREE.Vector3(0, p.rise + 5, 0), new THREE.Vector3(0, p.rise + 3.4, 0), color));
    ctx.forceGroup.add(arrow(new THREE.Vector3(-span / 2, 2.2, 0), new THREE.Vector3(-span / 2 - 1.2, 2.2, 0), color));
    ctx.forceGroup.add(arrow(new THREE.Vector3(span / 2, 2.2, 0), new THREE.Vector3(span / 2 + 1.2, 2.2, 0), color));
  };

  update({ span: 6, rise: 2.5, thickness: 1 });
  return { root, update, dispose: () => ctx.scene.remove(root) };
}

function vaultLesson(ctx: LessonContext): LessonRuntime {
  const root = new THREE.Group();
  const material = mkStone();
  const vault = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 8, 24, 1, true, 0, Math.PI), material);
  vault.rotation.z = Math.PI / 2;
  vault.position.set(0, 3, 0);
  const walls = new THREE.Mesh(new THREE.BoxGeometry(8, 3, 0.8), material);
  const walls2 = walls.clone();
  walls.position.set(0, 1.5, -2.2);
  walls2.position.set(0, 1.5, 2.2);
  root.add(vault, walls, walls2);
  ctx.scene.add(root);

  const update = (p: Record<string, number>) => {
    vault.scale.set(p.span / 6, p.span / 6, 1);
    vault.scale.y = p.span / 6;
    vault.material = material;
    (vault.material as THREE.MeshStandardMaterial).wireframe = p.showShell < 0.5;

    const t = vaultThrust(p.span, p.thickness);
    clearGroup(ctx.forceGroup);
    const c = forceColor(t.level);
    ctx.forceGroup.add(arrow(new THREE.Vector3(0, 5.5, 0), new THREE.Vector3(0, 4, 0), c));
    ctx.forceGroup.add(arrow(new THREE.Vector3(0, 2.5, -2.2), new THREE.Vector3(0, 2.5, -3.4), c));
    ctx.forceGroup.add(arrow(new THREE.Vector3(0, 2.5, 2.2), new THREE.Vector3(0, 2.5, 3.4), c));
  };

  update({ span: 6, thickness: 1, showShell: 1 });
  return { root, update, dispose: () => ctx.scene.remove(root) };
}

function domeLesson(ctx: LessonContext): LessonRuntime {
  const root = new THREE.Group();
  const material = mkStone();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(2.2, 28, 20, 0, Math.PI * 2, 0, Math.PI / 2), material);
  dome.position.y = 5;
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 1.2, 24), material);
  drum.position.y = 4;
  const pGeo = new THREE.ConeGeometry(1.6, 2.2, 4);
  const p1 = new THREE.Mesh(pGeo, material);
  const p2 = p1.clone();
  p1.position.set(-1.5, 2.9, -1.5);
  p2.position.set(1.5, 2.9, 1.5);
  root.add(dome, drum, p1, p2);
  ctx.scene.add(root);

  const update = (p: Record<string, number>) => {
    dome.scale.setScalar(p.radius / 2.2);
    dome.position.y = 3 + p.drum;
    drum.scale.x = p.radius / 2.2;
    drum.scale.z = p.radius / 2.2;
    drum.scale.y = p.drum / 1.2;
    drum.position.y = 2.5 + p.drum / 2;

    const t = domeThrust(p.radius, p.drum, p.pendentive / 10);
    clearGroup(ctx.forceGroup);
    const c = forceColor(t.level);
    ctx.forceGroup.add(arrow(new THREE.Vector3(0, 7, 0), new THREE.Vector3(0, 5.8, 0), c));
    ctx.forceGroup.add(arrow(new THREE.Vector3(2.2, 4.2, 0), new THREE.Vector3(3.5, 4.2, 0), c));
    ctx.forceGroup.add(arrow(new THREE.Vector3(-2.2, 4.2, 0), new THREE.Vector3(-3.5, 4.2, 0), c));
  };

  update({ radius: 2.2, drum: 1.2, pendentive: 6 });
  return { root, update, dispose: () => ctx.scene.remove(root) };
}

function buttressLesson(ctx: LessonContext): LessonRuntime {
  const root = new THREE.Group();
  const material = mkStone();
  const wall = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5, 8), material);
  wall.position.set(0, 2.5, 0);
  const buttress = new THREE.Mesh(new THREE.BoxGeometry(2.2, 4, 1.6), material);
  buttress.position.set(1.6, 2, 2.8);
  root.add(wall, buttress);
  ctx.scene.add(root);

  const update = (p: Record<string, number>) => {
    buttress.scale.x = p.mass / 5;
    buttress.position.x = 1 + p.mass / 10;
    const base = archThrust(p.span, 2.5).thrust;
    const rel = buttressRelief(base, p.mass);
    clearGroup(ctx.forceGroup);
    const c = forceColor(rel.level);
    ctx.forceGroup.add(arrow(new THREE.Vector3(0.6, 3.8, 0), new THREE.Vector3(2.1, 3.8, 0), c));
    ctx.forceGroup.add(arrow(new THREE.Vector3(2.2, 2.8, 2.8), new THREE.Vector3(1.2, 2.2, 2.8), 0x4caf50));
  };

  update({ mass: 5, span: 7 });
  return { root, update, dispose: () => ctx.scene.remove(root) };
}

export const lessons: LessonDef[] = [
  {
    id: 'beam-column',
    title: 'Балка против колонны',
    concept: 'Почему камень любит сжатие и плохо переносит изгиб.',
    explanation: 'Слева каменная балка над пролетом: внизу появляется растяжение, и риск трещин быстро растет с увеличением пролета. Справа колонна: нагрузка идет почти чисто вниз, поэтому преобладает сжатие.',
    insight: 'Удлинять пролет балкой опасно, а передавать нагрузку через колонны — естественно для камня.',
    controls: [
      { id: 'span', label: 'Пролет балки', min: 4, max: 12, step: 0.5, initial: 8, unit: 'м' },
      { id: 'height', label: 'Высота колонны', min: 3, max: 9, step: 0.5, initial: 5, unit: 'м' },
      { id: 'thickness', label: 'Толщина элемента', min: 0.6, max: 1.8, step: 0.1, initial: 1, unit: '×' }
    ],
    build: beamVsColumn
  },
  {
    id: 'arch',
    title: 'Арка',
    concept: 'Арка переводит нагрузку в сжатие по кривой.',
    explanation: 'Арка работает как цепочка клиньев. Гравитация толкает их вниз, а форма направляет усилия в стороны к опорам. Чем ниже подъем арки при том же пролете, тем больше боковой распор.',
    insight: 'Арка решает проблему растяжения, но требует надежных боковых опор.',
    controls: [
      { id: 'span', label: 'Пролет арки', min: 4, max: 10, step: 0.5, initial: 6, unit: 'м' },
      { id: 'rise', label: 'Подъем арки', min: 1.6, max: 4, step: 0.2, initial: 2.5, unit: 'м' },
      { id: 'thickness', label: 'Толщина арки', min: 0.6, max: 1.5, step: 0.1, initial: 1, unit: '×' }
    ],
    build: archLesson
  },
  {
    id: 'vault',
    title: 'Свод',
    concept: 'Цилиндрический свод расширяет логику арки в длину.',
    explanation: 'Бочарный свод — это арка, вытянутая вперед. Вес оболочки и кровли создает постоянный боковой распор по всей длине, поэтому требуются массивные стены или контрфорсы.',
    insight: 'Свод эффективен в сжатии, но постоянно распирает стены наружу.',
    controls: [
      { id: 'span', label: 'Ширина свода', min: 4, max: 10, step: 0.5, initial: 6, unit: 'м' },
      { id: 'thickness', label: 'Толщина оболочки', min: 0.6, max: 1.3, step: 0.1, initial: 1, unit: '×' },
      { id: 'showShell', label: 'Показать массив (0=каркас)', min: 0, max: 1, step: 1, initial: 1 }
    ],
    build: vaultLesson
  },
  {
    id: 'dome',
    title: 'Купол и паруса',
    concept: 'Купол дает круговой распор; паруса передают его на четыре опоры.',
    explanation: 'Купол работает в сжатии по меридианам, но в основании стремится раздвинуть опоры. Паруса (переход от квадрата к кругу) концентрируют нагрузку в углах и делают схему более управляемой.',
    insight: 'Паруса не убирают распор полностью, но направляют поток усилий в понятные точки опирания.',
    controls: [
      { id: 'radius', label: 'Радиус купола', min: 1.6, max: 3.4, step: 0.2, initial: 2.2, unit: 'м' },
      { id: 'drum', label: 'Высота барабана', min: 0.6, max: 2.4, step: 0.2, initial: 1.2, unit: 'м' },
      { id: 'pendentive', label: 'Эффективность парусов', min: 1, max: 10, step: 1, initial: 6, unit: '/10' }
    ],
    build: domeLesson
  },
  {
    id: 'buttress',
    title: 'Контрфорс',
    concept: 'Контрфорс превращает боковой распор в сжатие в массиве подпорки.',
    explanation: 'Толстая наружная подпорка принимает распор свода/арки и гасит его собственной массой. Чем массивнее контрфорс, тем меньше остаточная горизонтальная сила в стене.',
    insight: 'Контрфорс — это внешний путь нагрузки, позволяющий облегчить основную стену.',
    controls: [
      { id: 'span', label: 'Источник распора (пролет)', min: 4, max: 10, step: 0.5, initial: 7, unit: 'м' },
      { id: 'mass', label: 'Массивность контрфорса', min: 2, max: 8, step: 0.5, initial: 5, unit: '×' }
    ],
    build: buttressLesson
  }
];
