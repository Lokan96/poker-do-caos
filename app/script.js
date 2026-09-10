/* =====================================================================
   PÔQUER DO CAOS — Lógica da interface (fluxo do jogo, renderizado)
   Depende de: logica.js (LOGICA)
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     0. UTILIDADES
     ------------------------------------------------------------------ */
  const $ = function (id) { return document.getElementById(id); };
  const aleatorio = function (a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; };
  const escoger = function (arr) { return arr[aleatorio(0, arr.length - 1)]; };

  const ocultarPantallas = function () {
    document.querySelectorAll('.pantalla').forEach(function (p) { p.classList.add('oculta'); });
  };
  const mostrarPantalla = function (id) {
    ocultarPantallas();
    const p = $(id);
    p.classList.remove('oculta');
    try { window.scrollTo(0, 0); } catch (e) { /* ambientes sem scroll */ }
    return p;
  };

  /* ------------------------------------------------------------------
     1. MINI SINTETIZADOR (sons retro em WebAudio, sem arquivos)
     ------------------------------------------------------------------ */
  let contextoAudio = null;
  function garantirAudio() {
    try {
      if (!contextoAudio && window.AudioContext) contextoAudio = new AudioContext();
      if (!contextoAudio && window.webkitAudioContext) contextoAudio = new (window.webkitAudioContext)();
    } catch (e) { /* sem audio, sem problema */ }
    return contextoAudio;
  }

  function tono(freq, duracao, tipo, volume) {
    try {
      const ctx = garantirAudio();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const ganho = ctx.createGain();
      osc.type = tipo || 'square';
      osc.frequency.value = freq;
      ganho.gain.setValueAtTime(volume || 0.12, ctx.currentTime);
      ganho.gain.setValueAtTime(0.0001, ctx.currentTime + duracao);
      osc.connect(ganho);
      ganho.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duracao + 0.03);
    } catch (e) { /* silencio */ }
  }

  const Som = {
    carta:   () => tono(560, 0.07, 'square', 0.10),
    selecao: () => tono(880, 0.05, 'sine', 0.12),
    jugar:   () => { tono(440, 0.12, 'square', 0.14); setTimeout(() => tono(660, 0.14, 'square', 0.14), 110); },
    ganar:   () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tono(f, 0.22, 'triangle', 0.16), i * 130)); },
    perder:  () => { [400, 320, 240, 160].forEach((f, i) => setTimeout(() => tono(f, 0.3, 'sawtooth', 0.12), i * 180)); },
    comprar: () => tono(1180, 0.08, 'triangle', 0.10),
    ruleta:  () => { for (let i = 0; i < 20; i++) setTimeout(() => tono(300 + aleatorio(0, 900), 0.04, 'square', 0.05), i * 60); }
  };

  /* ------------------------------------------------------------------
     2. RECORDES (localStorage)
     ------------------------------------------------------------------ */
  const CLAVE_RECORDS = 'pokerCaos_records_v1';
  const records = {
    melhorPuntaje: 0,
    chefesVencidos: 0,
    partidas: 0,
    coringasTotales: 0
  };

  function cargarRecords() {
    try {
      const guardado = localStorage.getItem(CLAVE_RECORDS);
      if (guardado) {
        const obj = JSON.parse(guardado);
        Object.keys(records).forEach(function (k) { if (typeof obj[k] === 'number') records[k] = obj[k]; });
      }
    } catch (e) { /* primeiro jogo em modo privado, etc. */ }
  }

  function guardarRecords() {
    try { localStorage.setItem(CLAVE_RECORDS, JSON.stringify(records)); } catch (e) { /* ignore */ }
  }

  /* ------------------------------------------------------------------
     3. ESTADO DA PARTIDA
     ------------------------------------------------------------------ */
  let E = null;

  function novoEstado() {
    return {
      nome: '',
      dinheiro: 0,
      ronda: 0,                       // índice do chefão (0..7)
      pontosTotales: 0,
      baralho: [],
      manoJuego: [],                  // cartas na mano (máx 8)
      seleccionIds: new Set(),
      manos: 0,
      descartes: 0,
      pontos: 0,                      // pontos do blind atual
      coringas: [],                   // coringas que o jogador possui
      nivelMano: JSON.parse(JSON.stringify(LOGICA.NIVEIS_MANO)),
      melhorasPendientes: [],         // 'ouro' | 'fogo' | 'bionica' | 'espelho'
      bonus: { maoExtra: 0, pontosDobrados: 1, cartaOroGratis: false },
      ofertasCoringas: [],
      ofertasMejoradas: [],
      ultimaPremio: 0
    };
  }
