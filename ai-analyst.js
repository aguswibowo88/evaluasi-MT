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

  function showAnswer(text) {
    answer.textContent = text;
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
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Math.round(value || 0));
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

  async function sheetRows() {
    const response = await fetch(SHEET_CSV_URL + "&_cb=" + Date.now(), { cache: "reload" });
    if (!response.ok) throw new Error("sheet");
    const table = parseCsv(await response.text());
    const header = table[0].map((name) => String(name).trim().toUpperCase());
    const yearIndex = header.indexOf("TAHUN");
    const platformIndex = header.indexOf("NM_PLG");
    const brandIndex = header.indexOf("MERK");
    const itemIndex = header.indexOf("NM_BRG");
    const statusIndex = header.indexOf("STAT_PO");
    const revenueIndex = header.findIndex((name) => name.includes("BRUTTO"));
    if ([yearIndex, platformIndex, statusIndex, revenueIndex].some((index) => index < 0)) throw new Error("sheet");
    return table.slice(1).map((line) => ({
      year: Number(line[yearIndex]),
      platform: String(line[platformIndex] || "").trim(),
      brand: brandIndex < 0 ? "" : String(line[brandIndex] || "").trim(),
      item: itemIndex < 0 ? "" : String(line[itemIndex] || "").trim(),
      status: String(line[statusIndex] || "").trim().toUpperCase(),
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

  function answerFromSheet(rows, text) {
    const query = text.toLowerCase();
    const names = ranked(rows, (row) => row.platform, 100);
    const hit = names.find((item) => query.includes(item[0].toLowerCase()));
    if (hit) return "Omset DIKIRIM " + hit[0] + " pada Google Sheet Evaluasi MT adalah " + rupiah(hit[1]) + ".";
    const report = reportFromSheet(rows);
    return report.summary + " " + report.platform_analysis;
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
