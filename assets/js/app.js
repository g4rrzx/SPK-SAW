const monitors = [
  { id: 1, nama: "ViewSonic VX2458", harga: 1800000, resolusi: 75, refresh: 75, ukuran: 24, garansi: 2 },
  { id: 2, nama: "AOC 24G2SP", harga: 2500000, resolusi: 75, refresh: 165, ukuran: 24, garansi: 2 },
  { id: 3, nama: "LG 27UP850", harga: 4800000, resolusi: 100, refresh: 60, ukuran: 27, garansi: 3 },
  { id: 4, nama: "Xiaomi Mi 2K", harga: 2900000, resolusi: 85, refresh: 75, ukuran: 27, garansi: 1 },
  { id: 5, nama: "Samsung Odyssey G3", harga: 2300000, resolusi: 75, refresh: 144, ukuran: 24, garansi: 2 },
  { id: 6, nama: "Dell P2723D", harga: 4200000, resolusi: 85, refresh: 60, ukuran: 27, garansi: 3 },
  { id: 7, nama: "Asus VG279Q1A", harga: 3100000, resolusi: 75, refresh: 165, ukuran: 27, garansi: 2 },
  { id: 8, nama: "HP VH24", harga: 1600000, resolusi: 70, refresh: 60, ukuran: 24, garansi: 1 },
  { id: 9, nama: "Philips 275E2FAE", harga: 2700000, resolusi: 85, refresh: 75, ukuran: 27, garansi: 2 },
  { id: 10, nama: "BenQ GW2785TC", harga: 3500000, resolusi: 75, refresh: 60, ukuran: 27, garansi: 3 },
];

const criteria = [
  { code: "C1", key: "harga", label: "Harga", type: "cost", defaultWeight: 0.25 },
  { code: "C2", key: "resolusi", label: "Resolusi", type: "benefit", defaultWeight: 0.25 },
  { code: "C3", key: "refresh", label: "Refresh", type: "benefit", defaultWeight: 0.2 },
  { code: "C4", key: "ukuran", label: "Ukuran", type: "benefit", defaultWeight: 0.15 },
  { code: "C5", key: "garansi", label: "Garansi", type: "benefit", defaultWeight: 0.15 },
];

const tolerance = 0.001;

const elements = {
  monitorsBody: document.querySelector("#monitors-table tbody"),
  rankingBody: document.querySelector("#ranking-table tbody"),
  normalizationBody: document.querySelector("#normalization-table tbody"),
  preferenceBody: document.querySelector("#preference-table tbody"),
  sawStatsBody: document.querySelector("#saw-stats-table tbody"),
  wpWeightsBody: document.querySelector("#wp-weights-table tbody"),
  wpSBody: document.querySelector("#wp-s-table tbody"),
  wpVBody: document.querySelector("#wp-v-table tbody"),
  wpSumS: document.querySelector("#wp-sum-s"),
  smartWeightsBody: document.querySelector("#smart-weights-table tbody"),
  smartStatsBody: document.querySelector("#smart-stats-table tbody"),
  smartUtilityBody: document.querySelector("#smart-utility-table tbody"),
  smartPreferenceBody: document.querySelector("#smart-preference-table tbody"),
  sawDetails: document.querySelector("#saw-details"),
  wpDetails: document.querySelector("#wp-details"),
  smartDetails: document.querySelector("#smart-details"),
  form: document.querySelector("#weights-form"),
  calculateButton: document.querySelector("#btn-calculate"),
  resetButton: document.querySelector("#btn-reset"),
  toggleButton: document.querySelector("#toggle-details"),
  details: document.querySelector("#calculation-details"),
  errorBanner: document.querySelector("#error-banner"),
  topRecommendation: document.querySelector("#top-recommendation"),
  topMethodBadge: document.querySelector("#top-method-badge"),
  methodPills: Array.from(document.querySelectorAll(".method-pill")),
  methodDescription: document.querySelector("#method-description"),
  weightSumIndicator: document.querySelector("#weight-sum-indicator"),
  weightSumValue: document.querySelector("#weight-sum-value"),
};

const state = {
  method: "saw",
};

