import { createOptimizedPicture, fetchPlaceholders } from '../../scripts/aem.js';

export default async function decorate(block) {
  const placeholders = await fetchPlaceholders('');
  /*eslint-disable no-console*/
  console.log(placeholders); // Debugging: Check the content of placeholders
  const clickHereForMore = placeholders?.clickHereForMore || 'Click Here For More'; // Fallback text

  // Change to ul, li
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const divWrapper = document.createElement('div');
    const url = '/mainpage';
    const footer = `<a href="${url}">${clickHereForMore}</a>`;
    divWrapper.classList.add('cards-card-footer');
    divWrapper.innerHTML = footer;

    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((childDiv) => {
      if (childDiv.children.length === 1 && childDiv.querySelector('picture')) {
        childDiv.className = 'cards-card-image';
      } else {
        childDiv.className = 'cards-card-body';
      }
    });

    li.append(divWrapper);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    );
  });

  block.textContent = '';
  block.append(ul);
}
