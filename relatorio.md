# ROTEIRO DE ATIVIDADE PRÁTICA

## DESENVOLVIMENTO DE SISTEMAS

### DESAFIO: MEU PRIMEIRO APLICATIVO AUTÔNOMO

**Nome do estudante:** _______________________

**Turma:** _____________ **Data:** ____/____/______

**Professor:** _______________________

---

## 1. TEMA DA ATIVIDADE

Desenvolvimento de um aplicativo web interativo — o **Pôquer do Caos**, um jogo de cartas caótico em turnos, inspirado nos jogos de sucesso *Balatro* e *Luck be a Landlord*: o jogador monta mãos de pôquer, aplica efeitos caóticos de cartas especiais e enfrenta 8 "chefões" com regras absurdas.

O jogo foi feito **100% com tecnologia web (HTML, CSS e JavaScript puro)**, sem bibliotecas externas, e roda tanto no navegador quanto instalado como aplicativo Android (APK gerado com Capacitor).

## 2. OBJETIVOS ATENDIDOS

| Objetivo do roteiro | Onde foi atendido |
|---|---|
| Planejar antes de desenvolver | Etapas 1 e 2 deste relatório (escritas antes do código) |
| Identificar um problema a solucionar | Etapa 1.2 (distrativo leve com desafio mental) |
| Definir as funcionalidades do sistema | Etapa 1.4 e seção "O Jogo" |
| Elaborar descrição clara para orientar o desenvolvimento | "Pedido de desenvolvimento" da Etapa 3 |
| Utilizar ferramenta de desenvolvimento assistido | Desenvolvimento assistido por IA no VS Code (Cline) |
| Analisar resultado, testar, identificar problemas, corrigir, melhorar | Etapas 4 a 7 |
| Compreender interface, interação e comportamento | Separação em três arquivos: estrutura (HTML), aparência (CSS) e comportamento (JS) |

## 3. O DESAFIO — O QUE FOI FEITO

**Categoria:** Jogos.

**Descrição em uma frase:** sobreviva a 8 chefões caóticos armando mãos de pôquer cada vez mais absurdas, comprando Coringas brasileiros que quebram as regras do jogo.

## 4. REQUISITOS MÍNIMOS — ONDE CADA UM ESTÁ

| # | Requisito | Como o Pôquer do Caos atende |
|---|---|---|
| 1 | **Título** | "PÔQUER DO CAOS" em destaque na tela inicial |
| 2 | **Descrição** | Parágrafo de apresentação + seção "Como Jogar" |
| 3 | **Três ou mais informações** | Dinheiro (R$), chefão atual (1/8), pontos/alvo, mãos, descartes, Coringas, barra de progresso |
| 4 | **Campo de entrada** | Campo "Seu nome" na tela inicial — aparece no jogo e na loja |
| 5 | **Botão** | JOGAR MÃO, DESCARTAR, ORDENAR, GIRAR ROLETA, COMPRAR, CONTINUAR, NOVA PARTIDA |
| 6 | **Interação** | Toque/clique nas cartas para selecionar; botões respondem imediatamente |
| 7 | **Resultado** | Janela de pontuação (fichas × mult), pontos somados, barra do chefão atualiza |
| 8 | **Animação** | Cartas em cascata, números crescem ("pop"), tela treme ao vencer, roleta desliza, confete final |
| 9 | **Interface** | Tema "boteco místico" (verde feltro + dourado), cartas em CSS puro, botões grandes |
| 10 | **Idioma** | Todos os textos em português do Brasil |

---

## 5. ETAPA 1 — PLANEJAMENTO

### 5.1 Nome do aplicativo

**Nome:** Pôquer do Caos

### 5.2 Qual problema o aplicativo pretende resolver?

Oferecer um passatempo rápido (partidas de 5 a 10 minutos) que divirta e exercite o raciocínio: o jogador avalia probabilidades, decide quais cartas guardar ou descartar e planeja em qual combinação de Coringas investir seu dinheiro limitado. É um quebra-cabeça disfarçado de jogo de cartas — dá aquela vontade de "só mais uma partida" sem exigir reflexo.

### 5.3 Quem utilizará o aplicativo?

Estudantes e jovens que gostam de jogos de cartas e de estratégia "roguelike" (partidas curtas com progressão). Não exige conhecimento prévio de pôquer: a tela inicial explica as combinações e cada chefão avisa sua regra especial.

