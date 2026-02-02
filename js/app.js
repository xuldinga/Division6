const filters = {
    name: document.getElementById('filter-name'),
    type: document.getElementById('filter-type'),
    book: document.getElementById('filter-book'),
    subtypeSearch: document.getElementById('filter-subtype-search'),
};

const tableBody = document.querySelector('#class-table tbody');

let classData = [];

fetch('data/classes.json')
    .then(res => res.json())
    .then(data => {
        classData = data.classes ?? [];
        populateFilters(classData);
        renderTable(classData);
    })
    .catch(err => console.error('Failed to load classes.json:', err));

function uniqueValues(data, key) {
    return [...new Set(data.map(item => item?.[key]).filter(Boolean))];
}

function populateFilters(data) {
    filters.name.length = 1;
    uniqueValues(data, 'name')
        .sort((a, b) => a.localeCompare(b))
        .forEach(name => addOption(filters.name, name));
}

function addOption(select, value) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = value;
    select.appendChild(opt);
}

Object.values(filters).forEach(select => select.addEventListener('change', applyFilters));
filters.subtypeSearch.addEventListener('input', applyFilters);

function applyFilters() {
    const q = (filters.subtypeSearch.value || '').trim().toLowerCase();

    const filtered = classData.filter(c => {
        const subtype = (c.subtype || '').toLowerCase();

        return (
            (!filters.name.value || c.name === filters.name.value) &&
            (!filters.type.value || c.classType === filters.type.value) &&
            (!filters.book.value || c.book === filters.book.value) &&
            (!q || subtype.includes(q))
        );
    });
    renderTable(filtered);
}

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
            document.querySelectorAll('#class-table tbody tr').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
            showDetails(c);
        });

        tableBody.appendChild(row);
    });
}

/* ===== Attributes ===== */

function renderAttributes(attrs) {
    const map = {
        Strength: 'attr-strength',
        Agility: 'attr-agility',
        Endurance: 'attr-endurance',
        Awareness: 'attr-awareness',
        Intelligence: 'attr-intelligence',
        Resilience: 'attr-resilience',
        Appearance: 'attr-appearance',
        Charisma: 'attr-charisma',
    };

    // If a class uses Appearance_Charisma, use that for both fields as a fallback
    const combined = attrs?.Appearance_Charisma;

    Object.entries(map).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (!el) return;

        let valueObj = attrs?.[key];

        if (!valueObj && (key === 'Appearance' || key === 'Charisma') && combined) {
            valueObj = combined;
        }

        el.textContent = valueObj ? formatAttr(valueObj) : '';
    });
}

function formatAttr(attr) {
    if (!attr || typeof attr !== 'object') return '';
    const val = attr.Value ?? attr.value ?? '';
    const bonus = attr.Bonus ?? '';
    return bonus ? `${val} ${bonus}` : `${val}`;
}

/* ===== Skills ===== */

function renderSkills(skills) {
    const ul = document.getElementById('skills-list');
    ul.innerHTML = '';

    if (!Array.isArray(skills) || skills.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No skills listed.';
        ul.appendChild(li);
        return;
    }

    skills.forEach(skill => {
        const li = document.createElement('li');
        li.textContent = skill;
        ul.appendChild(li);
    });
}

/* ===== Lore (History + Description + ImageURL) ===== */

function renderLore(c) {
    document.getElementById('detail-history').textContent = c.History ?? '';
    document.getElementById('detail-description').textContent = c.Description ?? '';

    const img = document.getElementById('detail-image');
    const fallback = document.getElementById('detail-image-fallback');

    const path = c.ImageURL ?? '';

    // Clear any previous click handler
    img.onclick = null;

    if (path) {
        img.src = path;
        img.style.display = 'block';
        fallback.style.display = 'none';

        // Click to open full-res in a new tab
        img.style.cursor = 'zoom-in';
        img.onclick = () => window.open(path, '_blank', 'noopener,noreferrer');

        img.onerror = () => {
            img.style.display = 'none';
            fallback.style.display = 'grid';
        };
    } else {
        img.removeAttribute('src');
        img.style.display = 'none';
        fallback.style.display = 'grid';
    }
}


/* ===== Class Slots: ClassSlot1..ClassSlot11 ===== */

function renderSlots(c) {
    const container = document.getElementById('slots-container');
    container.innerHTML = '';

    let any = false;

    for (let i = 1; i <= 11; i++) {
        const key = `ClassSlot${i}`;
        const options = c[key];

        // Always show blocks; if you only want non-empty, change this behavior
        const block = document.createElement('div');
        block.className = 'slot-block';

        const title = document.createElement('h4');
        title.className = 'slot-title';
        title.textContent = `Class Slot ${i}`;
        block.appendChild(title);

        const ul = document.createElement('ul');

        if (Array.isArray(options) && options.length > 0) {
            any = true;
            options.forEach(opt => {
                const li = document.createElement('li');
                li.textContent = opt;
                ul.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = '(No options)';
            ul.appendChild(li);
        }

        block.appendChild(ul);
        container.appendChild(block);
    }

    if (!any) {
        container.innerHTML = `<div class="slots-empty">No class slot options listed.</div>`;
    }
}

/* ===== Main details ===== */

function showDetails(c) {
    document.getElementById('detail-name').textContent = c.name ?? '';
    document.getElementById('detail-classType').textContent = c.classType ?? '';
    document.getElementById('detail-subtype').textContent = c.subtype ?? '';
    document.getElementById('detail-firstMainTrait').textContent = c.firstMainTrait ?? '';
    document.getElementById('detail-basicMeta').textContent = c.basicMeta ?? '';
    document.getElementById('detail-masterMeta').textContent = c.masterMeta ?? '';
    document.getElementById('detail-definingAbility').textContent = c.definingAbility ?? '';
    document.getElementById('detail-advantage').textContent = c.advantage ?? '';
    document.getElementById('detail-disadvantage').textContent = c.disadvantage ?? '';
    document.getElementById('detail-book').textContent = c.book ?? '';

    renderAttributes(c.attributes);
    renderSkills(c.skills);
    renderLore(c);
    renderSlots(c);
}

/* ===== Helpers ===== */

function escapeHtml(value) {
    const s = String(value ?? '');
    return s
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
