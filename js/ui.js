import { calcularSaldo, calcularDividasPendentes, marcarDividaComoPaga } from './transactions.js';

function formatarMoeda(valor) {
  return `EUR ${valor.toFixed(2)}`;
}

export function atualizarUI(dados, idiomaAtual, traducoes) {
  const t = traducoes[idiomaAtual];
  const saldoEl = document.getElementById('saldo');
  const dividasEl = document.getElementById('dividas-pendentes');

  saldoEl.textContent = `${t.saldo}: ${formatarMoeda(calcularSaldo(dados))}`;
  dividasEl.textContent = `${t.dividasPendentes}: ${formatarMoeda(calcularDividasPendentes(dados))}`;

  const historicoEl = document.getElementById('historico-lista');
  historicoEl.innerHTML = '';

  if (dados.length === 0) {
    const vazio = document.createElement('li');
    vazio.className = 'historico-vazio';
    vazio.textContent = t.historicoVazio;
    historicoEl.appendChild(vazio);
    return;
  }

  dados.forEach((item, index) => {
    const li = document.createElement('li');
    li.classList.add(item.tipo);

    const nomeTipo = item.tipo === 'entrada'
      ? t.entrada
      : item.tipo === 'saida'
        ? t.saida
        : t.divida;

    const texto = document.createElement('span');
    texto.textContent = `${nomeTipo} - ${formatarMoeda(item.valor)} - ${item.descricao}`;
    li.appendChild(texto);

    if (item.tipo === 'divida' && !item.paga) {
      const btnPagar = document.createElement('button');
      btnPagar.type = 'button';
      btnPagar.textContent = t.marcarPaga;
      btnPagar.classList.add('botao-pagar');

      btnPagar.addEventListener('click', () => {
        if (confirm(t.confirmarPagamento)) {
          marcarDividaComoPaga(item);
          localStorage.setItem('dados', JSON.stringify(dados));
          atualizarUI(dados, idiomaAtual, traducoes);
        }
      });

      li.appendChild(btnPagar);
    }

    const btnDel = document.createElement('button');
    btnDel.type = 'button';
    btnDel.textContent = t.apagar;
    btnDel.classList.add('botao-apagar');

    btnDel.addEventListener('click', () => {
      if (confirm(t.confirmarApagar)) {
        dados.splice(index, 1);
        localStorage.setItem('dados', JSON.stringify(dados));
        atualizarUI(dados, idiomaAtual, traducoes);
      }
    });

    li.appendChild(btnDel);
    historicoEl.appendChild(li);
  });
}
