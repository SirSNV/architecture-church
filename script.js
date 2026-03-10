const sectionIds = ["intro", "arches", "vaults", "domes", "columns", "quiz", "recipes"];
const learned = new Set();

const progressBar = document.getElementById("chapter-progress");
const progressText = document.getElementById("progress-text");
document.querySelectorAll(".complete-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    learned.add(btn.dataset.section);
    const p = Math.round((learned.size / sectionIds.length) * 100);
    progressBar.value = p;
    progressText.textContent = `${p}%`;
    btn.textContent = "Отмечено ✓";
    btn.disabled = true;
  });
});

// -------- Арка (SVG) ----------
const archSvg = document.getElementById("arch-svg");
const spanInput = document.getElementById("span-input");
const riseInput = document.getElementById("rise-input");
const loadInput = document.getElementById("load-input");
const archExplanation = document.getElementById("arch-explanation");

function updateArch() {
  const span = +spanInput.value;
  const rise = +riseInput.value;
  const load = +loadInput.value;

  document.getElementById("span-value").textContent = span;
  document.getElementById("rise-value").textContent = rise;
  document.getElementById("load-value").textContent = load;

  const W = 700, H = 300;
  const margin = 70;
  const x1 = margin;
  const x2 = W - margin;
  const yBase = H - 30;
  const yTop = yBase - rise * 16;

  const d = `M ${x1} ${yBase} Q ${W / 2} ${yTop} ${x2} ${yBase}`;

  const thrust = (load * span) / (rise * 2.2);
  const stability = Math.max(5, 100 - thrust * 1.8);

  archSvg.innerHTML = `
    <rect x="0" y="0" width="700" height="300" fill="#fafafa" />
    <rect x="${x1 - 18}" y="${yBase}" width="36" height="55" fill="#b08968" />
    <rect x="${x2 - 18}" y="${yBase}" width="36" height="55" fill="#b08968" />
    <path d="${d}" stroke="#304d6d" stroke-width="10" fill="none" />
    <line x1="${W/2}" y1="35" x2="${W/2}" y2="${yTop+12}" stroke="#c53030" stroke-width="4" marker-end="url(#arrow)"/>
    <line x1="${x1+16}" y1="${yBase-10}" x2="${x1-34}" y2="${yBase-10}" stroke="#1f2937" stroke-width="3" marker-end="url(#arrow)"/>
    <line x1="${x2-16}" y1="${yBase-10}" x2="${x2+34}" y2="${yBase-10}" stroke="#1f2937" stroke-width="3" marker-end="url(#arrow)"/>
    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L8,3 L0,6 z" fill="#1f2937"/>
      </marker>
    </defs>
  `;

  const shapeHint = rise / span > 0.35 ? "высокая" : "пологая";
  archExplanation.textContent = `Арка ${shapeHint}. Условный распор на опоры ≈ ${thrust.toFixed(1)}. Чем выше подъем арки при том же пролете, тем меньше боковой распор и выше условная устойчивость (${stability.toFixed(0)} / 100).`;
}
[spanInput, riseInput, loadInput].forEach((el) => el.addEventListener("input", updateArch));
updateArch();

// -------- Своды (Chart.js) ----------
const vaultText = document.getElementById("vault-text");
const vaultCtx = document.getElementById("vaultChart");
const vaultDataByType = {
  barrel: {
    title: "Цилиндрический свод",
    text: "Нагрузка заметно распределяется по продольным стенам. Требует массивных боковых стен или контрфорсов.",
    data: [85, 30, 20],
  },
  groin: {
    title: "Крестовый свод",
    text: "Свод концентрирует нагрузку в углах ячейки. Это открывает возможность делать более легкие промежуточные стены.",
    data: [45, 75, 55],
  },
  rib: {
    title: "Ребристый свод",
    text: "Рёбра работают как направляющий каркас: нагрузка идет по читаемым линиям к столпам. Гибкая схема для сложных пространств.",
    data: [35, 90, 65],
  },
};

const vaultChart = new Chart(vaultCtx, {
  type: "radar",
  data: {
    labels: ["Нагрузка на стены", "Нагрузка на угловые опоры", "Гибкость планировки"],
    datasets: [{
      label: "Интенсивность",
      data: vaultDataByType.barrel.data,
      backgroundColor: "rgba(48,77,109,0.2)",
      borderColor: "#304d6d",
      borderWidth: 2,
    }],
  },
  options: {
    responsive: true,
    scales: { r: { min: 0, max: 100 } },
    plugins: { legend: { display: false } },
  },
});

function setVault(type) {
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b.dataset.vault === type));
  const item = vaultDataByType[type];
  vaultChart.data.datasets[0].data = item.data;
  vaultChart.update();
  vaultText.textContent = `${item.title}: ${item.text}`;
}

document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => setVault(b.dataset.vault)));
setVault("barrel");

// -------- Купол (Chart.js line) ----------
const domeDiam = document.getElementById("dome-diam");
const domeRatio = document.getElementById("dome-ratio");
const domeText = document.getElementById("dome-text");