/* ------------------------------------------------------------------
     4. FUNÇÕES AUXILIARES DE CÁLCULO
     ------------------------------------------------------------------ */
  const jefeAtual = function () { return LOGICA.JEFES[E.ronda]; };

  const manosPorBlind = function () {
    let m = jefeAtual().reglaId === 'menosMaos' ? 3 : 4;
    if (E.coringas.some(function (c) { return c.tipo === 'maoExtra'; })) m += 1;
    return m + E.bonus.maoExtra;
  };

  const descartesPorBlind = function () {
    let d = 3;
    if (E.coringas.some(function (c) { return c.tipo === 'descarteExtra'; })) d += 2;
    return d;
  };

  const slotsLivre = function () { return 5 - E.coringas.length; };

  const custoDescarte = function () {
    let custo = 0;
    if (jefeAtual().reglaId === 'descarteCaro') custo += 1;
    if (E.coringas.some(function (c) { return c.tipo === 'multMasDanoDescarte'; })) custo += 1;
    return custo;
  };

  const caixaBaralho = function () {
    return E.baralho.length + ' cartas';
  };

  /* ------------------------------------------------------------------
     5. INÍCIO DA PARTIDA E DO BLIND
     ------------------------------------------------------------------ */
  function iniciarPartida(nome) {
    E = novoEstado();
    E.nome = nome;
    E.dinheiro = 6;
    E.ronda = 0;
    E.pontosTotales = 0;
    records.partidas++;
    guardarRecords();
    evoluirParaBlind(0);
    mostrarPantalla('pantalla-juego');
    renderizarJuego();
    forcaDealAnimacao();
  }

  function evoluirParaBlind(indice) {
    E.ronda = indice;
    E.baralho = LOGICA.criarBaralho(true);
    E.manoJuego = LOGICA.comprar(E.baralho, 8);
    E.seleccionIds = new Set();
    E.manos = manosPorBlind();
    E.descartes = descartesPorBlind();
    E.pontos = 0;
    E.melhorasPendientes = [];
    E.bonus.maoExtra = 0; // bônus da roleta é consumido no blind atual
    if (E.ronda > 0) E.bonus.cartaOroGratis = false;
  }

  function forcaDealAnimacao() {
    // força a re-animação das cartas
    const zona = $('mano-juego');
    if (!zona) return;
    Array.from(zona.children).forEach(function (el, i) {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
      el.style.animationDelay = (i * 0.03) + 's';
    });
  }
