import { carregarDados, salvarDados, carregarIdioma, salvarIdioma } from './storage.js';
import { criarTransacao } from './transactions.js';
import { atualizarUI } from './ui.js';
import { traducoes } from './i18n.js';

// ===== Dados e idioma =====
let dados = carregarDados();
let idiomaAtual = carregarIdioma();
let versaoPro = localStorage.getItem("versaoPro") === "true";

// ===== Interface idioma =====
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

// ===== Limite FREE =====
function checarLimiteFree() {
  if (!versaoPro && dados.length >= 30) {
    alert("Has alcanzado el límite de la versión gratuita (30 movimientos).");
    return false;
  }
  return true;
}

// ===== Adicionar transação =====
function adicionarTransacaoSegura(tipo, valor, descricao) {
  if (!checarLimiteFree()) return false;

  const nova = criarTransacao(tipo, valor, descricao);
  dados.push(nova);
  salvarDados(dados);

  atualizarUI(dados, idiomaAtual, traducoes);
  atualizarGrafico();
}

// ===== Botão adicionar =====
document.getElementById('btn-adicionar').addEventListener('click', () => {
  const tipo = document.getElementById('tipo').value;
  const valor = parseFloat(document.getElementById('valor').value);
  const descricao = document.getElementById('descricao').value;

  if (!valor || !descricao) {
    alert(traducoes[idiomaAtual].alertaValor);
    return;
  }

  adicionarTransacaoSegura(tipo, valor, descricao);

  document.getElementById('valor').value = '';
  document.getElementById('descricao').value = '';
});

// ===== PRO por código =====
const CODIGO_PRO = "4321";

const btnUpgrade = document.getElementById('btn-upgrade-pro');
if (btnUpgrade) {
  btnUpgrade.addEventListener('click', () => {
    const codigo = prompt("Digite o código PRO:");

    if (!codigo) return;

    if (codigo === CODIGO_PRO) {
      localStorage.setItem("versaoPro", "true");
      versaoPro = true;

      alert("🎉 Versión PRO activada");
      atualizarUI(dados, idiomaAtual, traducoes);
      atualizarGrafico();
    } else {
      alert("❌ Código incorrecto");
    }
  });
}

// ===== Troca idioma =====
document.querySelectorAll('[data-idioma]').forEach(btn => {
  btn.addEventListener('click', () => {

    idiomaAtual = btn.dataset.idioma;
    salvarIdioma(idiomaAtual);

    // atualizar todos textos
    atualizarInterfaceIdioma();
    atualizarUI(dados, idiomaAtual, traducoes);
    atualizarGrafico();

    // força atualizar toda tela
    setTimeout(() => {
      atualizarInterfaceIdioma();
      atualizarUI(dados, idiomaAtual, traducoes);
      atualizarGrafico();
    }, 50);

  });
});


// ===== Backup =====
document.getElementById('btn-exportar')?.addEventListener('click', () => {
  if (!versaoPro) {
    alert("Disponible solo en versión PRO");
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
    alert("Disponible solo en versión PRO");
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
      alert("Error al importar archivo");
    }
  };
  reader.readAsText(file);
});

// ===== Gráfico =====
let grafico;

function atualizarGrafico() {
  if (!versaoPro) return;

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

// ===== Inicialização =====
atualizarInterfaceIdioma();
atualizarUI(dados, idiomaAtual, traducoes);
atualizarGrafico();

