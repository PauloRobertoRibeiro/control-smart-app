import { carregarDados, salvarDados, carregarIdioma, salvarIdioma } from './storage.js';
import { criarTransacao } from './transactions.js';
import { atualizarUI } from './ui.js';
import { traducoes } from './i18n.js';

let dados = carregarDados();
let idiomaAtual = carregarIdioma();

function texto(chave) {
  return traducoes[idiomaAtual][chave];
}

function atualizarInterfaceIdioma() {
  document.documentElement.lang = idiomaAtual;
  document.getElementById('valor').placeholder = texto('placeholderValor');
  document.getElementById('descricao').placeholder = texto('placeholderDescricao');

  const selectTipo = document.getElementById('tipo');
  selectTipo.options[0].text = texto('entrada');
  selectTipo.options[1].text = texto('saida');
  selectTipo.options[2].text = texto('divida');

  document.getElementById('btn-adicionar').textContent = texto('adicionar');
  document.getElementById('historico-titulo').textContent = texto('historico');
  document.getElementById('frase-app').textContent = texto('frase');
  document.getElementById('btn-exportar').textContent = texto('exportar');
  document.getElementById('btn-importar').textContent = texto('importar');
}

function adicionarTransacaoSegura(tipo, valor, descricao) {
  const nova = criarTransacao(tipo, valor, descricao);
  dados.push(nova);
  salvarDados(dados);
  atualizarTudo();
}

document.getElementById('btn-adicionar').addEventListener('click', () => {
  const tipo = document.getElementById('tipo').value;
  const valor = Number.parseFloat(document.getElementById('valor').value);
  const descricao = document.getElementById('descricao').value.trim();

  if (!Number.isFinite(valor) || valor <= 0 || !descricao) {
    alert(texto('alertaValor'));
    return;
  }

  adicionarTransacaoSegura(tipo, valor, descricao);

  document.getElementById('valor').value = '';
  document.getElementById('descricao').value = '';
  document.getElementById('descricao').focus();
});

document.querySelectorAll('[data-idioma]').forEach(btn => {
  btn.addEventListener('click', () => {
    idiomaAtual = btn.dataset.idioma;
    salvarIdioma(idiomaAtual);
    atualizarTudo();
  });
});

document.getElementById('btn-exportar').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'backup-control-smart.json';
  a.click();

  URL.revokeObjectURL(url);
});

const inputImportar = document.getElementById('input-importar');
document.getElementById('btn-importar').addEventListener('click', () => {
  inputImportar.click();
});

inputImportar.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const dadosImportados = JSON.parse(e.target.result);
      if (!Array.isArray(dadosImportados)) throw new Error('Invalid backup');

      const dadosValidos = dadosImportados.every(item =>
        item &&
        ['entrada', 'saida', 'divida'].includes(item.tipo) &&
        Number.isFinite(Number(item.valor)) &&
        typeof item.descricao === 'string'
      );

      if (!dadosValidos) throw new Error('Invalid backup data');
      if (!confirm(texto('confirmarImportar'))) return;

      dados = dadosImportados.map(item => ({
        ...item,
        valor: Number(item.valor),
        descricao: item.descricao.trim(),
        data: item.data || new Date().toISOString(),
        ...(item.tipo === 'divida' ? { paga: Boolean(item.paga) } : {})
      }));

      salvarDados(dados);
      atualizarTudo();
    } catch {
      alert(texto('erroImportar'));
    } finally {
      inputImportar.value = '';
    }
  };
  reader.readAsText(file);
});

function desenharGrafico() {
  const canvas = document.getElementById('graficoFinanceiro');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 34;

  const valores = [
    {
      label: texto('entrada'),
      valor: dados.filter(d => d.tipo === 'entrada').reduce((s, d) => s + d.valor, 0),
      cor: '#4caf50'
    },
    {
      label: texto('saida'),
      valor: dados.filter(d => d.tipo === 'saida').reduce((s, d) => s + d.valor, 0),
      cor: '#f44336'
    },
    {
      label: texto('pagamentoDivida'),
      valor: dados.filter(d => d.tipo === 'divida' && d.paga).reduce((s, d) => s + d.valor, 0),
      cor: '#2196f3'
    }
  ];

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#27293d';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#ffffff';
  ctx.font = '14px Segoe UI, sans-serif';

  const max = Math.max(...valores.map(item => item.valor), 1);
  const barWidth = 70;
  const gap = (width - padding * 2 - barWidth * valores.length) / (valores.length - 1);
  const chartHeight = height - 90;

  valores.forEach((item, index) => {
    const x = padding + index * (barWidth + gap);
    const barHeight = Math.round((item.valor / max) * chartHeight);
    const y = height - 48 - barHeight;

    ctx.fillStyle = item.cor;
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(item.label, x + barWidth / 2, height - 24);
    ctx.fillText(`EUR ${item.valor.toFixed(2)}`, x + barWidth / 2, Math.max(18, y - 8));
  });
}

function atualizarTudo() {
  atualizarInterfaceIdioma();
  atualizarUI(dados, idiomaAtual, traducoes);
  desenharGrafico();
}

atualizarTudo();
