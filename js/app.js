const filters = {
    name: document.getElementById('filter-name'),
    type: document.getElementById('filter-type'),
    book: document.getElementById('filter-book')
};

const tableBody = document.querySelector('#class-table tbody');
const details = document.getElementById('details-content');
let classData = [];

fetch('data/classes.json')
    .then(res => res.json())
    .then(data => {
        classData = data.classes;
        populateFilters(classData);
        renderTable(classData);
    });

function uniqueValues(data, key) {
    return [...new Set(data.map(item => item[key]))];
}

function populateFilters(data) {
    // Clear any existing options except "All Names"
    filters.name.length = 1;

    // Load every unique class name from JSON into the Name dropdown
    uniqueValues(data, 'name')
        .sort()
        .forEach(name => addOption(filters.name, name));
}

function addOption(select, value) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = value;
    select.appendChild(opt);
}

Object.values(filters).forEach(select => {
    select.addEventListener('change', applyFilters);
});

function applyFilters() {
    const filtered = classData.filter(c =>
        (!filters.name.value || c.name === filters.name.value) &&
        (!filters.type.value || c.classType === filters.type.value) &&
        (!filters.book.value || c.book === filters.book.value)
    );
    renderTable(filtered);
}

function renderTable(data) {
    tableBody.innerHTML = '';
    data.forEach(c => {
        const row = document.createElement('tr');
        row.innerHTML = `
<td>${c.name}</td>
<td>${c.classType}</td>
<td>${c.subtype}</td>
<td>${c.book}</td>
`;
        row.addEventListener('click', () => showDetails(c));
        tableBody.appendChild(row);
    });
}

function showDetails(c) {
    details.innerHTML = `
<tr>
  <td>${c.name}</td>
  <td>${c.classType}</td>
  <td>${c.subtype}</td>
  <td>${c.basicMeta}</td>
  <td>${c.masterMeta}</td>
  <td>${c.definingAbility}</td>
  <td>${c.advantage}</td>
  <td>${c.disadvantage}</td>
  <td>${c.book}</td>
</tr>
`;
}