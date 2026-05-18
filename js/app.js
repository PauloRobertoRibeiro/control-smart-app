import { carregarDados, salvarDados, carregarIdioma, salvarIdioma } from './storage.js';
import { criarTransacao } from './transactions.js';
import { atualizarUI } from './ui.js';
import { traducoes } from './i18n.js';

let dados = carregarDados();
let idiomaAtual = carregarIdioma();
let versaoPro = localStorage.getItem("versaoPro") === "true";

function atualizarInterfaceIdioma() {
  document.getElementById('valor').placeholder = traducoes[idiomaAtual].placeholderValor;
  document.getElementById('descricao').placeholder = traducoes[idiomaAtual].placeholderDescricao;

  const selectTipo = document.getElementById('tipo');
  selectTipo.options[0].text = traducoes[idiomaAtual].entrada;
  selectTipo.options[1].text = traducoes[idiomaAtual].saida;
  selectTipo.options[2].text = traducoes[idiomaAtual].divida;

  document.getElementById('btn-adicionar').textContent = traducoes[idiomaAtual].adicionar;
  document.getElementById('historico-titulo').textContent = traducoes[idiomaAtual].historico;
  document.getElementById('frase-app').textContent = traducoes[idiomaAtual].frase;
}

function checarLimiteFree() {
  if (!versaoPro && dados.length >= 30) {
    alert("Atingiu o limite da versão gratuita (30 movimentos).");
    return false;
  }
  return true;
}

function adicionarTransacaoSegura(tipo, valor, descricao) {
  if (!checarLimiteFree()) return false;

  const nova = criarTransacao(tipo, valor, descricao);
  dados.push(nova);
  salvarDados(dados);

  atualizarUI(dados, idiomaAtual, traducoes);
  atualizarGrafico();
  return true;
}

document.getElementById('btn-adicionar').addEventListener('click', () => {
  const tipo = document.getElementById('tipo').value;
  const valor = parseFloat(document.getElementById('valor').value);
  const descricao = document.getElementById('descricao').value.trim();

  if (!valor || !descricao) {
    alert(traducoes[idiomaAtual].alertaValor);
    return;
  }

  adicionarTransacaoSegura(tipo, valor, descricao);

  document.getElementById('valor').value = '';
  document.getElementById('descricao').value = '';
});

const CODIGO_PRO = "4321";

const btnUpgrade = document.getElementById('btn-upgrade-pro');
if (btnUpgrade) {
  btnUpgrade.addEventListener('click', () => {
    const codigo = prompt("Digite o código PRO:");

    if (!codigo) return;

    if (codigo === CODIGO_PRO) {
      localStorage.setItem("versaoPro", "true");
      versaoPro = true;

      alert("🎉 Versão PRO ativada");
      atualizarUI(dados, idiomaAtual, traducoes);
      atualizarGrafico();
    } else {
      alert("❌ Código incorreto");
    }
  });
}

document.querySelectorAll('[data-idioma]').forEach(btn => {
  btn.addEventListener('click', () => {
    idiomaAtual = btn.dataset.idioma;
    salvarIdioma(idiomaAtual);

    atualizarInterfaceIdioma();
    atualizarUI(dados, idiomaAtual, traducoes);
    atualizarGrafico();

    setTimeout(() => {
      atualizarInterfaceIdioma();
      atualizarUI(dados, idiomaAtual, traducoes);
      atualizarGrafico();
    }, 50);
  });
});

document.getElementById('btn-exportar')?.addEventListener('click', () => {
  if (!versaoPro) {
    alert("Disponível apenas na versão PRO");
    return;
  }

  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'backup-control-smart.json';
  a.click();

  URL.revokeObjectURL(url);
});

const inputImportar = document.getElementById('input-importar');
document.getElementById('btn-importar')?.addEventListener('click', () => {
  if (!versaoPro) {
    alert("Disponível apenas na versão PRO");
    return;
  }
  inputImportar.click();
});

inputImportar?.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const dadosImportados = JSON.parse(e.target.result);
      if (Array.isArray(dadosImportados)) {
        dados = dadosImportados;
        salvarDados(dados);
        atualizarUI(dados, idiomaAtual, traducoes);
        atualizarGrafico();
      }
    } catch {
      alert("Erro ao importar arquivo");
    }
  };
  reader.readAsText(file);
});

let grafico;

function atualizarGrafico() {
  if (!versaoPro || typeof Chart === 'undefined') return;

  const ctx = document.getElementById('graficoFinanceiro').getContext('2d');

  const entradas = dados.filter(d => d.tipo === 'entrada').reduce((s, d) => s + d.valor, 0);
  const saidas = dados.filter(d => d.tipo === 'saida').reduce((s, d) => s + d.valor, 0);
  const recebidas = dados.filter(d => d.tipo === 'divida' && d.paga).reduce((s, d) => s + d.valor, 0);

  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [
        traducoes[idiomaAtual].entrada,
        traducoes[idiomaAtual].saida,
        traducoes[idiomaAtual].pagamentoDivida
      ],
      datasets: [{
        data: [entradas, saidas, recebidas],
        backgroundColor: ['#4caf50','#f44336','#2196f3']
      }]
    },
    options: { responsive: true }
  });
}

atualizarInterfaceIdioma();
atualizarUI(dados, idiomaAtual, traducoes);
atualizarGrafico();
