const canvas = document.getElementById('tectonic-canvas');
const ctx = canvas.getContext('2d');
const lessonTitle = document.getElementById('lesson-title');
const lessonText = document.getElementById('lesson-text');
const controls = document.getElementById('dynamic-controls');

const state = {
  step: 0,
  load: 0.6,
  buttress: false,
  vault: 'barrel',
  domeOpenings: 4,
};

const lessons = [
  {
    title: '1) Базовая механика: сжатие и распор',
    text: 'Каменная архитектура любит сжатие. Проблема возникает, когда конструкция не только давит вниз, но и раздвигает опоры в стороны — это называется распор. Чем тяжелее верх, тем больше важна геометрия и контр-опоры.',
    controls: () => `
      <label>Нагрузка
        <input id="load" type="range" min="0.2" max="1" step="0.05" value="${state.load}">
      </label>
    `,
    draw: drawCompression,
  },
  {
    title: '2) Колонны и опоры',
    text: 'Колонна передаёт вертикальную нагрузку в фундамент. Но если сверху арка/свод — часть усилия уходит в сторону. Поэтому в храмах часто чередуют колонны, пилоны и утолщённые стены.',
    controls: () => `
      <label>Нагрузка
        <input id="load" type="range" min="0.2" max="1" step="0.05" value="${state.load}">
      </label>
      <label>
        <input id="buttress" type="checkbox" ${state.buttress ? 'checked' : ''}> Контрфорсы
      </label>
    `,
    draw: drawColumns,
  },
  {
    title: '3) Арка: зачем она нужна?',
    text: 'Арка превращает часть изгиба в сжатие вдоль кривой. Это позволяет перекрывать проёмы камнем без длинной цельной балки. Цена — распор в пяте арки, поэтому нужны массивные опоры или контрфорсы.',
    controls: () => `
      <label>Нагрузка
        <input id="load" type="range" min="0.2" max="1" step="0.05" value="${state.load}">
      </label>
      <label>
        <input id="buttress" type="checkbox" ${state.buttress ? 'checked' : ''}> Усилить опоры
      </label>
    `,
    draw: drawArch,
  },
  {
    title: '4) Своды: цилиндрический, крестовый, ребристый',
    text: 'Свод переносит нагрузки на линии опор. Цилиндрический требует сплошных стен, крестовый концентрирует усилия в углах, а ребристый позволяет легче перекрытия и больше окон.',
    controls: () => `
      <label>
        <input type="radio" name="vault" value="barrel" ${state.vault === 'barrel' ? 'checked' : ''}> Цилиндрический
      </label>
      <label>
        <input type="radio" name="vault" value="groin" ${state.vault === 'groin' ? 'checked' : ''}> Крестовый
      </label>
      <label>
        <input type="radio" name="vault" value="rib" ${state.vault === 'rib' ? 'checked' : ''}> Ребристый
      </label>
    `,
    draw: drawVault,
  },
  {
    title: '5) Купол и барабан',
    text: 'Купол даёт центричность и символический акцент, но создаёт кольцевой распор у основания. Барабан с окнами облегчает массу и вводит свет, а подпружные арки переводят усилия к пилонам.',
    controls: () => `
      <label>Окон в барабане
        <input id="openings" type="range" min="0" max="8" step="1" value="${state.domeOpenings}">
      </label>
    `,
    draw: drawDome,
  },
  {
    title: '6) Сборка храма как системы',
    text: 'Храм — это компромисс между символикой, светом, акустикой и несущей логикой. Увеличиваем высоту — усиливаем опоры. Хотим больше света — перераспределяем нагрузки ребрами, аркбутанами и пилонами.',
    controls: () => '',
    draw: drawSynthesis,
  },
];

function render() {
  const lesson = lessons[state.step];
  lessonTitle.textContent = lesson.title;
  lessonText.textContent = lesson.text;
  controls.innerHTML = lesson.controls();
  bindControls();
  clear();
  lesson.draw();
}

function bindControls() {
  const load = document.getElementById('load');
  const buttress = document.getElementById('buttress');
  const openings = document.getElementById('openings');

  if (load) load.oninput = (e) => { state.load = Number(e.target.value); render(); };
  if (buttress) buttress.onchange = (e) => { state.buttress = e.target.checked; render(); };
  if (openings) openings.oninput = (e) => { state.domeOpenings = Number(e.target.value); render(); };

  document.querySelectorAll('input[name="vault"]').forEach((node) => {
    node.onchange = (e) => {
      state.vault = e.target.value;
      render();
    };
  });
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGround();
}

function drawGround() {
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 360, canvas.width, 60);
}

function arrow(x1, y1, x2, y2, color = '#22c55e') {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 10 * Math.cos(a - 0.35), y2 - 10 * Math.sin(a - 0.35));
  ctx.lineTo(x2 - 10 * Math.cos(a + 0.35), y2 - 10 * Math.sin(a + 0.35));
  ctx.closePath();
  ctx.fill();
}

function drawCompression() {
  const w = 120;
  const h = 220;
  const x = 380;
  const y = 140;
  ctx.fillStyle = '#475569';
  ctx.fillRect(x, y, w, h);

  const arrows = Math.round(3 + state.load * 6);
  for (let i = 0; i < arrows; i++) {
    const xx = x + 15 + i * (w - 30) / (arrows - 1 || 1);
    arrow(xx, 50, xx, y - 8);
    arrow(xx, y + h + 8, xx, 350, '#38bdf8');
  }
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText('Сжатие: сила проходит вниз', 320, 32);
}

