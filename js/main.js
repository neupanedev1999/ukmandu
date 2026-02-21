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

function card(e){
  return `
    <a class="card" href="events.html#${e.slug}">
      <div class="badges">
        <span class="badge">${esc(badgeDate(e.date))}</span>
        <span class="pill">${esc(e.city)}</span>
      </div>
      <h3>${esc(e.title)}</h3>
      <div class="meta">${esc(when(e.date))}</div>
      <div class="meta">${esc(e.venue || "")}</div>
      <div class="tag">View details →</div>
    </a>
  `;
}

function featured(e){
  return `
    <div>
      <div class="kicker" style="margin:0 0 6px; letter-spacing:.2em;">FEATURED</div>
      <div style="font-size:28px;font-weight:900;">${esc(e.title)}</div>
      <div class="meta" style="margin-top:8px;">${esc(e.city)} • ${esc(when(e.date))}</div>
      <div class="meta">${esc(e.venue || "")}</div>
      ${e.organiser ? `<div class="meta" style="margin-top:10px;opacity:.8;">Organiser: ${esc(e.organiser)}</div>` : ""}
      <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">
        ${e.ticketUrl ? `<a class="btn primary" target="_blank" rel="noreferrer" href="${e.ticketUrl}">Buy tickets</a>` : ""}
        <a class="btn ghost" href="events.html">Browse all</a>
      </div>
    </div>
  `;
}

async function init(){
  document.getElementById("year").textContent = new Date().getFullYear();

  const res = await fetch("data/events.json");
  const events = await res.json();
  events.sort((a,b)=> new Date(a.date) - new Date(b.date));

  const f = document.getElementById("featured");
  if (f && events[0]) f.innerHTML = featured(events[0]);

  const list = document.getElementById("home-events");
  if (list) list.innerHTML = events.slice(0,6).map(card).join("");
}

init();
