import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://mspckltwldaxgyhgtdnk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_TveJs_5Df9ON2AaqhUBQOQ_fG8VHQY9";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

async function incrementAndShowViews(slug){
  const el = document.getElementById(`views-${slug}`);
  if (!el) return;

  const { data, error } = await supabase.rpc("increment_event_view", {
    slug_in: slug
  });

  if (error) {
    console.error("Supabase error:", error);
    el.textContent = "👁 views unavailable";
    return;
  }

  el.textContent = `👁 ${data} views`;
}

function render(){
  const q = (searchEl.value || "").toLowerCase().trim();
  const city = cityEl.value;

  let filtered = allEvents.filter(e => {
    const hay = `${e.title} ${e.city} ${e.venue || ""}`.toLowerCase();
    return (!q || hay.includes(q)) && (!city || e.city === city);
  });

  filtered.sort((a,b)=> new Date(a.date) - new Date(b.date));

 listEl.innerHTML = filtered.map(e => `
  <div class="card" id="${e.slug}">
    ${e.image ? `<img class="event-img" src="${e.image}" alt="${esc(e.title)}">` : ""}

    <div class="badges">
      <span class="badge">${esc(badgeDate(e.date))}</span>
      <span class="pill">${esc(e.city)}</span>
    </div>

    <h3>${esc(e.title)}</h3>
    <div class="meta">${esc(when(e.date))}</div>
    <div class="meta">${esc(e.venue || "")}</div>

    <div style="margin-top:12px;">
      ${e.ticketUrl ? `<a class="btn primary" target="_blank" rel="noreferrer" href="${e.ticketUrl}">Buy tickets</a>` : ""}
    </div>
  </div>
`).join("");

  filtered.forEach(e => incrementAndShowViews(e.slug));
}

async function init(){
  const res = await fetch("data/events.json");
  allEvents = await res.json();

  const cities = [...new Set(allEvents.map(e => e.city))].sort();
  cityEl.innerHTML =
    `<option value="">All cities</option>` +
    cities.map(c => `<option>${esc(c)}</option>`).join("");

  searchEl.addEventListener("input", render);
  cityEl.addEventListener("change", render);

  render();
}

init();