### 5.4 O que o usuário poderá fazer?

1. **Digitar seu nome** e começar uma partida;
2. **Selecionar de 1 a 5 cartas** e **jogar a mão** para somar pontos, ou **descartar** cartas ruins;
3. **Comprar Coringas e cartas melhoradas** na loja, subir o nível das mãos e **girar a Roleta do Caos** após cada vitória;
4. **Ordenar a mão** por naipe/valor e acompanhar seus recordes salvos no aparelho.

### 5.5 Qual será a principal ação do aplicativo?

**Jogar uma mão de pôquer.** Ao tocar em "JOGAR MÃO", o jogo identifica a melhor combinação entre as cartas selecionadas (Par, Trinca, Cor...), soma as fichas das cartas, multiplica pelo multiplicador da mão + bônus dos Coringas + regras do chefão, e apresenta o resultado com animação. Se os pontos atingirem o alvo do chefão antes de acabarem as mãos, o jogador vence, ganha dinheiro e avança; senão, a partida acaba.

---

## 6. ETAPA 2 — PLANEJAMENTO DA INTERFACE

Desenho simples da tela principal (um chefão), feito antes do desenvolvimento:

```
+----------------------------------------------------+
|  👤 NOME          💰 R$12            👹 3/8         |
+----------------------------------------------------+
|  [ 🐔 ]  Galinha dos Ovos        1.240 / 700       |
|  Figuras valem o dobro  ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░ 100%      |
+----------------------------------------------------+
|  🃏 Mãos: 4   🗑️ Descartes: 3   🎰 2 Coringas      |
+----------------------------------------------------+
|  Sua mão — toque as cartas para selecionar          |
|  [A♠] [K♠] [Q♠] [J♠] [10♠] [7♥] [2♦] [9♦]         |
+----------------------------------------------------+
|  Selecionadas (5/5)                                 |
|  [A♠] [K♠] [Q♠] [J♠] [10♠]   -> ROYAL FLUSH!      |
+----------------------------------------------------+
|  [ 🔥 JOGAR MÃO ] [ 🗑️ DESCARTAR ] [ 🔤 ORDENAR ]   |
+----------------------------------------------------+
|  Log: "🎟️ LOTERIA! Pontos TRIPLICADOS!"            |
+----------------------------------------------------+
```

Outras telas planejadas: tela inicial (nome + regras + recordes), **loja do boteco** (Coringas, cartas melhoradas, subir nível das mãos), janela de pontuação, **Roleta do Caos** (após cada vitória) e tela final (vitória/derrota + recordes).

---

## 7. ETAPA 3 — DESENVOLVIMENTO

### Pedido de desenvolvimento (como a ferramenta foi solicitada)

> "Crie um jogo chamado **Pôquer do Caos**, para o público jovem, em português do Brasil. O jogador digita o nome e enfrenta 8 chefões com alvos crescentes (300 a 15.000 pontos) e regras especiais. Cada rodada: compra 8 cartas de um baralho de 2 cópias, seleciona de 1 a 5, joga a mão (fichas × multiplicador por combinação de pôquer) ou descarta. São 4 mãos e 3 descartes por chefão. Ao vencer, ganha dinheiro e gira a Roleta do Caos. Na loja, compra até 5 Coringas com efeitos brasileiros (Carnavalesco, Feijoada, Loteria...), cartas melhoradas (Ouro, Fogo, Biônica, Espelho) e sobe o nível das mãos. Visual de boteco místico em verde e dourado, botões grandes para celular, animações em CSS, recordes salvos no aparelho. Precisa funcionar em tamanhos de tela diferentes."

### Como o projeto foi organizado

| Arquivo | Papel | Destaques |
|---|---|---|
| `app/index.html` | Estrutura (4 telas + 4 janelas sobrepostas) | 54 elementos com ID |
| `app/style.css` | Aparência e animações | Tema boteco, cartas em CSS puro, `clamp()` para responsividade |
| `app/logica.js` | **Lógica pura** (sem tela) | Baralho, avaliador de mãos, pontuação, Coringas, chefões, roleta |
| `app/script.js` | Comportamento da interface | Máquina de estados, sons sintetizados, recordes (`localStorage`) |

