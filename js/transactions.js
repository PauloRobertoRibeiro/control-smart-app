export function criarTransacao(tipo, valor, descricao) {
  const transacao = {
    tipo,
    valor,
    descricao,
    data: new Date().toISOString(),
  };

  if (tipo === 'divida') {
    transacao.paga = false;
  }

  return transacao;
}

export function marcarDividaComoPaga(transacao) {
  if (transacao.tipo === 'divida') {
    transacao.paga = true;
  }
}

export function calcularSaldo(dados) {
  let saldo = 0;
  dados.forEach(d => {
    if (d.tipo === 'entrada') saldo += d.valor;
    if (d.tipo === 'saida') saldo -= d.valor;
    if (d.tipo === 'divida' && d.paga) saldo += d.valor;
  });
  return saldo;
}

export function calcularDividasPendentes(dados) {
  return dados
    .filter(d => d.tipo === 'divida' && !d.paga)
    .reduce((sum, d) => sum + d.valor, 0);
}