/* ------------------------------------------------------------------
     6. RENDERIZADO DO JOGO
     ------------------------------------------------------------------ */
  function renderizarJuego() {
    if (!E) return;
    const j = jefeAtual();

    $('txt-nome').textContent = E.nome;
    $('txt-dinheiro').textContent = 'R$' + E.dinheiro;
    $('txt-ronda').textContent = E.ronda + 1;
    $('jefe-emoji').textContent = j.icone;
    $('jefe-nombre').textContent = j.nome;
    $('jefe-regla').textContent = j.regla;
    $('txt-puntos').textContent = E.pontos;
    $('txt-alvo').textContent = j.alvo;
    $('txt-manos').textContent = E.manos;
    $('txt-descartes').textContent = E.descartes;
    $('txt-coringas').textContent = E.coringas.length;

    const taxa = Math.min(100, Math.round((E.pontos / j.alvo) * 100));
    const barra = $('barra-progresso');
    barra.style.width = taxa + '%';
    barra.classList.toggle('cheio', taxa >= 100);

    renderizarManoJuego();
    renderizarSeleccion();

    const sel = E.seleccionIds.size;
    $('btn-jogar-mano').disabled = sel < 1 || sel > 5 || E.manos <= 0;
    $('btn-descartar').disabled = sel < 1 || E.descartes <= 0;
    $('btn-descartar').textContent = '🗑️ DESCARTAR' + (custoDescarte() > 0 ? ' (-R$' + custoDescarte() + ')' : '');
  }

  function criarElementoCarta(carta, selecionada) {
    const el = document.createElement('div');
    el.className = 'carta' + (carta.corNaipe === 'vermelho' ? ' roja' : '') +
      (selecionada ? ' seleccionada' : '') +
      (carta.melhorada ? ' mejorada' : '');
    el.dataset.id = carta.id;
    el.innerHTML =
      '<div class="valor">' + carta.rango + '</div>' +
      '<div class="naipe-grande">' + carta.simbolo + '</div>' +
      '<div class="naipe-inferior">' + carta.simbolo + '</div>';
    return el;
  }

  function renderizarManoJuego() {
    const zona = $('mano-juego');
    zona.innerHTML = '';
    E.manoJuego.forEach(function (carta) {
      const el = criarElementoCarta(carta, E.seleccionIds.has(carta.id));
      el.addEventListener('click', function () { alternarSeleccion(carta.id); });
      zona.appendChild(el);
    });
  }

  function renderizarSeleccion() {
    const zona = $('mano-seleccion');
    zona.innerHTML = '';
    E.manoJuego.filter(function (c) { return E.seleccionIds.has(c.id); })
      .forEach(function (carta, i) {
        const el = criarElementoCarta(carta, true);
        el.style.animationDelay = (i * 0.04) + 's';
        el.addEventListener('click', function () { alternarSeleccion(carta.id); });
        zona.appendChild(el);
      });
    $('txt-select').textContent = E.seleccionIds.size;
  }

  function alternarSeleccion(id) {
    if (E.seleccionIds.has(id)) {
      E.seleccionIds.delete(id);
    } else {
      if (E.seleccionIds.size >= 5) return;
      E.seleccionIds.add(id);
    }
    Som.selecao();
    renderizarManoJuego();
    renderizarSeleccion();
    renderizarJuego();
  }

  /* ------------------------------------------------------------------
     7. AÇÕES DO TURNO: JOGAR MÃO E DESCARTAR
     ------------------------------------------------------------------ */
  function jogarMao() {
    if (!E || E.manos <= 0) return;
    const cartas = E.manoJuego.filter(function (c) { return E.seleccionIds.has(c.id); });
    if (cartas.length < 1 || cartas.length > 5) return;

    // aplica melhorias compradas na loja às cartas jogadas
    cartas.forEach(function (c) {
      if (!c.melhorada && E.melhorasPendientes.length) {
        c.melhorada = E.melhorasPendientes.shift();
      }
    });

    const res = LOGICA.calcularPuntaje({
      cartas: cartas,
      coringas: E.coringas,
      reglaId: jefeAtual().reglaId,
      niveis: E.nivelMano,
      rng: Math.random,
      ronda: E.ronda + 1
    });

    // nível da mão sobe ao ser usada
    E.nivelMano[res.mao.clave] = (E.nivelMano[res.mao.clave] || 0) + 1;

    let pontos = res.puntaje;
    let avisoDobro = '';
    if (E.bonus.pontosDobrados > 1) {
      pontos *= E.bonus.pontosDobrados;
      avisoDobro = '🔥 PONTOS DOBRADOS!';
    }
    E.pontos += pontos;
    E.pontosTotales += pontos;

    // dinheiro de coringas (Tio Patinhas, Carta de Ouro)
    if (res.dinheiroEncontrado > 0) {
      E.dinheiro += res.dinheiroEncontrado;
    }

    // retira cartas jogadas e compra novas
    E.manoJuego = E.manoJuego.filter(function (c) { return !E.seleccionIds.has(c.id); });
    E.seleccionIds = new Set();
    E.manoJuego = E.manoJuego.concat(LOGICA.comprar(E.baralho, cartas.length));
    E.manos--;

    Som.jugar();
    mostrarOverlayPuntaje(res, pontos, avisoDobro);

    // registra coringas usados no recorde
    if (res.mao.clave && res.nivel > 0) { /* sem ação */ }
  }
