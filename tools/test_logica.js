/* =====================================================================
   PÔQUER DO CAOS — Testes automatizados da lógica pura (Node.js)
   Executar com:  node tools/test_logica.js
   ===================================================================== */
'use strict';

const L = require('../app/logica.js');

let passou = 0;
let falhou = 0;
const falhas = [];

function verificar(nome, condicao, detalhe) {
  if (condicao) {
    passou++;
  } else {
    falhou++;
    falhas.push(nome + (detalhe ? ' => ' + detalhe : ''));
  }
}

function carta(idx, naipeIdx, melhorada) {
  // Monta uma carta com base na marca de referência (idx 0..12, naipe 0..3)
  return {
    id: naipeIdx * 13 + idx,
    naipeIdx, naipe: L.NAIPES[naipeIdx].nome, simbolo: L.NAIPES[naipeIdx].simbolo,
    corNaipe: L.NAIPES[naipeIdx].cor,
    idx, rango: L.RANGOS[idx].rango, valor: L.RANGOS[idx].valor,
    melhorada: melhorada || null
  };
}

function baralhoLimpo() {
  // Baralho completo sem embaralhar, para testes previsíveis
  return L.criarBaralho(false);
}

/* ------------------------------------------------------------------
   TESTE 1 — Baralho
   ------------------------------------------------------------------ */
(function testarBaralho() {
  const b = baralhoLimpo();
  verificar('Baralho tem 104 cartas (2 baralhos)', b.length === 104, 'tamanho=' + b.length);
  const idUnico = new Set(b.map(c => c.id));
  verificar('Todas as cartas têm ID único', idUnico.size === 104);

  const v = L.comprar(b, 8);
  verificar('Comprar 8 cartas do topo do baralho', v.length === 8);
  verificar('Baralho ficou com 96 cartas', b.length === 96, 'tamanho=' + b.length);
})();

/* ------------------------------------------------------------------
   TESTE 2 — Avaliador de mãos
   ------------------------------------------------------------------ */