**Decisão técnica mais importante:** separar a lógica do jogo (`logica.js`) da interface (`script.js`). Assim a lógica roda no navegador **e** no Node.js, permitindo **testes automatizados de verdade** (32 testes unitários + simulação de 200 partidas pelo método de Monte Carlo).

**Principais mecânicas implementadas:**

- 10 combinações de pôquer (Carta Alta a Royal Flush), cada uma com fichas/multiplicador;
- Nível por tipo de mão: jogar a mesma combinação a deixa mais forte (+10 fichas e +1 ×mult por nível);
- 13 Coringas com efeitos que quebram regras; 8 chefões com regras caóticas (ex.: "Cor não vale como Cor", "todas as cartas valem 10");
- Roleta do Caos com 6 prêmios possíveis; recordes e estatísticas salvos no aparelho.

---

## 8. ETAPA 4 — PRIMEIRO TESTE

Tabela de testes preenchida após o desenvolvimento (testes manuais no navegador + verificação automatizada com jsdom):

| Teste | Funcionou? | Observação |
|---|---|---|
| O aplicativo abriu corretamente? | **Sim** | Abre direto no navegador (`index.html`) e no WebView do APK |
| O título aparece corretamente? | **Sim** | "Pôquer do Caos" com estilo neon-dourado |
| Os textos estão em português? | **Sim** | Revisão geral; encontrou e corrigiu o naipe "Paus" → "Espadas" |
| O campo de entrada funciona? | **Sim** | Nome digitado aparece na barra do jogo e da loja |
| O botão aparece corretamente? | **Sim** | Ficam desabilitados quando a ação não é possível (ex.: sem cartas selecionadas) |
| O botão executa a ação esperada? | **Sim** | Mão avaliada, pontos somados, cartas repostas do baralho |
| O resultado aparece corretamente? | **Sim** | Janela mostra fichas × mult detalhados; barra de progresso do chefão atualiza |
| A animação funciona? | **Sim** | Cascata das cartas, "pop" da pontuação, tremor de tela na vitória, confete final |
| A aplicação está organizada visualmente? | **Sim** | Tema boteco coerente; testado também em tela estreita (celular) |
| A aplicação funciona em diferentes tamanhos de tela? | **Sim** | Layout fluido com `clamp()`; testado redimensionando a janela de 360 px a desktop |

**Verificações automatizadas extras** (não exigidas pelo roteiro, feitas como apoio):
- `npm test` → 32 testes da lógica + verificação de IDs + 17 verificações de interface simulada: **todos passaram**;
- `npm run simular` → 200 partidas simuladas aleatórias para checar o equilíbrio dos alvos dos chefões.

## 9. ETAPA 5 — IDENTIFICANDO PROBLEMAS

**Problema encontrado:** a barra de progresso do chefão não aparecia na tela.

**O que deveria acontecer?** A barra deveria encher (em cor dourada) conforme os pontos se aproximam do alvo do chefão, e ficar cheia/destacada quando o alvo é alcançado.

**O que realmente aconteceu?** O JavaScript atualizava a largura da barra (`barra.style.width = taxa + '%'`), mas nenhum preenchimento aparecia — a barra ficava sempre invisível. Causa: no HTML, o elemento interno da barra foi criado **sem a classe CSS** que dá cor e preenchimento (`relleno`), então tinha largura mas nenhuma aparência.

*(Problema secundário encontrado na revisão de textos: o naipe ♠ estava com o nome "Paus", mas no baralho em português ♠ é "Espadas" — Paus é ♣. Isso confundiria quem conhece baralho.)*

## 10. ETAPA 6 — CORREÇÃO

**Problema corrigido?** ( **X** ) Sim  (  ) Não

**O que foi alterado?**

1. Adicionada a classe que faltava no HTML: `<div id="barra-progresso" class="relleno"></div>` — agora a largura alterada pelo JavaScript tem cor e altura visíveis;
2. Corrigida a nomenclatura do naipe ♠ de "Paus" para "Espadas" na lista de naipes e na descrição do Coringa Meteoro;
3. (Extras do build) Ajustado o `.gitignore` para o projeto Android com os ícones personalizados poder subir ao GitHub, e removido do workflow do GitHub Actions um passo que falharia quando a pasta já existe.

**O problema foi resolvido?** ( **X** ) Sim  (  ) Não

