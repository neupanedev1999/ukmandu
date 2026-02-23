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
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

let allEvents = [];

// ✅ increments and returns updated view count from Supabase function increment_event_view(slug_in)
async function incrementAndShowViews(slug){
  const el = document.getElementById(`views-${slug}`);
  if (!el) return;

  try {
    const { data, error } = await supabase.rpc("increment_event_view", { slug_in: slug });

    if (error) {
      console.error("Supabase view RPC error:", error);
      el.textContent = "👁 views unavailable";
      return;
    }

    el.textContent = `👁 ${Number(data).toLocaleString()} views`;
  } catch (err) {
    console.error("View counter crash:", err);
    el.textContent = "👁 views unavailable";
  }
}

function render(){
  if (!listEl) return;

  const q = (searchEl?.value || "").toLowerCase().trim();
  const city = cityEl?.value || "";

  let filtered = allEvents.filter(e => {
    const hay = `${e.title || ""} ${e.city || ""} ${e.venue || ""}`.toLowerCase();
    return (!q || hay.includes(q)) && (!city || e.city === city);
  });

  // sort by date
  filtered.sort((a,b)=> new Date(a.date) - new Date(b.date));

  listEl.innerHTML = filtered.map(e => `
    <div class="card" id="${esc(e.slug)}">

      ${e.image ? `<img class="event-img" src="${esc(e.image)}" alt="${esc(e.title)}" loading="lazy">` : ""}

      <div class="badges">
        <span class="badge">${esc(badgeDate(e.date))}</span>
        <span class="pill">${esc(e.city)}</span>
      </div>

      <h3>${esc(e.title)}</h3>
      <div class="meta">${esc(when(e.date))}</div>
      <div class="meta">${esc(e.venue || "")}</div>

      <!-- ✅ VIEW COUNT PLACEHOLDER -->
      <div class="meta view-count" id="views-${esc(e.slug)}">👁 Loading views...</div>

      <div style="margin-top:12px;">
        ${e.ticketUrl ? `<a class="btn primary" target="_blank" rel="noreferrer" href="${esc(e.ticketUrl)}">Buy tickets</a>` : ""}
      </div>
    </div>
  `).join("");

  // ✅ IMPORTANT: actually load views AFTER DOM is created
  filtered.forEach(e => incrementAndShowViews(e.slug));
}

async function init(){
  try {
    const res = await fetch("data/events.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`events.json fetch failed: ${res.status}`);
    allEvents = await res.json();

    // populate city dropdown
    if (cityEl) {
      const cities = [...new Set(allEvents.map(e => e.city).filter(Boolean))].sort();
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
