const STORAGE_KEY = 'dados';
const IDIOMA_KEY = 'idioma';

export function carregarDados() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

export function salvarDados(dados) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

export function carregarIdioma() {
  return localStorage.getItem(IDIOMA_KEY) || 'es';
}

export function salvarIdioma(idioma) {
  localStorage.setItem(IDIOMA_KEY, idioma);
}
