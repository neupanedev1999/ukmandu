async function loadHomeEvents(){
  const el = document.getElementById("home-events");
  if(!el) return;

  const res = await fetch("data/events.json");
  const events = await res.json();

  events.sort((a,b)=> new Date(a.date)-new Date(b.date));

  const top = events.slice(0,6);
  el.innerHTML = top.map(e => cardHtml(e)).join("");
}

function cardHtml(e){
  const d = new Date(e.date);
  const when = d.toLocaleString("en-GB", { timeZone: "Europe/London", dateStyle:"medium", timeStyle:"short" });

  return `
    <a class="card" href="events.html#${e.slug}">
      <h3>${escapeHtml(e.title)}</h3>
      <div class="meta">${escapeHtml(e.city)} • ${escapeHtml(when)}</div>
      <div class="meta">${escapeHtml(e.venue || "")}</div>
      <div class="tag">View details →</div>
    </a>
  `;
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

document.getElementById("year").textContent = new Date().getFullYear();
loadHomeEvents();
