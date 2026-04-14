import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf-8");
const css = readFileSync(new URL("../assets/css/styles.css", import.meta.url), "utf-8");

test("memiliki viewport meta untuk responsive device", () => {
  assert.match(html, /<meta\s+name="viewport"\s+content="width=device-width, initial-scale=1\.0"\s*\/>/);
});

test("menggunakan Bootstrap 5 CDN", () => {
  assert.match(html, /cdn\.jsdelivr\.net\/npm\/bootstrap@5\.3\.3/);
});

test("memiliki selector utama sesuai plan", () => {
  const requiredIds = [
    "hero-panel",
    "monitors-table",
    "weights-form",
    "btn-calculate",
    "btn-reset",
    "ranking-table",
    "normalization-table",
    "preference-table",
    "top-recommendation",
    "toggle-details",
  ];

  for (const id of requiredIds) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
});

test("hero header menyatu dengan kartu data monitor", () => {
  assert.doesNotMatch(html, /<header class="app-header">/);
  assert.match(
    html,
    /<article class="card shadow-sm h-100">[\s\S]*id="hero-panel"[\s\S]*Data Dummy Monitor/,
  );
});

test("menampilkan identitas mahasiswa dan judul tugas", () => {
  assert.match(html, /Rekomendasi Monitor Terbaik metode SPK/);
  assert.match(html, /Tegar Andriyansyah\s*-\s*231011402038/);
});

test("tabel utama dibungkus table-responsive", () => {
  const wrappers = html.match(/<div class="table-responsive">/g) ?? [];
  assert.ok(wrappers.length >= 3, "Expected minimal 3 table-responsive wrappers");
});

test("form input memiliki label dan atribut aksesibilitas", () => {
  const ids = ["weight-c1", "weight-c2", "weight-c3", "weight-c4", "weight-c5"];

  for (const id of ids) {
    assert.match(html, new RegExp(`<label class="form-label" for="${id}">`));
    assert.match(html, new RegExp(`<input id="${id}"[\\s\\S]*?aria-invalid="false"`));
  }
});

test("toggle detail memiliki aria-controls dan aria-expanded", () => {
  assert.match(html, /id="toggle-details"[\s\S]*aria-controls="calculation-details"/);
  assert.match(html, /id="toggle-details"[\s\S]*aria-expanded="false"/);
});

test("memiliki media query mobile-first dan small-screen", () => {
  assert.match(css, /@media \(min-width: 992px\)/);
  assert.match(css, /@media \(max-width: 575\.98px\)/);
});

test("guard mobile overflow tersedia untuk tabel dan kolom", () => {
  assert.match(css, /\.app-main-container \.row > \[class\*=\"col-\"\] \{[\s\S]*min-width: 0;/);
  assert.match(css, /\.table-responsive \{[\s\S]*overflow-x: auto;/);
  assert.match(css, /#monitors-table,[\s\S]*#preference-table \{[\s\S]*min-width: 0;/);
  assert.match(css, /\.mobile-stacked-table thead \{[\s\S]*clip: rect\(0 0 0 0\);[\s\S]*position: absolute;/);
  assert.match(css, /\.mobile-stacked-table tbody td::before \{[\s\S]*content: attr\(data-label\);/);
  assert.doesNotMatch(css, /min-width: 680px;/);
});
