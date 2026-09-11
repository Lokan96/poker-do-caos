# 🎰 Kit do Antigravity — Pôquer do Caos

Guia curto para gerar o jogo no **Google Antigravity**: cole o prompt-mestre (uma vez só), deixe o agente construir, e o **histórico de conversas dessa sessão será a prova do processo**. O jogo gerado é o output apresentável.

## 0. Preparação (5 minutos)

1. Instale o **Antigravity** (antigravity.google) e entre com sua conta Google;
2. Crie uma **pasta nova e vazia** (ex.: `poker-do-caos-antigravity`) e abra essa pasta no Antigravity;
3. Abra o painel do agente (chat) — pronto para colar o prompt.

> ⚠️ **Não apague** a conversa nem a pasta depois. O histórico é a comprovação pedida pelo professor — inclusive as mensagens de correção (mostram o ciclo testar → corrigir).

## 1. O PROMPT-MESTRE

Copie o bloco inteiro abaixo e cole **de uma vez** no chat do agente. Ele contém a especificação completa do jogo.

```text
VOCÊ É UM DESENVOLVEDOR FRONT-END SÊNIOR. Crie do zero, nesta pasta, um jogo web
completo chamado "PÔQUER DO CAOS", em português do Brasil, seguindo EXATAMENTE a
especificação abaixo. Use apenas HTML + CSS + JavaScript puro — sem frameworks,
sem bibliotecas, sem imagens (as cartas são desenhadas em CSS). Crie exatamente
4 arquivos na raiz: index.html, style.css, logica.js, script.js.

REGRAS DE ARQUITETURA:
- logica.js é LÓGICA PURA, sem nenhum uso de DOM. Ele exporta tudo via
  window.LOGICA no navegador e via module.exports no Node.js
  (if (typeof module !== 'undefined') module.exports = LOGICA;).
- script.js depende de LOGICA e cuida da interface, dos sons e dos recordes.
- Todo texto visível em português do Brasil.

――――――――――――――― 1. VISÃO GERAL ―――――――――――――――
Jogo de cartas em turnos inspirado em Balatro, com tema de boteco místico: o
jogador sobrevive a 8 chefões com alvos crescentes armando mãos de pôquer,
comprando Coringas que quebram regras, girando a Roleta do Caos e subindo o
nível das mãos. Partidas de 5 a 10 minutos, jogáveis no celular (toque) e no
computador.

――――――――――――――― 2. BARALHO E RODADA ―――――――――――――――
- Baralho de 104 cartas: 2 cópias de um baralho de 52. Naipes: Paus ♣ (preto),
  Ouros ♦ (vermelho), Copas ♥ (vermelho), Espadas ♠ (preto). Rangos: 2 a 10,
  J, Q, K, A.
- Valores para pontuação: 2 a 10 valem o número; J, Q e K valem 10; A vale 11.
- A cada chefão o baralho é recriado e embaralhado; o jogador recebe 8 cartas.
- O jogador toca de 1 a 5 cartas para selecionar e usa os botões:
  • JOGAR MÃO: consome 1 mão, pontua, retira as cartas jogadas e compra o
    mesmo número de novas cartas do baralho;
  • DESCARTAR: consome 1 descarte, retira as cartas selecionadas e repõe do
    baralho (não pontua);
  • ORDENAR: reorganiza as 8 cartas da mão agrupando por naipe (pretos, depois
    vermelhos) e valor dentro de cada naipe.
- Por chefão: 4 mãos e 3 descartes (modificáveis por regra de chefão ou Coringa).
- Dinheiro inicial da partida: $6 (exibir como R$6). Vitórias pagam prêmio
  (seção 7).
- Os pontos acumulam DENTRO do chefão (a barra compara com o alvo). Ao vencer,
  avança; ao entrar no próximo chefão, os pontos do chefão zeram (os totais da
  partida continuam somando para os recordes).
- Se acabarem as mãos sem atingir o alvo: derrota e fim de partida.

――――――――――――――― 3. AVALIADOR DE MÃOS (prioridade de cima para baixo) ―――――――――――――――
| Combinação        | Condição                                             | Fichas | ×mult |
| Royal Flush       | 10-J-Q-K-A do mesmo naipe (só com 5 cartas)          | 260    | ×12   |
| Sequência de Cor  | 5 em sequência do mesmo naipe (aceita A-2-3-4-5)     | 200    | ×10   |
| Cor (Flush)       | 5 cartas do mesmo naipe                              | 110    | ×5    |
| Full House        | trinca + par (só com 5 cartas)                       | 130    | ×5    |
| Quadra            | 4 cartas iguais                                      | 180    | ×8    |
| Sequência         | 5 em sequência (aceita A-2-3-4-5)                    | 100    | ×4    |
| Trinca            | 3 cartas iguais                                      | 80     | ×3    |
| Dois Pares        | dois pares (só com 5 cartas)                         | 60     | ×2    |
| Par               | 2 cartas iguais                                      | 40     | ×2    |
| Carta Alta        | qualquer outra (inclusive com 1 carta só)            | 20     | ×1    |
ATENÇÃO: Cor, Sequência, Sequência de Cor, Royal e Full House SÓ são avaliadas
com exatamente 5 cartas. Com 2 a 4 cartas só existem: Quadra, Trinca, Dois
Pares (só com 4 cartas), Par e Carta Alta. Com 1 carta: Carta Alta.

――――――――――――――― 4. NÍVEIS DAS MÃOS ―――――――――――――――
- Cada tipo de mão tem um nível, começando em 0. Quando o jogador USA uma mão,
  o nível daquele tipo sobe +1 imediatamente.
- Efeito do nível: +10 fichas e +1 ×mult naquele tipo (nível N = +10N fichas
  e +N ×mult).
- Na loja, tocar num tipo sobe +1 nível custando $2.
- O overlay de pontuação mostra "(nível N)" quando N > 0.

――――――――――――――― 5. OS 13 CORINGAS (máximo de 5 no total) ―――――――――――――――
| Nome                     | Ícone | Preço | Efeito exato                                                  |
| Coringa Carnavalesco     | 🎭    | $6    | +2 ×mult por cada carta vermelha (♦♥) jogada.                 |
| Coringa da Feijoada      | 🍲    | $6    | +35 fichas se a mão jogada tiver 5 cartas.                    |
| Coringa do Samba         | 🥁    | $7    | +5 ×mult se a mão for Cor, Sequência, Seq. de Cor ou Royal.   |
| Coringa Loteria          | 🎟️    | $8    | 25% de chance por mão de TRIPLICAR a pontuação final.         |
| Coringa Onça Pintada     | 🐆    | $7    | +6 ×mult se a mão tiver 3 ou mais naipes diferentes.          |
| Coringa Futebola         | ⚽    | $5    | +60 fichas se a mão tiver exatamente 3 cartas.                |
| Coringa Tio Patinhas     | 💰    | $5    | +$1 de dinheiro por mão jogada.                               |
| Coringa Caipirinha       | 🍹    | $4    | +$3 no prêmio de cada chefão vencido e −1 ×mult em todas as mãos. |
| Coringa Maracatu         | 🥁    | $6    | +10 ×mult sempre, mas cada descarte usado custa +$1.          |
| Coringa Capivara Zen     | 🦫    | $8    | +1 mão por chefão.                                            |
| Coringa Jogo do Bicho    | 🐛    | $7    | sorteia 1 carta da mão jogada e ela soma o valor em dobro.    |
| Coringa Cafézinho        | ☕    | $5    | +2 descartes por chefão.                                      |
| Coringa Meteoro          | ☄️    | $6    | +4 ×mult se a primeira carta da mão for Espadas (♠).          |
- Os efeitos disparam durante o cálculo e cada um mostra mensagem no overlay
  (ex.: "🍲 Feijoada: +35 fichas").
- Coringa comprado ou ganho grava no recorde de coringas coletados.

――――――――――――――― 6. CARTAS MELHORADAS (4) ―――――――――――――――
| Carta            | Ícone | Preço | Efeito quando jogada                                           |
| Carta de Ouro    | 🪙    | $3    | +30 fichas e +$1 de dinheiro por carta de ouro jogada.         |
| Carta de Fogo    | 🔥    | $3    | +45 fichas.                                                    |
| Carta Biônica    | ⚙️    | $5    | +4 ×mult.                                                      |
| Carta Espelho    | 🪞    | $5    | reforça o 1º Coringa: +10 ×mult se for Maracatu; +5 ×mult se for Samba em mão de Cor/Sequência; −1 ×mult se for Caipirinha. |
- As melhorias compradas ficam PENDENTES e são aplicadas às próximas cartas
  jogadas que ainda não tenham melhoria (uma melhoria por carta).
- A regra do 7º chefão ignora valores e melhorias (seção 7).

――――――――――――――― 7. OS 8 CHEFÕES (blinds) ―――――――――――――――
| # | Nome               | Ícone | Alvo  | Regra (implementação exata)                                        |
| 1 | Zé do Controle     | 🧢    | 300   | Nenhuma — rodada de aprendizado.                                   |
| 2 | Galinha dos Ovos   | 🐔    | 700   | Cartas J, Q, K e A valem o DOBRO em fichas.                        |
| 3 | Baralho Sujo       | 🃏    | 1200  | Cor NÃO vale como Cor: se a melhor mão for Cor, vira Carta Alta (20×1). |
| 4 | Mão de Gato        | 🐱    | 2000  | Cada descarte usado custa $1 do dinheiro.                          |
| 5 | Dona Astúcia       | 🎭    | 3200  | Apenas 3 mãos neste chefão (em vez de 4).                          |
| 6 | Capivara Relâmpago | ⚡    | 5000  | Nas Sequências (inclusive Seq. de Cor e Royal), cada carta vale ×1,5 (arredondado). |
| 7 | A Fera do Caos     | 👹    | 8000  | TODAS as cartas valem exatamente 10 fichas (ignora valores e melhorias). |
| 8 | DEUS DO CAOS       | 🌀    | 15000 | Cada mão recebe multiplicador aleatório entre ×0,50 e ×3,00 aplicado ao final (fichas × mult × aleatório), mostrado no overlay. |
- Prêmio por vencer, na ordem: $3, $4, $6, $8, $10, $12, $15, $25
  (+$3 em todos se o jogador tiver o Coringa Caipirinha).
- Ao atingir o alvo: vitória do chefão → prêmio → Roleta do Caos → loja
  (após o 8º chefão: tela de vitória final).

――――――――――――――― 8. ROLETA DO CAOS (janela pós-vitória) ―――――――――――――――
- Janela com título "🎰 ROLETA DO CAOS", dica, seta ▼ e uma tira horizontal
  com os 6 prêmios DUPLICADOS (12 segmentos de 84px de largura, cores
  alternadas: #d4a017, #8a1c1c, #1c6e5c, #6b3fa0, #1f6fb2, #b0781f).
- IMPORTANTE: fixe a largura total da tira por JavaScript (nº de segmentos ×
  84px) e use flex-shrink: 0 nos segmentos — isso evita a tira colapsar em
  WebViews antigos de Android.
- BOTÃO GIRAR: sorteia 1 prêmio (uniforme), anima a tira por 3,4 segundos
  (deslizando 2 a 4 voltas) e para com o prêmio sorteado no centro da seta;
  então mostra NOME + LEGENDA explicativa no campo de resultado e libera o
  botão "OK, IR À LOJA ➜". Som de ticks durante o giro.
- Prêmios e efeitos:
  | 💰 +$8 de bonificação           | recebe $8 na hora                           |
  | 🃏 +1 mão no próximo chefão     | +1 mão no chefão seguinte                   |
  | 🎁 Coringa aleatório GRÁTIS     | entra um Coringa aleatório (se houver slot; senão recebe $5) |
  | 🔥 Pontuação dobra no próximo   | todas as mãos do próximo chefão pontuam ×2  |
  | 🪙 Carta de Ouro grátis na loja | na próxima loja, a oferta de Ouro custa $0  |
  | 🌪️ O caos não te deu nada...    | nada acontece                               |

――――――――――――――― 9. LOJA DO BOTECO (tela após a roleta) ―――――――――――――――
- Cabeçalho: nome, dinheiro, título "🛒 LOJA DO BOTECO" e subtítulo.
- Seção "🎭 Coringas à venda": 3 Coringas sorteados SEM repetição (ícone,
  nome, descrição, preço, botão COMPRAR). Botão desabilitado se dinheiro
  insuficiente ou se já há 5/5 Coringas.
- Seção "⭐ Cartas melhoradas": 2 cartas sorteadas, com a dica "A melhoria é
  aplicada às próximas cartas jogadas". Se o prêmio de Ouro grátis estiver
  ativo, a oferta de Ouro custa $0 (botão GRÁTIS com 🎁).
- Seção "📈 Subir nível de mão ($2)": grade dos 10 tipos de mão mostrando
  "Nível N — X fichas • ×Y" (com o nível atual); tocar sobe +1 nível por $2.
- Seção "🗃️ Seus Coringas (n/5)": lista dos Coringas do jogador (ícone + nome
  + descrição) ou a dica "Você ainda não tem coringas. Compre alguns acima!".
- Botão "▶ CONTINUAR PARA O PRÓXIMO CHEFÃO" → próximo chefão (o prêmio de
  +1 mão e o Ouro grátis são consumidos naquele chefão/loja).

――――――――――――――― 10. TELAS E JANELAS ―――――――――――――――
TELA INÍCIO: logo "🃏 PÔQUER DO CAOS" com lema "O jogo de pôquer que não
respeita nenhuma regra"; descrição curta (8 chefões, Coringas, Rei do Boteco);
rótulo "Qual é seu nome, jogador?" com campo de texto (máximo 15 letras; o
botão só habilita com 2+ letras; Enter também envia); botão "ENTRAR NO
BOTECO"; botão "📖 COMO SE JOGA" que expande uma caixa com 6 passos de regras;
linha de recordes no rodapé.
TELA JOGO (chefão): barra superior (👤 nome, 💰 dinheiro, 👹 chefão X/8);
cartão do chefão (emoji grande, nome, regra, "pontos / alvo" e barra de
progresso colorida com transição); chips "🃏 Mãos: N", "🗑️ Descartes: N",
"🎴 N Coringas"; zona "Sua mão — toque as cartas para selecionar" com 8 cartas
clicáveis (selecionada sobe com borda dourada; naipes vermelhos em vermelho;
melhoradas com destaque); zona "Selecionadas (n/5)"; botões "🔥 JOGAR MÃO"
(desabilitado fora de 1 a 5 cartas ou sem mãos), "🗑️ DESCARTAR" (mostra
"(-R$1)" quando tem custo) e "🔤 ORDENAR"; log com as últimas 6 mensagens.
JANELA DE PONTUAÇÃO (overlay ao jogar mão): nome da mão + "(nível N)";
fichas detalhadas (base + cartas + extras); ×mult total (+ multiplicador
aleatório do Deus do Caos, se houver); mensagens dos Coringas e melhorias;
pontos grandes com animação de "pop"; aviso "🔥 PONTOS DOBRADOS!" quando
aplicável; botão CONTINUAR. Em mão de 600+ pontos: a tela inteira treme.
JANELA DA ROLETA: ver seção 8.
JANELA DE CONFETE: 60 peças coloridas caindo (1,6 a 3,6 s) nas vitórias.
TELA FIM: vitória 🏆 "VOCÊ VENCEU O CAOS!" + "você é o Rei do Boteco 👑";
derrota 💀 "O CAOS VENCEU" + "Chefão alcançado: nº — nome"; ambas mostram
pontuação total e recorde; botão "🔄 NOVA PARTIDA" volta ao início.

――――――――――――――― 11. SONS (Web Audio API, sem arquivos) ―――――――――――――――
Mini sintetizador com osciladores: carta 560 Hz quadrada 0,07 s; seleção
880 Hz senoidal 0,05 s; jogar 440 Hz + 660 Hz quadradas; vitória arpejo
523/659/784/1047 Hz triângulo; derrota 400/320/240/160 Hz serra; compra
1180 Hz triângulo; roleta 20 ticks aleatórios de 300 a 1200 Hz. Criar o
AudioContext no primeiro gesto do usuário; qualquer falha de áudio nunca
pode quebrar o jogo.

――――――――――――――― 12. RECORDES (localStorage) ―――――――――――――――
Chave "pokerCaos_records_v1" com: melhorPuntaje, chefesVencidos (maior nº de
chefões vencidos), partidas, coringasTotales. Exibir na tela inicial:
"🏅 Recorde: X pts • 👹 Chefões vencidos: Y/8 • 🎮 Partidas: N • 🗃️ Coringas
coletados: N". Atualizar nas vitórias, derrotas e ao comprar/ganhar Coringas.

――――――――――――――― 13. ESTILO E ANIMAÇÕES ―――――――――――――――
- Paleta: fundo verde feltro #0b3d2e; dourado #d4a017 (títulos, bordas,
  botões); vermelho #8a1c1c; creme #f5efe0 para texto; verde claro #1c6e5c.
- Tipografia do sistema; tamanhos com clamp() (responsivo em celular e
  desktop); botões grandes (altura mínima 48px) com estados hover, active e
  disabled bem visíveis.
- Cartas em CSS puro: brancas, valor e naipe no canto superior e inferior,
  versão vermelha para ♦♥, elevação ao selecionar, destaque para melhoradas.
- Animações CSS: cartas entram em cascata (delay de 0,03 s por carta,
  reforçada a cada nova mão); "pop" (scale) nos pontos; tremor do body em mão
  de 600+ pontos; confete; barra de progresso com transição de largura.
- Janelas: overlay escuro com caixa central; a classe .oculta (display: none)
  controla telas e janelas.

――――――――――――――― 14. CRITÉRIO DE PRONTO (confira antes de terminar) ―――――――――――――――
1. index.html abre no navegador sem erros no console e roda uma partida
   completa (nome → 8 chefões → vitória final; e também o caminho de derrota).
2. Todos os números conferidos: fichas/×mult das 10 mãos, preços dos 13
   Coringas, alvos e regras dos 8 chefões, prêmios ($3 a $25), $6 inicial,
   $2 por nível, 4 mãos/3 descartes, 5 Coringas no máximo.
3. Sem frameworks, bibliotecas ou imagens externas; apenas os 4 arquivos.
4. Interface 100% em português do Brasil, com sons, animações, recordes e
   responsividade para celular.
```

