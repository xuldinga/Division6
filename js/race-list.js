(async function () {
  const container = document.getElementById("raceLinks");

  try {
    const res = await fetch("data/race.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`Could not load race.json (${res.status})`);

    const races = await res.json();
    if (!Array.isArray(races)) throw new Error("race.json must be an array of race objects.");

    // Sort by name descending (Z → A)
    races.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    // Build list UI
    container.innerHTML = races.map(r => {
      const name = r.name || "Unknown";
      const href = `race.html?race=${encodeURIComponent(name)}`;
      return `<a class="race-link" href="${href}">${escapeHtml(name)}</a>`;
    }).join("");

  } catch (err) {
    container.innerHTML = `<p class="error">Error: ${escapeHtml(String(err.message || err))}</p>`;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
