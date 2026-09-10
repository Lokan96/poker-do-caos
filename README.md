# 🃏 Pôquer do Caos

Jogo de pôquer caótico em turnos, inspirado em *Balatro*: sobreviva a **8 chefões** armando mãos absurdas e combinando **Coringas brasileiros** que quebram as regras do jogo.

Feito 100% com **HTML + CSS + JavaScript puro** (sem frameworks, sem bibliotecas, sem imagens — as cartas são desenhadas em CSS). Roda no navegador **e** no celular como APK Android.

---

## 🎮 Como jogar

1. Digite seu nome na tela inicial;
2. Cada chefão tem um **alvo de pontos** e uma **regra caótica** própria;
3. Você recebe 8 cartas — selecione de 1 a 5 e **jogue a mão** (fichas × multiplicador) ou **descarte**;
4. Tem **4 mãos e 3 descartes** por chefão;
5. Venceu? Ganhe dinheiro, gire a **Roleta do Caos** e compre **Coringas** na loja;
6. Vença os 8 chefões e proclame-se **Rei do Boteco** 👑.

## ✨ Recursos

- **10 combinações de pôquer** (Carta Alta até Royal Flush), cada uma com fichas e multiplicador;
- **13 Coringas brasileiros** com efeitos que quebram regras (Carnavalesco, Feijoada, Loteria, Capivara Zen...);
- **8 chefões com regras caóticas** ("Cor não vale como Cor", "todas as cartas valem 10", "multiplicador aleatório por mão"...);
- **Níveis de mão**: repetir uma combinação a deixa permanentemente mais forte;
- **Loja**: Coringas, cartas melhoradas (Ouro, Fogo, Biônica, Espelho) e upgrade de mãos;
- **Roleta do Caos** com 6 prêmios aleatórios após cada vitória;
- **Sons sintetizados** com Web Audio API (sem arquivos de áudio);
- **Recordes e estatísticas** salvos no `localStorage`;
- **Animações em CSS puro**: cascata das cartas, "pop" da pontuação, tremor de tela, confete;
- **Responsivo**: layout fluido com `clamp()`, pensado para toque em celular.

## 🏗️ Arquitetura do projeto

```
trab_2bi/
├── app/                        # O JOGO (também é a webDir do Capacitor)
│   ├── index.html              # Estrutura: 4 telas + 4 janelas sobrepostas (54 IDs)
│   ├── style.css               # Tema "boteco" (verde feltro + dourado), cartas em CSS puro, @keyframes
│   ├── logica.js               # LÓGICA PURA (sem DOM): baralho, mãos, pontuação, Coringas, chefões
│   ├── script.js               # INTERFACE: máquina de estados, renderização, sons, recordes
│   ├── manifest.json           # Manifest PWA (nome, ícones, cores)
│   └── icons/                  # Ícones do app gerados por script
├── tools/                      # FERRAMENTAS (não entram no APK)
│   ├── test_logica.js          # 32 testes unitários da lógica pura
│   ├── chequear_ids.js         # Valida que todo ID usado no JS existe no HTML
│   ├── smoke_jsdom.js          # 17 verificações de interface simulada (jsdom)
│   ├── simular_partida.js      # Simulador Monte Carlo (200 partidas) p/ balanceamento
│   └── generar_iconos.py       # Gera os ícones Android/PWA (Pillow)
├── android/                    # Projeto nativo Android (Capacitor)
├── .github/workflows/
│   └── compilar-apk.yml        # CI: compila o APK automaticamente no GitHub Actions
├── capacitor.config.json       # Config do Capacitor (appId, webDir)
├── relatorio.md / .docx        # Relatório do trabalho (roteiro escolar)
└── package.json                # Scripts (test, simular, apk:local)
```

### Decisão técnica central: lógica separada da interface

`logica.js` **não conhece o DOM** — funciona tanto no navegador quanto no Node.js:

```js
// No navegador (index.html)
window.LOGICA = LOGICA;
// No Node.js (testes)
if (typeof module !== 'undefined') module.exports = LOGICA;
```

Isso permite **testar o jogo de verdade** sem abrir navegador:

| Comando | O que faz |
|---|---|
| `npm test` | 32 testes unitários + validação de IDs + 17 verificações de interface (jsdom) |
| `npm run simular` | Simula 200 partidas com jogadores aleatórios e mostra a taxa de vitória |
| `npm run apk:local` | Sincroniza e compila o APK localmente (requer Android SDK) |

### Máquina de estados da interface

```
INÍCIO ──(nome + começar)──► CHEFÃO (blind) ──(venceu)──► ROLETA ──► LOJA ──► próximo CHEFÃO
   ▲                            │                                                    │
   └────────(nova partida)──────┴──────(perdeu: GAME OVER / vitória final)◄──────────┘
```

### Fluxo da pontuação (ordem importa!)

```
fichas das cartas → bônus das cartas melhoradas → efeitos dos Coringas
→ multiplicadores → regra do chefão → compara com o alvo
```

Toda essa cadeia vive em `logica.js` (`pontuarMao`), e é coberta pelos testes unitários.

## 📱 Gerando o APK

O APK é compilado **automaticamente** pelo GitHub Actions a cada push:

1. Vá na aba **Actions** do repositório;
2. Abra a execução "Compilação do APK" mais recente;
3. Baixe o artefato **PokerDoCaos-APK** (ZIP com o `.apk` dentro);
4. Instale no Android (permita "fonte desconhecida") — funciona offline.

Como funciona o pipeline:
```
push → GitHub Actions (ubuntu, Java 17 + Android SDK pré-instalados)
     → npm install → npx cap sync android
     → ./gradlew assembleDebug   (APK debug = assinado automaticamente, instalável)
     → upload do artefato .apk
```

O APK pesa ~1–3 MB: o jogo é texto puro (HTML/CSS/JS), as cartas são CSS (sem imagens) e o navegador usado é o **WebView do próprio Android** (não vem embutido).

## 🧪 Qualidade

- 32 testes unitários da lógica (avaliação de mãos, Coringas, regras dos chefões);
- Verificação automática de que todo ID referenciado no JS existe no HTML;
- Teste de fumaça da interface com jsdom (fluxo completo: iniciar → jogar mão → vencer → loja);
- Balanceamento verificado com 200 partidas simuladas (Monte Carlo).

## 📄 Licença e contexto

Projeto escolar da disciplina de Desenvolvimento de Sistemas — atividade "Meu Primeiro Aplicativo Autônomo". O relatório completo está em `relatorio.md` (versão editável) e `relatorio.docx` (entrega).
