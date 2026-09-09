/* =====================================================================
   PÔQUER DO CAOS — Módulo de lógica pura (baralho, mãos, coringas, chefões)
   Este arquivo funciona no navegador (via <script>) e no Node.js (via
   require/module.exports) para permitir testes automatizados.
   ===================================================================== */

(function (global) {
  'use strict';

  /* ------------------------------------------------------------------
     1. CONFIGURAÇÃO BÁSICA: naipes, rangos e tipos de mão
     ------------------------------------------------------------------ */
  const NAIPES = [
    { nome: 'Treboles', simbolo: '♣', cor: 'preto' },
    { nome: 'Ouros',    simbolo: '♦', cor: 'vermelho' },
    { nome: 'Copas',    simbolo: '♥', cor: 'vermelho' },
    { nome: 'Espadas',  simbolo: '♠', cor: 'preto' }
  ];

  // idx 0..12  =>  valor para pontuação (Ás = 11, figuras = 10)
  const RANGOS = [
    { rango: '2',  valor: 2  }, { rango: '3',  valor: 3  },
    { rango: '4',  valor: 4  }, { rango: '5',  valor: 5  },
    { rango: '6',  valor: 6  }, { rango: '7',  valor: 7  },
    { rango: '8',  valor: 8  }, { rango: '9',  valor: 9  },
    { rango: '10', valor: 10 }, { rango: 'J',  valor: 10 },
    { rango: 'Q',  valor: 10 }, { rango: 'K',  valor: 10 },
    { rango: 'A',  valor: 11 }
  ];

  const MANOS = {
    cartaAlta:     { clave: 'cartaAlta',     nombre: 'Carta Alta',       fichas: 20,  mult: 1  },
    par:           { clave: 'par',           nombre: 'Par',              fichas: 40,  mult: 2  },
    doblesPares:   { clave: 'doblesPares',   nombre: 'Dois Pares',       fichas: 60,  mult: 2  },
    trinca:        { clave: 'trinca',        nombre: 'Trinca',           fichas: 80,  mult: 3  },
    escalera:      { clave: 'escalera',      nombre: 'Sequência',        fichas: 100, mult: 4  },
    cor:           { clave: 'cor',           nombre: 'Cor (Flush)',      fichas: 110, mult: 5  },
    fullHouse:     { clave: 'fullHouse',     nombre: 'Full House',       fichas: 130, mult: 5  },
    quadra:        { clave: 'quadra',        nombre: 'Quadra',           fichas: 180, mult: 8  },
    escaleraDeCor: { clave: 'escaleraDeCor', nombre: 'Sequência de Cor', fichas: 200, mult: 10 },
    escaleraReal:  { clave: 'escaleraReal',  nombre: 'Royal Flush',     fichas: 260, mult: 12 }
  };

  const NIVEIS_MANO = Object.keys(MANOS).reduce(function (acc, k) {
    acc[k] = 0; // nível começa em 0
    return acc;
  }, {});

  /* ------------------------------------------------------------------
     2. BARALHO
     ------------------------------------------------------------------ */
  function criarBaralho(embaralhado) {
    const baralho = [];
    for (let copia = 0; copia < 2; copia++) {
      for (let n = 0; n < NAIPES.length; n++) {
        for (let r = 0; r < RANGOS.length; r++) {
          baralho.push({
            id: copia * 52 + n * 13 + r,
            naipeIdx: n,
            naipe: NAIPES[n].nome,
            simbolo: NAIPES[n].simbolo,
            corNaipe: NAIPES[n].cor,
            idx: r,
            rango: RANGOS[r].rango,
            valor: RANGOS[r].valor,
            melhorada: null // 'ouro' | 'fogo' | 'bionica' | 'espelho'
          });
        }
      }
    }
    if (embaralhado) embaralhar(baralho);
    return baralho;
  }

  function embaralhar(array, rng) {
    const r = rng || Math.random;
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const tmp = array[i];
      array[i] = array[j];
      array[j] = tmp;
    }
    return array;
  }

  function comprar(baralho, quantidade) {
    const cartas = [];
    for (let i = 0; i < quantidade && baralho.length; i++) {
      cartas.push(baralho.pop());
    }
    return cartas;
  }
/* ------------------------------------------------------------------
     3. AVALIADOR DE MÃOS DE PÔQUER
     ------------------------------------------------------------------ */
  function contarPor(objs, chave) {
    const mapa = {};
    for (const o of objs) {
      const k = o[chave];
      mapa[k] = (mapa[k] || 0) + 1;
    }
    return mapa;
  }

  function esEscalera(indices) {
    if (indices.length !== 5) return false;
    const ordenados = indices.slice().sort(function (a, b) { return a - b; });
    // A baixa: A,2,3,4,5 => [0,1,2,3,12]
    if (ordenados[0] === 0 && ordenados[1] === 1 && ordenados[2] === 2 &&
        ordenados[3] === 3 && ordenados[4] === 12) {
      return true;
    }
    for (let i = 1; i < 5; i++) {
      if (ordenados[i] !== ordenados[i - 1] + 1) return false;
    }
    return true;
  }

  function avaliarMao(cartas) {
    const n = cartas.length;
    if (n < 2) return MANOS.cartaAlta;

    const porRango = contarPor(cartas, 'rango');
    const valores = Object.keys(porRango).map(function (k) { return porRango[k]; });
    const maxIguales = Math.max.apply(null, valores);
    const naipes = Object.keys(contarPor(cartas, 'naipe')).length;
    const mismoNaipe = naipes === 1;
    const indices = cartas.map(function (c) { return c.idx; });
    const esSeq = esEscalera(indices);

    if (n === 5) {
      const royal = esSeq && mismoNaipe &&
        [8, 9, 10, 11, 12].indexOf(indices[0]) !== -1 &&
        [8, 9, 10, 11, 12].indexOf(indices[1]) !== -1 &&
        [8, 9, 10, 11, 12].indexOf(indices[2]) !== -1 &&
        [8, 9, 10, 11, 12].indexOf(indices[3]) !== -1 &&
        [8, 9, 10, 11, 12].indexOf(indices[4]) !== -1;
      if (royal) return MANOS.escaleraReal;
      if (esSeq && mismoNaipe) return MANOS.escaleraDeCor;
      if (mismoNaipe) return MANOS.cor;
      if (esSeq) return MANOS.escalera;
      if (maxIguales === 4) return MANOS.quadra;
      if (maxIguales === 3 && valores.length === 2) return MANOS.fullHouse;
      if (maxIguales === 3) return MANOS.trinca;
      const pares = valores.filter(function (v) { return v === 2; }).length;
      if (pares === 2) return MANOS.doblesPares;
      if (pares === 1) return MANOS.par;
      return MANOS.cartaAlta;
    }
    if (n === 4) {
      if (maxIguales === 4) return MANOS.quadra;
      if (maxIguales === 3) return MANOS.trinca;
      const pares4 = valores.filter(function (v) { return v === 2; }).length;
      if (pares4 === 2) return MANOS.doblesPares;
      if (pares4 === 1) return MANOS.par;
      return MANOS.cartaAlta;
    }
    if (n === 3) {
      if (maxIguales === 3) return MANOS.trinca;
      if (valores.filter(function (v) { return v === 2; }).length === 1) return MANOS.par;
      return MANOS.cartaAlta;
    }
    if (n === 2) {
      if (valores.filter(function (v) { return v === 2; }).length === 1) return MANOS.par;
      return MANOS.cartaAlta;
    }
    return MANOS.cartaAlta;
  }
/* ------------------------------------------------------------------
     4. CORINGAS (efeitos caóticos) e CARTAS MELHORADAS
     ------------------------------------------------------------------ */
  const CORINGAS = [
    { id: 'carnaval',    nome: 'Coringa Carnavalesco', icone: '🎭', preco: 6,  tipo: 'multPorCartasVermelhas', valor: 2,
      desc: '+2 ×mult por cada carta vermelha (♦♥) jogada.' },
    { id: 'feijoada',    nome: 'Coringa da Feijoada',   icone: '🍲', preco: 6,  tipo: 'fichasSeCincoCartas', valor: 35,
      desc: '+35 fichas se você jogar 5 cartas.' },
    { id: 'samba',       nome: 'Coringa do Samba',      icone: '🥁', preco: 7,  tipo: 'multSeCorOuSequencia', valor: 5,
      desc: '+5 ×mult se a mão for Cor ou Sequência.' },
    { id: 'loteria',     nome: 'Coringa Loteria',       icone: '🎟️', preco: 8,  tipo: 'chanceTriplicar', valor: 0.25,
      desc: '25% de chance de TRIPLICAR a pontuação da mão.' },
    { id: 'onca',        nome: 'Coringa Onça Pintada',  icone: '🐆', preco: 7,  tipo: 'multSeTresNaipes', valor: 6,
      desc: '+6 ×mult se a mão tiver 3 ou mais naipes diferentes.' },
    { id: 'futebol',     nome: 'Coringa Futebola',      icone: '⚽', preco: 5,  tipo: 'fichasSeTresCartas', valor: 60,
      desc: '+60 fichas se você jogar exatamente 3 cartas.' },
    { id: 'tioPatinhas', nome: 'Coringa Tio Patinhas',  icone: '💰', preco: 5,  tipo: 'dinheiroPorMao', valor: 1,
      desc: '+$1 por mão jogada (dinheiro instantâneo).' },
    { id: 'caipirinha',  nome: 'Coringa Caipirinha',    icone: '🍹', preco: 4,  tipo: 'dinheiroPorBlindEMenosMult', valor: 1,
      desc: '+$3 por chefão vencido, mas -1 ×mult em todas as mãos.' },
    { id: 'maracatu',    nome: 'Coringa Maracatu',      icone: '🥁', preco: 6,  tipo: 'multMasDanoDescarte', valor: 10,
      desc: '+10 ×mult, mas -$1 por descarte usado.' },
    { id: 'capivara',    nome: 'Coringa Capivara Zen',  icone: '🦫', preco: 8,  tipo: 'maoExtra', valor: 1,
      desc: '+1 mão extra por chefão (blind).' },
    { id: 'bicho',       nome: 'Coringa Jogo do Bicho', icone: '🐛', preco: 7,  tipo: 'cartaAleatoriaDobrada', valor: 0,
      desc: '1 carta aleatória da mão vale dobro (×2).' },
    { id: 'cafe',        nome: 'Coringa Cafézinho',     icone: '☕', preco: 5,  tipo: 'descarteExtra', valor: 2,
      desc: '+2 descartes por chefão (blind).' },
    { id: 'meteoro',     nome: 'Coringa Meteoro',       icone: '☄️', preco: 6,  tipo: 'multSeComecaComPaus', valor: 4,
      desc: '+4 ×mult se a mão começar com Espadas (♠).' }
  ];

  const CARTAS_MELHORADAS = [
    { id: 'ouro',    nome: 'Carta de Ouro',   icone: '🪙', preco: 3,
      bonusFichas: 30, bonusMult: 0, desc: 'Vale +30 fichas e gera +$1 quando jogada.' },
    { id: 'fogo',    nome: 'Carta de Fogo',   icone: '🔥', preco: 3,
      bonusFichas: 45, bonusMult: 0, desc: 'Vale +45 fichas.' },
    { id: 'bionica', nome: 'Carta Biônica',   icone: '⚙️', preco: 5,
      bonusFichas: 0,  bonusMult: 4, desc: 'Adiciona +4 ×mult quando jogada.' },
    { id: 'espelho', nome: 'Carta Espelho',   icone: '🪞', preco: 5,
      bonusFichas: 0,  bonusMult: 0, desc: 'Dobra o efeito do 1º coringa na mão.' }
  ];

  // Dinheiro ganado por vencer cada chefão (índice = chefão - 1)
  const PREMIO_POR_JEFE = [3, 4, 6, 8, 10, 12, 15, 25];

  /* ------------------------------------------------------------------
     5. CHEFÕES (blinds) — 8 desafios com regras caóticas
     ------------------------------------------------------------------ */
  const JEFES = [
    { id: 1,  nome: 'Zé do Controle',     icone: '🧢', alvo: 300,   reglaId: null,
      regla: 'Regra normal. Aproveite para aprender.' },
    { id: 2,  nome: 'Galinha dos Ovos',   icone: '🐔', alvo: 700,   reglaId: 'figurasDobradas',
      regla: 'Figuras (J, Q, K, A) valem o dobro em fichas.' },
    { id: 3,  nome: 'Baralho Sujo',       icone: '🃏', alvo: 1200,  reglaId: 'semCor',
      regla: 'A Cor (Flush) NÃO vale como Cor nesta batalha.' },
    { id: 4,  nome: 'Mão de Gato',        icone: '🐱', alvo: 2000,  reglaId: 'descarteCaro',
      regla: 'Cada descarte custa $1 (de seu dinheiro).' },
    { id: 5,  nome: 'Dona Astúcia',       icone: '🎭', alvo: 3200,  reglaId: 'menosMaos',
      regla: 'Você só tem 3 mãos neste chefão.' },
    { id: 6,  nome: 'Capivara Relâmpago', icone: '⚡', alvo: 5000,  reglaId: 'sequenciaPotente',
      regla: 'As Sequências valem ×1,5 nesta batalha.' },
    { id: 7,  nome: 'A Fera do Caos',     icone: '👹', alvo: 8000,  reglaId: 'todasDez',
      regla: 'TODAS as cartas valem 10 fichas (ignora melhorias).' },
    { id: 8,  nome: 'DEUS DO CAOS',       icone: '🌀', alvo: 15000, reglaId: 'multAleatorio',
      regla: 'Cada mão recebe um multiplicador aleatório entre ×0,5 e ×3.' }
  ];
/* ------------------------------------------------------------------
     6. PONTUAÇÃO DE UMA MÃO (núcleo do jogo)
     ------------------------------------------------------------------ */
  /*
     contexto:
       cartas:   array de cartas jogadas
       coringas: array de objetos CORINGAS que o jogador possui
       reglaId:  regra do chefão (ou null)
       niveis:   objeto com níveis das mãos
       ronda:    número do chefão (1..8)
       rng:      função aleatória (padrão Math.random)
   */
  function calcularPuntaje(ctx) {
    const rng = ctx.rng || Math.random;
    const cartas = ctx.cartas;
    let mao = ctx.mao || avaliarMao(cartas);
    const coringas = ctx.coringas || [];
    const reglaId = ctx.reglaId || null;
    const niveis = ctx.niveis || Object.assign({}, NIVEIS_MANO);

    // Regra do Baralho Sujo: Cor não conta como Cor
    if (reglaId === 'semCor' && mao.clave === 'cor') {
      mao = MANOS.cartaAlta;
    }

    const nivel = niveis[mao.clave] || 0;
    let fichas = mao.fichas + nivel * 10;
    let mult = mao.mult + nivel;
    let fichasCartas = 0;

    // --- valor base de cada carta (com regras do chefão) ---
    for (let i = 0; i < cartas.length; i++) {
      const c = cartas[i];
      let valor = c.valor;

      if (reglaId === 'figurasDobradas' && ['J', 'Q', 'K', 'A'].indexOf(c.rango) !== -1) {
        valor *= 2;
      }
      if (reglaId === 'todasDez') {
        valor = 10;
      }
      if (reglaId === 'sequenciaPotente' &&
          (mao.clave === 'escalera' || mao.clave === 'escaleraDeCor' || mao.clave === 'escaleraReal')) {
        valor = Math.round(valor * 1.5);
      }

      // A Fera do Caos ignora as cartas melhoradas
      const melhoriasAtivas = reglaId !== 'todasDez';
      if (melhoriasAtivas && c.melhorada === 'ouro') {
        fichasCartas += valor + 30;
      } else if (melhoriasAtivas && c.melhorada === 'fogo') {
        fichasCartas += valor + 45;
      } else {
        fichasCartas += valor;
      }
    }

    const mensajes = [];
    let fichasExtra = 0;
    let dinheiroEncontrado = 0;
    let triplicar = false;
// --- efeitos dos coringas ---
    for (const cj of coringas) {
      switch (cj.tipo) {
        case 'multPorCartasVermelhas': {
          const qtd = cartas.filter(c => c.corNaipe === 'vermelho').length;
          if (qtd) {
            mult += qtd * cj.valor;
            mensajes.push(`🎭 Carnavalesco: +${qtd * cj.valor} ×mult`);
          }
          break;
        }
        case 'fichasSeCincoCartas':
          if (cartas.length === 5) {
            fichasExtra += cj.valor;
            mensajes.push('🍲 Feijoada: +35 fichas');
          }
          break;
        case 'fichasSeTresCartas':
          if (cartas.length === 3) {
            fichasExtra += cj.valor;
            mensajes.push('⚽ Futebola: +60 fichas');
          }
          break;
        case 'multSeCorOuSequencia':
          if (mao.clave === 'cor' || mao.clave === 'escalera' ||
              mao.clave === 'escaleraDeCor' || mao.clave === 'escaleraReal') {
            mult += cj.valor;
            mensajes.push('🥁 Samba: +5 ×mult');
          }
          break;
        case 'multSeTresNaipes': {
          const naipes = {};
          cartas.forEach(c => { naipes[c.naipe] = true; });
          if (Object.keys(naipes).length >= 3) {
            mult += cj.valor;
            mensajes.push('🐆 Onça: +6 ×mult (3+ naipes)');
          }
          break;
        }
        case 'multSeComecaComPaus':
          if (cartas.length && cartas[0].simbolo === '♠') {
            mult += cj.valor;
            mensajes.push('☄️ Meteoro: +4 ×mult (começa com ♠)');
          }
          break;
        case 'multMasDanoDescarte':
          mult += cj.valor;
          mensajes.push('🥁 Maracatu: +10 ×mult');
          break;
        case 'dinheiroPorBlindEMenosMult':
          mult -= 1;
          mensajes.push('🍹 Caipirinha: -1 ×mult');
          break;
        case 'dinheiroPorMao':
          dinheiroEncontrado += cj.valor;
          mensajes.push('💰 Tio Patinhas: +$1');
          break;
        case 'cartaAleatoriaDobrada': {
          const i = Math.floor(rng() * cartas.length);
          fichasCartas += cartas[i].valor;
          mensajes.push(`🐛 Jogo do Bicho: ${cartas[i].rango}${cartas[i].simbolo} valeu dobro`);
          break;
        }
        case 'chanceTriplicar':
          if (rng() < cj.valor) {
            triplicar = true;
            mensajes.push('🎟️ LOTERIA! Pontos serão TRIPLICADOS!');
          }
          break;
      }
    }
// --- mult extra de cartas melhoradas (Biônica, Espelho, Ouro) ---
    let multMelhoradas = 0;
    if (reglaId !== 'todasDez') {
      cartas.forEach(c => {
        if (c.melhorada === 'bionica') multMelhoradas += 4;
        if (c.melhorada === 'ouro') dinheiroEncontrado += 1;
        if (c.melhorada === 'espelho' && coringas.length) {
          const p = coringas[0];
          if (p.tipo === 'multMasDanoDescarte') multMelhoradas += 10;
          if (p.tipo === 'multSeCorOuSequencia' &&
              (mao.clave.indexOf('cor') !== -1 || mao.clave.indexOf('escalera') !== -1)) {
            multMelhoradas += 5;
          }
          if (p.tipo === 'dinheiroPorBlindEMenosMult') multMelhoradas -= 1;
        }
      });
    }
    if (multMelhoradas) {
      mult += multMelhoradas;
      mensajes.push(`⚙️ Melhorias: +${multMelhoradas} ×mult`);
    }

    // --- regra DEUS DO CAOS: multiplicador aleatório final ---
    let bonusFinal = 1;
    if (reglaId === 'multAleatorio') {
      bonusFinal = 0.5 + rng() * 2.5;
      mensajes.push(`🌀 Deus do Caos: ×${bonusFinal.toFixed(2)} aleatório`);
    }

    const fichasTotal = fichas + fichasCartas + fichasExtra;
    const multTotal = Math.max(mult, 0);
    let puntaje = Math.round(fichasTotal * multTotal * bonusFinal);
    if (triplicar) puntaje *= 3;

    return {
      mao,
      fichasBase: fichas,
      fichasCartas: fichasCartas,
      fichasExtra: fichasExtra,
      fichasTotal: fichasTotal,
      multBase: mult,
      multTotal: multTotal,
      bonusFinal: bonusFinal,
      puntaje: puntaje,
      nivel: nivel,
      triplicar: triplicar,
      dinheiroEncontrado: dinheiroEncontrado,
      mensajes: mensajes
    };
  }
/* ------------------------------------------------------------------
     7. ROLETA DO CAOS (sorteio pós-vitória)
     ------------------------------------------------------------------ */
  const ROLETA = [
    { id: 'dinheiroExtra',  nome: '+$8 de bonificação',                icone: '💰' },
    { id: 'maoExtra',       nome: '+1 mão no próximo chefão',          icone: '🃏' },
    { id: 'coringaGratis',  nome: 'Coringa aleatório GRÁTIS',          icone: '🎁' },
    { id: 'pontosDobrados', nome: 'Pontuação dobra no próximo chefão', icone: '🔥' },
    { id: 'ofertasOuro',    nome: 'Carta de Ouro grátis na loja',      icone: '🪙' },
    { id: 'nada',           nome: 'O caos não te deu nada...',         icone: '🌪️' }
  ];

  /* ------------------------------------------------------------------
     EXPORTAÇÃO (navegador + Node)
     ------------------------------------------------------------------ */
  const API = {
    NAIPES, RANGOS, MANOS, NIVEIS_MANO,
    CORINGAS, CARTAS_MELHORADAS, JEFES, ROLETA,
    PREMIO_POR_JEFE,
    criarBaralho, embaralhar, comprar,
    contarPor, esEscalera, avaliarMao,
    calcularPuntaje
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
  } else {
    global.LOGICA = API;
  }
})(typeof window !== 'undefined' ? window : globalThis);