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
    { id: 'carnaval',    nome: 'Coringa Carnavalesco', icone: '🎭', preco: 5,  tipo: 'multPorCartasVermelhas', valor: 1,
      desc: '+1 ×mult por cada carta vermelha (♦♥) jogada.' },
    { id: 'feijoada',    nome: 'Coringa da Feijoada',   icone: '🍲', preco: 6,  tipo: 'fichasSeCincoCartas', valor: 50,
      desc: '+50 fichas se você jogar 5 cartas.' },
    { id: 'samba',       nome: 'Coringa do Samba',      icone: '🥁', preco: 7,  tipo: 'multSeCorOuSequencia', valor: 4,
      desc: '+4 ×mult se a mão for Cor ou Sequência.' },
    { id: 'loteria',     nome: 'Coringa Loteria',       icone: '🎟️', preco: 8,  tipo: 'chanceTriplicar', valor: 0.15,
      desc: '15% de chance de TRIPLICAR a pontuação da mão.' },
    { id: 'onca',        nome: 'Coringa Onça Pintada',  icone: '🐆', preco: 7,  tipo: 'multSeTresNaipes', valor: 4,
      desc: '+4 ×mult se a mão tiver 3 ou mais naipes diferentes.' },
    { id: 'futebol',     nome: 'Coringa Futebola',      icone: '⚽', preco: 5,  tipo: 'fichasSeTresCartas', valor: 45,
      desc: '+45 fichas se você jogar exatamente 3 cartas.' },
    { id: 'tioPatinhas', nome: 'Coringa Tio Patinhas',  icone: '💰', preco: 7,  tipo: 'dinheiroPorChefao', valor: 2,
      desc: '+$2 de bonificação por chefão vencido.' },
    { id: 'caipirinha',  nome: 'Coringa Caipirinha',    icone: '🍹', preco: 4,  tipo: 'dinheiroPorBlindEMenosMult', valor: 1,
      desc: '+$3 por chefão vencido, mas -1 ×mult em todas as mãos.' },
    { id: 'maracatu',    nome: 'Coringa Maracatu',      icone: '🥁', preco: 6,  tipo: 'multMasDanoDescarte', valor: 5,
      desc: '+5 ×mult, mas -$1 por descarte usado.' },
    { id: 'capivara',    nome: 'Coringa Capivara Zen',  icone: '🦫', preco: 9,  tipo: 'maoExtra', valor: 1,
      desc: '+1 mão extra por chefão (blind).' },
    { id: 'bicho',       nome: 'Coringa Jogo do Bicho', icone: '🐛', preco: 7,  tipo: 'cartaAleatoriaDobrada', valor: 0,
      desc: '1 carta aleatória da mão vale dobro (×2).' },
    { id: 'cafe',        nome: 'Coringa Cafézinho',     icone: '☕', preco: 3,  tipo: 'descarteExtra', valor: 1,
      desc: '+1 descarte por chefão (blind).' },
    { id: 'meteoro',     nome: 'Coringa Meteoro',       icone: '☄️', preco: 6,  tipo: 'multSeComecaComPaus', valor: 3,
      desc: '+3 ×mult se a mão começar com Espadas (♠).' },
    { id: 'feira',       nome: 'Coringa Feira Noturna', icone: '🏮', preco: 9,  tipo: 'multSeQuatroNaipes', valor: 4, raro: true,
      desc: '+4 ×mult se a mão tiver 4 naipes diferentes.' },
    { id: 'zorra',       nome: 'Coringa Zorra Total',   icone: '🎲', preco: 7,  tipo: 'zorraPorQualidade', valor: 0, raro: true,
      desc: '×0,5 em Par/Carta Alta; ×3 em Sequência ou melhor.' },
    { id: 'fantasma',    nome: 'Coringa Amigo Fantasma',icone: '👻', preco: 6,  tipo: 'chanceMult', valor: 2, raro: true,
      desc: '50% de chance de +2 ×mult por mão.' }
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
  const PREMIO_POR_JEFE = [3, 3, 4, 5, 7, 9, 12, 15];

  /* ------------------------------------------------------------------
     5. CHEFÕES (blinds) — 8 desafios com regras caóticas
     ------------------------------------------------------------------ */
  const JEFES = [
    { id: 1,  nome: 'Zé do Controle',     icone: '🧢', alvo: 300,   reglaId: null,
      regla: 'Regra normal. Aproveite para aprender.',
      falas: { entrada: 'Bem-vindo ao boteco, novato. Aqui o barato sai caro.',
               meio: 'Opa... tá quase, hein? Vou simular o juiz.',
               vitoria: 'Fala baixo que o dono não pode saber...',
               derrota: 'Volta quando aprender a contar, moleque.' } },
    { id: 2,  nome: 'Galinha dos Ovos',   icone: '🐔', alvo: 900,   reglaId: 'figurasDobradas',
      regla: 'Figuras (J, Q, K, A) valem o dobro em fichas.',
      falas: { entrada: 'Có-có! Aposto meus ovos que você NÃO passa!',
               meio: 'Có... NÃO! Meus ovinhos!',
               vitoria: 'Minhas economias... CLUCK... levaram meu ninho.',
               derrota: 'Cocoricó! Paguei pra ver!' } },
    { id: 3,  nome: 'Baralho Sujo',       icone: '🃏', alvo: 2500,  reglaId: 'semCor',
      regla: 'A Cor (Flush) NÃO vale como Cor nesta batalha.',
      falas: { entrada: 'Este baralho veio do esgoto. Cor aqui não vale nada.',
               meio: 'Guarda esse flush aí... nadinha, nadinha.',
               vitoria: 'Você trapaceou melhor que eu. Respeito.',
               derrota: 'O baralho sujo te sujou de volta.' } },
    { id: 4,  nome: 'Mão de Gato',        icone: '🐱', alvo: 6500,  reglaId: 'descarteCaro',
      regla: 'Cada descarte custa $1 (de seu dinheiro).',
      falas: { entrada: 'Miau. Cada descarte seu me deixa mais rica.',
               meio: 'Raspando o fundo do pote, eu vejo...',
               vitoria: 'Purrr... fique com as migalhas.',
               derrota: 'Miav... até o gato se arrepende.' } },
    { id: 5,  nome: 'Dona Astúcia',       icone: '🎭', alvo: 12000, reglaId: 'menosMaos',
      regla: 'Você só tem 3 mãos neste chefão.',
      falas: { entrada: 'Três mãos, querido. Eu faço minhas com menos.',
               meio: 'Meu instinto diz que você vai falhar feio.',
               vitoria: 'A máscara caiu. Nós duas sabemos quem manda.',
               derrota: 'Leve a vitória, meu anjo. A próxima é minha.' } },
    { id: 6,  nome: 'Capivara Relâmpago', icone: '⚡', alvo: 22000, reglaId: 'sequenciaPotente',
      regla: 'As Sequências valem ×1,5 nesta batalha.',
      falas: { entrada: 'Zzz... hã? Sequências aceleradas? AGORA EU ACORDEI!',
               meio: 'Bzzt! Veloz demais pra você!',
               vitoria: 'Zzz... cinco por um. Adivinha quem dorme bem.',
               derrota: 'Brrr... você é veloz, criaturinha.' } },
    { id: 7,  nome: 'A Fera do Caos',     icone: '👹', alvo: 55000, reglaId: 'todasDez',
      regla: 'TODAS as cartas valem 10 fichas (ignora melhorias).',
      falas: { entrada: 'TUDO VALE 10. SUAS JÓIAS, SUAS ESTRELAS: LIXO.',
               meio: 'AQUECENDO? EU ACABEI DE ACORDAR.',
               vitoria: 'O ABISMO DIGERIU SUA ESPERANÇA.',
               derrota: 'VOLTE QUANDO O CAOS TE CHAMAR DE AMIGO.' } },
    { id: 8,  nome: 'DEUS DO CAOS',       icone: '🌀', alvo: 150000, reglaId: 'multAleatorio',
      regla: 'Cada mão recebe um multiplicador aleatório entre ×0,5 e ×3.',
      falas: { entrada: 'Eu sou as regras que você não leu.',
               meio: 'O destino rolou os dados... você ouviu?',
               vitoria: 'Inaceitável. O caos exige recontagem.',
               derrota: 'Agora você entende: o caos não tem final feliz.' } }
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
    const pasos = []; // linha do tempo da pontuação (alimenta a animação)

    // Regra do Baralho Sujo: Cor não conta como Cor
    if (reglaId === 'semCor' && mao.clave === 'cor') {
      mao = MANOS.cartaAlta;
      pasos.push({ tipo: 'regla', texto: '🃏 Baralho Sujo: a Cor não vale como Cor!' });
    }

    const nivel = niveis[mao.clave] || 0;
    let fichas = mao.fichas + nivel * 10;
    let mult = mao.mult + nivel;
    let fichasCartas = 0;

    pasos.push({ tipo: 'mao', nombre: mao.nombre, fichas: fichas, mult: mult, nivel: nivel });

    // --- valor base de cada carta (com regras do chefão) ---
    for (let i = 0; i < cartas.length; i++) {
      const c = cartas[i];
      let valor = c.valor;
      let nota = null;

      if (reglaId === 'figurasDobradas' && ['J', 'Q', 'K', 'A'].indexOf(c.rango) !== -1) {
        valor *= 2;
        nota = '2× figura';
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
        nota = '🪙 +30 fichas';
      } else if (melhoriasAtivas && c.melhorada === 'fogo') {
        fichasCartas += valor + 45;
        nota = '🔥 +45 fichas';
      } else {
        fichasCartas += valor;
      }
      pasos.push({ tipo: 'carta', idx: i, rango: c.rango, simbolo: c.simbolo,
                   valor: valor, nota: nota });
    }

    let fichasExtra = 0;
    let dinheiroEncontrado = 0;
    let triplicar = false;
    let bonusFinal = 1;
// --- efeitos dos coringas ---
    for (const cj of coringas) {
      switch (cj.tipo) {
        case 'multPorCartasVermelhas': {
          const qtd = cartas.filter(c => c.corNaipe === 'vermelho').length;
          if (qtd) {
            mult += qtd * cj.valor;
            pasos.push({ tipo: 'coringa', icone: cj.icone, nome: 'Carnavalesco', mult: qtd * cj.valor,
                         texto: '🎭 Carnavalesco: +' + (qtd * cj.valor) + ' ×mult' });
          }
          break;
        }
        case 'fichasSeCincoCartas':
          if (cartas.length === 5) {
            fichasExtra += cj.valor;
            pasos.push({ tipo: 'coringa', icone: cj.icone, nome: 'Feijoada', fichas: cj.valor,
                         texto: '🍲 Feijoada: +' + cj.valor + ' fichas' });
          }
          break;
        case 'fichasSeTresCartas':
          if (cartas.length === 3) {
            fichasExtra += cj.valor;
            pasos.push({ tipo: 'coringa', icone: cj.icone, nome: 'Futebola', fichas: cj.valor,
                         texto: '⚽ Futebola: +' + cj.valor + ' fichas' });
          }
          break;
        case 'multSeCorOuSequencia':
          if (mao.clave === 'cor' || mao.clave === 'escalera' ||
              mao.clave === 'escaleraDeCor' || mao.clave === 'escaleraReal') {
            mult += cj.valor;
            pasos.push({ tipo: 'coringa', icone: cj.icone, nome: 'Samba', mult: cj.valor,
                         texto: '🥁 Samba: +' + cj.valor + ' ×mult' });
          }
          break;
        case 'multSeTresNaipes': {
          const naipes3 = {};
          cartas.forEach(c => { naipes3[c.naipe] = true; });
          if (Object.keys(naipes3).length >= 3) {
            mult += cj.valor;
            pasos.push({ tipo: 'coringa', icone: cj.icone, nome: 'Onça', mult: cj.valor,
                         texto: '🐆 Onça: +' + cj.valor + ' ×mult (3+ naipes)' });
          }
          break;
        }
        case 'multSeQuatroNaipes': {
          const naipes4 = {};
          cartas.forEach(c => { naipes4[c.naipe] = true; });
          if (Object.keys(naipes4).length >= 4) {
            mult += cj.valor;
            pasos.push({ tipo: 'coringa', icone: cj.icone, nome: 'Feira', mult: cj.valor,
                         texto: '🏮 Feira: +' + cj.valor + ' ×mult (4 naipes)' });
          }
          break;
        }
        case 'multSeComecaComPaus':
          if (cartas.length && cartas[0].simbolo === '♠') {
            mult += cj.valor;
            pasos.push({ tipo: 'coringa', icone: cj.icone, nome: 'Meteoro', mult: cj.valor,
                         texto: '☄️ Meteoro: +' + cj.valor + ' ×mult (começa com ♠)' });
          }
          break;
        case 'multMasDanoDescarte':
          mult += cj.valor;
          pasos.push({ tipo: 'coringa', icone: cj.icone, nome: 'Maracatu', mult: cj.valor,
                       texto: '🥁 Maracatu: +' + cj.valor + ' ×mult' });
          break;
        case 'chanceMult':
          if (rng() < 0.5) {
            mult += cj.valor;
            pasos.push({ tipo: 'coringa', icone: cj.icone, nome: 'Fantasma', mult: cj.valor,
                         texto: '👻 Amigo Fantasma: +' + cj.valor + ' ×mult' });
          } else {
            pasos.push({ tipo: 'coringa', icone: cj.icone, nome: 'Fantasma',
                         texto: '👻 Amigo Fantasma: apagou...' });
          }
          break;
        case 'zorraPorQualidade': {
          const fortes = ['escalera', 'escaleraDeCor', 'escaleraReal'];
          const fracas = ['cartaAlta', 'par', 'doblesPares'];
          let fator = 1;
          if (fortes.indexOf(mao.clave) !== -1) fator = 3;
          else if (fracas.indexOf(mao.clave) !== -1) fator = 0.5;
          if (fator !== 1) {
            bonusFinal *= fator;
            pasos.push({ tipo: 'coringa', icone: cj.icone, nome: 'Zorra', multBonus: fator,
                         texto: '🎲 Zorra Total: ×' + fator + ' na mão' });
          }
          break;
        }
        case 'dinheiroPorBlindEMenosMult':
          mult -= 1;
          pasos.push({ tipo: 'coringa', icone: cj.icone, nome: 'Caipirinha', mult: -1,
                       texto: '🍹 Caipirinha: -1 ×mult' });
          break;
        case 'cartaAleatoriaDobrada': {
          if (cartas.length) {
            const i = Math.floor(rng() * cartas.length);
            fichasCartas += cartas[i].valor;
            pasos.push({ tipo: 'coringa', icone: cj.icone, nome: 'Bicho', fichas: cartas[i].valor,
                         texto: '🐛 Jogo do Bicho: ' + cartas[i].rango + cartas[i].simbolo + ' valeu dobro' });
          }
          break;
        }
        case 'chanceTriplicar':
          if (rng() < cj.valor + (ctx.bonusLoteria || 0)) {
            triplicar = true;
            pasos.push({ tipo: 'coringa', icone: cj.icone, nome: 'Loteria',
                         texto: '🎟️ LOTERIA! Pontos serão TRIPLICADOS!' });
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
          if (p.tipo === 'multMasDanoDescarte') multMelhoradas += 5;
          if (p.tipo === 'multSeCorOuSequencia' &&
              (mao.clave.indexOf('cor') !== -1 || mao.clave.indexOf('escalera') !== -1)) {
            multMelhoradas += 4;
          }
          if (p.tipo === 'dinheiroPorBlindEMenosMult') multMelhoradas -= 1;
        }
      });
    }
    if (multMelhoradas) {
      mult += multMelhoradas;
      pasos.push({ tipo: 'melhoria', icone: '⚙️', nome: 'Melhorias', mult: multMelhoradas,
                   texto: '⚙️ Melhorias: +' + multMelhoradas + ' ×mult' });
    }

    // --- regra DEUS DO CAOS: multiplicador aleatório final ---
    if (reglaId === 'multAleatorio') {
      const fator = 0.5 + rng() * 2.5;
      bonusFinal *= fator;
      pasos.push({ tipo: 'bonus', icone: '🌀', nome: 'Deus do Caos', multBonus: fator,
                   texto: '🌀 Deus do Caos: ×' + fator.toFixed(2) + ' aleatório' });
    }

    const fichasTotal = fichas + fichasCartas + fichasExtra;
    const multTotal = Math.max(mult, 0);
    let puntaje = Math.round(fichasTotal * multTotal * bonusFinal);
    if (triplicar) puntaje *= 3;

    pasos.push({ tipo: 'total', fichas: fichasTotal, mult: multTotal, bonus: bonusFinal,
                 pontos: puntaje, triplicar: triplicar });

    const mensajes = pasos.filter(function (p) { return p.texto; })
                          .map(function (p) { return p.texto; });

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
      mensajes: mensajes,
      pasos: pasos
    };
  }
