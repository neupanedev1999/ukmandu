function esc(str){
  return String(str ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

function when(iso){
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function badgeDate(iso){
  const d = new Date(iso);
  const day = d.toLocaleString("en-GB", { timeZone:"Europe/London", day:"2-digit" });
  const mon = d.toLocaleString("en-GB", { timeZone:"Europe/London", month:"short" });
  return `${day} ${mon}`;
}

function isUpcoming(iso){
  return new Date(iso).getTime() >= Date.now();
}

const listEl = document.getElementById("events-list");
const searchEl = document.getElementById("search");
const cityEl = document.getElementById("city");
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

let allEvents = [];

function render(){
  if (!listEl) return;

  const q = (searchEl?.value || "").toLowerCase().trim();
  const city = cityEl?.value || "";

  let filtered = allEvents
    .filter(e => isUpcoming(e.date))
    .filter(e => {
      const hay = `${e.title || ""} ${e.city || ""} ${e.venue || ""}`.toLowerCase();
      return (!q || hay.includes(q)) && (!city || e.city === city);
    });

  filtered.sort((a,b)=> new Date(a.date) - new Date(b.date));

  listEl.innerHTML = filtered.map(e => `
    <div class="card" id="${esc(e.slug)}">
      ${e.image ? `<img class="event-img" src="${esc(e.image)}" alt="${esc(e.title)}" loading="lazy">` : ""}

      <div class="badges">
        <span class="badge">${esc(badgeDate(e.date))}</span>
        <span class="pill">${esc(e.city || "")}</span>
      </div>

      <h3>${esc(e.title)}</h3>
      <div class="meta">${esc(when(e.date))}</div>
      <div class="meta">${esc(e.venue || "")}</div>

      <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap;">
        <a class="btn ghost" href="event.html?slug=${encodeURIComponent(e.slug)}">View details</a>
        ${e.ticketUrl ? `<a class="btn primary" target="_blank" rel="noreferrer" href="${esc(e.ticketUrl)}">Buy tickets</a>` : ""}
      </div>
    </div>
  `).join("");
}

async function init(){
  try {
    const res = await fetch("data/events.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`events.json fetch failed: ${res.status}`);
    allEvents = await res.json();

    if (cityEl) {
      const cities = [...new Set(allEvents.filter(e => isUpcoming(e.date)).map(e => e.city).filter(Boolean))].sort();
      cityEl.innerHTML =
        `<option value="">All cities</option>` +
        cities.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
    }

    searchEl?.addEventListener("input", render);
    cityEl?.addEventListener("change", render);

    render();
  } catch (err) {
    console.error(err);
    if (listEl) {
      listEl.innerHTML = `
        <div class="card">
          <h3>Events failed to load</h3>
          <div class="meta">${esc(err.message)}</div>
        </div>
      `;
    }
  }
}

init();
