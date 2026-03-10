const lessons = [
  {
    title: "1. Колонна: почему вертикаль так важна",
    goal: "Понять, как колонна переводит вес храма в фундамент и почему важны пропорции.",
    content: `
      <p><strong>Тектоническая идея:</strong> колонна показывает путь усилий вниз. Если она слишком тонкая для нагрузки, возникает риск потери устойчивости (выпучивания).</p>
      <p>В византийской и древнерусской традиции колонны и столпы задают ритм интерьера и несут барабан купола.</p>
      <ul>
        <li>Больше нагрузка → выше сжимающее напряжение;</li>
        <li>Более стройная колонна → выше риск изгиба;</li>
        <li>Капитель расширяет «пятно» передачи усилия на арку/прогон.</li>
      </ul>
    `,
    controls: [
      { key: "load", label: "Нагрузка (условн. ед.)", min: 20, max: 120, value: 65 },
      { key: "slenderness", label: "Стройность колонны", min: 20, max: 100, value: 55 },
    ],
    quiz: {
      q: "Зачем капитель у колонны в тектоническом смысле?",
      options: [
        "Только для декора",
        "Чтобы расширить передачу усилия на опору выше",
        "Чтобы уменьшить вес фундамента",
      ],
      answer: 1,
    },
  },
  {
    title: "2. Арка: зачем она вообще нужна",
    goal: "Увидеть, как арка перераспределяет нагрузку в сжатие и уменьшает изгиб по сравнению с балкой.",
    content: `
      <p><strong>Ключевой ответ:</strong> арка выгодна камню и кирпичу, потому что они хорошо работают на <em>сжатие</em>, но плохо — на растяжение.</p>
      <p>Арка переводит вертикальную нагрузку в диагональные силы к опорам. Поэтому появляются распор и необходимость контрмер: толстые стены, контрфорсы, подпружные арки.</p>
      <p>В храме арки не только держат перекрытие, но и организуют пространство: нефы, проемы, переход от квадрата к куполу.</p>
    `,
    controls: [
      { key: "span", label: "Пролет арки", min: 20, max: 120, value: 70 },
      { key: "rise", label: "Подъем арки", min: 10, max: 80, value: 35 },
      { key: "load", label: "Нагрузка", min: 20, max: 120, value: 60 },
    ],
    quiz: {
      q: "Почему арка часто лучше балки для каменного храма?",
      options: [
        "Арка передает больше растяжения",
        "Арка использует сжатие, а камень его хорошо воспринимает",
        "Потому что арка всегда дешевле",
      ],
      answer: 1,
    },
  },
  {
    title: "3. Своды: цилиндрический и крестовый",
    goal: "Сравнить, как тип свода влияет на свет, распор и свободу планировки.",
    content: `
      <p>Цилиндрический свод давит непрерывно вдоль стен, поэтому требуются массивные боковые опоры.</p>
      <p>Крестовый свод концентрирует усилия в узлах/ребрах, позволяя раскрывать проемы между опорами.</p>
      <p>Для прихожанина это чувствуется как разница между «тяжелой пещерной» и более «легкой ритмичной» пространственностью.</p>
    `,
    controls: [
      { key: "type", label: "Тип", options: ["Цилиндрический", "Крестовый"], value: 0 },
      { key: "span", label: "Пролет", min: 30, max: 120, value: 75 },
      { key: "load", label: "Нагрузка", min: 20, max: 120, value: 55 },
    ],
    quiz: {
      q: "Какой свод обычно лучше для открытия боковых проемов?",
      options: ["Цилиндрический", "Крестовый", "Оба одинаково"],
      answer: 1,
    },
  },
  {
    title: "4. Купол и паруса: переход от квадрата к кругу",
    goal: "Понять логику купола и роль парусов/тромпов в крестово-купольной системе.",
    content: `
      <p>Купол собирает пространство вокруг центра и работает в мембранном сжатии, но создает распор в основании.</p>
      <p>Паруса (pendentives) позволяют поставить круглый барабан купола на квадрат из четырех опор.</p>
      <p>Чем выше купол и легче оболочка, тем менее агрессивен распор, но растут требования к устойчивости барабана и связям.</p>
    `,
    controls: [
      { key: "radius", label: "Радиус купола", min: 30, max: 120, value: 70 },
      { key: "height", label: "Высота подъема", min: 20, max: 120, value: 65 },
      { key: "ring", label: "Жесткость кольца", min: 20, max: 120, value: 55 },
    ],
    quiz: {
      q: "Зачем в куполе нужно «кольцо» (или его аналог)?",
      options: [
        "Для удержания распора у основания купола",
        "Только чтобы повесить люстру",
        "Чтобы увеличить количество окон автоматически",
      ],
      answer: 0,
    },
  },
];

let current = 0;
const done = new Set();