const methodMeta = {
  saw: {
    label: "SAW",
    button: "Hitung SAW",
    description:
      "<strong>SAW</strong> — Simple Additive Weighting: normalisasi linier <code>R</code>, lalu <code>V = Σ (W × R)</code>.",
  },
  wp: {
    label: "WP",
    button: "Hitung WP",
    description:
      "<strong>WP</strong> — Weighted Product: <code>S = Π (X^w')</code>, pangkat negatif untuk cost, lalu <code>V = S / ΣS</code>.",
  },
  smart: {
    label: "SMART",
    button: "Hitung SMART",
    description:
      "<strong>SMART</strong> — Simple Multi-Attribute Rating Technique: utilitas <code>u = (X−min)/(max−min)</code> (benefit) atau <code>(max−X)/(max−min)</code> (cost), lalu <code>V = Σ (w' × u)</code>.",
  },
};

const formatterCurrency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatNumber(value, digits = 4) {
  return Number(value).toFixed(digits);
}

function parseLocalizedNumber(value) {
  if (typeof value !== "string") return Number.NaN;
  return Number(value.trim().replace(",", "."));
}

function getWeightInputs() {
  return criteria.map((criterion) => {
    const input = elements.form.querySelector(`#weight-${criterion.code.toLowerCase()}`);
    return {
      ...criterion,
      input,
      value: parseLocalizedNumber(input.value),
    };
  });
}

function validateWeights(items) {
  for (const item of items) {
    if (!Number.isFinite(item.value)) {
      return { valid: false, message: `Bobot ${item.code} harus berupa angka.`, field: item.input };
    }
    if (item.value < 0) {
      return { valid: false, message: `Bobot ${item.code} tidak boleh negatif.`, field: item.input };
    }
  }
  const sum = items.reduce((total, item) => total + item.value, 0);
  if (Math.abs(sum - 1) > tolerance) {
    return { valid: false, message: "Total bobot harus 1.00 (toleransi ±0.001).", field: null };
  }
  return { valid: true, message: "", field: null };
}

/* ============== SAW ============== */
function calculateSaw(monitorsInput, weights) {
  const stats = criteria.map((criterion) => {
    const values = monitorsInput.map((m) => m[criterion.key]);
    return { ...criterion, max: Math.max(...values), min: Math.min(...values) };
  });

  const normalized = monitorsInput.map((monitor) => {
    const values = {};
    for (const stat of stats) {
      const source = monitor[stat.key];
      const denominator = stat.type === "benefit" ? stat.max : source;
      const numerator = stat.type === "benefit" ? source : stat.min;
      if (denominator === 0) {
        throw new Error(`Perhitungan gagal: pembagi nol pada ${stat.code}.`);
      }
      values[stat.code] = numerator / denominator;
    }
    return { id: monitor.id, nama: monitor.nama, ...values };
  });

  const preferences = normalized.map((row) => {
    const score = criteria.reduce((total, c) => total + weights[c.code] * row[c.code], 0);
    return { id: row.id, nama: row.nama, score };
  });

  const ranking = [...preferences]
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.id - b.id))
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return { method: "saw", stats, normalized, preferences, ranking };
}

/* ============== WP ============== */
function calculateWp(monitorsInput, weights) {
  const sumW = criteria.reduce((acc, c) => acc + weights[c.code], 0);
  const wpWeights = criteria.map((c) => {
    const wPrime = weights[c.code] / sumW;
    const power = c.type === "cost" ? -wPrime : wPrime;
    return { ...c, w: weights[c.code], wPrime, power };
  });

  const sValues = monitorsInput.map((monitor) => {
    let s = 1;
    const components = {};
    for (const w of wpWeights) {
      const x = monitor[w.key];
      if (x <= 0) {
        throw new Error(`Perhitungan gagal: nilai ${w.code} harus > 0.`);
      }
      const term = Math.pow(x, w.power);
      components[w.code] = term;
      s *= term;
    }
    return { id: monitor.id, nama: monitor.nama, components, s };
  });

  const sumS = sValues.reduce((acc, r) => acc + r.s, 0);
  if (sumS === 0) {
    throw new Error("Perhitungan gagal: ΣS = 0.");
  }

  const preferences = sValues.map((r) => ({ id: r.id, nama: r.nama, score: r.s / sumS, s: r.s }));

  const ranking = [...preferences]
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.id - b.id))
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return { method: "wp", wpWeights, sValues, sumS, preferences, ranking };
}