/* ------------------------------------------------------------------
     8. OVERLAY DE PUNTAJE + LOG
     ------------------------------------------------------------------ */
  function añadirLog(mensaje) {
    const zona = $('log-juego');
    if (!zona) return;
    const el = document.createElement('div');
    el.className = 'msg';
    el.textContent = mensaje;
    zona.appendChild(el);
    while (zona.children.length > 6) zona.removeChild(zona.firstChild);
  }

  function mostrarOverlayPuntaje(res, pontos, avisoDobro) {
    $('pop-mao').textContent = res.mao.nombre + (res.nivel ? '  (nível ' + res.nivel + ')' : '');
    let detalle = 'Fichas: ' + res.fichasTotal +
      '  (mão ' + res.fichasBase + ' + cartas ' + res.fichasCartas +
      (res.fichasExtra ? ' + extras ' + res.fichasExtra : '') + ')\n' +
      'Multiplicador: ×' + Math.round(res.multTotal * 100) / 100 +
      (res.bonusFinal !== 1 ? '  (aleatório ×' + Math.round(res.bonusFinal * 100) / 100 + ')' : '');
    if (res.mensajes.length) detalle += '\n' + res.mensajes.join('\n');
    if (avisoDobro) detalle += '\n' + avisoDobro;
    $('pop-detalle').textContent = detalle;
    $('pop-puntos').textContent = pontos;

    const overlay = $('overlay-puntaje');
    overlay.classList.remove('oculta');
    overlay.querySelector('.puntaje-pop').style.animation = 'none';
    void overlay.querySelector('.puntaje-pop').offsetWidth;
    overlay.querySelector('.puntaje-pop').style.animation = '';

    if (pontos >= 600) {
      document.body.classList.remove('temblor');
      void document.body.offsetWidth;
      document.body.classList.add('temblor');
    }

    añadirLog('🃏 ' + res.mao.nombre + ' — ' + pontos + ' pontos' +
      (res.mensajes.length ? ' (' + res.mensajes[0] + ')' : ''));
  }

  function fecharOverlayPuntaje() {
    $('overlay-puntaje').classList.add('oculta');
    guardarRecords();

    if (E.pontos >= jefeAtual().alvo) {
      ganarBlind();
      return;
    }
    if (E.manos <= 0) {
      perderPartida();
      return;
    }
    renderizarJuego();
  }

  /* ------------------------------------------------------------------
     9. DESCARTAR
     ------------------------------------------------------------------ */
  function descartar() {
    if (!E || E.descartes <= 0) return;
    const cartas = E.manoJuego.filter(function (c) { return E.seleccionIds.has(c.id); });
    if (!cartas.length) return;

    const custo = custoDescarte();
    if (custo > 0) {
      E.dinheiro = Math.max(0, E.dinheiro - custo);
      añadirLog('💸 Descartes custaram R$' + custo);
    }
    E.descartes--;

    E.manoJuego = E.manoJuego.filter(function (c) { return !E.seleccionIds.has(c.id); });
    E.seleccionIds = new Set();
    E.manoJuego = E.manoJuego.concat(LOGICA.comprar(E.baralho, cartas.length));

    Som.carta();
    añadirLog('🗑️ ' + cartas.length + ' carta(s) descartada(s). Baralho: ' + E.baralho.length);
    renderizarJuego();
  }
