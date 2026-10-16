(function () {
  const status = document.getElementById("aiStatus");
  const result = document.getElementById("aiResult");
  const analyze = document.getElementById("aiAnalyze");
  const form = document.getElementById("aiAskForm");
  const question = document.getElementById("aiQuestion");
  const ask = document.getElementById("aiAsk");
  const answerCard = document.getElementById("aiAnswerCard");
  const answer = document.getElementById("aiAnswer");
  const report = document.getElementById("aiReport");
  if (!status || !result || !analyze || !form || !question || !ask || !answerCard || !answer || !report) return;

  const fields = {
    summary: document.getElementById("aiSummary"),
    trend_analysis: document.getElementById("aiTrend"),
    platform_analysis: document.getElementById("aiPlatform"),
    brand_analysis: document.getElementById("aiBrand"),
    product_analysis: document.getElementById("aiProduct"),
  };
  const lists = {
    key_findings: document.getElementById("aiFindings"),
    anomalies: document.getElementById("aiAnomalies"),
    possible_explanations: document.getElementById("aiHypotheses"),
    recommendations: document.getElementById("aiRecommendations"),
  };

  function setBusy(busy) {
    analyze.disabled = busy;
    ask.disabled = busy;
    question.disabled = busy;
    status.textContent = busy ? "AI sedang menganalisis data..." : "";
  }

  function fillList(node, items) {
    node.replaceChildren();
    (items || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      node.appendChild(li);
    });
  }

  const AUTHOR_ANSWER = "Inisiatif pengembangan program ini diprakarsai dan dieksekusi langsung oleh Agus Wibowo. Latar belakang pengembangannya didasari oleh kebutuhan riil di lapangan akan sebuah sistem yang presisi dan adaptif. Dengan menggabungkan pemahaman mendalam tentang tata kelola operasional bisnis dan arsitektur data, program ini hadir sebagai solusi mandiri yang efisien, fleksibel, serta siap mendukung pertumbuhan bisnis secara berkelanjutan.";
  const TECH_ANSWER = "Program ini dibuat dengan menggunakan HTML, JS, CSS, Back End dan Front End, disimpan ke Github dan menghubungkan AI dengan kode API dari Google Studio AI.";

  function exclusiveAnswer(text) {
    const value = String(text || "").toLowerCase().replace(/[?!.,]/g, " ").replace(/\s+/g, " ").trim();
    const aboutProgram = /(program|aplikasi|website|web site|sistem|presentasi|\bini\b)/.test(value);
    const creatorPhrase = /(siapa(kah)?(?: yang)? (?:membuat|buat|bikin|pembuat|pencipta|developer|pengembang|creator)\b)|(\bwho (?:created|made|built)\b)|(pembuat (?:program|aplikasi|website|sistem|ini)\b)/.test(value);
    const asksAuthor = /(siapa(kah)?|who)\b/.test(value) && /(pembuat|membuat|buat|bikin|pengembang|developer|creator|author|pencipta|pemilik|created|made)\b/.test(value);
    const asksAuthorAlt = aboutProgram && /(pembuat|pengembang|developer|creator|pencipta)\b/.test(value);
    if (creatorPhrase || (asksAuthor && aboutProgram) || asksAuthorAlt || (aboutProgram && /(dibuat|diciptakan|dirancang|created|made)\b/.test(value) && /(siapa|who)/.test(value))) {
      return AUTHOR_ANSWER;
    }
    const asksTech = aboutProgram && (
      /(teknologi|tech stack|bahasa pemrograman|framework|\btools?\b)/.test(value)
      || /(dibuat|buat|dikembangkan|bikin).{0,40}(menggunakan|memakai|pakai|pake|dengan)/.test(value)
      || /(menggunakan|memakai|pakai|pake) apa/.test(value)
    );
    if (asksTech) return TECH_ANSWER;
    return "";
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null && text !== "") node.textContent = text;
    return node;
  }

  function renderTable(table) {
    const wrap = el("div", "mt-3 overflow-x-auto rounded-xl border border-slate-200");
    const tableEl = el("table", "min-w-full border-collapse text-left text-xs sm:text-sm");
    const headRow = el("tr");
    table.columns.forEach((col, index) => {
      headRow.appendChild(el("th", "px-3 py-2 font-medium whitespace-nowrap " + (index ? "text-right" : "text-left"), col));
    });
    const thead = el("thead", "bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500");
    thead.appendChild(headRow);
    const tbody = el("tbody");
    (table.rows || []).forEach((row) => {
      const item = Array.isArray(row) ? { cells: row } : row;
      const tr = el("tr", "border-t border-slate-100" + (item.emphasis ? " bg-slate-50 font-medium" : ""));
      (item.cells || []).forEach((cell, index) => {
        const value = cell && typeof cell === "object" ? cell : { text: cell };
        let className = "px-3 py-2 align-top " + (index ? "text-right tabular-nums whitespace-nowrap" : "text-slate-800");
        if (value.tone === "up") className += " font-medium text-teal-700";
        if (value.tone === "down") className += " font-medium text-rose-700";
        tr.appendChild(el("td", className, value.text == null || value.text === "" ? "—" : String(value.text)));
      });
      tbody.appendChild(tr);
    });
    tableEl.appendChild(thead);
    tableEl.appendChild(tbody);
    wrap.appendChild(tableEl);
    return wrap;
  }

  function renderPresentation(root, data) {
    root.appendChild(el("p", "text-[11px] tracking-[0.2em] uppercase text-gold-700", "Jawaban analis bisnis"));
    root.appendChild(el("h3", "mt-2 font-display text-2xl sm:text-3xl leading-tight text-slate-900", data.title || "Jawaban"));
    if (data.question) root.appendChild(el("p", "mt-2 text-xs leading-relaxed text-slate-500", "Pertanyaan: " + data.question));
    const tone = data.tone === "down" ? "border-rose-200 bg-rose-50" : data.tone === "up" ? "border-teal-200 bg-teal-50" : "border-slate-200 bg-slate-50";
    root.appendChild(el("p", "mt-4 rounded-xl border px-4 py-3 text-sm font-medium leading-relaxed text-slate-800 " + tone, data.verdict || ""));
    (data.sections || []).forEach((section) => {
      const block = el("section", "mt-5");
      if (section.heading) block.appendChild(el("p", "text-[11px] tracking-[0.18em] uppercase text-teal-700", section.heading));
      if (section.lead) block.appendChild(el("p", "mt-2 text-sm leading-relaxed text-slate-700", section.lead));
      if (section.bullets && section.bullets.length) {
        const ul = el("ul", "mt-2 space-y-2");
        section.bullets.forEach((item) => {
          const li = el("li", "flex gap-2 text-sm leading-relaxed text-slate-700");
          li.appendChild(el("span", "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500"));
          li.appendChild(el("span", "", item));
          ul.appendChild(li);
        });
        block.appendChild(ul);
      }
      if (section.table && section.table.columns && section.table.columns.length) block.appendChild(renderTable(section.table));
      if (section.note) block.appendChild(el("p", "mt-2 text-xs leading-relaxed text-slate-500", section.note));
      root.appendChild(block);
    });
  }

  function showAnswer(payload) {
    answer.replaceChildren();
    if (payload && typeof payload === "object") renderPresentation(answer, payload);
    else {
      const paragraph = el("p", "text-slate-700 leading-relaxed whitespace-pre-wrap", String(payload || ""));
      answer.appendChild(paragraph);
    }
    answerCard.hidden = false;
    report.hidden = true;
    result.hidden = false;
  }

  function render(data) {
    fields.summary.textContent = data.summary || "";
    fields.trend_analysis.textContent = data.trend_analysis || "";
    fields.platform_analysis.textContent = data.platform_analysis || "";
    fields.brand_analysis.textContent = data.brand_analysis || "";
    fields.product_analysis.textContent = data.product_analysis || "";
    fillList(lists.key_findings, data.key_findings);
    fillList(lists.anomalies, data.anomalies);
    fillList(lists.possible_explanations, data.possible_explanations);
    fillList(lists.recommendations, data.recommendations);
    answerCard.hidden = true;
    report.hidden = false;
    result.hidden = false;
  }

  const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTdQlL8hFi8A-n1CiPX8YLL0KLWDlsxvoS0g2LIhc84VakDRfY7LCrsG3MHTUvCfW4lC37qlWjx28KA/pub?output=csv";

  function analystEndpoint() {
    const host = location.hostname;
    if (host === "127.0.0.1" || host === "localhost" || host.endsWith("workers.dev")) {
      return new URL("api/analyst", location.href).href;
    }
    return "";
  }

  function parseCsv(source) {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
    const input = String(source).replace(/^\uFEFF/, "");
    for (let i = 0; i < input.length; i += 1) {
      const ch = input[i];
      if (quoted) {
        if (ch === "\"") {
          if (input[i + 1] === "\"") { cell += "\""; i += 1; }
          else quoted = false;
        } else cell += ch;
      } else if (ch === "\"") quoted = true;
      else if (ch === ",") { row.push(cell); cell = ""; }
      else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
      else if (ch !== "\r") cell += ch;
    }
    if (cell.length || row.length) { row.push(cell); rows.push(row); }
    return rows.filter((item) => item.some((value) => String(value).trim() !== ""));
  }

  function sheetAmount(value) {
    let text = String(value || "").trim().replace(/Rp|IDR/gi, "").replace(/\s/g, "");
    if (!text || text === "-" || text === "—") return 0;
    if (/^\d{1,3}(\.\d{3})+$/.test(text)) text = text.replace(/\./g, "");
    else if (/^\d{1,3}(,\d{3})+$/.test(text)) text = text.replace(/,/g, "");
    else text = text.replace(/,/g, "");
    const number = Number(text);
    return Number.isFinite(number) ? number : 0;
  }

  function legacyChannel(name) {
    const text = String(name || "").toUpperCase();
    return text.includes("SHOPEE") || text.includes("TOKOPEDIA") || text.includes("TOKPED") || text.includes("SEMERU") || text.includes("ALFA GIFT") || text.includes("ALFAGIFT");
  }

  function rupiah(value) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Math.round(value || 0)).replace(/[\u00A0\u202F]/g, " ");
  }

  function ranked(rows, keyFn, limit) {
    const map = new Map();
    rows.forEach((row) => {
      const key = keyFn(row);
      if (!key || legacyChannel(key)) return;
      map.set(key, (map.get(key) || 0) + row.amount);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  }

  const MONTH_NAME = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const MONTH_TOKEN = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MEI: 5, MAY: 5, JUN: 6, JUL: 7, AGU: 8, AGS: 8, AUG: 8, SEP: 9, OKT: 10, OCT: 10, NOV: 11, DES: 12, DEC: 12 };

  function monthNumber(value) {
    const token = String(value || "").trim().replace(/\./g, "-").split(/[-\s]/)[0].toUpperCase().slice(0, 3);
    return MONTH_TOKEN[token] || 0;
  }

  async function sheetRows() {
    const response = await fetch(SHEET_CSV_URL + "&_cb=" + Date.now(), { cache: "reload" });
    if (!response.ok) throw new Error("sheet");
    const table = parseCsv(await response.text());
    const header = table[0].map((name) => String(name).trim().toUpperCase());
    const yearIndex = header.indexOf("TAHUN");
    const monthIndex = header.indexOf("BULAN");
    const platformIndex = header.indexOf("NM_PLG");
    const brandIndex = header.indexOf("MERK");
    const itemIndex = header.indexOf("NM_BRG");
    const statusIndex = header.indexOf("STAT_PO");
    const qtyIndex = header.findIndex((name) => name.includes("QTY"));
    const revenueIndex = header.findIndex((name) => name.includes("BRUTTO"));
    if ([yearIndex, platformIndex, statusIndex, revenueIndex].some((index) => index < 0)) throw new Error("sheet");
    return table.slice(1).map((line) => ({
      year: Number(line[yearIndex]),
      month: monthIndex < 0 ? 0 : monthNumber(line[monthIndex]),
      platform: String(line[platformIndex] || "").trim(),
      brand: brandIndex < 0 ? "" : String(line[brandIndex] || "").trim(),
      item: itemIndex < 0 ? "" : String(line[itemIndex] || "").trim(),
      status: String(line[statusIndex] || "").trim().toUpperCase(),
      qty: qtyIndex < 0 ? 0 : sheetAmount(line[qtyIndex]),
      amount: sheetAmount(line[revenueIndex]),
    })).filter((row) => row.status === "DIKIRIM" && row.year && !legacyChannel(row.platform));
  }

  function reportFromSheet(rows) {
    const total = rows.reduce((sum, row) => sum + row.amount, 0);
    const years = [...new Set(rows.map((row) => row.year))].sort((a, b) => a - b);
    const latestYear = years[years.length - 1];
    const yearLines = years.map((year) => {
      const value = rows.filter((row) => row.year === year).reduce((sum, row) => sum + row.amount, 0);
      return year + " " + rupiah(value);
    });
    const stores = ranked(rows, (row) => row.platform, 6);
    const brands = ranked(rows, (row) => row.brand, 3);
    const items = ranked(rows, (row) => row.item, 3);
    const lead = stores[0] || ["", 0];
    const share = total ? Math.round((lead[1] / total) * 1000) / 10 : 0;
    return {
      summary: "Analisis Evaluasi MT dihitung hanya dari Google Sheet. Total omset DIKIRIM " + rupiah(total) + ". Toko terbesar adalah " + lead[0] + " sebesar " + rupiah(lead[1]) + " (" + String(share).replace(".", ",") + "%).",
      key_findings: stores.slice(0, 3).map((item, index) => (index + 1) + ". " + item[0] + " — " + rupiah(item[1])),
      trend_analysis: "Omset DIKIRIM per tahun: " + yearLines.join("; ") + ". Data terakhir pada tahun " + latestYear + ".",
      platform_analysis: "Enam toko terbesar: " + stores.map((item) => item[0] + " " + rupiah(item[1])).join("; ") + ".",
      brand_analysis: brands.length ? "Merek terbesar: " + brands.map((item) => item[0] + " " + rupiah(item[1])).join("; ") + "." : "Data merek belum tersedia.",
      product_analysis: items.length ? "Item terbesar: " + items.map((item) => item[0] + " " + rupiah(item[1])).join("; ") + "." : "Data item belum tersedia.",
      anomalies: ["Tidak ditemukan anomali di luar data Google Sheet Evaluasi MT."],
      possible_explanations: ["Angka ini dihitung langsung dari baris berstatus DIKIRIM pada Google Sheet Evaluasi MT."],
      recommendations: lead[0] ? ["Jaga pasokan untuk " + lead[0] + " karena kontribusinya paling besar.", "Pantau toko di luar enam besar agar pertumbuhan tidak tertumpu pada satu toko."] : [],
    };
  }

  const STOP_TOKEN = new Set(["yang", "dari", "untuk", "dengan", "pada", "dalam", "adalah", "apakah", "bagaimana", "mengapa", "kenapa", "omset", "penjualan", "brutto", "tahun", "bulan", "toko", "merek", "merk", "brand", "produk", "item", "naik", "turun", "kenaikan", "penurunan", "apple", "secara", "dilihat", "mengalami", "terhadap", "dibanding", "dibandingkan", "versus", "antara", "paling", "besar", "kecil", "total", "semua", "data", "sheet", "google", "status", "dikirim", "supermarket", "hypermarket", "indonesia", "persero", "limited", "store", "group", "official", "periode", "sama"]);

  function readIntent(text) {
    const q = String(text || "").toLowerCase().replace(/[?!.,;:()"']/g, " ").replace(/\s+/g, " ").trim();
    const years = [...q.matchAll(/\b(20\d{2})\b/g)].map((match) => Number(match[1]));
    return {
      q,
      years: [...new Set(years)],
      apple: /apple\s*to\s*apple|apples\s*to\s*apples|like\s*for\s*like|apel\s*ke\s*apel|periode yang sama|head\s*to\s*head|\byoy\b|year on year|year-on-year/.test(q),
      compare: /banding|dibanding|versus|\bvs\b|komparasi|perbandingan/.test(q),
      growth: /naik|kenaikan|turun|penurunan|tumbuh|pertumbuhan|meningkat|anjlok|merosot|drop|stabil/.test(q),
      why: /mengapa|kenapa|penyebab|karena apa|apa sebab|apa yang membuat/.test(q),
      store: /toko|pelanggan|outlet|platform|kanal|customer/.test(q),
      brand: /merek|merk|brand/.test(q),
      product: /produk|item|sku|barang/.test(q),
      month: /bulanan|\bbulan\b|mom|musiman|musim/.test(q),
    };
  }

  function askedMonths(q) {
    if (/kuartal\s*1|\bq1\b|triwulan\s*1/.test(q)) return [1, 2, 3];
    if (/kuartal\s*2|\bq2\b|triwulan\s*2/.test(q)) return [4, 5, 6];
    if (/kuartal\s*3|\bq3\b|triwulan\s*3/.test(q)) return [7, 8, 9];
    if (/kuartal\s*4|\bq4\b|triwulan\s*4/.test(q)) return [10, 11, 12];
    if (/semester\s*1|\bh1\b|paruh pertama/.test(q)) return [1, 2, 3, 4, 5, 6];
    if (/semester\s*2|\bh2\b|paruh kedua/.test(q)) return [7, 8, 9, 10, 11, 12];
    return null;
  }

  function distinctiveTokens(name) {
    return String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ").filter((word) => word.length >= 4 && !STOP_TOKEN.has(word));
  }

  function mentionIndex(q, name) {
    let index = q.length + 1;
    distinctiveTokens(name).forEach((token) => {
      const found = q.indexOf(token);
      if (found >= 0 && found < index) index = found;
    });
    return index;
  }

  function includesToken(q, token) {
    return new RegExp("(^|[^a-z0-9])" + token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z0-9]|$)").test(q);
  }

  function matchNames(rows, q, keyFn, minScore, keepMany) {
    const totals = new Map();
    rows.forEach((row) => {
      const name = keyFn(row);
      if (!name) return;
      totals.set(name, (totals.get(name) || 0) + row.amount);
    });
    const hits = [];
    totals.forEach((amount, name) => {
      const matched = distinctiveTokens(name).filter((token) => includesToken(q, token));
      if (!matched.length) return;
      const score = matched.reduce((sum, token) => sum + token.length, 0);
      if (score < minScore) return;
      hits.push({ name, amount, score });
    });
    hits.sort((a, b) => b.score - a.score || b.amount - a.amount);
    if (!hits.length) return [];
    if (!keepMany) return [hits[0]];
    return hits.slice(0, 3);
  }

  function pickNamed(intent, stores, brands, products) {
    const groups = [];
    if (stores.length) groups.push({ kind: "platform", list: stores, score: stores[0].score + (intent.store ? 2 : 0) });
    if (brands.length) groups.push({ kind: "brand", list: brands, score: brands[0].score + (intent.brand ? 2 : 0) });
    if (products.length) groups.push({ kind: "item", list: products, score: products[0].score + (intent.product ? 2 : 0) });
    groups.sort((a, b) => b.score - a.score);
    return groups[0] || null;
  }

  function keyOf(kind) {
    if (kind === "brand") return (row) => row.brand;
    if (kind === "item") return (row) => row.item;
    return (row) => row.platform;
  }

  function nounOf(kind) {
    if (kind === "brand") return "Merek";
    if (kind === "item") return "Produk";
    return "Toko";
  }

  function growthPct(now, before) {
    if (!before) return null;
    return Math.round(((now - before) / Math.abs(before)) * 1000) / 10;
  }

  function pctLabel(value) {
    if (value == null || !Number.isFinite(value)) return "—";
    const sign = value > 0 ? "+" : "";
    return sign + value.toFixed(1).replace(".", ",") + "%";
  }

  function absPct(value) {
    if (value == null || !Number.isFinite(value)) return "—";
    return Math.abs(value).toFixed(1).replace(".", ",") + "%";
  }

  function shareText(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";
    return number.toFixed(1).replace(".", ",") + "%";
  }

  function toneOf(value) {
    if (value == null || !Number.isFinite(value) || Math.abs(value) < 0.05) return "";
    return value > 0 ? "up" : "down";
  }

  function pctCell(value) {
    return { text: pctLabel(value), tone: toneOf(value) };
  }

  function signedRupiah(value) {
    const number = Math.round(value || 0);
    if (number > 0) return "+" + rupiah(number);
    return rupiah(number);
  }

  function pcsLabel(value) {
    return new Intl.NumberFormat("id-ID").format(Math.round(value || 0)) + " pcs";
  }

  function sumAmount(list) {
    return list.reduce((sum, row) => sum + row.amount, 0);
  }

  function sumQty(list) {
    return list.reduce((sum, row) => sum + (row.qty || 0), 0);
  }

  function periodLabel(months) {
    const sorted = [...months].filter((month) => month >= 1 && month <= 12).sort((a, b) => a - b);
    if (!sorted.length) return "seluruh tahun tercatat";
    const contiguous = sorted.every((month, index) => index === 0 || month === sorted[index - 1] + 1);
    if (sorted.length === 1) return MONTH_NAME[sorted[0]];
    if (contiguous) return MONTH_NAME[sorted[0]] + "–" + MONTH_NAME[sorted[sorted.length - 1]];
    return sorted.map((month) => MONTH_NAME[month]).join(", ");
  }

  function monthsIn(rows, year) {
    return [...new Set(rows.filter((row) => row.year === year && row.month >= 1 && row.month <= 12).map((row) => row.month))].sort((a, b) => a - b);
  }

  function resolvePeriod(rows, intent) {
    const available = [...new Set(rows.map((row) => row.year).filter(Boolean))].sort((a, b) => a - b);
    const focus = intent.years.length ? Math.max(...intent.years) : available[available.length - 1];
    let base = null;
    if (intent.years.length >= 2) base = Math.min(...intent.years.filter((year) => year !== focus));
    if (base == null) base = [...available].reverse().find((year) => year < focus) || null;
    const hasMonth = rows.some((row) => row.month >= 1 && row.month <= 12);
    const monthsA = hasMonth && base ? monthsIn(rows, base) : [];
    const monthsB = hasMonth && focus ? monthsIn(rows, focus) : [];
    const requested = askedMonths(intent.q);
    let overlap = monthsA.filter((month) => monthsB.includes(month));
    if (requested) overlap = overlap.filter((month) => requested.includes(month));
    const sameSpan = monthsA.length > 0 && monthsA.length === monthsB.length && monthsA.every((month) => monthsB.includes(month));
    const apple = Boolean(intent.apple || requested || (hasMonth && base && !sameSpan));
    const months = !hasMonth ? [] : (apple || requested ? overlap : monthsB);
    return { available, focus, base, hasMonth, monthsA, monthsB, months, apple, sameSpan, requested: Boolean(requested) };
  }

  function rowsInPeriod(rows, year, period) {
    return rows.filter((row) => {
      if (row.year !== year) return false;
      if (!period.hasMonth) return true;
      if (!period.months.length) return false;
      return period.months.includes(row.month);
    });
  }

  function directionWord(delta) {
    if (delta > 0) return "naik";
    if (delta < 0) return "turun";
    return "stabil";
  }

  function toneFromDelta(delta) {
    if (delta > 0) return "up";
    if (delta < 0) return "down";
    return "flat";
  }

  function answerLead(intent, delta) {
    const askUp = /naik|kenaikan|meningkat|tumbuh|pertumbuhan/.test(intent.q);
    const askDown = /turun|penurunan|anjlok|merosot|drop/.test(intent.q);
    if (askUp && !askDown) {
      if (delta > 0) return "Ya. ";
      if (delta < 0) return "Tidak. ";
      return "Tidak ada kenaikan. ";
    }
    if (askDown && !askUp) {
      if (delta < 0) return "Ya. ";
      if (delta > 0) return "Tidak. ";
      return "Tidak ada penurunan. ";
    }
    return "";
  }

  function aggregate(rows, keyFn) {
    const map = new Map();
    rows.forEach((row) => {
      const key = keyFn(row);
      if (!key) return;
      map.set(key, (map.get(key) || 0) + row.amount);
    });
    return map;
  }

  function pickMovers(list) {
    const up = list.filter((item) => item.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, 5);
    const down = list.filter((item) => item.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 3);
    if (!up.length) return list.filter((item) => item.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 8);
    if (!down.length) return up;
    return up.concat(down);
  }

  function moverRows(source, period, keyFn) {
    if (!period.base) return [];
    const before = aggregate(rowsInPeriod(source, period.base, period), keyFn);
    const now = aggregate(rowsInPeriod(source, period.focus, period), keyFn);
    const names = new Set([...before.keys(), ...now.keys()]);
    return [...names].map((name) => {
      const oldValue = before.get(name) || 0;
      const newValue = now.get(name) || 0;
      return { name, before: oldValue, now: newValue, delta: newValue - oldValue, pct: growthPct(newValue, oldValue) };
    }).filter((item) => item.before || item.now);
  }

  function topName(rows, kind, year) {
    const scoped = year ? rows.filter((row) => row.year === year) : rows;
    const rankedNames = [...aggregate(scoped, keyOf(kind)).entries()].sort((a, b) => b[1] - a[1]);
    return rankedNames.length ? rankedNames[0][0] : "";
  }

  function slide(question, title, tone, verdict, sections) {
    return { question, title, tone, verdict, sections };
  }

  function growthPresentation(allRows, text, intent, options) {
    const opt = options || {};
    const source = opt.subject ? allRows.filter((row) => keyOf(opt.kind)(row) === opt.subject) : allRows;
    const period = resolvePeriod(allRows, intent);
    const subject = opt.subject || "Omset";
    if (!period.available.length) {
      return slide(text, "Data omset belum tersedia", "flat", "Google Sheet belum berisi baris DIKIRIM yang bisa dianalisis.", []);
    }
    if (intent.years.length && !period.available.includes(period.focus)) {
      return slide(text, "Tahun " + period.focus + " belum ada di data", "flat", "Tidak ada omset DIKIRIM tahun " + period.focus + " pada Google Sheet Evaluasi MT.", [
        { heading: "Tahun yang tersedia", bullets: [period.available.join(", ")] },
      ]);
    }
    if (!period.base) {
      const only = sumAmount(source.filter((row) => row.year === period.focus));
      return slide(text, subject + " " + period.focus, "flat", subject + " tahun " + period.focus + " tercatat " + rupiah(only) + ". Belum ada tahun pembanding sebelumnya.", [
        { heading: "Angka", bullets: ["Omset " + period.focus + ": " + rupiah(only) + "."] },
      ]);
    }
    if (period.hasMonth && !period.months.length) {
      return slide(text, "Perbandingan apple-to-apple tidak bisa dibuat", "flat", "Tidak ada bulan yang sama antara " + period.base + " dan " + period.focus + ", jadi kenaikan atau penurunan yang setara tidak bisa disimpulkan.", [
        { heading: "Bulan yang tersedia", bullets: [period.base + ": " + (periodLabel(period.monthsA) || "—") + ".", period.focus + ": " + (periodLabel(period.monthsB) || "—") + "."] },
      ]);
    }

    const beforeRows = rowsInPeriod(source, period.base, period);
    const nowRows = rowsInPeriod(source, period.focus, period);
    const before = sumAmount(beforeRows);
    const now = sumAmount(nowRows);
    const delta = now - before;
    if (opt.subject && !before && !now) {
      const byYear = [...aggregate(source, (row) => String(row.year)).entries()].sort((a, b) => Number(a[0]) - Number(b[0]));
      const recorded = byYear.length ? byYear[byYear.length - 1] : null;
      const span = period.hasMonth && period.months.length ? periodLabel(period.months) + " " : "";
      return slide(text, subject + " tidak ada pada " + period.focus, "flat", subject + " tidak memiliki omset DIKIRIM pada " + span + period.focus + (period.base ? " maupun periode yang sama di " + period.base : "") + "." + (recorded ? " Omset terakhir tercatat di " + recorded[0] + " sebesar " + rupiah(recorded[1]) + "." : ""), [
        { heading: "Omset tercatat", table: { columns: ["Tahun", "Omset"], rows: byYear.map((item) => [item[0], rupiah(item[1])]) }, note: "Tahun yang ditanyakan ada di sheet, tetapi tidak ada baris DIKIRIM untuk nama ini pada periode tersebut." },
      ]);
    }
    const pct = growthPct(now, before);
    const qtyBefore = sumQty(beforeRows);
    const qtyNow = sumQty(nowRows);
    const qtyPct = growthPct(qtyNow, qtyBefore);
    const label = period.hasMonth ? periodLabel(period.months) : "total tahun";
    const mode = period.apple && period.hasMonth ? "Secara apple-to-apple (" + label + ")" : "Pada " + label;
    const word = directionWord(delta);
    const asksAmount = /berapa|sebesar apa|nominal/.test(intent.q) && !intent.growth && !intent.apple && !intent.compare;
    let verdict = asksAmount ? "" : answerLead(intent, delta);
    if (asksAmount) {
      verdict = subject + " tahun " + period.focus + " tercatat " + rupiah(now) + ".";
      if (before) verdict += " " + mode + ", angka ini " + word + (pct == null ? "" : " " + absPct(pct)) + " dibanding " + period.base + " (" + rupiah(before) + ").";
    } else if (!before && now) {
      verdict += mode + ", " + subject + " tahun " + period.focus + " tercatat " + rupiah(now) + ". Periode yang sama di " + period.base + " belum memiliki omset, jadi ini penjualan baru pada cakupan tersebut.";
    } else {
      verdict += mode + ", " + subject + " tahun " + period.focus + " " + word + (pct == null ? "" : " " + absPct(pct)) + " dibanding " + period.base + ": " + rupiah(before) + " menjadi " + rupiah(now) + " (selisih " + signedRupiah(delta) + ").";
    }

    const fullBefore = sumAmount(source.filter((row) => row.year === period.base));
    const fullNow = sumAmount(source.filter((row) => row.year === period.focus));
    const fullDelta = fullNow - fullBefore;
    const fullPct = growthPct(fullNow, fullBefore);
    const differentCoverage = period.hasMonth && (period.monthsA.length !== period.months.length || period.monthsB.length !== period.months.length);
    if (differentCoverage && fullDelta && delta && Math.sign(fullDelta) !== Math.sign(delta)) {
      verdict += " Total tahun tercatat justru " + directionWord(fullDelta) + " " + absPct(fullPct) + " (" + signedRupiah(fullDelta) + "), tetapi cakupan bulannya tidak sama sehingga angka itu tidak dipakai sebagai kesimpulan.";
    }
    const companyNow = sumAmount(rowsInPeriod(allRows, period.focus, period));
    const share = opt.subject && companyNow ? Math.round((now / companyNow) * 1000) / 10 : null;
    const bullets = [
      "Periode pembanding: " + label + " " + period.base + " terhadap " + label + " " + period.focus + ".",
      "Omset " + period.base + ": " + rupiah(before) + ".",
      "Omset " + period.focus + ": " + rupiah(now) + ".",
      "Selisih: " + signedRupiah(delta) + " (" + pctLabel(pct) + ").",
    ];
    if (qtyBefore || qtyNow) {
      bullets.push("Volume: " + pcsLabel(qtyBefore) + " menjadi " + pcsLabel(qtyNow) + " (" + pctLabel(qtyPct) + ").");
      if (qtyBefore && qtyNow) {
        bullets.push("Nilai rata-rata per pcs: " + rupiah(before / qtyBefore) + " menjadi " + rupiah(now / qtyNow) + ".");
      }
    }
    if (share != null) bullets.push("Porsi terhadap seluruh omset pada periode yang sama: " + shareText(share) + ".");

    const sections = [];
    if (opt.preface) sections.push({ heading: "Cakupan jawaban", bullets: [opt.preface] });
    sections.push({ heading: "Angka kunci", bullets });

    if (differentCoverage) {
      const missing = period.monthsA.filter((month) => !period.monthsB.includes(month));
      sections.push({
        heading: "Setara dan tidak setara",
        lead: "Kesimpulan memakai bulan yang sama. Total tahun penuh tidak dipakai karena cakupan bulannya berbeda.",
        table: {
          columns: ["Pembanding", String(period.base), String(period.focus), "Selisih", "Perubahan"],
          rows: [
            { cells: ["Apple-to-apple (" + label + ")", rupiah(before), rupiah(now), { text: signedRupiah(delta), tone: toneOf(delta) }, pctCell(pct)], emphasis: true },
            ["Total tahun tercatat", rupiah(fullBefore), rupiah(fullNow), { text: signedRupiah(fullDelta), tone: toneOf(fullDelta) }, pctCell(fullPct)],
          ],
        },
        note: missing.length ? "Bulan yang tidak ikut dibanding: " + periodLabel(missing) + " " + period.base + ". Bulan itu belum ada di " + period.focus + "." : "",
      });
    }

    if (period.hasMonth && period.months.length) {
      const monthRows = period.months.map((month) => {
        const oldValue = sumAmount(source.filter((row) => row.year === period.base && row.month === month));
        const newValue = sumAmount(source.filter((row) => row.year === period.focus && row.month === month));
        const monthDelta = newValue - oldValue;
        return [MONTH_NAME[month], rupiah(oldValue), rupiah(newValue), { text: signedRupiah(monthDelta), tone: toneOf(monthDelta) }, pctCell(growthPct(newValue, oldValue))];
      });
      monthRows.push({ cells: ["Total periode", rupiah(before), rupiah(now), { text: signedRupiah(delta), tone: toneOf(delta) }, pctCell(pct)], emphasis: true });
      sections.push({
        heading: "Rincian bulan yang sama",
        table: { columns: ["Bulan", String(period.base), String(period.focus), "Selisih", "Perubahan"], rows: monthRows },
      });
    }

    const driverKind = opt.kind === "platform" ? "brand" : opt.kind === "brand" || opt.kind === "item" ? "platform" : "platform";
    const movers = pickMovers(moverRows(source, period, keyOf(driverKind)));
    if (movers.length) {
      sections.push({
        heading: nounOf(driverKind) + " yang menggerakkan perubahan",
        lead: "Diurutkan dari kenaikan terbesar, lalu penurunan yang paling menahan hasil.",
        table: {
          columns: [nounOf(driverKind), String(period.base), String(period.focus), "Selisih", "Perubahan"],
          rows: movers.map((item) => [item.name, rupiah(item.before), rupiah(item.now), { text: signedRupiah(item.delta), tone: toneOf(item.delta) }, pctCell(item.pct)]),
        },
      });
    }

    const reading = [];
    if (differentCoverage && fullDelta && delta && Math.sign(fullDelta) !== Math.sign(delta)) {
      reading.push("Total tahun tercatat memberi arah yang berbeda dari apple-to-apple. Yang dipakai untuk menjawab adalah bulan yang sama, bukan total tahun.");
    }
    if (movers[0]) reading.push(movers[0].name + " memberi selisih " + signedRupiah(movers[0].delta) + " pada periode yang sama.");
    const upTotal = movers.filter((item) => item.delta > 0).reduce((sum, item) => sum + item.delta, 0);
    const topUp = movers.find((item) => item.delta > 0);
    if (topUp && upTotal) {
      const role = Math.round((topUp.delta / upTotal) * 1000) / 10;
      reading.push(topUp.name + " menyumbang " + shareText(role) + " dari kenaikan bruto yang tampil pada tabel.");
    }
    if (pct != null && qtyPct != null && qtyBefore && qtyNow) {
      if (pct > 0 && qtyPct < 0) reading.push("Omset naik sementara volume turun. Kenaikan lebih condong ke harga atau campuran produk, bukan ke jumlah barang.");
      else if (pct < 0 && qtyPct > 0) reading.push("Volume naik tetapi omset turun. Nilai per barang lebih rendah dibanding periode pembanding.");
      else if (pct > 0 && qtyPct > 0) reading.push("Kenaikan omset sejalan dengan kenaikan volume.");
      else if (pct < 0 && qtyPct < 0) reading.push("Omset dan volume sama-sama turun.");
    }
    const down = movers.find((item) => item.delta < 0);
    if (topUp && down) reading.push("Perubahan tidak merata: ada yang tumbuh dan ada yang turun pada periode yang sama.");
    if (reading.length) sections.push({ heading: "Bacaan bisnis", bullets: reading });

    const actions = [];
    if (delta > 0 && topUp) actions.push("Jaga pasokan dan kelangsungan order di " + topUp.name + " karena kontribusinya paling mengangkat omset pada periode yang sama.");
    if (down) actions.push("Tinjau " + down.name + " terpisah. Penurunannya menahan hasil perbandingan.");
    if (differentCoverage) actions.push("Nilai kenaikan dari bulan yang sama. Jangan menyimpulkan dari total " + period.base + " terhadap total " + period.focus + " sebelum kedua tahun punya cakupan bulan yang sama.");
    else if (delta < 0 && topUp) actions.push("Pertahankan " + topUp.name + " yang masih tumbuh agar penurunan tidak melebar.");
    if (actions.length) sections.push({ heading: "Yang perlu ditindaklanjuti", bullets: actions.slice(0, 3) });
    if (intent.why) {
      sections.push({
        heading: "Batas penyebab",
        bullets: [
          "Sheet menjelaskan siapa yang berubah dan berapa nilainya.",
          "Promo, harga putus, stok kosong, dan jumlah listing tidak tercatat, jadi penyebab di luar angka tetap hipotesis.",
        ],
      });
    }
    sections.push({ heading: "Sumber angka", note: "BRUTTO pesanan berstatus DIKIRIM pada Google Sheet Evaluasi MT. Angka tidak dibulatkan ke miliar supaya selisihnya bisa dicek." });
    return slide(text, subject + " " + period.focus + " " + word + (pct == null ? "" : " " + absPct(pct)) + " dibanding " + period.base, toneFromDelta(delta), verdict, sections);
  }

  function compareNamed(allRows, text, intent, named) {
    const period = resolvePeriod(allRows, intent);
    const names = named.list.map((item) => item.name).sort((a, b) => mentionIndex(intent.q, a) - mentionIndex(intent.q, b));
    const label = period.hasMonth && period.months.length ? periodLabel(period.months) : "total tahun";
    if (period.hasMonth && period.base && !period.months.length) {
      return growthPresentation(allRows, text, intent, { subject: names[0], kind: named.kind });
    }
    const metrics = names.map((name) => {
      const scoped = allRows.filter((row) => keyOf(named.kind)(row) === name);
      const before = period.base ? sumAmount(rowsInPeriod(scoped, period.base, period)) : 0;
      const now = sumAmount(rowsInPeriod(scoped, period.focus, period));
      return { name, before, now, delta: now - before, pct: period.base ? growthPct(now, before) : null };
    });
    const company = sumAmount(rowsInPeriod(allRows, period.focus, period)) || 1;
    const leader = [...metrics].sort((a, b) => b.now - a.now)[0];
    const growing = period.base ? metrics.filter((item) => item.pct != null && item.pct > 0).sort((a, b) => b.pct - a.pct) : [];
    let verdict = "Pada " + label + " " + period.focus + ", " + leader.name + " paling besar dengan omset " + rupiah(leader.now) + ".";
    if (growing.length) verdict += " Kenaikan tertinggi pada periode yang sama ada di " + growing[0].name + " (" + pctLabel(growing[0].pct) + ").";
    const absent = metrics.filter((item) => !item.now).map((item) => item.name);
    if (absent.length) verdict += " " + absent.join(" dan ") + " tidak memiliki omset DIKIRIM pada periode " + period.focus + ".";
    const header = ["Metrik"].concat(names);
    const row = (labelText, pick, tonePick) => {
      const cells = [labelText];
      metrics.forEach((item) => {
        const value = pick(item);
        cells.push(tonePick ? { text: value, tone: tonePick(item) } : value);
      });
      return cells;
    };
    const tableRows = [
      row("Omset " + period.focus, (item) => rupiah(item.now)),
      row("Porsi " + period.focus, (item) => shareText(Math.round((item.now / company) * 1000) / 10)),
    ];
    if (period.base) {
      tableRows.unshift(row("Omset " + period.base, (item) => rupiah(item.before)));
      tableRows.push(row("Selisih", (item) => signedRupiah(item.delta), (item) => toneOf(item.delta)));
      tableRows.push(row("Perubahan", (item) => pctLabel(item.pct), (item) => toneOf(item.pct)));
    }
    const bullets = metrics.map((item) => item.name + ": " + rupiah(item.now) + (item.pct == null ? "" : " (" + pctLabel(item.pct) + " terhadap " + period.base + ")") + ".");
    return slide(text, "Perbandingan " + names.join(" dan "), "flat", verdict, [
      { heading: "Jawaban langsung", lead: period.apple && period.hasMonth ? "Angka di bawah sudah disejajarkan pada " + label + "." : "Pembanding mengikuti " + label + " " + period.focus + ".", bullets },
      { heading: "Kolom perbandingan", table: { columns: header, rows: tableRows } },
      { heading: "Sumber angka", note: "BRUTTO pesanan berstatus DIKIRIM pada Google Sheet Evaluasi MT." },
    ]);
  }

  function rankingPresentation(rows, text, intent, kind) {
    const year = intent.years.length ? intent.years[intent.years.length - 1] : null;
    const source = year ? rows.filter((row) => row.year === year) : rows;
    const noun = nounOf(kind);
    const ascending = /terkecil|paling kecil|terendah/.test(intent.q);
    const totals = [...aggregate(source, keyOf(kind)).entries()].sort((a, b) => ascending ? a[1] - b[1] : b[1] - a[1]);
    const total = totals.reduce((sum, item) => sum + item[1], 0) || 1;
    const top = totals.slice(0, 8);
    if (!top.length) return slide(text, noun + " belum tersedia", "flat", "Tidak ada omset DIKIRIM untuk pemeringkatan ini.", []);
    const leaderShare = Math.round((top[0][1] / total) * 1000) / 10;
    const rankWord = ascending ? "terkecil" : "terbesar";
    const scope = year ? "tahun " + year : "seluruh tahun di Google Sheet";
    let running = 0;
    const tableRows = top.map((item, index) => {
      running += item[1];
      const share = Math.round((item[1] / total) * 1000) / 10;
      const cumulative = Math.round((running / total) * 1000) / 10;
      return [String(index + 1), item[0], rupiah(item[1]), shareText(share), shareText(cumulative)];
    });
    const top3 = top.slice(0, 3).reduce((sum, item) => sum + item[1], 0);
    const top3Share = Math.round((top3 / total) * 1000) / 10;
    const bullets = [
      top[0][0] + " adalah yang " + rankWord + " dengan " + rupiah(top[0][1]) + " (" + shareText(leaderShare) + ").",
      "Tiga " + rankWord + " menguasai " + shareText(top3Share) + " dari omset pada cakupan ini.",
    ];
    if (!ascending && leaderShare >= 40) bullets.push("Ketergantungan ke " + top[0][0] + " tinggi. Penurunan di satu nama ini langsung terlihat di omset total.");
    return slide(
      text,
      noun + " " + rankWord + ": " + top[0][0],
      "flat",
      noun + " dengan omset " + rankWord + " pada " + scope + " adalah " + top[0][0] + ", sebesar " + rupiah(top[0][1]) + " atau " + shareText(leaderShare) + " dari total.",
      [
        { heading: "Jawaban langsung", bullets },
        { heading: "Peringkat", table: { columns: ["No", noun, "Omset", "Porsi", "Kumulatif"], rows: tableRows }, note: "Cakupan: " + scope + ". Status DIKIRIM." },
      ]
    );
  }

  function monthPresentation(rows, text) {
    const map = new Map();
    rows.forEach((row) => {
      if (!row.month) return;
      const key = row.year * 12 + row.month;
      const current = map.get(key) || { year: row.year, month: row.month, amount: 0, qty: 0 };
      current.amount += row.amount;
      current.qty += row.qty || 0;
      map.set(key, current);
    });
    const series = [...map.values()].sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month)).slice(-8);
    if (!series.length) return slide(text, "Tren bulan belum tersedia", "flat", "Kolom bulan belum bisa dibaca dari Google Sheet.", []);
    const last = series[series.length - 1];
    const prev = series.length > 1 ? series[series.length - 2] : null;
    const delta = prev ? last.amount - prev.amount : 0;
    const pct = prev ? growthPct(last.amount, prev.amount) : null;
    const rowsOut = series.map((item, index) => {
      const earlier = index ? series[index - 1] : null;
      const change = earlier ? growthPct(item.amount, earlier.amount) : null;
      return [MONTH_NAME[item.month] + " " + item.year, rupiah(item.amount), pcsLabel(item.qty), pctCell(change)];
    });
    const verdict = prev
      ? MONTH_NAME[last.month] + " " + last.year + " tercatat " + rupiah(last.amount) + ", " + directionWord(delta) + (pct == null ? "" : " " + absPct(pct)) + " dari " + MONTH_NAME[prev.month] + " " + prev.year + "."
      : MONTH_NAME[last.month] + " " + last.year + " tercatat " + rupiah(last.amount) + ".";
    return slide(text, "Tren bulan terakhir", toneFromDelta(delta), verdict, [
      { heading: "Delapan bulan terakhir", table: { columns: ["Bulan", "Omset", "Volume", "Vs bulan sebelumnya"], rows: rowsOut } },
      { heading: "Sumber angka", note: "BRUTTO pesanan berstatus DIKIRIM. Perubahan dihitung dari bulan sebelumnya yang tampil di tabel." },
    ]);
  }

  function fallbackPresentation(rows, text, intent) {
    const business = /omset|jual|brutto|qty|volume|barang|pelanggan|kinerja|evaluasi|bisnis|revenue|sales|naik|turun|toko|merek|produk/.test(intent.q);
    if (!business) {
      return slide(text, "Di luar data Evaluasi MT", "flat", "Pertanyaan ini tidak bisa dijawab dari angka penjualan yang tersedia.", [
        {
          heading: "Yang bisa ditanyakan",
          bullets: [
            "Analis membaca omset DIKIRIM: toko, merek, produk, bulan, dan tahun.",
            "Contoh yang langsung terjawab: perbandingan apple-to-apple 2025 dan 2026, kinerja satu toko, atau merek terbesar.",
          ],
        },
      ]);
    }
    return growthPresentation(rows, text, {
      q: intent.q + " apple to apple",
      years: [],
      apple: true,
      compare: true,
      growth: true,
      why: false,
      store: false,
      brand: false,
      product: false,
      month: false,
    }, {
      preface: "Pertanyaan belum menunjuk tahun atau nama tertentu. Yang dibanding adalah tahun terakhir terhadap tahun sebelumnya pada bulan yang sama.",
    });
  }

  function answerFromSheet(rows, text) {
    const intent = readIntent(text);
    const keepMany = /banding|dibanding|\bvs\b|versus|\bantara\b|\bdan\b/.test(intent.q);
    const stores = matchNames(rows, intent.q, (row) => row.platform, 4, keepMany);
    const brands = matchNames(rows, intent.q, (row) => row.brand, 5, keepMany);
    const products = matchNames(rows, intent.q, (row) => row.item, 8, keepMany);
    const named = pickNamed(intent, stores, brands, products);
    const asksWhich = /\bmana\b|\bsiapa\b|apa yang|merek apa|toko apa|produk apa|item apa|peringkat/.test(intent.q);
    const asksRank = /terbesar|paling besar|dominan|terkecil|paling kecil|terendah/.test(intent.q);
    if (named && named.list.length >= 2 && keepMany) return compareNamed(rows, text, intent, named);
    if (asksRank && (asksWhich || (!intent.growth && !intent.why && !intent.apple))) {
      const kind = intent.product ? "item" : intent.brand ? "brand" : "platform";
      return rankingPresentation(rows, text, intent, kind);
    }
    if (!named && asksRank && (intent.growth || intent.apple || intent.compare)) {
      const kind = intent.brand ? "brand" : intent.product ? "item" : "platform";
      const name = topName(rows, kind, null);
      if (name) return growthPresentation(rows, text, intent, { subject: name, kind });
    }
    if (named && named.list.length === 1) return growthPresentation(rows, text, intent, { subject: named.list[0].name, kind: named.kind });
    if (intent.years.length || intent.apple || intent.compare || intent.growth || intent.why) return growthPresentation(rows, text, intent, {});
    if (asksRank || /kontribusi|porsi/.test(intent.q)) {
      const kind = intent.product ? "item" : intent.brand ? "brand" : "platform";
      return rankingPresentation(rows, text, intent, kind);
    }
    if (intent.month) return monthPresentation(rows, text);
    if (intent.brand) return rankingPresentation(rows, text, intent, "brand");
    if (intent.product) return rankingPresentation(rows, text, intent, "item");
    if (intent.store) return rankingPresentation(rows, text, intent, "platform");
    return fallbackPresentation(rows, text, intent);
  }

  async function run(text, full) {
    setBusy(true);
    result.hidden = true;
    const preset = full ? "" : exclusiveAnswer(text);
    if (preset) {
      status.textContent = "";
      showAnswer(preset);
      analyze.disabled = false;
      ask.disabled = false;
      question.disabled = false;
      return;
    }
    const endpoint = analystEndpoint();
    if (!endpoint) {
      try {
        const rows = await sheetRows();
        status.textContent = "";
        if (full) render(reportFromSheet(rows));
        else showAnswer(answerFromSheet(rows, text));
      } catch (error) {
        console.error("AI Analyst gagal", error);
        status.textContent = "AI Analyst sedang tidak dapat digunakan. Silakan coba lagi.";
      } finally {
        analyze.disabled = false;
        ask.disabled = false;
        question.disabled = false;
      }
      return;
    }
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: text, full: Boolean(full) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.error) {
        console.error("AI Analyst gagal", response.status, data && data.error ? data.error : data);
        status.textContent = "AI Analyst sedang tidak dapat digunakan. Silakan coba lagi.";
        return;
      }
      status.textContent = "";
      if (!full && data.answer) showAnswer(data.answer);
      else render(data);
    } catch (error) {
      console.error("AI Analyst gagal", error);
      status.textContent = "AI Analyst sedang tidak dapat digunakan. Silakan coba lagi.";
    } finally {
      analyze.disabled = false;
      ask.disabled = false;
      question.disabled = false;
    }
  }

  analyze.addEventListener("click", () => {
    run("Buat analisis eksekutif Evaluasi MT hanya dari KPI Google Sheet yang tersedia. Jangan menganalisis sebagai e-commerce.", true);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = question.value.trim();
    if (!text) return;
    run(text, false);
  });
})();
