(async function () {
    const container = document.getElementById("raceDetail");

    const params = new URLSearchParams(window.location.search);
    const requestedName = (params.get("race") || "").trim();

    try {
        const res = await fetch("data/race.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load race.json (${res.status})`);

        const races = await res.json();
        if (!Array.isArray(races)) throw new Error("race.json must be an array of race objects.");

        const race =
            requestedName
                ? races.find(r => (r.name || "").toLowerCase() === requestedName.toLowerCase())
                : races[0];

        if (!race) {
            container.innerHTML = `<div class="race-card"><div class="placeholder">No race found for "${escapeHtml(requestedName)}".</div></div>`;
            return;
        }

        container.innerHTML = renderRaceCard(race);

    } catch (err) {
        container.innerHTML = `<div class="race-card"><div class="error">Error: ${escapeHtml(String(err.message || err))}</div></div>`;
    }

    function renderRaceCard(r) {
        const name = r.name ?? "Unknown";
        const imageUrl = r.ImageURL || "";
        const eyes = r.eye ?? "—";

        // Accept either key: racialSlot1 OR racialSlot
        const racialList = Array.isArray(r.racialSlot1)
            ? r.racialSlot1
            : (Array.isArray(r.racialSlot) ? r.racialSlot : []);

        const fields = [
            ["Description", r.description],
            ["Backstory", r.backstory],
            ["Hair", r.hair],
            ["Skin", r.skin],
            ["Eyes", eyes],
            ["Height", r.height],
            ["Weight", r.weight],
            ["Lifespan", r.lifespan],
        ];

        return `
      <section class="race-card">
        <header class="race-header">
          <h1 class="race-title">${escapeHtml(name)}</h1>
          <p class="race-subtitle">Race</p>
        </header>

        <div class="race-body">
          <div class="race-fields">
            ${fields.map(([label, value]) => fieldBlock(label, value)).join("")}
            ${racialListBlock("Racial Slots", racialList)}
          </div>

          <aside class="race-imagePanel" aria-label="Race image">
            ${imageUrl
                ? `<img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(name)}" />`
                : `<div class="placeholder">No image provided.</div>`
            }
          </aside>
        </div>
      </section>
    `;
    }

    function fieldBlock(label, value) {
        const safeValue = (value === null || value === undefined || value === "")
            ? "—"
            : String(value);

        const allowHtml = (label === "Description" || label === "Backstory");

        return `
    <div class="field">
      <p class="field-label">${escapeHtml(label)}</p>
      ${allowHtml
                ? `<div class="field-value">${safeValue}</div>`   // RENDERS YOUR <ul> LIST
                : `<p class="field-value">${escapeHtml(safeValue)}</p>`
            }
    </div>
  `;
    }



    function racialListBlock(label, items) {
        if (!items || items.length === 0) return "";

        const lis = items.map(x => `<li>${escapeHtml(String(x))}</li>`).join("");
        return `
      <div class="field">
        <p class="field-label">${escapeHtml(label)}</p>
        <ul class="field-list">${lis}</ul>
      </div>
    `;
    }

    function escapeHtml(str) {
        return String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function escapeAttr(str) {
        return escapeHtml(str).replaceAll("`", "&#096;");
    }
})();