function drawColumns() {
  const loadH = 40 + state.load * 70;
  ctx.fillStyle = '#64748b';
  ctx.fillRect(220, 180, 60, 180);
  ctx.fillRect(600, 180, 60, 180);
  ctx.fillStyle = '#334155';
  ctx.fillRect(180, 150, 520, 30);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(180, 150 - loadH, 520, loadH);

  arrow(440, 90, 440, 145);
  arrow(440, 180, 250, 220, '#f97316');
  arrow(440, 180, 630, 220, '#f97316');

  if (state.buttress) {
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(160, 220, 30, 140);
    ctx.fillRect(690, 220, 30, 140);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Контрфорсы гасят боковой распор', 290, 65);
  }
}

function drawArch() {
  ctx.lineWidth = 18;
  ctx.strokeStyle = '#94a3b8';
  ctx.beginPath();
  ctx.arc(440, 320, 200, Math.PI, 2 * Math.PI);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.fillRect(230, 320, 30, 40);
  ctx.fillRect(620, 320, 30, 40);

  arrow(440, 90, 440, 145);
  arrow(330, 260, 250, 315, '#f97316');
  arrow(550, 260, 630, 315, '#f97316');

  if (state.buttress) {
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(190, 260, 35, 100);
    ctx.fillRect(655, 260, 35, 100);
  }

  ctx.fillStyle = '#e2e8f0';
  ctx.fillText('Арка переносит нагрузку к опорам', 300, 50);
}

function drawVault() {
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 8;
  if (state.vault === 'barrel') {
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(220 + i * 60, 330, 90, Math.PI, 2 * Math.PI);
      ctx.stroke();
    }
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('Цилиндрический: распор по всей длине стен', 230, 60);
  } else if (state.vault === 'groin') {
    ctx.beginPath();
    ctx.moveTo(220, 320); ctx.quadraticCurveTo(440, 120, 660, 320); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(220, 200); ctx.quadraticCurveTo(440, 400, 660, 200); ctx.stroke();
    arrow(440, 250, 250, 350, '#38bdf8');
    arrow(440, 250, 630, 350, '#38bdf8');
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('Крестовый: нагрузки в угловые опоры', 280, 60);
  } else {
    ctx.beginPath();
    ctx.moveTo(220, 320); ctx.quadraticCurveTo(440, 120, 660, 320); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(220, 200); ctx.quadraticCurveTo(440, 400, 660, 200); ctx.stroke();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(220, 320); ctx.lineTo(440, 220); ctx.lineTo(660, 320); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(220, 200); ctx.lineTo(440, 220); ctx.lineTo(660, 200); ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('Ребристый: каркас направляет усилия, освобождая стены', 200, 60);
  }
}

function drawDome() {
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(440, 260, 160, Math.PI, 2 * Math.PI);
  ctx.stroke();
  ctx.strokeRect(300, 260, 280, 70);

  const count = state.domeOpenings;
  const spacing = 280 / (count + 1 || 1);
  ctx.fillStyle = '#7dd3fc';
  for (let i = 1; i <= count; i++) {
    ctx.fillRect(300 + i * spacing - 8, 272, 16, 36);
  }
  arrow(360, 250, 280, 300, '#f97316');
  arrow(520, 250, 600, 300, '#f97316');
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText('Барабан: свет + снижение массы', 320, 70);
}

function drawSynthesis() {
  // simplified basilica-cross plan with central dome
  ctx.fillStyle = '#374151';
  ctx.fillRect(140, 220, 600, 120); // nave
  ctx.fillRect(340, 120, 200, 260); // transept/crossing

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(440, 220, 90, Math.PI, 2 * Math.PI);
  ctx.stroke();

  ctx.fillStyle = '#1d4ed8';
  [[320,220],[530,220],[320,320],[530,320]].forEach(([x,y])=>ctx.fillRect(x,y,20,20));

  arrow(440, 70, 440, 125);
  arrow(440, 220, 330, 240, '#38bdf8');
  arrow(440, 220, 550, 240, '#38bdf8');

  ctx.fillStyle = '#e2e8f0';
  ctx.fillText('Система: купол → подпружные арки → пилоны → фундамент', 190, 50);
}

document.querySelectorAll('.step-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.step = Number(btn.dataset.step);
    document.querySelectorAll('.step-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

const quizData = [
  {
    q: 'Почему арка часто предпочтительнее прямой каменной балки над большим пролётом?',
    options: [
      'Потому что арка работает в основном на сжатие',
      'Потому что арка вообще не даёт бокового распора',
      'Только по эстетическим причинам',
    ],
    answer: 0,
  },
  {
    q: 'Какой свод сильнее освобождает стены под окна?',
    options: ['Цилиндрический', 'Ребристый', 'Любой одинаково'],
    answer: 1,
  },
  {
    q: 'Что обычно компенсирует распор купола и арок?',
    options: ['Тонкие ненесущие перегородки', 'Пилоны и контрфорсы', 'Иконостас'],
    answer: 1,
  },
];

const quizContainer = document.getElementById('quiz-container');
quizContainer.innerHTML = quizData
  .map((item, i) => `
    <div class="quiz-item">
      <p><strong>${i + 1}. ${item.q}</strong></p>
      ${item.options
        .map((op, oi) => `<label><input type="radio" name="q${i}" value="${oi}"> ${op}</label><br>`) 
        .join('')}
    </div>
  `)
  .join('');

document.getElementById('check-quiz').addEventListener('click', () => {
  let score = 0;
  quizData.forEach((item, i) => {
    const picked = document.querySelector(`input[name="q${i}"]:checked`);
    if (picked && Number(picked.value) === item.answer) score += 1;
  });
  const msg = score === quizData.length
    ? 'Отлично! Вы чувствуете тектоническую логику.'
    : `Результат: ${score}/${quizData.length}. Перелистайте уроки и попробуйте ещё раз.`;
  document.getElementById('quiz-result').textContent = msg;
});

render();