## 2. Prompts de reserva (cole no MESMO chat, só se precisar)

**A. Corrigir bug:**

```text
Encontrei um problema: [descreva o que você fez, o que aconteceu e o que era
esperado — ex.: "clicar em JOGAR MÃO com 2 cartas dá erro no console"].
Corrija seguindo a especificação do primeiro prompt, sem mudar regras nem
valores, e explique em 3 linhas o que alterou.
```

**B. Completar requisito:**

```text
O requisito "[descreva o que falta — ex.: a barra de progresso do chefão não
atualiza]" da especificação não está funcionando. Implemente/ajuste e confira
a lista completa da especificação para garantir que nada mais está faltando.
```

**C. Revisão geral (opcional):**

```text
Revise o jogo inteiro contra a especificação do primeiro prompt, liste tudo
que estiver diferente ou faltando e corrija.
```

## 3. Antes de mostrar ao professor (checklist)

- [ ] Abrir o Antigravity com o **histórico da conversa** visível (painel do agente) — o pedido completo e o desenvolvimento estão lá;
- [ ] Abrir `index.html` no navegador e **jogar uma partida na frente dele** (mostre Coringas, roleta e loja);
- [ ] Pasta do projeto **guardada** (backup) — o histórico fica associado a ela;
- [ ] Nada da conversa foi apagado — as mensagens de correção contam como o ciclo "testar → corrigir" do roteiro.
