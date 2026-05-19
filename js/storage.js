const STORAGE_KEY = 'dados';
const IDIOMA_KEY = 'idioma';

export function carregarDados() {
  try {
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

export function salvarDados(dados) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

export function carregarIdioma() {
  const idioma = localStorage.getItem(IDIOMA_KEY) || 'pt';
  return ['pt', 'es', 'en'].includes(idioma) ? idioma : 'pt';
}

export function salvarIdioma(idioma) {
  localStorage.setItem(IDIOMA_KEY, idioma);
}