const lessonList = document.getElementById("lesson-list");
const titleEl = document.getElementById("lesson-title");
const goalEl = document.getElementById("lesson-goal");
const contentEl = document.getElementById("lesson-content");
const controlsEl = document.getElementById("controls");
const quizEl = document.getElementById("quiz");
const insightEl = document.getElementById("insight");
const progressEl = document.getElementById("progress");
const progressText = document.getElementById("progress-text");
const canvas = document.getElementById("structure-canvas");
const ctx = canvas.getContext("2d");

let chart;

function renderLessonList() {
  lessonList.innerHTML = "";
  lessons.forEach((l, i) => {
    const li = document.createElement("li");
    li.textContent = l.title;
    if (i === current) li.classList.add("active");
    if (done.has(i)) li.classList.add("done");
    li.onclick = () => {
      current = i;
      render();
    };
    lessonList.appendChild(li);
  });
}

function renderControls(lesson) {
  controlsEl.innerHTML = "";
  lesson.controls.forEach((c) => {
    const wrap = document.createElement("div");
    wrap.className = "control";
    const label = document.createElement("label");
    label.textContent = `${c.label}: `;

    if (c.options) {
      const select = document.createElement("select");
      c.options.forEach((opt, idx) => {
        const o = document.createElement("option");
        o.value = idx;
        o.textContent = opt;
        if (idx === c.value) o.selected = true;
        select.appendChild(o);
      });
      select.onchange = (e) => {
        c.value = Number(e.target.value);
        drawScene();
      };
      wrap.append(label, select);
    } else {
      const value = document.createElement("span");
      value.textContent = c.value;
      const input = document.createElement("input");
      input.type = "range";
      input.min = c.min;
      input.max = c.max;
      input.value = c.value;
      input.oninput = (e) => {
        c.value = Number(e.target.value);
        value.textContent = c.value;
        drawScene();
      };
      wrap.append(label, value, input);
    }
    controlsEl.appendChild(wrap);
  });
}

function getVal(key) {
  return lessons[current].controls.find((c) => c.key === key).value;
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (current === 0) return drawColumn();
  if (current === 1) return drawArch();
  if (current === 2) return drawVault();
  if (current === 3) return drawDome();
}

function drawColumn() {
  const load = getVal("load");
  const slenderness = getVal("slenderness");
  const width = 120 - slenderness;
  const x = canvas.width / 2 - width / 2;
  const y = 70;
  const h = 220;

  ctx.fillStyle = "#d8c3a5";
  ctx.fillRect(x, y, width, h);
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(x - 20, y - 16, width + 40, 18);
  ctx.fillRect(x - 28, y + h, width + 56, 20);

  const stress = (load / width) * 10;
  const buckling = (slenderness * load) / 100;

  drawForceArrows(canvas.width / 2, y - 5, Math.round(load / 10), "down");
  insightEl.textContent = `Сжатие: ${stress.toFixed(1)} | Риск потери устойчивости: ${buckling.toFixed(
    1
  )}. Чем тоньше колонна при той же нагрузке, тем опаснее выпучивание.`;

  updateChart([stress, buckling], ["Сжатие", "Риск изгиба"]);
}

function drawArch() {
  const span = getVal("span");
  const rise = getVal("rise");
  const load = getVal("load");

  const left = 180;
  const right = left + span * 2.2;
  const baseY = 260;
  const apexY = baseY - rise * 2;

  ctx.fillStyle = "#c5b39a";
  ctx.fillRect(left - 30, baseY, 40, 70);
  ctx.fillRect(right - 10, baseY, 40, 70);

  ctx.beginPath();
  ctx.strokeStyle = "#7a5c45";
  ctx.lineWidth = 20;
  ctx.moveTo(left, baseY);
  ctx.quadraticCurveTo((left + right) / 2, apexY, right, baseY);
  ctx.stroke();

  drawForceArrows((left + right) / 2, apexY - 25, Math.round(load / 10), "down");

  const thrust = (load * span) / (rise + 10);
  const compressionBenefit = (rise / span) * 100;
  insightEl.textContent = `Распор на опоры: ${thrust.toFixed(
    1
  )}. Чем ниже арка при том же пролете, тем сильнее распирает стены. Доля работы в сжатии: ${compressionBenefit.toFixed(
    1
  )}%`;

  updateChart([thrust, compressionBenefit], ["Распор", "Сжатие %"]);
}

