/* =====================================================================
   PÔQUER DO CAOS — Prueba de humo (smoke test) com jsdom
   Carrega o jogo num DOM simulado, digita o nome, joga mãos de verdade
   e verifica as transições de estado.

   Executar com:  node tools/smoke_jsdom.js
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const base = path.join(__dirname, '..', 'app');
const htmlOriginal = fs.readFileSync(path.join(base, 'index.html'), 'utf8');
const logica = fs.readFileSync(path.join(base, 'logica.js'), 'utf8');
const script = fs.readFileSync(path.join(base, 'script.js'), 'utf8');

function esperar(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

let passou = 0;
let falhou = 0;
function verificar(nome, cond, detalhe) {
  if (cond) { passou++; }
  else { falhou++; console.log('❌ ' + nome + (detalhe ? ' => ' + detalhe : '')); }
}

// pula a contagem animada de pontos (a caixa matemática vira skip no toque)
async function pularContagem(doc) {
  const m = doc.getElementById('caixa-matematica');
  if (m && !m.classList.contains('oculta')) m.click();
  await esperar(700);
}

async function run() {
  const dom = new JSDOM(htmlOriginal, {
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    url: 'http://localhost/'
  });
  const win = dom.window;

  // carrega a lógica e o jogo direto no contexto da janela
  win.eval(logica);
  win.eval(script);

  // dispara o arranque (equivalente ao DOMContentLoaded)
  win.document.dispatchEvent(new win.Event('DOMContentLoaded', { bubbles: true }));

  const doc = win.document;

  // 1) A tela inicial está visível
  verificar('Tela inicial visível', !doc.getElementById('pantalla-inicio').classList.contains('oculta'));

  // 2) Registra recordes iniciais
  verificar('Recordes mostrados no início', !doc.getElementById('records-inicio').classList.contains('oculta'));

  // 3) Campo de nome habilita o botão
  const input = doc.getElementById('input-nome');
  const btnJogar = doc.getElementById('btn-jogar');
  verificar('Botão começa desabilitado', btnJogar.disabled === true);

  input.value = 'Bruno';
  input.dispatchEvent(new win.Event('input'));
  verificar('Botão habilita com nome', btnJogar.disabled === false);

  // 4) Inicia a partida
  btnJogar.click();
  verificar('Tela de jogo visível após iniciar', !doc.getElementById('pantalla-juego').classList.contains('oculta'));
  const mano = doc.getElementById('mano-juego');
  verificar('Mão com 8 cartas', mano.children.length === 8, 'cartas=' + mano.children.length);
  verificar('Chefão 1 é Zé do Controle', doc.getElementById('jefe-nombre').textContent === 'Zé do Controle');
  verificar('Balão de fala do chefão apareceu', !doc.getElementById('jefe-fala').classList.contains('oculta'));
  verificar('Caixa do Boteco existe', !!doc.getElementById('caixa-desbloqueios'));
  verificar('Contadores de matemática existem', !!doc.getElementById('caixa-matematica') && !!doc.getElementById('contador-fichas'));

  // 5) Seleciona 5 cartas e joga uma mão
  let cartas = Array.from(mano.children);
  cartas.slice(0, 5).forEach(el => el.click());
  verificar('Selecionou 5 cartas', doc.getElementById('txt-select').textContent === '5', 'sel=' + doc.getElementById('txt-select').textContent);
  verificar('Botão jogar habilitado', doc.getElementById('btn-jogar-mano').disabled === false);

  doc.getElementById('btn-jogar-mano').click();
  await esperar(60);
  await pularContagem(doc);
  const overlay = doc.getElementById('overlay-puntaje');
  verificar('Overlay de pontuação apareceu', !overlay.classList.contains('oculta'));
  const pontos = parseInt(doc.getElementById('pop-puntos').textContent, 10);
  verificar('Pontuação > 0 na primeira mão', pontos > 0, 'pontos=' + pontos);

  // fecha o overlay para que o progresso da barra se atualice
  doc.getElementById('btn-fechar-puntaje').click();
  await esperar(20);
  verificar('Barra de progresso preencheu (bug corrigido)',
    doc.getElementById('barra-progresso').style.width !== '0%' &&
    doc.getElementById('barra-progresso').style.width !== '',
    'width=' + doc.getElementById('barra-progresso').style.width);

  // 6) Fecha o overlay e joga até vencer o blind 1 ou perder
  let hands = 1;
  let fechoVertoria = null;
  for (;;) {
    if (!overlay.classList.contains('oculta')) doc.getElementById('btn-fechar-puntaje').click();
    await esperar(30);

    const pontosTxt = doc.getElementById('txt-puntos').textContent;
    const manosText = doc.getElementById('txt-manos').textContent;
    const pontosNum = parseInt(pontosTxt, 10);
    const manosNum = parseInt(manosText, 10);

    // venceu blind 1?
    if (doc.getElementById('overlay-ruleta') && !doc.getElementById('overlay-ruleta').classList.contains('oculta')) {
      fechoVertoria = true;
      break;
    }
    // perdeu?
    if (!doc.getElementById('pantalla-fin').classList.contains('oculta')) {
      fechoVertoria = false;
      break;
    }
    // jogar mais uma mão
    if (manosNum <= 0 || (pontosNum >= 300 && manosNum > 0)) {
      fechoVertoria = pontosNum >= 300;
      break;
    }
    if (hands >= 8) break;
    cartas = Array.from(doc.getElementById('mano-juego').children);
    const sel = Math.min(5, cartas.length);
    cartas.slice(0, sel).forEach(el => el.click());
    doc.getElementById('btn-jogar-mano').click();
    await esperar(60);
    await pularContagem(doc);
    hands++;
  }

  verificar('Blind 1 terminou (vitória ou derrota)',
    fechoVertoria === true || fechoVertoria === false, 'resultado=' + fechoVertoria);

  // 7) Se venceu, gira a roleta e vai à loja
  if (fechoVertoria === true) {
    const btnGirar = doc.getElementById('btn-girar');
    if (!btnGirar.classList.contains('oculta')) btnGirar.click();
    await esperar(3900);
    const resultado = doc.getElementById('ruleta-resultado').textContent;
    verificar('Roleta deu um resultado', resultado.length > 0, 'resultado=' + resultado);

    const btnFecharRuleta = doc.getElementById('btn-fechar-ruleta');
    if (!btnFecharRuleta.classList.contains('oculta')) btnFecharRuleta.click();
    await esperar(30);
    verificar('Loja visível após roleta', !doc.getElementById('pantalla-tienda').classList.contains('oculta'));

    // 8) Continua para o próximo chefão
    doc.getElementById('btn-continuar').click();
    await esperar(30);
    verificar('Próximo chefão carregado', doc.getElementById('jefe-nombre').textContent === 'Galinha dos Ovos');
    verificar('Nova mão com 8 cartas', doc.getElementById('mano-juego').children.length === 8);
  }

  console.log('=== SMOKE TEST (jsdom) ===');
  console.log('✔ Passaram: ' + passou);
  console.log('✘ Falharam: ' + falhou);
  process.exit(falhou ? 1 : 0);
}

run().catch(function (err) { console.error(err); process.exit(1); });