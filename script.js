/* script.js - interaksi untuk website portofolio sederhana */
(function () {
  "use strict";

  /* ---------- Penyimpanan aman (bisa gagal di mode privat) ---------- */
  function simpan(kunci, nilai) {
    try {
      localStorage.setItem(kunci, nilai);
    } catch (e) {
      /* abaikan */
    }
  }

  function ambil(kunci) {
    try {
      return localStorage.getItem(kunci);
    } catch (e) {
      return null;
    }
  }

  /* ---------- 1. Menu untuk ponsel ---------- */
  var menuToggle = document.getElementById("menuToggle");
  var nav = document.getElementById("mainNav");

  function tutupMenu() {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  menuToggle.addEventListener("click", function () {
    var terbuka = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", terbuka ? "true" : "false");
  });

  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      tutupMenu();
    }
  });

  /* ---------- 2. Mode gelap / terang ---------- */
  var root = document.documentElement;
  var tombolTema = document.getElementById("themeToggle");

  function aturTema(tema) {
    if (tema === "dark") {
      root.setAttribute("data-theme", "dark");
      tombolTema.textContent = "Mode Terang";
    } else {
      root.removeAttribute("data-theme");
      tombolTema.textContent = "Mode Gelap";
    }
  }

  var temaTersimpan = ambil("tema");
  if (temaTersimpan) {
    aturTema(temaTersimpan);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    aturTema("dark");
  }

  tombolTema.addEventListener("click", function () {
    var baru = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    aturTema(baru);
    simpan("tema", baru);
  });

  /* ---------- 3. Teks mengetik bergantian ---------- */
  var elTyping = document.getElementById("typing");
  var kalimat = ["Guru Informatika", "pembuat website", "calon programmer"];
  var iKalimat = 0;
  var iHuruf = 0;
  var menghapus = false;
  var kurangiGerak = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ketik() {
    var teks = kalimat[iKalimat];
    if (!menghapus) {
      iHuruf++;
      elTyping.textContent = teks.slice(0, iHuruf);
      if (iHuruf === teks.length) {
        menghapus = true;
        setTimeout(ketik, 1500);
        return;
      }
    } else {
      iHuruf--;
      elTyping.textContent = teks.slice(0, iHuruf);
      if (iHuruf === 0) {
        menghapus = false;
        iKalimat = (iKalimat + 1) % kalimat.length;
      }
    }
    setTimeout(ketik, menghapus ? 40 : 90);
  }

  if (!kurangiGerak) {
    elTyping.textContent = "";
    ketik();
  }

  /* ---------- 4. Angka statistik naik, bar keterampilan terisi ---------- */
  function hitungNaik(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (kurangiGerak || isNaN(target)) {
      el.textContent = target;
      return;
    }
    var mulai = null;
    var durasi = 1000;
    function langkah(waktu) {
      if (mulai === null) { mulai = waktu; }
      var p = Math.min((waktu - mulai) / durasi, 1);
      el.textContent = Math.round(p * target);
      if (p < 1) { requestAnimationFrame(langkah); }
    }
    requestAnimationFrame(langkah);
  }

  function isiBar(el) {
    el.style.width = el.getAttribute("data-level") + "%";
  }

  var angka = document.querySelectorAll("[data-count]");
  var bar = document.querySelectorAll(".bar-fill");

  if ("IntersectionObserver" in window) {
    var pengamat = new IntersectionObserver(function (daftar, obs) {
      daftar.forEach(function (item) {
        if (!item.isIntersecting) { return; }
        var el = item.target;
        if (el.hasAttribute("data-count")) { hitungNaik(el); }
        if (el.classList.contains("bar-fill")) { isiBar(el); }
        obs.unobserve(el);
      });
    }, { threshold: 0.4 });

    angka.forEach(function (el) { pengamat.observe(el); });
    bar.forEach(function (el) { pengamat.observe(el); });
  } else {
    angka.forEach(hitungNaik);
    bar.forEach(isiBar);
  }

  /* ---------- 5. Filter proyek ---------- */
  var tombolFilter = document.querySelectorAll(".filter");
  var kartu = document.querySelectorAll("#projectList .card");
  var pesanKosong = document.getElementById("emptyMessage");

  tombolFilter.forEach(function (tombol) {
    tombol.addEventListener("click", function () {
      var kategori = tombol.getAttribute("data-filter");
      var tampil = 0;

      tombolFilter.forEach(function (t) { t.classList.remove("active"); });
      tombol.classList.add("active");

      kartu.forEach(function (k) {
        var cocok = kategori === "semua" || k.getAttribute("data-category") === kategori;
        k.hidden = !cocok;
        if (cocok) { tampil++; }
      });

      pesanKosong.hidden = tampil !== 0;
    });
  });

  /* ---------- 6. Validasi formulir (hanya contoh, tidak mengirim data) ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nama = form.elements["nama"];
    var pesan = form.elements["pesan"];
    var valid = true;

    [nama, pesan].forEach(function (f) {
      var kosong = f.value.trim() === "";
      f.classList.toggle("error", kosong);
      if (kosong) { valid = false; }
    });

    if (!valid) {
      status.className = "form-status bad";
      status.textContent = "Mohon isi nama dan pesan.";
      return;
    }

    status.className = "form-status ok";
    status.textContent = "Terima kasih, " + nama.value.trim() +
      "! (Ini hanya contoh; pesan tidak dikirim.)";
    form.reset();
  });

  /* ---------- 7. Tombol kembali ke atas ---------- */
  var tombolAtas = document.getElementById("toTop");

  window.addEventListener("scroll", function () {
    tombolAtas.hidden = window.scrollY < 400;
  });

  tombolAtas.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: kurangiGerak ? "auto" : "smooth" });
  });

  /* ---------- 8. Tahun otomatis di footer ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