/* ------------------------------------------------------------------
     7. ROLETA DO CAOS (sorteio pós-vitória)
     ------------------------------------------------------------------ */
  const ROLETA = [
    { id: 'dinheiroExtra',  nome: '+$8 de bonificação',                icone: '💰',
      desc: 'Você recebe R$8 extra na hora.' },
    { id: 'maoExtra',       nome: '+1 mão no próximo chefão',          icone: '🃏',
      desc: 'No próximo chefão, você terá 1 mão a mais.' },
    { id: 'coringaGratis',  nome: 'Coringa aleatório GRÁTIS',          icone: '🎁',
      desc: 'Um Coringa aleatório entra no seu baralho (se houver espaço).' },
    { id: 'pontosDobrados', nome: 'Pontuação dobra no próximo chefão', icone: '🔥',
      desc: 'No próximo chefão, a pontuação vale o dobro.' },
    { id: 'ofertasOuro',    nome: 'Carta de Ouro grátis na loja',      icone: '🪙',
      desc: 'Na próxima loja, uma Carta de Ouro será gratuita.' },
    { id: 'nada',           nome: 'O caos não te deu nada...',         icone: '🌪️',
      desc: 'O caos não te deu nada. Azar.' }
  ];

/* ------------------------------------------------------------------
     8. DESBLOQUEIOS PERMANENTES (roguelite — "Caixa do Boteco")
     Condições verificadas no script.js; dados e textos ficam aqui.
     ------------------------------------------------------------------ */
  const DESBLOQUEIOS = [
    { id: 'clientela',    nome: 'Clientela Fiel',      icone: '🍻',
      como: 'Alcance o 3º chefão em uma partida',
      efeito: 'Começa a partida com R$8 (em vez de R$6).' },
    { id: 'barman',       nome: 'Confiança do Barman', icone: '🍺',
      como: 'Vença o chefão "Galinha dos Ovos"',
      efeito: 'Toda partida começa com 1 Coringa aleatório grátis.' },
    { id: 'estante',      nome: 'Estante de Garrafas', icone: '🍾',
      como: 'Termine um chefão com R$20 ou mais no bolso',
      efeito: 'A loja passa a vender "+1 Espaço de Coringa" (R$10, até 2 por partida).' },
    { id: 'jurosCaixa',   nome: 'Juros do Caixa',      icone: '💵',
      como: 'Vença o chefão "Dona Astúcia"',
      efeito: 'Os juros do caixa passam a valer até R$8 por chefão.' },
    { id: 'colecionador', nome: 'Colecionador',        icone: '🎴',
      como: 'Vença o chefão "Capivara Relâmpago"',
      efeito: '3 Coringas raros entram no sortimento da loja (Feira, Zorra, Fantasma).' },
    { id: 'sorteGrande',  nome: 'Sorte Grande',        icone: '🍀',
      como: 'Faça uma mão de 5.000 pontos ou mais',
      efeito: 'A Loteria passa a ter 25% de chance (em vez de 15%).' },
    { id: 'coroa',        nome: 'Coroa do Boteco',     icone: '👑',
      como: 'Vença os 8 chefões',
      efeito: '+1 descarte por chefão e título dourado na tela inicial.' }
  ];

  // Juros do caixa: R$1 por cada R$10 guardados, com teto
  function calcularJuros(dinheiro, maximo) {
    return Math.min(maximo || 4, Math.floor(dinheiro / 10));
  }

  // Custo para subir o nível de uma mão: R$2, subindo R$1 a cada 2 níveis
  function custoNivel(nivelAtual) {
    return 2 + Math.floor((nivelAtual || 0) / 2);
  }

  /* ------------------------------------------------------------------
     EXPORTAÇÃO (navegador + Node)
     ------------------------------------------------------------------ */
  const API = {
    NAIPES, RANGOS, MANOS, NIVEIS_MANO,
    CORINGAS, CARTAS_MELHORADAS, JEFES, ROLETA,
    PREMIO_POR_JEFE, DESBLOQUEIOS, calcularJuros, custoNivel,
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