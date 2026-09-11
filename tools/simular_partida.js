/* =====================================================================
   PÔQUER DO CAOS — Simulador de partidas (Monte Carlo)
   Uma "IA" que joga partidas completas escolhendo sempre a melhor mano
   possível, para validar o balance do jogo.

   Executar com:  node tools/simular_partida.js [nº_de_partidas]
   ===================================================================== */
'use strict';

const L = require('../app/logica.js');

const NUM_PARTIDAS = process.argv[2] ? parseInt(process.argv[2], 10) : 200;

/* ---------- utilidades de combinaciones ---------- */
function combinaciones(arr, k) {
  const resultado = [];
  const n = arr.length;
  function recursiva(inicio, atual) {
    if (atual.length === k) { resultado.push(atual.slice()); return; }
    for (let i = inicio; i < n; i++) {
      atual.push(arr[i]);
      recursiva(i + 1, atual);
      atual.pop();
    }
  }
  recursiva(0, []);
  return resultado;
}

function melhorMano(manoJuego, coringas, reglaId, niveis, ronda) {
  let melhor = null;
  for (let k = 2; k <= 5; k++) {
    combinaciones(manoJuego, k).forEach(function (cartas) {
      const res = L.calcularPuntaje({
        cartas, coringas, reglaId, niveis, ronda, rng: Math.random
      });
      if (!melhor || res.puntaje > melhor.puntaje) {
        res.idCartas = cartas.map(c => c.id);
        melhor = res;
      }
    });
  }
  return melhor;
}

/* ---------- simulação de uma partida ---------- */
function jogarPartida() {
  let dinheiro = 6;
  let nivelMano = JSON.parse(JSON.stringify(L.NIVEIS_MANO));
  let coringas = [];
  let bonus = { maoExtra: 0, pontosDobrados: 1 };

  for (let ronda = 0; ronda < L.JEFES.length; ronda++) {
    const jefe = L.JEFES[ronda];
    const baralho = L.criarBaralho(true);
    let manoJuego = L.comprar(baralho, 8);
    let manos = (jefe.reglaId === 'menosMaos' ? 3 : 4) + bonus.maoExtra;
    if (coringas.some(c => c.tipo === 'maoExtra')) manos += 1;
    let descartes = 3 + (coringas.some(c => c.tipo === 'descarteExtra') ? 1 : 0);
    let pontos = 0;
    bonus.maoExtra = 0;

    while (manos > 0 && pontos < jefe.alvo) {
      const melhor = melhorMano(manoJuego, coringas, jefe.reglaId, nivelMano, ronda + 1);
      if (!melhor) break;

      let p = melhor.puntaje;
      if (bonus.pontosDobrados > 1) p *= 2;
      pontos += p;
      nivelMano[melhor.mao.clave] = (nivelMano[melhor.mao.clave] || 0) + 1;
      dinheiro += melhor.dinheiroEncontrado;

      manoJuego = manoJuego.filter(c => melhor.idCartas.indexOf(c.id) === -1);
      manoJuego = manoJuego.concat(L.comprar(baralho, melhor.idCartas.length));
      manos--;
    }

    if (pontos < jefe.alvo) {
      return { vitoria: false, ronda: ronda + 1, pontosTotales: 0, dinheiro: dinheiro };
    }

    // Ganó el blind: prêmio + roleta (aleatória) + compras simples
    let premio = L.PREMIO_POR_JEFE[ronda];
    if (coringas.some(c => c.tipo === 'dinheiroPorBlindEMenosMult')) premio += 3;
    premio += coringas.filter(c => c.tipo === 'dinheiroPorChefao').length * 2; // Tio Patinhas
    dinheiro += premio;
    dinheiro += Math.min(4, Math.floor(dinheiro / 10)); // juros do caixa

    const roleta = Math.floor(Math.random() * L.ROLETA.length);
    const efeito = L.ROLETA[roleta].id;
    if (efeito === 'dinheiroExtra') dinheiro += 8;
    if (efeito === 'maoExtra') bonus.maoExtra += 1;
    if (efeito === 'pontosDobrados') bonus.pontosDobrados = 2;
    if (efeito === 'coringaGratis' && coringas.length < 4) {
      const pool = L.CORINGAS.filter(c => !c.raro);
      coringas.push(Object.assign({}, pool[Math.floor(Math.random() * pool.length)]));
    }

    // Loja: comprar coringas acessibles até encher os 4 slots
    const ofertas = L.CORINGAS.filter(c => !c.raro).slice();
    let comprados = 0;
    while (comprados < 3 && coringas.length < 4 && ofertas.length) {
      // maior valor de coringa que podemos pagar? compra o 1º aleatório acessible menor que dinheiro
      const i = Math.floor(Math.random() * ofertas.length);
      const oferta = ofertas.splice(i, 1)[0];
      if (oferta.preco <= dinheiro && coringas.filter(c => c.id === oferta.id).length === 0) {
        dinheiro -= oferta.preco;
        coringas.push(Object.assign({}, oferta));
        comprados++;
      }
    }
    // Melhora a mão mais usada com o que sobrar (custo progressivo)
    let melhorClave = 'par';
    let maxNivel = -1;
    Object.keys(nivelMano).forEach(clave => {
      if (nivelMano[clave] > maxNivel) { maxNivel = nivelMano[clave]; melhorClave = clave; }
    });
    while (dinheiro >= L.custoNivel(nivelMano[melhorClave])) {
      dinheiro -= L.custoNivel(nivelMano[melhorClave]);
      nivelMano[melhorClave]++;
    }
  }

  return { vitoria: true, ronda: 8, pontosTotales: 0, dinheiro: dinheiro };
}

/* ---------- corrida de simulação ---------- */
let vitorias = 0;
const rondasMax = [];
let partidasGanadas = 0;

for (let i = 0; i < NUM_PARTIDAS; i++) {
  const resultado = jogarPartida();
  if (resultado.vitoria) vitorias++;
  rondasMax.push(resultado.ronda);
}

const prom = rondasMax.reduce((a, b) => a + b, 0) / rondasMax.length;
console.log('=== SIMULADOR DE PARTIDAS (Monte Carlo) ===');
console.log('Partidas: ' + NUM_PARTIDAS);
console.log('Vitorias (vencer os 8 chefões): ' + vitorias + ' (' + Math.round(vitorias * 100 / NUM_PARTIDAS) + '%)');
console.log('Chefão máximo alcanzado (media): ' + (prom.toFixed(2)));
const dist = {};
rondasMax.forEach(r => { dist[r] = (dist[r] || 0) + 1; });
console.log(Object.keys(dist).sort((a, b) => a - b).map(k => '  chefão ' + k + ': ' + dist[k]).join('\n'));