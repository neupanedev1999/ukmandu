import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://mspckltwldaxgyhgtdnk.supabase.co",
  "sb_publishable_TveJs_5Df9ON2AaqhUBQOQ_fG8VHQY9"
);

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

function getSlug(){
  return new URL(location.href).searchParams.get("slug") || "";
}

async function init(){
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const holder = document.getElementById("event-detail");
  const slug = getSlug();

  if (!slug) {
    holder.innerHTML = `<div class="card"><h3>Event not found</h3><div class="meta">Missing slug in URL.</div></div>`;
    return;
  }

  const res = await fetch("data/events.json", { cache: "no-store" });
  const events = await res.json();
  const e = events.find(x => x.slug === slug);

  if (!e) {
    holder.innerHTML = `<div class="card"><h3>Event not found</h3><div class="meta">No event matches: ${esc(slug)}</div></div>`;
    return;
  }

  holder.innerHTML = `
    <div class="card">
      ${e.image ? `<img class="event-img" src="${esc(e.image)}" alt="${esc(e.title)}" loading="lazy">` : ""}
      <div class="badges">
        <span class="badge">${esc(e.city || "")}</span>
        <span class="pill">Event</span>
      </div>
      <h3 style="font-size:22px;">${esc(e.title)}</h3>
      <div class="meta">${esc(when(e.date))}</div>
      <div class="meta">${esc(e.venue || "")}</div>

      <div class="meta view-count" id="views">👁 Loading views...</div>

      <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">
        ${e.ticketUrl ? `<a class="btn primary" target="_blank" rel="noreferrer" href="${esc(e.ticketUrl)}">Buy tickets</a>` : ""}
        <a class="btn ghost" href="events.html">Browse all events</a>
      </div>
    </div>
  `;

  // ✅ Count view ONLY here (not on events list page)
  try {
    const { data, error } = await supabase.rpc("increment_event_view", { slug_in: slug });
    const viewsEl = document.getElementById("views");
    if (error) throw error;
    if (viewsEl) viewsEl.textContent = `👁 ${Number(data ?? 0).toLocaleString()} views`;
  } catch (err) {
    console.error(err);
    const viewsEl = document.getElementById("views");
    if (viewsEl) viewsEl.textContent = "👁 views unavailable";
  }
}

init();