(function testarAvaliador() {
  // Par de 9 (idx 7)
  let mao = L.avaliarMao([carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 0)]);
  verificar('Par detectado', mao.clave === 'par', mao.clave);

  // Dois Pares (7 e 3)
  mao = L.avaliarMao([carta(7, 0), carta(7, 1), carta(3, 2), carta(3, 3), carta(5, 0)]);
  verificar('Dois Pares detectado', mao.clave === 'doblesPares', mao.clave);

  // Trinca de 10 (idx 8)
  mao = L.avaliarMao([carta(8, 0), carta(8, 1), carta(8, 2), carta(2, 3), carta(5, 0)]);
  verificar('Trinca detectada', mao.clave === 'trinca', mao.clave);

  // Quadra de 4 (idx 2)
  mao = L.avaliarMao([carta(2, 0), carta(2, 1), carta(2, 2), carta(2, 3), carta(5, 0)]);
  verificar('Quadra detectada', mao.clave === 'quadra', mao.clave);

  // Full House (trinca 8 + par 3)
  mao = L.avaliarMao([carta(8, 0), carta(8, 1), carta(8, 2), carta(3, 3), carta(3, 0)]);
  verificar('Full House detectado', mao.clave === 'fullHouse', mao.clave);

  // Sequência 8-9-10-J-Q
  mao = L.avaliarMao([carta(5, 0), carta(6, 1), carta(7, 2), carta(8, 3), carta(9, 0)]);
  verificar('Sequência detectada', mao.clave === 'escalera', mao.clave);

  // Sequência com Ás baixo (A-2-3-4-5)
  mao = L.avaliarMao([carta(12, 0), carta(0, 1), carta(1, 2), carta(2, 3), carta(3, 0)]);
  verificar('Sequência com Ás baixo', mao.clave === 'escalera', mao.clave);

  // Cor (Flush) 5 de Paus (naipe 3)
  mao = L.avaliarMao([carta(0, 3), carta(2, 3), carta(5, 3), carta(8, 3), carta(11, 3)]);
  verificar('Cor (Flush) detectada', mao.clave === 'cor', mao.clave);

  // Sequência de Cor (5-6-7-8-9 de Treboles)
  mao = L.avaliarMao([carta(3, 0), carta(4, 0), carta(5, 0), carta(6, 0), carta(7, 0)]);
  verificar('Sequência de Cor detectada', mao.clave === 'escaleraDeCor', mao.clave);

  // Escalera Real (10-J-Q-K-A de Paus)
  mao = L.avaliarMao([carta(8, 3), carta(9, 3), carta(10, 3), carta(11, 3), carta(12, 3)]);
  verificar('Escalera Real detectada', mao.clave === 'escaleraReal', mao.clave);

  // Carta Alta
  mao = L.avaliarMao([carta(1, 0), carta(4, 1), carta(7, 2), carta(10, 3), carta(12, 0)]);
  verificar('Carta Alta (sem combinação)', mao.clave === 'cartaAlta', mao.clave);

  // Com 2 cartas: par
  mao = L.avaliarMao([carta(5, 0), carta(5, 1)]);
  verificar('Par com 2 cartas', mao.clave === 'par', mao.clave);

  // Com 2 cartas diferentes: carta alta
  mao = L.avaliarMao([carta(5, 0), carta(6, 1)]);
  verificar('2 cartas diferentes = Carta Alta', mao.clave === 'cartaAlta', mao.clave);

  // Sequência com 3 cartas (5-6-7)
  mao = L.avaliarMao([carta(3, 0), carta(4, 1), carta(5, 2)]);
  verificar('Sequência com 3 cartas (5-6-7)', mao.clave === 'escalera', mao.clave);

  // Sequência com 4 cartas (9-10-J-Q)
  mao = L.avaliarMao([carta(7, 0), carta(8, 1), carta(9, 2), carta(10, 3)]);
  verificar('Sequência com 4 cartas (9-J-Q)', mao.clave === 'escalera', mao.clave);

  // Sequência de Cor com 3 cartas (5-6-7 de Paus)
  mao = L.avaliarMao([carta(3, 3), carta(4, 3), carta(5, 3)]);
  verificar('Sequência de Cor com 3 cartas', mao.clave === 'escaleraDeCor', mao.clave);

  // Cor (Flush) com 3 cartas
  mao = L.avaliarMao([carta(0, 2), carta(4, 2), carta(9, 2)]);
  verificar('Cor com 3 cartas', mao.clave === 'cor', mao.clave);

  // Quase sequência (5-6-8): NÃO é sequência
  mao = L.avaliarMao([carta(3, 0), carta(4, 1), carta(6, 2)]);
  verificar('5-6-8 NÃO é sequência', mao.clave !== 'escalera', mao.clave);

  // Royal Flush e carta duplicada (v0.4.2)
  mao = L.avaliarMao([carta(8, 0), carta(9, 0), carta(10, 0), carta(11, 0), carta(12, 0)]);
  verificar('Royal Flush reconhecido', mao.clave === 'escaleraReal', mao.clave);
  mao = L.avaliarMao([carta(3, 1), carta(4, 1), carta(5, 1), carta(6, 1), carta(7, 1)]);
  verificar('Sequência de Cor com 5 cartas', mao.clave === 'escaleraDeCor', mao.clave);
  mao = L.avaliarMao([carta(8, 2), carta(8, 2), carta(9, 2), carta(10, 2), carta(11, 2)]);
  verificar('Carta duplicada impede Royal (fica Cor)', mao.clave === 'cor', mao.clave);
})();

/* ------------------------------------------------------------------
   TESTE 3 — Pontuação básica
   ------------------------------------------------------------------ */
(function testarPontuacao() {
  // Par de 9 (idx 7): fichas base 40, cartas 9+9+7+4+2 = 31... valores: 9,9,2,10,5 = 35
  const cartas = [carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 0)];
  const r = L.calcularPuntaje({ cartas: cartas, coringas: [], niveis: L.NIVEIS_MANO, rng: () => 0.5 });
  verificar('Par: 40 fichas base + 39 das cartas', r.fichasTotal === 79, 'fichasTotal=' + r.fichasTotal);
  verificar('Par: ×2 mult', r.multTotal === 2, 'mult=' + r.multTotal);
  verificar('Par: 79 × 2 = 158 pontos', r.puntaje === 158, 'puntaje=' + r.puntaje);

  // Nível 2 do Par: fichas 60, mult 4, cartas 35 → (60+35)*4 = 380
  const niveis = Object.assign({}, L.NIVEIS_MANO, { par: 2 });
  const r2 = L.calcularPuntaje({ cartas: cartas, coringas: [], niveis: niveis, rng: () => 0.5 });
  verificar('Par nível 2: (60+39)×4 = 396', r2.puntaje === 396, 'puntaje=' + r2.puntaje);
})();
/* ------------------------------------------------------------------
   TESTE 4 — Coringas
   ------------------------------------------------------------------ */