const domeChart = new Chart(document.getElementById("domeChart"), {
  type: "line",
  data: {
    labels: ["Меридианы", "Основание"],
    datasets: [
      {
        label: "Сжатие",
        data: [70, 50],
        borderColor: "#2f855a",
        tension: 0.25,
      },
      {
        label: "Распор",
        data: [20, 65],
        borderColor: "#c53030",
        tension: 0.25,
      },
    ],
  },
  options: {
    responsive: true,
    scales: { y: { min: 0, max: 100 } },
  },
});

function updateDome() {
  const d = +domeDiam.value;
  const ratio = +domeRatio.value;
  document.getElementById("dome-diam-val").textContent = d;
  document.getElementById("dome-ratio-val").textContent = ratio.toFixed(1);

  const slenderness = ratio;
  const baseThrust = Math.max(15, 90 - slenderness * 45 + d * 0.8);
  const meridianCompression = Math.min(95, 45 + d * 1.2 + slenderness * 18);

  domeChart.data.datasets[0].data = [Math.round(meridianCompression), Math.round(meridianCompression - 18)];
  domeChart.data.datasets[1].data = [Math.round(baseThrust * 0.35), Math.round(baseThrust)];
  domeChart.update();

  const kind = ratio > 1.1 ? "высокий (луковичный/стрельчатый по силуэту)" : ratio < 0.7 ? "приплюснутый" : "сбалансированный";
  domeText.textContent = `Купол ${kind}. При диаметре ${d} м условный распор в основании ≈ ${Math.round(baseThrust)}. Чем больше распор, тем важнее подпружные арки, толстые стены барабана и/или наружная контрсистема.`;
}
[domeDiam, domeRatio].forEach((el) => el.addEventListener("input", updateDome));
updateDome();

// -------- Колонны ----------
const colH = document.getElementById("col-h");
const colD = document.getElementById("col-d");
const colLoad = document.getElementById("col-load");
const colText = document.getElementById("column-text");
const colFill = document.getElementById("column-fill");

function updateColumn() {
  const h = +colH.value;
  const d = +colD.value;
  const load = +colLoad.value;
  document.getElementById("col-h-val").textContent = h;
  document.getElementById("col-d-val").textContent = d.toFixed(1);
  document.getElementById("col-load-val").textContent = load;

  const slender = h / d;
  const risk = Math.min(100, Math.max(5, slender * 2.6 + load * 3.8));
  colFill.style.width = `${risk}%`;

  let verdict = "Низкий риск";
  if (risk > 75) verdict = "Высокий риск потери устойчивости";
  else if (risk > 45) verdict = "Умеренный риск";

  colText.textContent = `Гибкость λ ≈ ${slender.toFixed(1)}. Индикатор риска: ${Math.round(risk)} / 100 — ${verdict}. В реальном проекте это компенсируется материалом, армированием, связями и точным расчётом.`;
}
[colH, colD, colLoad].forEach((el) => el.addEventListener("input", updateColumn));
updateColumn();

// -------- Quiz ----------
const quizQuestions = [
  {
    q: "Почему каменная арка часто эффективнее балки при большом пролете?",
    options: ["Потому что арка переводит работу в сжатие", "Потому что арка всегда легче", "Потому что арка не требует опор"],
    a: 0,
  },
  {
    q: "Какой свод сильнее концентрирует нагрузку в углах ячейки?",
    options: ["Цилиндрический", "Крестовый", "Коробовый"],
    a: 1,
  },
  {
    q: "Что обычно растёт у купола при увеличении диаметра (без усиления системы)?",
    options: ["Горизонтальный распор в основании", "Прозрачность барабана", "Высота колонн автоматически"],
    a: 0,
  },
];

const quizContainer = document.getElementById("quiz-container");
quizQuestions.forEach((item, i) => {
  const block = document.createElement("div");
  block.className = "quiz-item";
  block.innerHTML = `<p><strong>${i + 1}. ${item.q}</strong></p>` + item.options.map((opt, idx) => `
      <label><input type="radio" name="q${i}" value="${idx}"> ${opt}</label>
    `).join("<br>");
  quizContainer.appendChild(block);
});

document.getElementById("check-quiz").addEventListener("click", () => {
  let score = 0;
  quizQuestions.forEach((item, i) => {
    const checked = document.querySelector(`input[name="q${i}"]:checked`);
    if (checked && +checked.value === item.a) score += 1;
  });
  const total = quizQuestions.length;
  const pct = Math.round((score / total) * 100);
  const msg = pct === 100
    ? "Отлично! У вас уже инженерная интуиция по тектонике храма."
    : pct >= 66
      ? "Хорошо! Осталось укрепить отдельные связи между формой и нагрузкой."
      : "Неплохо для старта. Пересмотрите блоки про арку и купол — там ключ к пониманию.";
  document.getElementById("quiz-result").textContent = `Результат: ${score}/${total} (${pct}%). ${msg}`;
});
