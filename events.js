function esc(str){
  return String(str).replace(/[&<>"']/g, m => ({
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

const listEl = document.getElementById("events-list");
const searchEl = document.getElementById("search");
const cityEl = document.getElementById("city");
document.getElementById("year").textContent = new Date().getFullYear();

let allEvents = [];

function render(){
  const q = (searchEl.value || "").toLowerCase().trim();
  const city = cityEl.value;

  const filtered = allEvents.filter(e => {
    const hay = `${e.title} ${e.city} ${e.venue || ""}`.toLowerCase();
    return (!q || hay.includes(q)) && (!city || e.city === city);
  });

  filtered.sort((a,b)=> new Date(a.date) - new Date(b.date));

  listEl.innerHTML = filtered.map(e => `
    <div class="card" id="${e.slug}">
      <div class="badges">
        <span class="badge">${esc(badgeDate(e.date))}</span>
        <span class="pill">${esc(e.city)}</span>
      </div>
      <h3>${esc(e.title)}</h3>
      <div class="meta">${esc(when(e.date))}</div>
      <div class="meta">${esc(e.venue || "")}</div>
      ${e.organiser ? `<div class="meta" style="margin-top:8px;opacity:.85;">Organiser: ${esc(e.organiser)}</div>` : ""}
      <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;">
        ${e.ticketUrl ? `<a class="btn primary" target="_blank" rel="noreferrer" href="${e.ticketUrl}">Buy tickets</a>` : ""}
        <a class="btn ghost" href="events.html#${e.slug}">Copy link</a>
      </div>
    </div>
  `).join("") || `<div class="card"><h3>No events found</h3><div class="meta">Try another search or city.</div></div>`;
}

async function init(){
  const res = await fetch("data/events.json");
  allEvents = await res.json();

  const cities = [...new Set(allEvents.map(e => e.city))].sort();
  cityEl.innerHTML = `<option value="">All cities</option>` + cities.map(c => `<option>${esc(c)}</option>`).join("");

  searchEl.addEventListener("input", render);
  cityEl.addEventListener("change", render);

  render();
}

init();