/* ============== SMART ============== */
function calculateSmart(monitorsInput, weights) {
  const sumW = criteria.reduce((acc, c) => acc + weights[c.code], 0);
  const smartWeights = criteria.map((c) => ({
    ...c,
    w: weights[c.code],
    wPrime: weights[c.code] / sumW,
  }));

  const stats = criteria.map((criterion) => {
    const values = monitorsInput.map((m) => m[criterion.key]);
    return { ...criterion, max: Math.max(...values), min: Math.min(...values) };
  });

  const utility = monitorsInput.map((monitor) => {
    const values = {};
    for (const stat of stats) {
      const range = stat.max - stat.min;
      const x = monitor[stat.key];
      if (range === 0) {
        values[stat.code] = 1;
      } else if (stat.type === "benefit") {
        values[stat.code] = (x - stat.min) / range;
      } else {
        values[stat.code] = (stat.max - x) / range;
      }
    }
    return { id: monitor.id, nama: monitor.nama, ...values };
  });

  const preferences = utility.map((row) => {
    const score = smartWeights.reduce((total, c) => total + c.wPrime * row[c.code], 0);
    return { id: row.id, nama: row.nama, score };
  });

  const ranking = [...preferences]
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.id - b.id))
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return { method: "smart", smartWeights, stats, utility, preferences, ranking };
}

/* ============== Renderers ============== */
function renderMonitorsTable(data) {
  elements.monitorsBody.innerHTML = data
    .map(
      (m) => `
      <tr>
        <td data-label="ID">${m.id}</td>
        <td data-label="Nama">${m.nama}</td>
        <td data-label="Harga" class="table-cell-nowrap">${formatterCurrency.format(m.harga)}</td>
        <td data-label="Resolusi" class="table-cell-nowrap">${m.resolusi}</td>
        <td data-label="Refresh" class="table-cell-nowrap">${m.refresh} Hz</td>
        <td data-label="Ukuran" class="table-cell-nowrap">${m.ukuran}”</td>
        <td data-label="Garansi" class="table-cell-nowrap">${m.garansi} tahun</td>
      </tr>`,
    )
    .join("");
}

function rankBadgeClass(rank) {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  return "";
}

function renderRankingTable(ranking) {
  const max = ranking.length ? ranking[0].score : 1;
  elements.rankingBody.innerHTML = ranking
    .map((row) => {
      const pct = max > 0 ? Math.max(4, Math.round((row.score / max) * 100)) : 0;
      return `
      <tr class="${row.rank === 1 ? "ranking-top" : ""}">
        <td data-label="Rank"><span class="rank-badge ${rankBadgeClass(row.rank)}">${row.rank}</span></td>
        <td data-label="Nama Monitor">${row.nama}</td>
        <td data-label="Nilai V">
          <div class="score-cell">${formatNumber(row.score)}</div>
          <div class="score-bar"><span style="width:${pct}%"></span></div>
        </td>
      </tr>`;
    })
    .join("");
}

function renderSawDetails(result) {
  elements.sawStatsBody.innerHTML = result.stats
    .map(
      (s) => `
      <tr>
        <td data-label="Kriteria">${s.code} ${s.label}</td>
        <td data-label="Tipe">${s.type}</td>
        <td data-label="Max">${s.max}</td>
        <td data-label="Min">${s.min}</td>
      </tr>`,
    )
    .join("");

  elements.normalizationBody.innerHTML = result.normalized
    .map(
      (row) => `
      <tr>
        <td data-label="ID">${row.id}</td>
        <td data-label="Nama">${row.nama}</td>
        <td data-label="C1">${formatNumber(row.C1)}</td>
        <td data-label="C2">${formatNumber(row.C2)}</td>
        <td data-label="C3">${formatNumber(row.C3)}</td>
        <td data-label="C4">${formatNumber(row.C4)}</td>
        <td data-label="C5">${formatNumber(row.C5)}</td>
      </tr>`,
    )
    .join("");

  elements.preferenceBody.innerHTML = result.preferences
    .map(
      (row) => `
      <tr>
        <td data-label="ID">${row.id}</td>
        <td data-label="Nama">${row.nama}</td>
        <td data-label="Nilai V">${formatNumber(row.score)}</td>
      </tr>`,
    )
    .join("");
}