Comprovação: a verificação automatizada de interface foi **atualizada para testar exatamente esse cenário** (jogar uma mão que vence o chefão → fechar a janela de pontuação → conferir que a largura da barra é atualizada). Suíte completa reexecutada: 32 + 17 verificações, **0 falhas**.

## 11. ETAPA 7 — MELHORIA

Pergunta feita a si mesmo: "Se eu fosse um usuário, o que poderia ser melhor?"

**Minha melhoria será:** um botão **🔤 ORDENAR** que organiza as cartas da mão automaticamente — agrupa por naipe e ordena por valor dentro de cada naipe.

Por quê: com 8 cartas na mão, é difícil enxergar sequências e cores espalhadas; ordenar deixa as combinações "saltarem aos olhos" e reduz erro de seleção, especialmente no celular.

**Como foi implementada:** função `ordenarMano()` no `script.js` (ordena o vetor da mão por índice de naipe e valor, e re-renderiza com a animação de cascata), botão adicionado na seção de ações. Testado manualmente e revalidado pela suíte automatizada: as cartas ficam agrupadas por naipe em ordem crescente.

---

## 12. DESAFIO EXTRA

**Minha funcionalidade extra:** a **Roleta do Caos** — após vencer cada chefão, o jogador gira uma roleta que premia um efeito aleatório entre seis possibilidades: `+$8`, `+1 mão extra` no próximo chefão, `pontos dobrados` no próximo chefão, `coringa grátis` da loja, `cartas de ouro` na próxima compra, ou **nada** (porque "isso é o Caos").

**Por que escolhi essa funcionalidade?** Queria reforçar o tema do jogo (o CAOS) com um elemento de sorte que ninguém controla. A roleta cria antecipação: mesmo quem venceu com folga fica curioso para ver o prêmio, e o prêmio muda a estratégia do próximo chefão (por exemplo, com pontos dobrados vale arriscar mãos maiores). Também exigiu aprender coisas novas: desenho de roleta com CSS girando (`@keyframes` com `transform: rotate()`), sorteio com probabilidade ponderada e integração do prêmio ao estado da partida.

---

## 13. REFLEXÃO SOBRE A ATIVIDADE

**1. Qual foi a maior dificuldade encontrada durante o desenvolvimento?**
Organizar a lógica de pontuação para que tudo acontecesse na ordem certa: primeiro as fichas das cartas, depois os bônus dos Coringas, depois os multiplicadores e só então a comparação com o alvo do chefão. Resolvi separando a lógica pura em um arquivo próprio (`logica.js`) e testando ela isoladamente com testes automatizados antes de ligar na tela.

**2. O aplicativo ficou exatamente como você havia planejado?**
( ) Sim  ( **X** ) Parcialmente  (  ) Não
**Explique:** o núcleo ficou fiel ao desenho de tela da Etapa 2 (barra do chefão, mão de cartas, botões, log de mensagens). Durante o desenvolvimento percebi que precisava de detalhes que não estavam no desenho: uma janela separada mostrando o detalhe fichas × mult (senão o jogador não entende de onde veio a pontuação) e a indicação de quantas mãos/descartes restam bem visível, porque sem isso o jogador se perdia.

**3. Você encontrou algum problema durante os testes?**
( **X** ) Sim  (  ) Não
**Se sim, qual?** A barra de progresso do chefão não aparecia na tela (descrito na Etapa 5). Também foi encontrada na revisão a troca indevida dos nomes dos naipes (♠ aparecendo como "Paus").

**4. Como você resolveu o problema?**
Comparando o HTML com o CSS e percebendo que faltava a classe que dá cor ao preenchimento da barra; adicionei a classe e criei um teste automatizado que reproduz o fluxo completo (jogar mão vitoriosa → fechar janela → conferir a barra), para o erro nunca voltar sem ser notado. O nome do naipe foi corrigido na lista de naipes e na descrição do Coringa.

**5. O que você aprendeu durante esta atividade?**
Que planejar antes (nome, público, ações, tela) evita refazer trabalho; que separar lógica de interface ajuda a testar e encontrar erros; que testar de verdade (seguindo uma tabela) revela problemas que "parece que funciona" esconde; e que detalhes de idioma (nomes dos naipes, textos do jogo) fazem diferença na qualidade final.