function drawVault() {
  const type = getVal("type");
  const span = getVal("span");
  const load = getVal("load");

  const cx = canvas.width / 2;
  const y = 250;
  ctx.strokeStyle = "#7b6756";
  ctx.lineWidth = 10;

  if (type === 0) {
    ctx.beginPath();
    ctx.moveTo(cx - span * 2, y);
    ctx.quadraticCurveTo(cx, y - 130, cx + span * 2, y);
    ctx.stroke();

    ctx.fillStyle = "#c7b199";
    ctx.fillRect(cx - span * 2 - 30, y, 30, 90);
    ctx.fillRect(cx + span * 2, y, 30, 90);
  } else {
    ctx.beginPath();
    ctx.moveTo(cx - span * 1.4, y);
    ctx.quadraticCurveTo(cx, y - 120, cx + span * 1.4, y);
    ctx.moveTo(cx - span * 1.4, y);
    ctx.quadraticCurveTo(cx, y - 120, cx + span * 1.4, y);
    ctx.stroke();

    const pts = [
      [cx - span * 1.3, y],
      [cx + span * 1.3, y],
      [cx - span * 1.3, y + 90],
      [cx + span * 1.3, y + 90],
    ];
    ctx.fillStyle = "#c7b199";
    pts.forEach(([x, yy]) => ctx.fillRect(x - 15, yy, 30, 40));
  }

  drawForceArrows(cx, y - 120, Math.round(load / 10), "down");
  const lateral = type === 0 ? (load * span) / 25 : (load * span) / 40;
  const openness = type === 0 ? 35 : 68;

  insightEl.textContent = `${
    type === 0 ? "Цилиндрический" : "Крестовый"
  } свод: боковой распор ${lateral.toFixed(1)}; потенциал боковых проемов ${openness}%`;

  updateChart([lateral, openness], ["Боковой распор", "Открытость стен %"]);
}

function drawDome() {
  const radius = getVal("radius");
  const height = getVal("height");
  const ring = getVal("ring");

  const cx = canvas.width / 2;
  const cy = 230;

  ctx.fillStyle = "#ccb69e";
  ctx.fillRect(cx - 130, cy + 20, 260, 90);

  ctx.beginPath();
  ctx.strokeStyle = "#7b6756";
  ctx.lineWidth = 10;
  ctx.arc(cx, cy, radius, Math.PI, 2 * Math.PI);
  ctx.stroke();

  ctx.fillStyle = "#9a7d67";
  ctx.fillRect(cx - radius, cy - 4, radius * 2, 10);

  ctx.beginPath();
  ctx.moveTo(cx - 130, cy + 20);
  ctx.lineTo(cx - 200, cy + 110);
  ctx.moveTo(cx + 130, cy + 20);
  ctx.lineTo(cx + 200, cy + 110);
  ctx.strokeStyle = "#95745a";
  ctx.lineWidth = 6;
  ctx.stroke();

  drawForceArrows(cx, cy - radius - 15, 6, "down");

  const thrust = (radius * 80) / (height + ring);
  const stability = (ring + height) / radius;
  insightEl.textContent = `Распор у основания купола: ${thrust.toFixed(
    1
  )}; индекс устойчивости системы: ${stability.toFixed(
    2
  )}. Более жесткое кольцо лучше «собирает» распирающие силы.`;

  updateChart([thrust, stability * 30], ["Распор", "Устойчивость (×30)"]);
}

function drawForceArrows(x, y, n, dir) {
  ctx.strokeStyle = "#b83232";
  ctx.fillStyle = "#b83232";
  for (let i = 0; i < n; i++) {
    const xx = x - (n * 12) / 2 + i * 12;
    ctx.beginPath();
    if (dir === "down") {
      ctx.moveTo(xx, y);
      ctx.lineTo(xx, y + 24);
      ctx.lineTo(xx - 4, y + 18);
      ctx.moveTo(xx, y + 24);
      ctx.lineTo(xx + 4, y + 18);
    }
    ctx.stroke();
  }
}

function updateChart(values, labels) {
  const c = document.getElementById("metrics-chart");
  if (chart) chart.destroy();

  chart = new Chart(c, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: ["#8a5a44", "#d9b08c"],
          borderRadius: 6,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function renderQuiz(lesson) {
  const { q, options, answer } = lesson.quiz;
  quizEl.innerHTML = `<div class="question"><strong>${q}</strong><br/></div>`;
  const box = quizEl.querySelector(".question");
  options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => {
      if (idx === answer) {
        btn.style.background = "#c6f6d5";
        box.append(" ✅ Верно");
      } else {
        btn.style.background = "#fed7d7";
        box.append(" ❌ Подумай о том, как идут усилия в конструкции.");
      }
    };
    box.appendChild(btn);
  });
}

function updateProgress() {
  const percent = Math.round((done.size / lessons.length) * 100);
  progressEl.value = percent;
  progressText.textContent = `${percent}% завершено`;
}

function render() {
  const lesson = lessons[current];
  titleEl.textContent = lesson.title;
  goalEl.textContent = `Учебная цель: ${lesson.goal}`;
  contentEl.innerHTML = lesson.content;
  renderLessonList();
  renderControls(lesson);
  renderQuiz(lesson);
  drawScene();
  updateProgress();
}

document.getElementById("next").onclick = () => {
  current = Math.min(lessons.length - 1, current + 1);
  render();
};
document.getElementById("prev").onclick = () => {
  current = Math.max(0, current - 1);
  render();
};
document.getElementById("mark-done").onclick = () => {
  done.add(current);
  render();
};

render();
