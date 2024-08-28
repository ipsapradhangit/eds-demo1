function createSelect(fd) {
  const select = document.createElement('select');
  select.id = fd.Field;
  if (fd.Placeholder) {
    const placeholderOption = document.createElement('option');
    placeholderOption.textContent = fd.Placeholder;
    placeholderOption.setAttribute('selected', '');
    placeholderOption.setAttribute('disabled', '');
    select.append(placeholderOption);
  }
  fd.Options.split(',').forEach((optionText) => {
    const option = document.createElement('option');
    option.textContent = optionText.trim();
    option.value = optionText.trim();
    select.append(option);
  });
  if (fd.Mandatory === 'x') {
    select.setAttribute('required', 'required');
  }
  return select;
}

// create an input element
function createInput(fd) {
  const input = document.createElement('input');
  input.type = fd.Type === 'text-field' ? 'text' : fd.Type;
  input.id = fd.Field;
  input.setAttribute('placeholder', fd.Placeholder);
  if (fd.Mandatory === 'x') {
    input.setAttribute('required', 'required');
  }
  return input;
}

// create a textarea element
function createTextArea(fd) {
  const textarea = document.createElement('textarea');
  textarea.id = fd.Field;
  textarea.setAttribute('placeholder', fd.Placeholder);
  if (fd.Mandatory === 'x') {
    textarea.setAttribute('required', 'required');
  }
  return textarea;
}

// create a label element
function createLabel(fd) {
  const label = document.createElement('label');
  label.setAttribute('for', fd.Field);
  label.textContent = fd.Label;
  if (fd.Mandatory === 'x') {
    label.classList.add('required');
  }
  return label;
}

function createButton(fd) {
  const button = document.createElement('button');
  button.textContent = fd.Label;
  button.type = 'submit';
  button.classList.add('button');
  return button;
}

function constructPayload(form) {
  const payload = {};
  [...form.elements].forEach((fe) => {
    if (fe.type === 'checkbox') {
      if (fe.checked) payload[fe.id] = fe.value;
    } else if (fe.id) {
      payload[fe.id] = fe.value;
    }
  });
  return payload;
}

async function submitForm(form) {
  const payload = constructPayload(form);
  payload.timestamp = new Date().toJSON();
  const resp = await fetch(`https://form.aem.page/main--helix-website--adobe${form.dataset.action}`, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: payload }),
  });
  await resp.text();

  // Redirect to the specified URL after submission
  const redirectTo = '/homepage';
  window.location.href = redirectTo;
}

// create the form based on JSON data
export async function createForm(formURL) {
  const resp = await fetch(formURL);
  const json = await resp.json();
  const form = document.createElement('form');
  form.dataset[data1, data2] = formURL.split('.json');
  form.dataset.action = data1;

  json.data.forEach((fd) => {
    fd.Type = fd.Type || 'text';
    const fieldWrapper = document.createElement('div');
    fieldWrapper.className = `form-${fd.Type}-wrapper field-wrapper`;

    switch (fd.Type) {
      case 'select':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createSelect(fd));
        break;
      case 'text-area':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createTextArea(fd));
        break;
      case 'submit':
        fieldWrapper.append(createButton(fd));
        break;
      default:
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createInput(fd));
    }

    form.append(fieldWrapper);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (form.checkValidity()) {
      await submitForm(form);
    }
  });

  return form;
}

// Function to replace the link with the generated form
export default async function decorate(block) {
  const formLink = block.querySelector('a[href$=".json"]');
  if (formLink) {
    const form = await createForm(formLink.href);
    formLink.replaceWith(form);
  }
}