**6. Se tivesse mais tempo, o que acrescentaria ao aplicativo?**
Um sistema de "run em dificuldade maior" (após vencer os 8 chefões, recomeçar com alvos mais altos e prêmios melhores), mais Coringas desbloqueáveis por conquistas (ex.: "vencer um chefão só com Flush") e um modo de dois jogadores passando o celular, onde cada um tem um chefão próprio e vence quem sobreviver mais longe.

---

## 14. APRESENTAÇÃO

Roteiro que será usado para demonstrar o trabalho ao professor:

1. **Nome:** Pôquer do Caos — jogo de pôquer caótico em estilo "Balatro".
2. **Problema que pretende resolver:** a maioria dos jogos de cartas fica entediante rápido porque não recompensa a criatividade; o Pôquer do Caos resolve isso dando efeitos caóticos que mudam as regras a cada partida, incentivando o jogador a pensar em combinações cada vez melhores.
3. **Público-alvo:** estudantes e jovens que gostam de jogos de cartas/estratégia rápidos, jogáveis no celular em partidas curtas.
4. **Principais funcionalidades:** mãos de pôquer pontuadas (fichas × multiplicador), 13 Coringas brasileiros com efeitos caóticos, 8 chefões com regras que alteram as partidas, loja de cartas melhoradas, Roleta do Caos, níveis das mãos, recordes salvos no aparelho e apostas "dobro ou nada".
5. **Como o usuário interage:** digita o nome → seleciona de 1 a 5 cartas tocando nelas → usa os botões (jogar, descartar, ordenar) → acompanha os pontos → compra melhorias na loja → gira a roleta. Tudo por toque, pensado para celular.
6. **Uma dificuldade encontrada:** a barra de progresso do chefão não aparecia mesmo com o JavaScript atualizando-a.
7. **Como o problema foi solucionado:** faltava a classe CSS no elemento do HTML; corrigido e garantido com um teste automatizado que reproduz o fluxo.
8. **Uma melhoria realizada:** botão ORDENAR que agrupa as cartas por naipe e valor, facilitando a visualização das combinações (principalmente no celular).

**Explicação técnica (para demonstrar domínio):**
- `index.html`: estrutura e as três telas (início, jogo/loja, fim);
- `style.css`: tema "boteco" (verde + dourado), cartas em CSS puro (sem imagens), animações com `@keyframes`, layout responsivo com `clamp()`;
- `logica.js`: lógica pura (baralho de 104 cartas, avaliação das mãos, efeitos dos Coringas, regras dos chefões) — funciona também no Node.js, o que permite os testes automatizados;
- `script.js`: interface — máquina de estados (início → chefão → loja → fim), renderização, sons sintetizados (Web Audio API, sem arquivos de áudio) e recordes no `localStorage`;
- Empacotamento Android com **Capacitor** (WebView nativo, sem internet) e compilação do APK automática via **GitHub Actions**.

---

## 15. ENTREGA

| Item do roteiro | Onde está |
|---|---|
| 1. Aplicativo funcionando | pasta `app/` — abre com duplo clique no `index.html`; e como APK instalado no celular |
| 2. Planejamento preenchido | Etapas 1 e 2 deste documento |
| 3. Tabela de testes preenchida | Etapa 4 deste documento |
| 4. Registro de problemas e correções | Etapas 5 e 6 deste documento |
| 5. Respostas da reflexão | Etapa 13 deste documento |
| 6. Apresentação | Roteiro na Etapa 14 |

### Bônus técnico: do navegador para o APK
O mesmo jogo foi empacotado como aplicativo Android: o **Capacitor** embute os arquivos do jogo em um projeto nativo (o app roda offline no WebView do próprio Android), os ícones foram gerados por um script em Python e o **APK é compilado automaticamente no GitHub Actions** ao enviar o código ao repositório — bastando baixar o artefato `PokerDoCaos-APK` e instalar no celular.

## 16. ATO 2 — BALANCEAMENTO, ROGUELITE E LORE

Depois do desafio extra, o jogo foi medido com uma simulação de Monte Carlo: uma "IA" que joga sempre a melhor mão vencia **98%** das partidas — fácil demais. A versão 0.2.0 foi redesenhada com base no sistema do *Balatro*:

