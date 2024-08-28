import { fetchPlaceholders, getMetadata } from '../../scripts/aem.js';

const rowsPerPage = 20;

// Fetch placeholders from metadata
async function getPlaceholders() {
  const placeholders = await fetchPlaceholders(getMetadata('Table'));

  const country = placeholders.country || 'Country'; // Add this line for country
  const capital = placeholders.capital || 'Capital';
  const continent = placeholders.continent || 'Continent';

  return { country, capital, continent };
}

// Create table header
async function createTableHeader(table) {
  const { country, capital, continent } = await getPlaceholders();

  const tr = document.createElement('tr');

  const countryHeader = document.createElement('th');
  countryHeader.appendChild(document.createTextNode(country));

  const capitalHeader = document.createElement('th');
  capitalHeader.appendChild(document.createTextNode(capital));

  const continentHeader = document.createElement('th');
  continentHeader.appendChild(document.createTextNode(continent));

  tr.append(countryHeader);
  tr.append(capitalHeader);
  tr.append(continentHeader);

  table.appendChild(tr);

  return table;
}

// Create a table row
function createTableRow(row) {
  const tr = document.createElement('tr');

  const country = document.createElement('td');
  country.appendChild(document.createTextNode(row.Countries || 'N/A'));

  const capital = document.createElement('td');
  capital.appendChild(document.createTextNode(row.Capital || 'N/A'));

  const continent = document.createElement('td');
  continent.appendChild(document.createTextNode(row.Continent || 'N/A'));

  tr.appendChild(country);
  tr.appendChild(capital);
  tr.appendChild(continent);

  return tr;
}

// Create the table and populate it with data
async function createTable(jsonURL, offset = 0, limit = rowsPerPage) {
  const resp = await fetch(`${jsonURL}?offset=${offset}&limit=${limit}`);
  if (!resp.ok) {
    console.error('Failed to fetch JSON:', resp.statusText);
    return;
  }

  const json = await resp.json();
  console.log('=====Fetched JSON Data=====>', json);

  const table = document.createElement('table');
  await createTableHeader(table);
  json.data.forEach((row) => {
    const tableRow = createTableRow(row);
    table.appendChild(tableRow);
  });

  return { table, total: json.total };
}

// Update the table and handle pagination
async function updateTable(parentDiv, jsonURL, page, limit) {
  const offset = (page - 1) * limit;

  const { table, total } = await createTable(jsonURL, offset, limit);
  parentDiv.innerHTML = '';
  parentDiv.appendChild(table);

  const pagination = document.createElement('div');
  pagination.classList.add('pagination-controls');

  // Previous button
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Previous';
  prevButton.onclick = () => updateTable(parentDiv, jsonURL, page - 1, limit);
  prevButton.disabled = page === 1;
  pagination.appendChild(prevButton);

  // Next button
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.onclick = () => updateTable(parentDiv, jsonURL, page + 1, limit);
  nextButton.disabled = offset + limit >= total;
  pagination.appendChild(nextButton);

  parentDiv.appendChild(pagination);
}

// Main function to decorate the block
export default async function decorate(block) {
  const countriesLink = block.querySelector('a[href$=".json"]');
  const parentDiv = document.createElement('div');
  parentDiv.classList.add('countries-block');

  if (countriesLink) {
    const currentPage = 1;
    const limit = rowsPerPage;
    await updateTable(parentDiv, countriesLink.href, currentPage, limit);
    countriesLink.replaceWith(parentDiv);
  }
}