(function testarCoringas() {
  // Carnavalesco: par de 9 vermelho? usar cartas vermelhas (naipe 1=copas,2=ouros)
  const coringasCarnaval = [L.CORINGAS.find(c => c.tipo === 'multPorCartasVermelhas')];
  // 3 vermelhas (Copas=1, Ouros=2)
  const cartasVermelhas = [carta(7, 1), carta(7, 2), carta(3, 1), carta(10, 0), carta(5, 3)];
  const r = L.calcularPuntaje({ cartas: cartasVermelhas, coringas: coringasCarnaval, niveis: L.NIVEIS_MANO, rng: () => 0.5 });
  // mult = 2 (par) + 3 vermelhas*2 = 8
  verificar('Carnavalesco: mult +3 (3 vermelhas ×1)', r.multTotal === 5, 'mult=' + r.multTotal);

  // Feijoada: +35 fichas com 5 cartas
  const coringasFeijoada = [L.CORINGAS.find(c => c.tipo === 'fichasSeCincoCartas')];
  const r2 = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 0)], coringas: coringasFeijoada, niveis: L.NIVEIS_MANO, rng: () => 0.5 });
  verificar('Feijoada: +50 fichas com 5 cartas', r2.fichasExtra === 50, 'extra=' + r2.fichasExtra);

  // Futebola: +60 fichas com exatamente 3 cartas
  const coringasFutebol = [L.CORINGAS.find(c => c.tipo === 'fichasSeTresCartas')];
  const r3 = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(7, 2)], coringas: coringasFutebol, niveis: L.NIVEIS_MANO, rng: () => 0.5 });
  verificar('Futebola: +45 fichas com 3 cartas', r3.fichasExtra === 45, 'extra=' + r3.fichasExtra);

  // Loteria: rng 0.1 (menor que 0.15) → triplica
  const coringaLoteria = [L.CORINGAS.find(c => c.tipo === 'chanceTriplicarOuDividir')];
  const r4 = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 0)], coringas: coringaLoteria, niveis: L.NIVEIS_MANO, rng: () => 0.1 });
  verificar('Loteria (rng 0.1): pontos triplicados', r4.triplicar === true && r4.puntaje === 474, 'puntaje=' + r4.puntaje);

  // Loteria: rng 0.2 (entre 0.15 e 0.30) → divide por 2
  const r4b = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 0)], coringas: coringaLoteria, niveis: L.NIVEIS_MANO, rng: () => 0.2 });
  verificar('Loteria (rng 0.2): pontos divididos por 2', r4b.dividir === true && r4b.puntaje === 79, 'puntaje=' + r4b.puntaje);

  // Samba: +5 mult se Cor → mult = 5+5 = 10
  const coringasSamba = [L.CORINGAS.find(c => c.tipo === 'multSeCorOuSequencia')];
  const r5 = L.calcularPuntaje({ cartas: [carta(0, 3), carta(2, 3), carta(5, 3), carta(8, 3), carta(11, 3)], coringas: coringasSamba, niveis: L.NIVEIS_MANO, rng: () => 0.5 });
  verificar('Samba: +4 mult na Cor', r5.multTotal === 9, 'mult=' + r5.multTotal);

  // Maracatu: +10 mult fixa
  const coringasMaracatu = [L.CORINGAS.find(c => c.tipo === 'multMasDanoDescarte')];
  const r6 = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 0)], coringas: coringasMaracatu, niveis: L.NIVEIS_MANO, rng: () => 0.5 });
  verificar('Maracatu: +5 mult fixa', r6.multTotal === 7, 'mult=' + r6.multTotal);
})();

