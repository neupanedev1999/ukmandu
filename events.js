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
    const matchQ = !q || hay.includes(q);
    const matchCity = !city || e.city === city;
    return matchQ && matchCity;
  });

  filtered.sort((a,b)=> new Date(a.date)-new Date(b.date));

  listEl.innerHTML = filtered.map(e => {
    const d = new Date(e.date);
    const when = d.toLocaleString("en-GB", { timeZone:"Europe/London", dateStyle:"full", timeStyle:"short" });

    return `
      <div class="card" id="${e.slug}">
        <h3>${escapeHtml(e.title)}</h3>
        <div class="meta">${escapeHtml(e.city)} • ${escapeHtml(when)}</div>
        <div class="meta">${escapeHtml(e.venue || "")}</div>
        ${e.ticketUrl ? `<a class="btn primary" style="display:inline-block;margin-top:12px" target="_blank" rel="noreferrer" href="${e.ticketUrl}">Buy Tickets</a>` : ""}
      </div>
    `;
  }).join("") || `<div class="card"><h3>No events found</h3><div class="meta">Try another search or city.</div></div>`;
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

async function init(){
  const res = await fetch("data/events.json");
  allEvents = await res.json();

  // fill city dropdown
  const cities = [...new Set(allEvents.map(e => e.city))].sort();
  cityEl.innerHTML = `<option value="">All cities</option>` + cities.map(c => `<option>${c}</option>`).join("");

  searchEl.addEventListener("input", render);
  cityEl.addEventListener("change", render);

  render();
}

init();
