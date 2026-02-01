const filters = {
    name: document.getElementById('filter-name'),
    type: document.getElementById('filter-type'),
    book: document.getElementById('filter-book')
};

const tableBody = document.querySelector('#class-table tbody');

let classData = [];

// ---- Load JSON ----
fetch('data/classes.json')
    .then(res => {
        if (!res.ok) throw new Error(`Failed to load classes.json (${res.status})`);
        return res.json();
    })
    .then(data => {
        classData = data.classes || [];
        populateFilters(classData);
        renderTable(classData);
    })
    .catch(err => console.error(err));

// ---- Utilities ----
function uniqueValues(data, key) {
    return [...new Set(data.map(item => item[key]).filter(Boolean))];
}

function addOption(select, value, label = value) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    select.appendChild(opt);
}

// ---- Populate Filters ----
function populateFilters(data) {
    // Names should be dynamic from JSON
    filters.name.length = 1;
    uniqueValues(data, 'name')
        .sort()
        .forEach(name => addOption(filters.name, name));
}

// ---- Filter Events ----
Object.values(filters).forEach(sel => sel.addEventListener('change', applyFilters));

function applyFilters() {
    const filtered = classData.filter(c =>
        (!filters.name.value || c.name === filters.name.value) &&
        (!filters.type.value || c.classType === filters.type.value) &&
        (!filters.book.value || c.book === filters.book.value)
    );

    renderTable(filtered);
}

// ---- Render Main Table ----
function renderTable(data) {
    tableBody.innerHTML = '';

    data.forEach(c => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.classType)}</td>
      <td>${escapeHtml(c.subtype)}</td>
      <td>${escapeHtml(c.book)}</td>
    `;

        row.addEventListener('click', () => {
            // clear previous selection
            document.querySelectorAll('#class-table tbody tr').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');

            showDetails(c);
        });

        tableBody.appendChild(row);
    });
}

// ---- Details + Attributes + Skills ----
function showDetails(c) {
    setText('detail-name', c.name);
    setText('detail-classType', c.classType);
    setText('detail-subtype', c.subtype);
    setText('detail-basicMeta', c.basicMeta);
    setText('detail-masterMeta', c.masterMeta);
    setText('detail-definingAbility', c.definingAbility);
    setText('detail-advantage', c.advantage);
    setText('detail-disadvantage', c.disadvantage);
    setText('detail-book', c.book);

    renderAttributes(c.attributes);
    renderSkills(c.skills);
}

function renderAttributes(attrs) {
    const map = {
        Strength: 'attr-strength',
        Agility: 'attr-agility',
        Endurance: 'attr-endurance',
        Awareness: 'attr-awareness',
        Intelligence: 'attr-intelligence',
        Resilience: 'attr-resilience',
        Appearance: 'attr-appearance',
        Charisma: 'attr-charisma'
    };

    Object.entries(map).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (!el) return;

        const value = attrs && attrs[key] ? formatAttr(attrs[key]) : '';
        el.textContent = value;
    });
}

function formatAttr(attr) {
    // supports { Value: number, Bonus?: "S"|"M"|"S+M" }
    if (!attr || typeof attr !== 'object') return '';
    const v = (attr.Value ?? attr.value ?? '');
    const b = attr.Bonus ? ` ${attr.Bonus}` : '';
    return `${v}${b}`.trim();
}

function renderSkills(skills) {
    const ul = document.getElementById('skills-list');
    ul.innerHTML = '';

    if (!Array.isArray(skills) || skills.length === 0) {
        ul.innerHTML = '<li>No skills listed.</li>';
        return;
    }

    skills.forEach(skill => {
        const li = document.createElement('li');
        li.textContent = skill;
        ul.appendChild(li);
    });
}

// ---- Helpers ----
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text ?? '';
}

// minimal HTML escaping for table cells
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