/* ------------------------------------------------------------------
   TESTE 5 — Regras dos chefões
   ------------------------------------------------------------------ */
(function testarChefes() {
  // figurasDobradas: Rei vale 20 em vez de 10
  const cartas = [carta(11, 0), carta(11, 1), carta(4, 2), carta(5, 3), carta(8, 0)]; // K, K, 6, 7, 10
  const r = L.calcularPuntaje({ cartas, coringas: [], niveis: L.NIVEIS_MANO, reglaId: 'figurasDobradas', rng: () => 0.5 });
  // fichasCartas = 20+20+6+7+10 = 63; par fichas 40 → 103; ×2 = 206
  verificar('Galinha: figuras dobram (K=20)', r.fichasCartas === 63, 'fichasCartas=' + r.fichasCartas);

  // semCor: Cor vira Carta Alta
  const cor = [carta(0, 3), carta(2, 3), carta(5, 3), carta(8, 3), carta(11, 3)]; // flush de Paus
  const r2 = L.calcularPuntaje({ cartas: cor, coringas: [], niveis: L.NIVEIS_MANO, reglaId: 'semCor', rng: () => 0.5 });
  verificar('Baralho Sujo: Cor vira Carta Alta (1×)', r2.mao.clave === 'cartaAlta' && r2.multTotal === 1, 'mao=' + r2.mao.clave);

  // todasDez: valor = 10 por carta
  const r3 = L.calcularPuntaje({ cartas: [carta(12, 0), carta(12, 1), carta(4, 2), carta(5, 3), carta(8, 0)], coringas: [], niveis: L.NIVEIS_MANO, reglaId: 'todasDez', rng: () => 0.5 });
  verificar('Fera: todas as cartas valem 10', r3.fichasCartas === 50, 'fichasCartas=' + r3.fichasCartas);

  // multAleatorio: rng 0.5 → bonus = 0.5 + 0.5*2.5 = 1.75
  const r4 = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 0)], coringas: [], niveis: L.NIVEIS_MANO, reglaId: 'multAleatorio', rng: () => 0.5 });
  // 79 × 2 × 1.75 = 276.5 → 277
  verificar('Deus do Caos: ×1.75 (rng 0.5)', r4.bonusFinal === 1.75, 'bonus=' + r4.bonusFinal);
  verificar('Deus do Caos: 277 pontos', r4.puntaje === 277, 'puntaje=' + r4.puntaje);
})();

/* ------------------------------------------------------------------
   TESTE 6 — Ato 2: raros, Zorra, Fantasma, juros, linha do tempo
   ------------------------------------------------------------------ */
