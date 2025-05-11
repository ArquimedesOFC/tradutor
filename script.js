const maxChars = 500;
let translationHistory = [];

function updateCharCount() {
  const input = document.getElementById('text-to-translate');
  const counter = document.getElementById('char-counter');
  const remaining = maxChars - input.value.length;
  counter.textContent = `${remaining} caracteres restantes`;
  counter.classList.toggle('exceeded', remaining < 0);
}

document.getElementById('translate-btn').addEventListener('click', translateText);
document.getElementById('translate-long-btn').addEventListener('click', translateLongText);
document.getElementById('toggle-theme').addEventListener('click', toggleTheme);

function toggleTheme() {
  const body = document.body;
  body.dataset.theme = body.dataset.theme === 'light' ? 'dark' : 'light';
}

async function translateText() {
  const inputText = document.getElementById('text-to-translate').value.trim();
  const output = document.getElementById('translated-text');
  const button = document.getElementById('translate-btn');

  if (!inputText) return alert("Por favor, digite um texto para traduzir.");
  if (inputText.length > maxChars) return alert(`O texto excede o limite de ${maxChars} caracteres.`);

  button.disabled = true;
  output.value = "Traduzindo...";

  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(inputText)}&langpair=en|pt`);
    const data = await response.json();
    const translated = data.responseData.translatedText;
    output.value = translated;
    addTranslationToHistory(inputText, translated);
  } catch (error) {
    console.error('Erro:', error);
    output.value = "Erro na tradução. Tente novamente.";
  }

  button.disabled = false;
}

function addTranslationToHistory(original, translated) {
  if (translationHistory.length >= 5) translationHistory.shift();
  translationHistory.push({ original, translated });
  updateHistoryDisplay();
}

function updateHistoryDisplay() {
  const historyList = document.getElementById('history-list');
  historyList.innerHTML = '';
  translationHistory.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'history-item full';
    el.textContent = `Histórico ${index + 1}`;
    el.title = `${item.original} → ${item.translated}`;
    el.onclick = () => {
      document.getElementById('text-to-translate').value = item.original;
      document.getElementById('translated-text').value = item.translated;
      updateCharCount();
    };
    historyList.appendChild(el);
  });
}

async function translateLongText() {
  const inputText = document.getElementById('text-to-translate').value.trim();
  const output = document.getElementById('translated-text');
  const actions = document.querySelector('.actions');

  if (!inputText) return alert("Digite um texto.");

  const existingLink = document.getElementById('download-link');
  if (existingLink) actions.removeChild(existingLink);

  const chunks = inputText.match(/.{1,500}/g);
  let finalTranslation = '';

  output.value = "Traduzindo partes...";

  for (let i = 0; i < chunks.length; i++) {
    try {
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunks[i])}&langpair=en|pt`);
      const data = await response.json();
      finalTranslation += data.responseData.translatedText + '\n';
    } catch (e) {
      finalTranslation += '[Erro ao traduzir parte do texto]\n';
    }
  }

  output.value = finalTranslation;

  const blob = new Blob([finalTranslation], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'traducao.txt';
  link.textContent = 'Clique aqui para baixar a tradução completa';
  link.id = 'download-link';
  link.style.display = 'block';
  link.style.marginTop = '20px';
  link.style.color = 'var(--primary)';
  actions.appendChild(link);

  addTranslationToHistory(inputText, finalTranslation.trim());
}