### 16.1 Balanceamento (medido com o simulador)
- **Alvos escalando exponencialmente:** 300 · 900 · 2.500 · 6.500 · 12.000 · 22.000 · 55.000 · 150.000;
- **Prêmios menores:** $3, $3, $4, $5, $7, $9, $12, $15 (antes chegava a $25);
- **Juros do caixa:** +$1 por cada $10 guardados ao fim de cada chefão (teto $4) — guardar dinheiro virou estratégia;
- **Nerfs nos Coringas:** Carnavalesco +1 (antes +2), Maracatu +5 (antes +10), Loteria 15% (antes 25%), Onça +4 (antes +6), Futebola +45 (antes +60), Cafézinho +1 descarte (antes +2), Meteoro +3 (antes +4) — e a Feijoada foi buffada para +50;
- **Nível de mão progressivo:** subir um nível custa $2 e sobe $1 a cada 2 níveis (antes era $2 para sempre);
- **Tio Patinhas corrigido:** $2 por chefão vencido (antes $1 por mão jogada — pagava demais);
- **Resultado medido:** a taxa de vitória da IA perfeita caiu de **98% para 26%** (1.000 partidas simuladas).

### 16.2 Espaços de Coringa estilo Balatro
Os 5 espaços fixos pareciam forçados. Agora: **4 espaços base** e a loja vende **"+1 Espaço" por $10** (no máximo 2 por partida, até 6) — igual aos vouchers do Balatro.

### 16.3 Roguelite — "Caixa do Boteco"
A derrota agora libera progresso permanente (salvo no aparelho) — 7 desbloqueios com toast comemorativo: Clientela Fiel (+$2 inicial), Confiança do Barman (começa a partida com 1 Coringa), Estante de Garrafas (vende +1 espaço), Juros do Caixa (teto $8), Colecionador (3 Coringas raros entram na loja: Feira Noturna, Zorra Total e Amigo Fantasma), Sorte Grande (Loteria volta a 25%) e Coroa do Boteco (+1 descarte e título dourado).

### 16.4 Lore e falas
Cada chefão tem **falas em 4 momentos** (balão de fala no cartão + registro no log): entrada, jogador alcança 75% do alvo, vitória do jogador e derrota — ex.: a Galinha dos Ovos provoca ("Có-có! Aposto meus ovos que você NÃO passa!") e se lamenta ao perder.

### 16.5 Contagem de pontos à Balatro
A antiga "letra miúda" do resultado virou matemática viva: fichas e ×mult pulsam na tela, cada carta ativa uma a uma, os Coringas disparam em sequência (tremendo na fileira) e o total **explode** ao final — com novos efeitos sonoros e um toque que acelera a contagem.

### 16.6 Manutenção — v0.2.1 (correções de bugs)
- **Roleta reescrita à prova de WebView**: a animação deixou de depender de `flex` + `transition: left` (frágil em WebView antigo) e passou a usar **`requestAnimationFrame` com `transform: translateX`** — funciona em qualquer navegador/WebView. A pista também ganhou fundo listrado para nunca parecer vazia;
- **Botão ORDENAR**: depois da contagem animada ele ficava travado para sempre (só JOGAR/DESCARTAR eram reabilitados) — agora os 3 botões são reabilitados corretamente;
- **Chefão maior**: o emoji do chefão cresceu de 2,4rem para `clamp(2,6rem, 11vw, 3,8rem)` no cartão;
- Validado com as 2 novas verificações de interface (ORDENAR reabilitado + roleta com 12 segmentos).

**Validação do Ato 2:** 53 testes unitários, 22 verificações de interface e calibração com 1.000 partidas simuladas.

## 17. ATO 3 — PÓS-TESTE: CORREÇÕES, DIFICULDADE E QUALIDADE DE VIDA

Depois de jogar de verdade em celular e desktop, os seguintes ajustes foram feitos (v0.3.0):

### 17.1 Bug de lógica corrigido — Sequências com 3 e 4 cartas
O avaliador de mãos só reconhecia sequência com **exatamente 5 cartas**: mãos como `5♠ 6♥ 7♣` (sequência de 3) ou `9♦ 10♠ J♣ Q♥` (de 4) caíam como "Carta Alta" ou "Par". Corrigido o avaliador (`esEscalera`/`avaliarMao`) para aceitar **3 a 5 cartas consecutivas**, incluindo o Ás baixo em sequências curtas (A-2-3, A-2-3-4). Agora Sequência, Cor e Sequência de Cor funcionam com 3, 4 ou 5 cartas — igual ao *Balatro*.