(function testarAto2() {
  // 3 Coringas raros (só entram na loja com o desbloqueio "Colecionador")
  const raros = L.CORINGAS.filter(c => c.raro);
  verificar('3 Coringas raros marcados', raros.length === 3, 'raros=' + raros.length);
  verificar('Raros são Feira, Zorra e Fantasma',
    raros.map(c => c.id).sort().join(',') === 'fantasma,feira,zorra', raros.map(c => c.id).join(','));

  // Feira Noturna: +4 ×mult com 4 naipes (par de 7 → 2 + 4 = 6)
  const coringaFeira = [L.CORINGAS.find(c => c.tipo === 'multSeQuatroNaipes')];
  const rf = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 0)],
    coringas: coringaFeira, niveis: L.NIVEIS_MANO, rng: () => 0.5 });
  verificar('Feira: +4 ×mult (4 naipes)', rf.multTotal === 6, 'mult=' + rf.multTotal);

  // Zorra Total: ×3 em Sequência (100 + 7+8+9+10+10 = 144 → ×4 ×3 = 1728)
  const coringaZorra = [L.CORINGAS.find(c => c.tipo === 'zorraPorQualidade')];
  const rz = L.calcularPuntaje({ cartas: [carta(5, 0), carta(6, 1), carta(7, 2), carta(8, 3), carta(9, 0)],
    coringas: coringaZorra, niveis: L.NIVEIS_MANO, rng: () => 0.5 });
  verificar('Zorra: ×3 na Sequência', rz.bonusFinal === 3 && rz.puntaje === 1728,
    'bonus=' + rz.bonusFinal + ' pontos=' + rz.puntaje);

  // Zorra Total: ×0,5 no Par (79 ×2 ×0,5 = 79)
  const rz2 = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 0)],
    coringas: coringaZorra, niveis: L.NIVEIS_MANO, rng: () => 0.5 });
  verificar('Zorra: ×0,5 no Par', rz2.puntaje === 79, 'pontos=' + rz2.puntaje);

  // Amigo Fantasma: rng 0,2 dispara (+2 ×mult → 79 ×4 = 316); rng 0,8 não dispara
  const coringaFantasma = [L.CORINGAS.find(c => c.tipo === 'chanceMult')];
  const rfa1 = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 0)],
    coringas: coringaFantasma, niveis: L.NIVEIS_MANO, rng: () => 0.2 });
  verificar('Fantasma (rng 0,2): +2 ×mult', rfa1.multTotal === 4 && rfa1.puntaje === 316, 'mult=' + rfa1.multTotal);
  const rfa2 = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 0)],
    coringas: coringaFantasma, niveis: L.NIVEIS_MANO, rng: () => 0.8 });
  verificar('Fantasma (rng 0,8): nada acontece', rfa2.multTotal === 2 && rfa2.puntaje === 158, 'mult=' + rfa2.multTotal);

  // Tio Patinhas agora é 'dinheiroPorChefao' (pago na vitória, não por mão)
  const tio = L.CORINGAS.find(c => c.id === 'tioPatinhas');
  verificar('Tio Patinhas: $2 por chefão', tio.tipo === 'dinheiroPorChefao' && tio.valor === 2,
    tio.tipo + '=' + tio.valor);

  // Juros do caixa
  verificar('Juros: R$55 com teto 5 = R$5', L.calcularJuros(55, 5) === 5, '' + L.calcularJuros(55, 5));
  verificar('Juros: R$23 com teto 5 = R$2', L.calcularJuros(23, 5) === 2, '' + L.calcularJuros(23, 5));
  verificar('Juros: R$95 com teto 8 = R$8', L.calcularJuros(95, 8) === 8, '' + L.calcularJuros(95, 8));
  verificar('Juros: R$9 = R$0', L.calcularJuros(9, 5) === 0, '' + L.calcularJuros(9, 5));

  // Linha do tempo (pasos): mão + 1 passo por carta + total
  const rp = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2)],
    coringas: [], niveis: L.NIVEIS_MANO, rng: () => 0.5 });
  verificar('Pasos: mão + cartas + total', rp.pasos.length === 5, 'pasos=' + rp.pasos.length);
  verificar('Pasos: primeiro é a mão', rp.pasos[0].tipo === 'mao', rp.pasos[0].tipo);
  verificar('Pasos: último é o total', rp.pasos[rp.pasos.length - 1].tipo === 'total',
    rp.pasos[rp.pasos.length - 1].tipo);
  verificar('Pasos: total casa com a pontuação', rp.pasos[rp.pasos.length - 1].pontos === rp.puntaje);

  // Bônus de Loteria via desbloqueio "Sorte Grande" (15% + 10% = 25%)
  const coringaLoteria2 = [L.CORINGAS.find(c => c.tipo === 'chanceTriplicarOuDividir')];
  const rl = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 0)],
    coringas: coringaLoteria2, niveis: L.NIVEIS_MANO, rng: () => 0.20, bonusLoteria: 0.10 });
  verificar('Loteria com Sorte Grande (rng 0,20 < 0,25): triplica', rl.triplicar === true);

  /* --- Coringas com trade-off (Ato 3) --- */
  // Cassino: ×2 mult (2→4) mas custoDinheiro 2 → 79 ×4 = 316
  const coringaCassino = [L.CORINGAS.find(c => c.tipo === 'multDobroMasCustaDinheiro')];
  const rc = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 0)],
    coringas: coringaCassino, niveis: L.NIVEIS_MANO, rng: () => 0.5 });
  verificar('Cassino: ×2 mult', rc.multTotal === 4, 'mult=' + rc.multTotal);
  verificar('Cassino: custo $2', rc.custoDinheiro === 2, 'custo=' + rc.custoDinheiro);
  verificar('Cassino: 316 pontos', rc.puntaje === 316, 'puntaje=' + rc.puntaje);

  // Vidente: +60 fichas extras (79 + 60 = 139 ×2 = 278)
  const coringaVidente = [L.CORINGAS.find(c => c.tipo === 'fichasMasMenosDescarte')];
  const rv = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 0)],
    coringas: coringaVidente, niveis: L.NIVEIS_MANO, rng: () => 0.5 });
  verificar('Vidente: +60 fichas extras', rv.fichasExtra === 60, 'extra=' + rv.fichasExtra);
  verificar('Vidente: 278 pontos', rv.puntaje === 278, 'puntaje=' + rv.puntaje);

  // Juiz: +8 ×mult em mão fraca (Par: 2+8 = 10 → 79 ×10 = 790)
  const coringaJuiz = [L.CORINGAS.find(c => c.tipo === 'multSeFracaSenaoPenaliza')];
  const rj = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 0)],
    coringas: coringaJuiz, niveis: L.NIVEIS_MANO, rng: () => 0.5 });
  verificar('Juiz: +8 ×mult em Par (mão fraca)', rj.multTotal === 10, 'mult=' + rj.multTotal);

  // Juiz: -4 ×mult em Sequência (mult 4-4 = 0 → 0 pontos)
  const rj2 = L.calcularPuntaje({ cartas: [carta(5, 0), carta(6, 1), carta(7, 2), carta(8, 3), carta(9, 0)],
    coringas: coringaJuiz, niveis: L.NIVEIS_MANO, rng: () => 0.5 });
  verificar('Juiz: -4 ×mult em Sequência (mult 0)', rj2.multTotal === 0 && rj2.puntaje === 0,
    'mult=' + rj2.multTotal);

  // Bomba: rng 0.1 → +100 fichas (79+100 = 179 ×2 = 358)
  const coringaBomba = [L.CORINGAS.find(c => c.tipo === 'chanceFichasOuPerdeDinheiro')];
  const rb = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 0)],
    coringas: coringaBomba, niveis: L.NIVEIS_MANO, rng: () => 0.1 });
  verificar('Bomba (rng 0.1): +100 fichas', rb.fichasExtra === 100 && rb.puntaje === 358,
    'puntaje=' + rb.puntaje);

  // Bomba: rng 0.4 → custo $5
  const rb2 = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 0)],
    coringas: coringaBomba, niveis: L.NIVEIS_MANO, rng: () => 0.4 });
  verificar('Bomba (rng 0.4): -$5', rb2.custoDinheiro === 5 && rb2.puntaje === 158,
    'custo=' + rb2.custoDinheiro);

  // Bomba: rng 0.8 → nada acontece
  const rb3 = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 0)],
    coringas: coringaBomba, niveis: L.NIVEIS_MANO, rng: () => 0.8 });
  verificar('Bomba (rng 0.8): nada', rb3.puntaje === 158, 'puntaje=' + rb3.puntaje);

  /* --- Coringas build-around (Ato 4, estilo Balatro) --- */
  // Cartomante: +1 ×mult por chefão vencido (ronda 4 → 4 chefões vencidos: 2+4 = 6)
  const coringaCartomante = [L.CORINGAS.find(c => c.tipo === 'multPorChefaoVencido')];
  const rcm = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 0)],
    coringas: coringaCartomante, niveis: L.NIVEIS_MANO, rng: () => 0.5, chefesVencidos: 4 });
  verificar('Cartomante: +4 ×mult (4 chefões vencidos)', rcm.multTotal === 6, 'mult=' + rcm.multTotal);
  // Sem chefões vencidos: nada
  const rcm0 = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 0)],
    coringas: coringaCartomante, niveis: L.NIVEIS_MANO, rng: () => 0.5, chefesVencidos: 0 });
  verificar('Cartomante (0 vencidos): nada', rcm0.multTotal === 2, 'mult=' + rcm0.multTotal);

  // Enxame: +2 ×mult com todas do mesmo naipe (2 cartas de Treboles: Carta Alta 1 + 2 = 3)
  const coringaEnxame = [L.CORINGAS.find(c => c.tipo === 'multSeMesmoNaipe')];
  const re = L.calcularPuntaje({ cartas: [carta(5, 0), carta(7, 0)],
    coringas: coringaEnxame, niveis: L.NIVEIS_MANO, rng: () => 0.5 });
  verificar('Enxame: +2 ×mult (naipe único)', re.multTotal === 3, 'mult=' + re.multTotal);
  // Naipes mistos: nada
  const re2 = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 0)],
    coringas: coringaEnxame, niveis: L.NIVEIS_MANO, rng: () => 0.5 });
  verificar('Enxame (naipes mistos): nada', re2.multTotal === 2, 'mult=' + re2.multTotal);

  // Farejador: +40 fichas por ♠ (2 espadas naipe 3: 79 + 80 = 159 ×2 = 318)
  const coringaFarejador = [L.CORINGAS.find(c => c.tipo === 'fichasPorEspadas')];
  const rfj = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2), carta(10, 3), carta(5, 3)],
    coringas: coringaFarejador, niveis: L.NIVEIS_MANO, rng: () => 0.5 });
  verificar('Farejador: +80 fichas (2× ♠)', rfj.fichasExtra === 80 && rfj.puntaje === 318,
    'extra=' + rfj.fichasExtra);

  // Bibliotecário: +3 ×mult com exatamente 2 cartas (par: (40+18)×5 = 290)
  const coringaBibliotecario = [L.CORINGAS.find(c => c.tipo === 'multSeDuasCartas')];
  const rbl = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1)],
    coringas: coringaBibliotecario, niveis: L.NIVEIS_MANO, rng: () => 0.5 });
  verificar('Bibliotecário: +3 ×mult (2 cartas)', rbl.multTotal === 5 && rbl.puntaje === 290,
    'mult=' + rbl.multTotal + ' pontos=' + rbl.puntaje);
  // Com 3 cartas: nada (par: mult 2)
  const rbl2 = L.calcularPuntaje({ cartas: [carta(7, 0), carta(7, 1), carta(2, 2)],
    coringas: coringaBibliotecario, niveis: L.NIVEIS_MANO, rng: () => 0.5 });
  verificar('Bibliotecário (3 cartas): nada', rbl2.multTotal === 2, 'mult=' + rbl2.multTotal);

  // Coringas cheat definidos (5) e marcados
  const cheats = L.CORINGAS.filter(c => c.cheat);
  verificar('4 Coringas cheat definidos', cheats.length === 4, 'cheats=' + cheats.length);
  verificar('Cheats: Determinação, Karma, Temmie, Muffet (O Vazio removido)',
    cheats.map(c => c.id).sort().join(',') === 'determinacao,karma,muffet,temmie',
    cheats.map(c => c.id).join(','));

  // Desbloqueios definidos (7), alvos novos e falas completas
  verificar('7 desbloqueios definidos', L.DESBLOQUEIOS.length === 7, '' + L.DESBLOQUEIOS.length);
  verificar('Alvos escalando: 300..150000',
    L.JEFES.map(j => j.alvo).join(',') === '300,900,2500,6500,12000,22000,55000,150000',
    L.JEFES.map(j => j.alvo).join(','));
  verificar('Custo de nível progressivo', L.custoNivel(0) === 2 && L.custoNivel(2) === 3 &&
    L.custoNivel(6) === 5 && L.custoNivel(10) === 7,
    'n0=' + L.custoNivel(0) + ' n2=' + L.custoNivel(2) + ' n6=' + L.custoNivel(6) + ' n10=' + L.custoNivel(10));
  verificar('Chefões têm falas',
    L.JEFES.every(j => j.falas && j.falas.entrada && j.falas.meio && j.falas.vitoria && j.falas.derrota));
})();

/* ------------------------------------------------------------------
   RESUMO
   ------------------------------------------------------------------ */
console.log(`\n=== RESULTADO DOS TESTES ===`);
console.log(`✔ Passaram: ${passou}`);
console.log(`✘ Falharam: ${falhou}`);
if (falhas.length) {
  console.log('\nFalhas:');
  falhas.forEach(f => console.log('  - ' + f));
  process.exit(1);
} else {
  console.log('\nTodos os testes passaram! 🎉');
}