/* ------------------------------------------------------------------
     10. VITÓRIA SOBRE O CHEFÃO + ROLETA DO CAOS
     ------------------------------------------------------------------ */
  function ganarBlind() {
    const j = jefeAtual();
    let premio = LOGICA.PREMIO_POR_JEFE[E.ronda];
    if (E.coringas.some(function (c) { return c.tipo === 'dinheiroPorBlindEMenosMult'; })) premio += 3;
    E.dinheiro += premio;
    E.ultimaPremio = premio;
    E.bonus.pontosDobrados = 1; // o bônus da roleta vale apenas para o blind em que foi consumido

    records.chefesVencidos = Math.max(records.chefesVencidos, E.ronda + 1);
    records.melhorPuntaje = Math.max(records.melhorPuntaje, E.pontosTotales);
    guardarRecords();

    Som.ganar();
    capaConfeti();
    añadirLog('👑 Chefão "' + j.nome + '" VENCIDO! Prêmio: R$' + premio);
    mostrarRuleta();
  }

  /* ---------- Roleta do Caos ---------- */
  const LARGURA_SEGMENTO = 84;

  function montarTira() {
    const tira = $('tira-ruleta');
    tira.innerHTML = '';
    const dobla = LOGICA.ROLETA.concat(LOGICA.ROLETA);
    const cores = ['#d4a017', '#8a1c1c', '#1c6e5c', '#6b3fa0', '#1f6fb2', '#b0781f'];
    dobla.forEach(function (seg, i) {
      const el = document.createElement('div');
      el.className = 'segmento-ruleta';
      el.style.background = cores[i % cores.length];
      el.innerHTML = '<div class="seg-icone">' + seg.icone + '</div><div>' + seg.nome + '</div>';
      el.setAttribute('data-id', seg.id);
      tira.appendChild(el);
    });
    // Garante a largura total da tira mesmo se o flex do CSS falhar (WebView antigos)
    tira.style.width = (dobla.length * LARGURA_SEGMENTO) + 'px';
  }

  function mostrarRuleta() {
    montarTira();
    $('tira-ruleta').style.left = '0px';
    $('ruleta-resultado').textContent = '';
    $('btn-girar').classList.remove('oculta');
    $('btn-fechar-ruleta').classList.add('oculta');
    $('overlay-ruleta').classList.remove('oculta');
  }

  function girarRuleta() {
    const tira = $('tira-ruleta');
    const indice = aleatorio(0, LOGICA.ROLETA.length - 1);
    const alvoVisual = indice + LOGICA.ROLETA.length;
    const pistaAncho = $('pista-ruleta').clientWidth || Math.max(280, window.innerWidth - 40);
    const rotações = aleatorio(2, 4) * LOGICA.ROLETA.length;
    const dest = -(alvoVisual * LARGURA_SEGMENTO + LARGURA_SEGMENTO / 2 - pistaAncho / 2) - rotações * LARGURA_SEGMENTO;

    tira.style.left = dest + 'px';
    Som.ruleta();

    setTimeout(function () {
      const r = LOGICA.ROLETA[indice];
      aplicarRoleta(r);
      $('ruleta-resultado').innerHTML =
        '<b>' + r.icone + ' ' + r.nome + '</b><br><span class="ruleta-legenda">' + r.desc + '</span>';
      $('btn-girar').classList.add('oculta');
      $('btn-fechar-ruleta').classList.remove('oculta');
    }, 3600);
  }

  function aplicarRoleta(r) {
    switch (r.id) {
      case 'dinheiroExtra':
        E.dinheiro += 8;
        break;
      case 'maoExtra':
        E.bonus.maoExtra++;
        break;
      case 'coringaGratis':
        if (slotsLivre() > 0) {
          E.coringas.push(Object.assign({}, escoger(LOGICA.CORINGAS)));
          records.coringasTotales++;
        } else {
          E.dinheiro += 5;
        }
        break;
      case 'pontosDobrados':
        E.bonus.pontosDobrados = 2;
        break;
      case 'ofertasOuro':
        E.bonus.cartaOroGratis = true;
        break;
      case 'nada':
        break;
    }
    guardarRecords();
  }