### 17.2 Dificuldade — fim do "nível grátis"
Antes, o nível da mão subia **automaticamente** cada vez que a mão era jogada, o que tornava o jogo fácil demais no fim da partida. Agora o nível de mão **só sobe comprando na loja** — o jogador precisa decidir entre investir dinheiro em Coringas, cartas melhoradas ou níveis de mão, criando decisões estratégicas reais de gestão de recursos (como no *Balatro*).

### 17.3 Coringas com risco e recompensa (trade-offs)
Novos Coringas com poder forte **mas** desvantagem, para decisões difíceis:
- 🎰 **Cassino** — ×2 ×mult, mas −$2 por mão jogada;
- 🔮 **Vidente** — +60 fichas, mas −1 descarte por chefão;
- ⚖️ **Juiz** — +8 ×mult em mãos fracas (Carta Alta/Par), −4 ×mult em mãos fortes;
- 💣 **Bomba** — 30% de +100 fichas, 20% de perder $5;
- 🎟️ **Loteria** — agora tem lado negro: 15% de TRIPLICAR, mas 15% de DIVIDIR os pontos por 2.

### 17.4 Bug de economia corrigido — descartar sem dinheiro
Com o chefão "Mão de Gato" (descartes custam $1) ou o Coringa Maracatu, era possível **descartar sem ter dinheiro** (o custo era simplesmente zerado). Agora: o botão mostra **"💸 SEM DINHEIRO"** e fica desabilitado quando o custo supera o caixa, e a função de descarte bloqueia a ação com a mensagem "Dinheiro insuficiente para descartar!".

### 17.5 Interface — mobile-first e legibilidade
- **Chefão redesenhado:** ícone grande dentro de um círculo dourado flutuante ao lado do nome e da regra (antes: campo vazio e texto apertado);
- **Botões fixados no rodapé** (barra sempre visível, sem precisar rolar a tela para achar "JOGAR MÃO" — inclusive em telas altas/DPI alta);
- **Layout mobile-first:** media query para telas ≤360 px, alvos de toque ≥44 px, `safe-area-inset` para telas com notcha;
- **Painel de Coringas ativos** na tela de jogo, com ícone + nome + descrição (antes eram só emojis);
- **Mini board de mãos** (botão "📖 Mãos"): painel com a hierarquia completa das 10 combinações, condição de formação, fichas × mult e nível atual de cada uma;
- **Roleta robustecida:** animação por CSS transition com centralização prévia da pista e fallback por `requestAnimationFrame`.

### 17.6 Texto corrigido
Fala de entrada da Dona Astúcia reescrita ("Apenas três mãos, querido. Quem sabe fazer mais, faz com menos.").

**Validação do Ato 3:** suíte de testes expandida e reexecutada — **69 testes unitários, 0 falhas** (incluindo novos testes de sequências curtas, Loteria dividindo, Cassino, Vidente, Juiz e Bomba).

## 18. ATO 4 — POWER FANTASY, CAOS VISUAL E MODO CHARA (v0.4.0)

Uma rodada focada em sensação de poder, apresentação caótica do dano e ferramentas de teste no celular.

### 18.1 O nível da mão volta a subir ao jogar
A mudança do Ato 3 (nível só na loja) foi revertida: **jogar uma mão agora sobe o nível dela** (+10 fichas, +1 ×mult). Combinado com a compra na loja, isso cria "builds" aceleradas — números gigantes na tela e sensação de crescimento, no espírito do *Balatro*. A loja continua sendo o atalho para focar uma mão específica.

### 18.2 Cálculo de dano caótico + vida do chefão
O resultado da mão agora é apresentado de forma mais fluida e "agressiva":
- A sequência de pontos (mão → cartas → coringas → total) é encadeada com animação;
- Ao final, um **número de dano flutuante** (`-2.350`) sobe do cartão do chefão;
- O ícone do chefão recebe um **frame de dor**: fica cinza e treme por ~0,7s (efeito `grayscale` + shake);
- A barra de progresso representa a "vida" do chefão, esvaziando conforme o dano entra.

