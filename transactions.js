// transactions.js

// ===== Criar transação =====
export function criarTransacao(tipo, valor, descricao) {
  const transacao = {
    tipo,
    valor,
    descricao,
    data: new Date().toISOString(),
  };

  // Se for divida, adiciona a propriedade paga
  if (tipo === 'divida') {
    transacao.paga = false; // evita undefined
  }

  return transacao;
}

// ===== Marcar divida como paga =====
export function marcarDividaComoPaga(transacao) {
  if (transacao.tipo === 'divida') {
    transacao.paga = true;
  }
}

// ===== Calcular saldo =====
export function calcularSaldo(dados) {
  let saldo = 0;
  dados.forEach(d => {
    if (d.tipo === 'entrada') saldo += d.valor;
    if (d.tipo === 'saida') saldo -= d.valor;
    if (d.tipo === 'divida' && d.paga) saldo += d.valor; // só entra se a dívida foi paga
  });
  return saldo;
}

// ===== Calcular valores a receber =====
export function calcularDividasPendentes(dados) {
  return dados
    .filter(d => d.tipo === 'divida' && !d.paga) // só dívidas não pagas
    .reduce((sum, d) => sum + d.valor, 0);
}