/* ------------------------------------------------------------------
     11. LOJA DO BOTECO
     ------------------------------------------------------------------ */
  function fecharRuleta() {
    $('overlay-ruleta').classList.add('oculta');
    if (E.ronda >= LOGICA.JEFES.length - 1) {
      mostrarVictoria();
    } else {
      abrirTienda();
    }
  }

  function abrirTienda() {
    mostrarPantalla('pantalla-tienda');
    gerarOfertas();
    renderizarTienda();
  }

  function gerarOfertas() {
    const pool = LOGICA.CORINGAS.slice();
    E.ofertasCoringas = [];
    while (E.ofertasCoringas.length < 3 && pool.length) {
      const i = aleatorio(0, pool.length - 1);
      E.ofertasCoringas.push(Object.assign({}, pool.splice(i, 1)[0]));
    }

    const poolM = LOGICA.CARTAS_MELHORADAS.slice();
    E.ofertasMejoradas = [];
    while (E.ofertasMejoradas.length < 2 && poolM.length) {
      const i = aleatorio(0, poolM.length - 1);
      const m = Object.assign({}, poolM.splice(i, 1)[0]);
      if (E.bonus.cartaOroGratis && m.id === 'ouro') m.preco = 0;
      E.ofertasMejoradas.push(m);
    }
  }

  function renderizarTienda() {
    if (!E) return;
    $('txt-nome-tienda').textContent = E.nome;
    $('txt-dinheiro-tienda').textContent = 'R$' + E.dinheiro;
    $('txt-slots').textContent = E.coringas.length;

    // Coringas à venda
    const zonaC = $('ofertas-coringas');
    zonaC.innerHTML = '';
    E.ofertasCoringas.forEach(function (oferta) {
      const el = document.createElement('div');
      el.className = 'oferta';
      el.innerHTML =
        '<div class="oferta-icone">' + oferta.icone + '</div>' +
        '<div class="oferta-nome">' + oferta.nome + '</div>' +
        '<div class="oferta-desc">' + oferta.desc + '</div>' +
        '<div class="oferta-preco">R$' + oferta.preco + '</div>';
      const btn = document.createElement('button');
      btn.className = 'boton';
      btn.textContent = 'COMPRAR';
      btn.disabled = E.dinheiro < oferta.preco || slotsLivre() <= 0;
      btn.addEventListener('click', function () { comprarCoringa(oferta); });
      el.appendChild(btn);
      zonaC.appendChild(el);
    });

    // Cartas melhoradas
    const zonaM = $('ofertas-mejoradas');
    zonaM.innerHTML = '';
    E.ofertasMejoradas.forEach(function (oferta) {
      const el = document.createElement('div');
      el.className = 'oferta';
      el.innerHTML =
        '<div class="oferta-icone">' + oferta.icone + '</div>' +
        '<div class="oferta-nome">' + oferta.nome + '</div>' +
        '<div class="oferta-desc">' + oferta.desc + '</div>' +
        '<div class="oferta-preco">R$' + oferta.preco + (oferta.preco === 0 ? ' 🎁' : '') + '</div>';
      const btn = document.createElement('button');
      btn.className = 'boton';
      btn.textContent = oferta.preco === 0 ? 'GRÁTIS' : 'COMPRAR';
      btn.disabled = E.dinheiro < oferta.preco;
      btn.addEventListener('click', function () { comprarMejorada(oferta); });
      el.appendChild(btn);
      zonaM.appendChild(el);
    });

    // Níveis das mãos
    const zonaN = $('grade-niveis');
    zonaN.innerHTML = '';
    Object.keys(LOGICA.MANOS).forEach(function (clave) {
      const mano = LOGICA.MANOS[clave];
      const nivel = E.nivelMano[clave] || 0;
      const el = document.createElement('div');
      el.className = 'nivel-item';
      el.innerHTML =
        '<b>' + mano.nombre + '</b>' +
        '<span class="nivel-num">Nível ' + nivel + ' — ' +
        (mano.fichas + nivel * 10) + ' fichas • ×' + (mano.mult + nivel) + '</span>';
      el.addEventListener('click', function () { subirNivel(clave); });
      zonaN.appendChild(el);
    });

    // Coringas do jogador
    const zonaCj = $('mis-coringas');
    zonaCj.innerHTML = '';
    if (!E.coringas.length) {
      zonaCj.innerHTML = '<p class="dica">Você ainda não tem coringas. Compre alguns acima!</p>';
    } else {
      E.coringas.forEach(function (c) {
        const el = document.createElement('div');
        el.className = 'coringa-propio';
        el.innerHTML = '<div class="co-icone">' + c.icone + '</div>' +
          '<div class="co-texto"><b>' + c.nome + '</b><p>' + c.desc + '</p></div>';
        zonaCj.appendChild(el);
      });
    }
  }

  function comprarCoringa(oferta) {
    if (E.dinheiro < oferta.preco || slotsLivre() <= 0) return;
    E.dinheiro -= oferta.preco;
    E.coringas.push(oferta);
    records.coringasTotales++;
    guardarRecords();
    Som.comprar();
    renderizarTienda();
  }

  function comprarMejorada(oferta) {
    if (E.dinheiro < oferta.preco) return;
    E.dinheiro -= oferta.preco;
    E.melhorasPendientes.push(oferta.id);
    Som.comprar();
    renderizarTienda();
  }

  function subirNivel(clave) {
    if (E.dinheiro < 2) return;
    E.dinheiro -= 2;
    E.nivelMano[clave] = (E.nivelMano[clave] || 0) + 1;
    Som.comprar();
    renderizarTienda();
  }

  function continuar() {
    E.ronda++;
    E.bonus.maoExtra = 0;
    E.bonus.cartaOroGratis = false;
    evoluirParaBlind(E.ronda);
    mostrarPantalla('pantalla-juego');
    renderizarJuego();
    forcaDealAnimacao();
  }
