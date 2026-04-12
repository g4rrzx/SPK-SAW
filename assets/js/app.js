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
  form: document.querySelector("#weights-form"),
  calculateButton: document.querySelector("#btn-calculate"),
  resetButton: document.querySelector("#btn-reset"),
  toggleButton: document.querySelector("#toggle-details"),
  details: document.querySelector("#calculation-details"),
  errorBanner: document.querySelector("#error-banner"),
  topRecommendation: document.querySelector("#top-recommendation"),
};

const formatterCurrency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatNumber(value) {
  return Number(value).toFixed(4);
}

function parseLocalizedNumber(value) {
  if (typeof value !== "string") {
    return Number.NaN;
  }

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
    return {
      valid: false,
      message: "Total bobot harus 1.00 (toleransi ±0.001).",
      field: null,
    };
  }

  return { valid: true, message: "", field: null };
}

function calculateSaw(monitorsInput, weights) {
  const stats = criteria.map((criterion) => {
    const values = monitorsInput.map((monitor) => monitor[criterion.key]);
    return {
      ...criterion,
      max: Math.max(...values),
      min: Math.min(...values),
    };
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

    return {
      id: monitor.id,
      nama: monitor.nama,
      ...values,
    };
  });

  const preferences = normalized.map((row) => {
    const score = criteria.reduce((total, criterion) => {
      const weight = weights[criterion.code];
      return total + weight * row[criterion.code];
    }, 0);

    return { id: row.id, nama: row.nama, score };
  });

  const ranking = [...preferences]
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.id - b.id;
    })
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return { normalized, preferences, ranking };
}

function renderMonitorsTable(data) {
  elements.monitorsBody.innerHTML = data
    .map(
      (monitor) => `
      <tr>
        <td>${monitor.id}</td>
        <td>${monitor.nama}</td>
        <td class="table-cell-nowrap">${formatterCurrency.format(monitor.harga)}</td>
        <td class="table-cell-nowrap">${monitor.resolusi}</td>
        <td class="table-cell-nowrap">${monitor.refresh} Hz</td>
        <td class="table-cell-nowrap">${monitor.ukuran}”</td>
        <td class="table-cell-nowrap">${monitor.garansi} tahun</td>
      </tr>
    `,
    )
    .join("");
}

function renderRankingTable(ranking) {
  elements.rankingBody.innerHTML = ranking
    .map(
      (row) => `
      <tr class="${row.rank === 1 ? "ranking-top" : ""}">
        <td>${row.rank}</td>
        <td>${row.nama}</td>
        <td>${formatNumber(row.score)}</td>
      </tr>
    `,
    )
    .join("");
}

function renderNormalizationTable(normalized) {
  elements.normalizationBody.innerHTML = normalized
    .map(
      (row) => `
      <tr>
        <td>${row.id}</td>
        <td>${row.nama}</td>
        <td>${formatNumber(row.C1)}</td>
        <td>${formatNumber(row.C2)}</td>
        <td>${formatNumber(row.C3)}</td>
        <td>${formatNumber(row.C4)}</td>
        <td>${formatNumber(row.C5)}</td>
      </tr>
    `,
    )
    .join("");
}

function renderPreferenceTable(preferences) {
  elements.preferenceBody.innerHTML = preferences
    .map(
      (row) => `
      <tr>
        <td>${row.id}</td>
        <td>${row.nama}</td>
        <td>${formatNumber(row.score)}</td>
      </tr>
    `,
    )
    .join("");
}

function renderTopRecommendation(ranking) {
  const top = ranking[0];
  if (!top) {
    elements.topRecommendation.textContent = "Belum ada hasil perhitungan.";
    elements.topRecommendation.classList.add("text-secondary");
    return;
  }

  elements.topRecommendation.classList.remove("text-secondary");
  elements.topRecommendation.textContent = `#${top.rank} ${top.nama} dengan nilai preferensi ${formatNumber(top.score)}.`;
}

function setDefaultWeights() {
  for (const criterion of criteria) {
    const input = elements.form.querySelector(`#weight-${criterion.code.toLowerCase()}`);
    input.value = criterion.defaultWeight.toString();
  }
}

function clearResults() {
  elements.rankingBody.innerHTML = "";
  elements.normalizationBody.innerHTML = "";
  elements.preferenceBody.innerHTML = "";
  renderTopRecommendation([]);
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
  for (const criterion of criteria) {
    const input = elements.form.querySelector(`#weight-${criterion.code.toLowerCase()}`);
    input.setAttribute("aria-invalid", "false");
  }
}

function setInputError(inputElement) {
  if (!inputElement) {
    return;
  }

  inputElement.setAttribute("aria-invalid", "true");
  inputElement.focus();
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
    const result = calculateSaw(monitors, weights);
    renderRankingTable(result.ranking);
    renderNormalizationTable(result.normalized);
    renderPreferenceTable(result.preferences);
    renderTopRecommendation(result.ranking);
  } catch (error) {
    showError(error instanceof Error ? error.message : "Terjadi kesalahan saat menghitung SAW.");
    clearResults();
  }
}

function onReset() {
  hideError();
  clearInputErrors();
  setDefaultWeights();
  clearResults();
  elements.details.classList.add("d-none");
  elements.toggleButton.textContent = "Tampilkan Detail Perhitungan";
  elements.toggleButton.setAttribute("aria-expanded", "false");
}

function onToggleDetails() {
  const hidden = elements.details.classList.toggle("d-none");
  elements.toggleButton.setAttribute("aria-expanded", hidden ? "false" : "true");
  elements.toggleButton.textContent = hidden
    ? "Tampilkan Detail Perhitungan"
    : "Sembunyikan Detail Perhitungan";
}

function bootstrap() {
  const missingElements = Object.entries(elements)
    .filter(([, value]) => value === null)
    .map(([key]) => key);

  if (missingElements.length > 0) {
    throw new Error(`Inisialisasi gagal: elemen DOM tidak ditemukan (${missingElements.join(", ")}).`);
  }

  renderMonitorsTable(monitors);
  setDefaultWeights();
  clearResults();

  elements.form.addEventListener("submit", onCalculate);
  elements.resetButton.addEventListener("click", onReset);
  elements.toggleButton.addEventListener("click", onToggleDetails);
}

bootstrap();