function renderWpDetails(result) {
  elements.wpWeightsBody.innerHTML = result.wpWeights
    .map(
      (w) => `
      <tr>
        <td data-label="Kriteria">${w.code} ${w.label}</td>
        <td data-label="Tipe">${w.type}</td>
        <td data-label="w">${formatNumber(w.w)}</td>
        <td data-label="w'">${formatNumber(w.wPrime)}</td>
        <td data-label="Pangkat">${w.power >= 0 ? "+" : ""}${formatNumber(w.power)}</td>
      </tr>`,
    )
    .join("");

  elements.wpSBody.innerHTML = result.sValues
    .map(
      (row) => `
      <tr>
        <td data-label="ID">${row.id}</td>
        <td data-label="Nama">${row.nama}</td>
        <td data-label="C1">${formatNumber(row.components.C1)}</td>
        <td data-label="C2">${formatNumber(row.components.C2)}</td>
        <td data-label="C3">${formatNumber(row.components.C3)}</td>
        <td data-label="C4">${formatNumber(row.components.C4)}</td>
        <td data-label="C5">${formatNumber(row.components.C5)}</td>
        <td data-label="S">${formatNumber(row.s, 6)}</td>
      </tr>`,
    )
    .join("");

  elements.wpSumS.textContent = formatNumber(result.sumS, 6);

  elements.wpVBody.innerHTML = result.preferences
    .map(
      (row) => `
      <tr>
        <td data-label="ID">${row.id}</td>
        <td data-label="Nama">${row.nama}</td>
        <td data-label="S">${formatNumber(row.s, 6)}</td>
        <td data-label="V">${formatNumber(row.score)}</td>
      </tr>`,
    )
    .join("");
}

function renderSmartDetails(result) {
  elements.smartWeightsBody.innerHTML = result.smartWeights
    .map(
      (w) => `
      <tr>
        <td data-label="Kriteria">${w.code} ${w.label}</td>
        <td data-label="Tipe">${w.type}</td>
        <td data-label="w">${formatNumber(w.w)}</td>
        <td data-label="w'">${formatNumber(w.wPrime)}</td>
      </tr>`,
    )
    .join("");

  elements.smartStatsBody.innerHTML = result.stats
    .map(
      (s) => `
      <tr>
        <td data-label="Kriteria">${s.code} ${s.label}</td>
        <td data-label="Tipe">${s.type}</td>
        <td data-label="Max">${s.max}</td>
        <td data-label="Min">${s.min}</td>
      </tr>`,
    )
    .join("");

  elements.smartUtilityBody.innerHTML = result.utility
    .map(
      (row) => `
      <tr>
        <td data-label="ID">${row.id}</td>
        <td data-label="Nama">${row.nama}</td>
        <td data-label="C1">${formatNumber(row.C1)}</td>
        <td data-label="C2">${formatNumber(row.C2)}</td>
        <td data-label="C3">${formatNumber(row.C3)}</td>
        <td data-label="C4">${formatNumber(row.C4)}</td>
        <td data-label="C5">${formatNumber(row.C5)}</td>
      </tr>`,
    )
    .join("");

  elements.smartPreferenceBody.innerHTML = result.preferences
    .map(
      (row) => `
      <tr>
        <td data-label="ID">${row.id}</td>
        <td data-label="Nama">${row.nama}</td>
        <td data-label="Nilai V">${formatNumber(row.score)}</td>
      </tr>`,
    )
    .join("");
}

function renderTopRecommendation(ranking, method) {
  const top = ranking[0];
  if (!top) {
    elements.topRecommendation.textContent = "Belum ada hasil perhitungan.";
    elements.topRecommendation.classList.add("text-secondary");
    elements.topMethodBadge.textContent = "—";
    return;
  }
  elements.topRecommendation.classList.remove("text-secondary");
  elements.topRecommendation.textContent = `#${top.rank} ${top.nama} dengan nilai preferensi ${formatNumber(top.score)}.`;
  elements.topMethodBadge.textContent = methodMeta[method].label;
}

function setDefaultWeights() {
  for (const c of criteria) {
    const input = elements.form.querySelector(`#weight-${c.code.toLowerCase()}`);
    input.value = c.defaultWeight.toString();
  }
}

function clearResults() {
  elements.rankingBody.innerHTML = "";
  elements.normalizationBody.innerHTML = "";
  elements.preferenceBody.innerHTML = "";
  elements.sawStatsBody.innerHTML = "";
  elements.wpWeightsBody.innerHTML = "";
  elements.wpSBody.innerHTML = "";
  elements.wpVBody.innerHTML = "";
  elements.wpSumS.textContent = "—";
  elements.smartWeightsBody.innerHTML = "";
  elements.smartStatsBody.innerHTML = "";
  elements.smartUtilityBody.innerHTML = "";
  elements.smartPreferenceBody.innerHTML = "";
  renderTopRecommendation([], state.method);
}

function showError(message) {
  elements.errorBanner.textContent = message;
  elements.errorBanner.classList.remove("d-none");
}

function hideError() {
  elements.errorBanner.classList.add("d-none");
  elements.errorBanner.textContent = "";
}