/* ------------------------------------------------------------------
     12. FIN DE PARTIDA, CONFETI E MELHORIA (ORDENAR)
     ------------------------------------------------------------------ */
  function perderPartida() {
    guardarRecords();
    Som.perder();
    mostrarPantalla('pantalla-fin');
    $('fin-emoji').textContent = '💀';
    $('fin-titulo').textContent = 'O CAOS VENCEU';
    $('fin-info').innerHTML =
      '<p>Chefão alcançado: <b>' + (E.ronda + 1) + 'º</b> — ' + jefeAtual().nome + '</p>' +
      '<p>Pontuação total: <b>' + E.pontosTotales + '</b></p>' +
      '<p>Recorde partida: <b>' + records.melhorPuntaje + '</b></p>';
  }

  function mostrarVictoria() {
    records.chefesVencidos = 8;
    records.melhorPuntaje = Math.max(records.melhorPuntaje, E.pontosTotales);
    guardarRecords();
    Som.ganar();
    capaConfeti();
    mostrarPantalla('pantalla-fin');
    $('fin-emoji').textContent = '🏆';
    $('fin-titulo').textContent = 'VOCÊ VENCEU O CAOS!';
    $('fin-info').innerHTML =
      '<p>Venceu os <b>8 chefões</b> — você é o <b>Rei do Boteco</b>! 👑</p>' +
      '<p>Pontuação total: <b>' + E.pontosTotales + '</b></p>' +
      '<p>Recorde partida: <b>' + records.melhorPuntaje + '</b></p>';
  }

  function capaConfeti() {
    const capa = $('capa-confeti');
    capa.innerHTML = '';
    capa.classList.remove('oculta');
    const cores = ['#d4a017', '#f0c94a', '#e74c3c', '#2ecc71', '#3498db', '#9b59b6'];
    for (let i = 0; i < 60; i++) {
      const el = document.createElement('div');
      el.className = 'confete';
      el.style.left = (Math.random() * 100) + 'vw';
      el.style.width = (6 + Math.random() * 6) + 'px';
      el.style.height = (8 + Math.random() * 6) + 'px';
      el.style.background = cores[aleatorio(0, cores.length - 1)];
      el.style.animationDuration = (1.6 + Math.random() * 2) + 's';
      el.style.animationDelay = (Math.random() * 0.8) + 's';
      capa.appendChild(el);
    }
    setTimeout(function () { capa.classList.add('oculta'); capa.innerHTML = ''; }, 4200);
  }

  // Melhoria: botão ORDENAR que agrupa a mão por naipe e valor
  function ordenarMano() {
    if (!E) return;
    E.manoJuego.sort(function (a, b) {
      if (a.corNaipe !== b.corNaipe) return a.corNaipe < b.corNaipe ? -1 : 1;
      if (a.naipeIdx !== b.naipeIdx) return a.naipeIdx - b.naipeIdx;
      return a.idx - b.idx;
    });
    Som.carta();
    renderizarJuego();
  }

  /* ------------------------------------------------------------------
     13. RECORDS NO INÍCIO
     ------------------------------------------------------------------ */
  function mostrarRecords() {
    const el = $('records-inicio');
    el.classList.remove('oculta');
    el.innerHTML =
      '🏅 Recorde: <b>' + records.melhorPuntaje + '</b> pts • ' +
      '👹 Chefões vencidos: <b>' + records.chefesVencidos + '/8</b> • ' +
      '🎮 Partidas: <b>' + records.partidas + '</b> • ' +
      '🗃️ Coringas coletados: <b>' + records.coringasTotales + '</b>';
  }

  /* ------------------------------------------------------------------
     14. EVENTOS E ARRANQUE
     ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    cargarRecords();
    mostrarRecords();

    const inputNome = $('input-nome');
    const btnJogar = $('btn-jogar');

    inputNome.addEventListener('input', function () {
      btnJogar.disabled = inputNome.value.trim().length < 2;
    });

    btnJogar.addEventListener('click', function () {
      const nome = inputNome.value.trim();
      if (nome.length >= 2) {
        garantirAudio();
        iniciarPartida(nome);
      }
    });

    $('btn-como').addEventListener('click', function () {
      $('caixa-como').classList.toggle('oculta');
    });

    $('btn-jogar-mano').addEventListener('click', jogarMao);
    $('btn-descartar').addEventListener('click', descartar);
    $('btn-ordenar').addEventListener('click', ordenarMano);
    $('btn-fechar-puntaje').addEventListener('click', fecharOverlayPuntaje);
    $('btn-girar').addEventListener('click', girarRuleta);
    $('btn-fechar-ruleta').addEventListener('click', fecharRuleta);
    $('btn-continuar').addEventListener('click', continuar);
    $('btn-reiniciar').addEventListener('click', function () {
      mostrarPantalla('pantalla-inicio');
      mostrarRecords();
    });

    inputNome.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !btnJogar.disabled) btnJogar.click();
    });
  });
})();