### 18.3 Coringas build-around (menos aleatórios, mais estratégicos)
Quatro coringas que recompensam **construir em torno de uma ideia** (condição consistente, não sorte):
- 🚬 **Cartomante** — +1 ×mult **acumulado** por cada chefão vencido na partida (aumenta quanto mais longe você vai);
- 🐝 **Enxame** — +2 ×mult se TODAS as cartas jogadas forem do mesmo naipe;
- 👑 **Farejador** — +40 fichas por cada carta de Espadas (♠) jogada;
- 📚 **Bibliotecário** — +3 ×mult ao jogar exatamente 2 cartas.

### 18.4 Modo CHARA — controle de teste temático (Undertale)
Digitando **"chara"** (qualquer maiúscula/minúscula) no campo de nome, ativa-se um modo de teste com um badge 👻 na barra superior. Ele concede **cinco Coringas cheat** que isolam sistemas para testar no celular, **não entram na loja/roleta** e **não gravam recordes**:
- ❤️ **Determinação** — não morre: ficar sem mãos reinicia o chefão atual (permite testar cada regra à vontade);
-  **Karma** — qualquer mão derrota o chefão instantaneamente (testa o fluxo de vitória/roleta/loja);
- 🐶 **Temmie** — dinheiro infinito (testa a loja inteira; exibido como "hOI! R$...");
- 🕷️ **Muffet** — descartes infinitos e grátis (testa o descarte e o bug do Mão de Gato);
- ⬛ **O Vazio** — alvos dos chefões viram 1 ponto (testa o fluxo completo do zero em segundos).

### 18.5 Validação
- Suíte de testes expandida com os novos coringas build-around e a verificação dos 5 cheats: **78 testes unitários, 0 falhas**;
- Sintaxe validada com `node --check` em `logica.js` e `script.js`;
- **Rebalanceamento medido:** como o nível de mão volta a subir ao jogar, o simulador de Monte Carlo (200 partidas) foi rodado de novo. A taxa de vitória da IA perfeita ficou em **29%** (contra 26% do Ato 2) — levemente mais fácil, o que é coerente com a "power fantasy" pretendida sem quebrar o desafio. Os alvos **não precisaram ser alterados**.

### 18.6 Consolidação para a Release v0.4.0
Antes da publicação, uma limpeza final de consistência:
- O tremor dos Coringas durante a contagem animada foi **realojado no painel de Coringas** (`lista-coringas`), pois a antiga tira de emojis foi removida da tela no redesenho — função morta `renderTiraCoringas` eliminada;
- A checagem de fumaça da roleta foi atualizada para os **18 segmentos** do desenho novo (antes esperava 12);
- Versão nativa elevada para `versionCode 4` / `versionName "4.0"` e projeto Android ressincronizado (`npx cap sync`);
- Revalidação completa: **78 testes unitários, 0 falhas · 22/22 verificações de interface · 0 IDs em falta**.

### 18.7 Correções pós-release (v0.4.1)
Jogando a v0.4.0 de verdade no celular, três problemas apareceram e foram resolvidos:
- **"undefined" no overlay**: o nome da mão exibido vinha do campo errado (`res.mao.nome` em vez de `res.mao.nombre`) — toda mão jogada mostrava "undefined". Corrigido e coberto por verificação de interface;
- **Roleta reescrita com o padrão do Antigravity**: o giro antigo somava voltas extras além do fim da tira (o deslocamento chegava a -2.400px numa tira de 1.512px — no celular a pista ficava vazia). O novo desenho usa o layout provado: viewbox de largura fixa (252px), tira no fluxo normal (sem `position: absolute`) e **uma única transição CSS em `transform`**, com o prêmio sempre na cópia do meio da tira;
- **Modo CHARA revisado**: o cheat Karma virou um **botão "🔪 KARMA — DANO TOTAL"** (aplica o dano pelo fluxo visual completo — número flutuante, frame de dor e barra de vida — e segue para a roleta/loja, permitindo analisar a luta); o cheat **O Vazio foi removido** (abolia os alvos e impedia testar a dificuldade real). Ficaram 4 cheats: Determinação, Karma (botão), Temmie e Muffet.

**Validação da v0.4.1:** testes unitários 0 falhas · **24 verificações de interface** (2 novas: nome da mão sem "undefined" e botão KARMA oculto fora do CHARA) · 0 IDs em falta · sonda jsdom confirmou mão "Par" no overlay, KARMA aplicando 300/300 de dano e a roleta girando até `-504px` com prêmio + legenda.