function clearInputErrors() {
  for (const c of criteria) {
    elements.form.querySelector(`#weight-${c.code.toLowerCase()}`).setAttribute("aria-invalid", "false");
  }
}

function setInputError(inputElement) {
  if (!inputElement) return;
  inputElement.setAttribute("aria-invalid", "true");
  inputElement.focus();
}

function updateWeightSumIndicator() {
  const entries = getWeightInputs();
  const sum = entries.reduce((t, e) => t + (Number.isFinite(e.value) ? e.value : 0), 0);
  elements.weightSumValue.textContent = formatNumber(sum, 2);
  elements.weightSumIndicator.classList.remove("is-valid", "is-invalid");
  if (entries.every((e) => Number.isFinite(e.value) && e.value >= 0) && Math.abs(sum - 1) <= tolerance) {
    elements.weightSumIndicator.classList.add("is-valid");
  } else {
    elements.weightSumIndicator.classList.add("is-invalid");
  }
}

function applyMethodView() {
  const meta = methodMeta[state.method];
  elements.calculateButton.textContent = meta.button;
  elements.methodDescription.innerHTML = meta.description;
  for (const pill of elements.methodPills) {
    const active = pill.dataset.method === state.method;
    pill.classList.toggle("active", active);
    pill.setAttribute("aria-pressed", active ? "true" : "false");
  }
  elements.sawDetails.classList.toggle("d-none", state.method !== "saw");
  elements.wpDetails.classList.toggle("d-none", state.method !== "wp");
  elements.smartDetails.classList.toggle("d-none", state.method !== "smart");
}

function onMethodPillClick(event) {
  const method = event.currentTarget.dataset.method;
  if (!method || method === state.method) return;
  state.method = method;
  applyMethodView();
  hideError();
  clearResults();
  // collapse details panel until next compute
  elements.details.classList.add("d-none");
  elements.toggleButton.textContent = "Tampilkan Detail Perhitungan";
  elements.toggleButton.setAttribute("aria-expanded", "false");
}

function onCalculate(event) {
  event.preventDefault();
  hideError();
  clearInputErrors();

  const entries = getWeightInputs();
  const validation = validateWeights(entries);
  if (!validation.valid) {
    showError(validation.message);
    setInputError(validation.field);
    clearResults();
    return;
  }

  const weights = entries.reduce((acc, item) => {
    acc[item.code] = item.value;
    return acc;
  }, {});

  try {
    let result;
    if (state.method === "wp") {
      result = calculateWp(monitors, weights);
    } else if (state.method === "smart") {
      result = calculateSmart(monitors, weights);
    } else {
      result = calculateSaw(monitors, weights);
    }
    renderRankingTable(result.ranking);
    if (result.method === "saw") {
      renderSawDetails(result);
    } else if (result.method === "wp") {
      renderWpDetails(result);
    } else {
      renderSmartDetails(result);
    }
    renderTopRecommendation(result.ranking, result.method);
  } catch (error) {
    showError(error instanceof Error ? error.message : "Terjadi kesalahan saat menghitung.");
    clearResults();
  }
}

function onReset() {
  hideError();
  clearInputErrors();
  setDefaultWeights();
  clearResults();
  updateWeightSumIndicator();
  elements.details.classList.add("d-none");
  elements.toggleButton.textContent = "Tampilkan Detail Perhitungan";
  elements.toggleButton.setAttribute("aria-expanded", "false");
}

function onToggleDetails() {
  const hidden = elements.details.classList.toggle("d-none");
  elements.toggleButton.setAttribute("aria-expanded", hidden ? "false" : "true");
  elements.toggleButton.textContent = hidden ? "Tampilkan Detail Perhitungan" : "Sembunyikan Detail Perhitungan";
}

function bootstrap() {
  const missing = Object.entries(elements)
    .filter(([, v]) => v === null || (Array.isArray(v) && v.length === 0))
    .map(([k]) => k);
  if (missing.length > 0) {
    throw new Error(`Inisialisasi gagal: elemen DOM tidak ditemukan (${missing.join(", ")}).`);
  }

  renderMonitorsTable(monitors);
  setDefaultWeights();
  clearResults();
  applyMethodView();
  updateWeightSumIndicator();

  elements.form.addEventListener("submit", onCalculate);
  elements.form.addEventListener("input", updateWeightSumIndicator);
  elements.resetButton.addEventListener("click", onReset);
  elements.toggleButton.addEventListener("click", onToggleDetails);
  for (const pill of elements.methodPills) {
    pill.addEventListener("click", onMethodPillClick);
  }
}

bootstrap();
