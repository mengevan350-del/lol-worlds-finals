document.addEventListener("DOMContentLoaded", () => {
  const cardGrid = document.getElementById("card-grid");
  const filterBar = document.getElementById("filter-bar");
  const noteViewer = document.getElementById("note-viewer");
  const noteMeta = document.getElementById("note-meta");
  const noteContent = document.getElementById("note-content");
  const backBtn = document.getElementById("back-btn");
  const themeToggle = document.getElementById("theme-toggle");

  let allNotes = [];
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  fetch("./data/notes.json")
    .then(res => res.json())
    .then(data => {
      allNotes = data;
      renderFilters(allNotes);
      renderCards(allNotes);
    })
    .catch(err => {
      cardGrid.innerHTML = `<p>無法載入筆記索引：${err.message}</p>`;
    });

  function renderFilters(notes) {
    const categories = [...new Set(notes.map(n => n.category))];
    categories.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = "filter-btn";
      btn.dataset.category = cat;
      btn.textContent = cat;
      filterBar.appendChild(btn);
    });

    filterBar.addEventListener("click", (e) => {
      if (!e.target.classList.contains("filter-btn")) return;
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      const selected = e.target.dataset.category;
      const filtered = selected === "all" ? allNotes : allNotes.filter(n => n.category === selected);
      renderCards(filtered);
    });
  }

  function renderCards(notes) {
    cardGrid.innerHTML = notes.map(note => `
      <div class="note-card" data-file="${note.filename}">
        <div class="card-meta">${note.date} · ${note.category}</div>
        <h3 class="card-title">${note.title}</h3>
        <p class="card-summary">${note.summary}</p>
        <div class="tag-list">
          ${note.tags.map(t => `<span class="tag">#${t}</span>`).join("")}
        </div>
      </div>
    `).join("");

    document.querySelectorAll(".note-card").forEach(card => {
      card.addEventListener("click", () => openNote(card.dataset.file));
    });
  }

  function openNote(filename) {
    const noteInfo = allNotes.find(n => n.filename === filename);
    fetch(`./notes/${filename}`)
      .then(res => res.text())
      .then(mdText => {
        const cleanedMd = mdText.replace(/^---[\s\S]*?---\n*/, "");
        noteMeta.innerHTML = `<strong>${noteInfo.title}</strong> ｜ 日期：${noteInfo.date} ｜ 分類：${noteInfo.category}`;
        noteContent.innerHTML = window.marked ? marked.parse(cleanedMd) : `<pre>${cleanedMd}</pre>`;
        cardGrid.classList.add("hidden");
        filterBar.classList.add("hidden");
        noteViewer.classList.remove("hidden");
        window.scrollTo(0, 0);
      });
  }

  backBtn.addEventListener("click", () => {
    noteViewer.classList.add("hidden");
    cardGrid.classList.remove("hidden");
    filterBar.classList.remove("hidden");
  });
});
