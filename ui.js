// ui.js
import { calcularSaldo, calcularDividasPendentes, marcarDividaComoPaga } from './transactions.js';

export function atualizarUI(dados, idiomaAtual, traducoes) {

  // ===== Atualiza saldo e valores a receber =====
  const saldoEl = document.getElementById('saldo');
  const dividasEl = document.getElementById('dividas-pendentes');

  saldoEl.textContent = `${traducoes[idiomaAtual].saldo}: €${calcularSaldo(dados).toFixed(2)}`;
  dividasEl.textContent = `${traducoes[idiomaAtual].dividasPendentes}: €${calcularDividasPendentes(dados).toFixed(2)}`;

  // ===== Atualiza histórico =====
  const historicoEl = document.getElementById('historico-lista');
  historicoEl.innerHTML = '';

  dados.forEach((t, index) => {
    const li = document.createElement('li');

    let texto = `${t.tipo === 'entrada' ? traducoes[idiomaAtual].entrada
               : t.tipo === 'saida' ? traducoes[idiomaAtual].saida
               : traducoes[idiomaAtual].divida} - €${t.valor.toFixed(2)} - ${t.descricao}`;

    li.textContent = texto;

    // ===== Se for dívida pendente =====
    if (t.tipo === 'divida' && !t.paga) {
      const btnPagar = document.createElement('button');
      btnPagar.textContent = traducoes[idiomaAtual].marcarPaga;
      btnPagar.classList.add("botao-pagar");

      btnPagar.addEventListener('click', () => {
        if (confirm("Confirmar pagamento?")) {
          marcarDividaComoPaga(t);
          localStorage.setItem('dados', JSON.stringify(dados));
          atualizarUI(dados, idiomaAtual, traducoes);
        }
      });

      li.appendChild(btnPagar);
    }

    // ===== Botão apagar =====
    const btnDel = document.createElement('button');
    btnDel.textContent = traducoes[idiomaAtual].apagar;
    btnDel.classList.add("botao-apagar");

    btnDel.addEventListener('click', () => {
      if (confirm(traducoes[idiomaAtual].confirmarApagar)) {
        dados.splice(index, 1);
        localStorage.setItem('dados', JSON.stringify(dados));
        atualizarUI(dados, idiomaAtual, traducoes);
      }
    });

    li.appendChild(btnDel);
    historicoEl.appendChild(li);
  });
}


// ===== Limpar histórico total =====
function limparHistorico() {
  if (confirm("Deseja realmente limpar todo o histórico?")) {
    localStorage.removeItem('dados');
    location.reload();
  }
}

window.limparHistorico = limparHistorico;
