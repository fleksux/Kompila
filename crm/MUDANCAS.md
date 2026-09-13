# kompila lead recovery · v2 · o que mudou e por quê

## v2.1 (12 set, mais tarde): hierarquia e o pipeline de volta

Reprovação do Alex na v2.0: "lota a tela com um monte de coisa que chama atenção, não tem hierarquia" e "cadê o kanban, que é o pipeline definido pro negócio do cliente". Referência: painel do Kommo (1 número por card, 1 fonte, 3 cores, zero legenda, filtro de período no topo).

O que mudou:
- **Uma coisa grande por tela.** Agora = 5 cards de um número + uma lista (Precisa de gente) + o diário. Antes eram 3 camadas de KPI dizendo a mesma coisa.
- **Card de um número só.** Rótulo, número grande, uma linha cinza embaixo. Só o "Fechado" é preto.
- **Lista de uma linha.** Pendência é tempo · nome · valor · motivo · botão. Regra e sugestão da IA só aparecem ao clicar na linha.
- **Sem legenda.** Saíram os subtítulos de bloco ("do mais antigo pro mais novo", "estado dado pela IA"), o botão Ajuda e os rótulos em Mono caixa baixa. Uma fonte; Mono só no número grande.
- **Cor só onde tem decisão.** Vermelho = precisa de gente. Verde = IA. O resto é cinza.
- **Filtro de período** (Hoje, Ontem, Semana, Mês) no topo do Agora.
- **Pipeline voltou** (`pipeline.html`): kanban com as fases do cliente, definidas na aba Pipeline do Conector (P1LED: Novo → Qualificado → Cotado → Visita → Proposta → Fechado; MRV: Novo → Simulado → Visita marcada → Documentos → Análise Caixa → Fechado). Cada card mostra quem conduz (IA ou pessoa) e o valor; borda vermelha quando precisa de gente. A IA move o lead; a pessoa também pode (na conversa, "Mover").
- O vendedor também tem "Meu pipeline", só com os leads dele.
- Na aba Pipeline do Conector: quem move pra cada fase, quando, e o peso no pipeline ponderado.
- Código da v2.0 guardado em `assets/_k_v2.0.js` e `_k_v2.0.css`.

### v2.1, segunda rodada: o que a v1 fazia melhor voltou
Alex comparou as duas abas: "seu dashboard ficou pior que a v1, não mostra as bolinhas com onde está o lead". Voltaram, na régua arejada da v2.1:
- **Bolinhas** ("Onde cada lead está"): por fase do pipeline (padrão) ou por tempo de espera (toggle), com quem conduz ou quem segura.
- **Ajuda com tooltip** no topo: liga um "?" em cada bloco; no hover explica o que o bloco é e por que está ali. Serve pra ele entender o que eu trouxe e pra vender em demo.
- **Busca e sino** no topo. Relógio com segundos.
- **Sparkline** nos 5 cards (7 dias ou 7 meses).
- **Conversão em destaque** como primeiro bloco: % do mês, respondeu em 15 min × depois, sem precisar de gente, por pessoa.
- **Resultado do mês** virou acordeon, fechado por padrão, com fechado × meta, pipeline ponderado e por pessoa.
- **Time** e **Hora em que o lead chega** de volta no Agora.

### v2.1, terceira rodada: o que a Kommo faz melhor (do doc `../referencias/kommo_whatsapp_2026-09-12.html`)
Só entrou o que responde "ajuda 5 min ou 24 h?":
- **Botões e listas da Meta** na bolha da IA: "Terça 10h / Quarta 15h / Outro dia". O lead responde com um toque (marcado na bolha dele). Menos abandono na coleta.
- **O tempo, escrito** (Conector › Quando chama gente): a régua como frase, 0 s → 15 min → 30 min → 23 h → 24 h. Na Kommo isso é "Registrar respostas lentas", desligado, evento no log. E a coluna "Se estourar" agora diz o que acontece em cada regra, não um texto genérico.
- **Nota de 1 a 10 ao fechar** como ação opcional em "O que a IA faz" (o único bot pronto da Kommo, sem virar placar).
- **Exportar JSON** do Conector (e Importar): P1LED vira molde pro próximo cliente de LED.
- **Dica por nível** (iniciante / gerente) nas regras principais, no hover.
- Ficou pra Fase 2, como o doc recomenda: CAPI e qualquer coisa de anúncio.

### v2.1, quarta rodada: a IA faz o que gente esquece
Alex: "minha intenção é fazer a IA fazer coisas que os humanos não fazem, esquecem, não participam".
- Na conversa, **"Mover" virou "Fase"**: mostra a fase, quem moveu (a IA, quando) e só abre "A IA errou? Corrigir" num detalhe. Correção vira evento e "ensina o playbook".
- Bloco **"A IA vai fazer"** na conversa: o que já está agendado pra aquele lead sem ninguém pedir (follow-up dia 1, lembrete de visita, template, volta da base).
- **Diário reescrito** em volta do trabalho invisível, com a tag verde "ninguém faria": follow-up do dia 3, template antes da janela fechar (3 conversas, R$ 0,15), perda com data de volta (Escola Crescer, 11 de dezembro), base de agosto reaberta, lembrete de visita, cobrança do status na Caixa (MRV). O contador no título: "N coisas que ninguém faria".
- "Meu resultado" do vendedor ganhou "A IA fez por mim": o mesmo diário filtrado pelos leads dele.

---

## v2.0 (12 set): a virada

12 set 2026. A v1 (`../P1LED/mock`, `../MRV/mock`) fica intacta. A v2 é uma pasta só: `v2/`, um código, uma chave por cliente.

## A virada

| | v1 | v2 |
|---|---|---|
| Quem opera | o vendedor, com a IA de assistente | **a IA**, com a pessoa entrando só quando a regra do cliente manda |
| Tela principal | Minha caixa (fila de leads esperando resposta humana) | **Agora** (o que a IA fez, o que travou esperando gente) |
| O que o vendedor vê | fila, kanban, placar, todas as conversas | **Meu resultado**: leads que recebeu, o que a IA pediu dele, visitas, propostas, fechado |
| O que o gerente vê | painel e gerente (repetiam KPI) | **tudo**: Agora, Fila, Conversas, Leads, Equipe, Resultado, Conector |
| Onde mora a regra do negócio | espalhada em Configurar (7 abas) | **Conector <cliente>**, item de menu com o nome do cliente: o que a IA faz sozinha, quando chama gente, motores, templates, tom, chave |
| Por cliente | dois mockups separados, código copiado | **um código**, `dados.js` com um bloco por cliente; troca no topo |

**Por quê.** O pedido de 12/set: "não é um humano, é uma inteligência fazendo tudo; o vendedor só olha o resultado dele; o gerente tem acesso a tudo; a inteligência de cada negócio é uma chave conectora no menu". A v1 foi desenhada como CRM pra vendedor operar; a v2 é um sistema que a IA opera e que a empresa acompanha.

## Tela a tela

### Agora (era Painel)
- **Barra de status da IA** no topo: leads hoje, 1ª resposta em segundos, resolveu sozinha, chamou gente, travado agora, custo do dia. Antes o painel abria com "conversão" e "respondido em 5 min por vendedor". Agora abre com o que a IA fez, porque é ela quem atende.
- **O que a IA fez hoje**: funil em 7 caixas, na ordem em que acontece com um lead. A caixa amarela ("chamou gente") é o único lugar em que o humano entra. Na v1 o funil era do mês e misturava IA e vendedor.
- **O que está travando**: pendências com o motivo (regra do conector), com quem está, há quanto tempo, e o que a IA sugere. Na v1 o equivalente era "Risco agora", que era lead esperando vendedor. Aqui é lead esperando decisão humana; o lead já foi respondido.
- **Diário da IA** (era "O guardião fez sozinho"): mesma ideia, agora é o registro de tudo, não só dos alarmes.
- **Time hoje**: quem está devendo resposta pra IA e em quanto tempo resolve. Substitui "Resposta em 5 min por vendedor": a IA responde em segundos, então o relógio do vendedor mede outra coisa (quanto tempo leva pra aprovar ou decidir).
- Saiu: "IA × humano" como comparação de quem atende melhor. Não faz sentido quando a IA atende tudo; virou "custo do atendimento" em Resultado.

### Fila (era Minha caixa)
- Só o que está **parado esperando uma pessoa**, agrupado pelo motivo de parada. Cada card tem: relógio contra o prazo da regra, por que a IA parou, o que ela sugere, e 3 ações: aprovar/decidir, assumir a conversa, devolver pra IA.
- Bloco separado "Esperando o lead, não você": conversas em que a IA já respondeu e o follow-up está agendado. Ninguém precisa fazer nada; está ali pra não parecer que o lead sumiu.
- Saiu: abas "Só o bot respondeu", "Dono offline", "Estourados", faixa de tempo por bucket. Eram sobre lead esperando humano responder. Na v2 lead não espera humano responder; espera decisão.

### Conversas
- A IA conduz. A pessoa entra de dois jeitos: quando a IA chama (rascunho pronto, um toque pra aprovar) ou por vontade própria (escreve e assume; depois "devolve pra IA").
- Card do motor (tool call) continua igual: entrada e saída visíveis. Briefing "O que a IA apurou" continua, com **confiança** em barra. Confiança abaixo de 70% em 2 mensagens é regra de escalada.
- Saiu: pontos ao responder, "sua sequência". Ver Placar abaixo.

### Leads (era Kanban)
- **Revisto na v2.1: o kanban voltou como Pipeline, com as fases do cliente.** O que segue era a decisão da v2.0.
- Tabela, sem colunas arrastáveis. O estado é dado pela IA (IA conduzindo, esperando o lead, precisa de gente, visita marcada, proposta enviada, fechado, perdido, reabrindo). Próximo passo agendado aparece na linha.
- **Por quê**: kanban é pra humano mover card. Aqui ninguém move; a fase anda pela ação da IA ou por evento (visita feita, fechou). Kanban puxava o produto de volta pra "CRM que disputa com o HubSpot".

### Equipe (era Placar + parte de Gerente)
- Uma linha por pessoa: leads com ela, quantas vezes a IA chamou, em quanto tempo resolveu, quantos na mão agora, visitas, propostas, fechado.
- "Por que a IA chamou gente": distribuição por regra do conector. Se um motivo cresce, é regra pra revisar. Liga direto no conector.
- **Saiu o Placar público** (pódio, pontos, nível, conquistas, prêmio). Motivos: (1) num time de 3 a 5 pessoas, ranking com nome e "enrolando" na frente de todos constrange mais do que motiva; (2) o que a v1 pontuava (responder em 5 min) agora é a IA que faz. O que sobra pra medir é "resolveu o que a IA pediu em quanto tempo", e isso está na Equipe, visível pro gerente e pra própria pessoa no "Eu × time".
- **Saiu a auditoria com nota por conversa** exposta pra todo mundo. Fica pra Fase 2, visível só pro gerente e pra pessoa avaliada.

### Resultado (era Gerente + Resultado do mês)
- Dinheiro, meta, pipeline ponderado, últimos fechados com "o que a IA fez" em cada um.
- Funil do mês pela IA.
- **Custo do atendimento**: IA × pessoas em atendimentos, tempo, custo por atendimento e no mês. É a conta que o cliente vai fazer.
- Perdas só com motivo dito pelo lead. Lead que sumiu não é perdido; fica no ciclo de reabertura.

### Conector <cliente> (era Configurar)
- Item de menu com o **nome e o logo do cliente**. É a chave: toda a inteligência do negócio mora aqui, o produto é o mesmo pra todo mundo.
- Aba **O que a IA faz**: cada ação em 3 níveis, editável: *sozinha* / *pede aprovação* (de quem) / *nunca*. É a regra central. Exemplo P1LED: cotar é sozinha (pelo Copiloto), proposta formal pede aprovação do vendedor, desconto até 15% vendedor e acima Marcos, prazo de entrega nunca.
- Aba **Quando chama gente**: regra → pra quem → prazo da pessoa. Regra fixa da kompila (não editável): em 24 h sem ação humana, a IA manda template de utilidade e mantém o lead vivo.
- Abas Motores, Templates, Tom e horário, Chave e API: o que já existia em Configurar, agora dentro da chave do cliente.
- Saiu: régua de "5 min / 15 min / 24 h" como configuração central. A IA responde em segundos sempre; o que sobra configurar é o prazo da pessoa (15 min P1LED, 10 min MRV).

## Papéis
- Seletor "ver como" no topo: gerente ou cada pessoa do time.
- **Gerente**: 7 itens de menu, vê tudo, edita o conector.
- **Vendedor**: 4 itens (Meu resultado, Precisa de mim, Minhas conversas, Meus leads). Só os leads dele. Não vê Equipe, Resultado nem Conector.
- **Sthefany** (P1LED) mudou de papel: era pré-venda (a primeira resposta), que é o que a IA faz agora. Na v2 ela é "supervisora da IA": recebe as conversas em que a IA ficou insegura e corrige o playbook. É o cargo que nasce com o produto.

## Dados corrigidos em relação à v1 (P1LED)
- **Time**: Marcos (gerente, aprova), Beatriz, Cesar, Rafaela (vendas), Sthefany (supervisora). Saiu "Alexandre" como vendedor: no HubSpot ele é Diretoria.
- **Preços pela tabela do Copiloto**: P2.5 indoor é gabinete imantado 960×960 a R$ 6.650 (não 500×500); 3,84 × 1,92 = 8 gabinetes = R$ 53.200 + instalação R$ 4.400 = R$ 57.600. P10 outdoor 960×960 a R$ 4.559; 6 × 3 fecha em 5,76 × 2,88 = 18 gabinetes = R$ 82.062 + instalação e frete. A v1 dizia R$ 28 a 32 mil e R$ 46 a 52 mil.
- **Medidas fecham em múltiplo do gabinete**: a IA diz "6 × 3 fecha em 5,76 × 2,88". Na v1 era "6×3 m, 17,3 m²".
- **Motor de cotação é o Copiloto (API)**, não "tabela de gabinetes". `consultar_estoque` saiu (não existe fonte).
- **CPF não passa pela conversa**: `ficha_cadastral_pf` manda link pro formulário do Copiloto. Bate com o RNF-04 do PROJETO.md.
- **Um número de lead por mês**: 372 no mês (31/dia × 12), 31 hoje. A v1 tinha 150, 612 e 31 pra mesma coisa.
- **Fechados = R$ 214.110 em 3 vendas**, que são negócios reais do HubSpot (P1.5 GOB R$ 115.110 Cesar; P2.5 indoor R$ 79.000 e P2.5 outdoor R$ 20.000 Beatriz), com o nome do cliente trocado por descrição.
- **Perdidos e motivos**: mantidos coerentes com o HubSpot (16 perdidos em 12 semanas viram 38 no mês projetado só porque agora tem IA dando motivo; é projeção, marcado na fonte).
- O texto "o CRM do cliente continua sendo a fonte" saiu. Na aba Chave e API: a fonte de verdade é a kompila; o CRM de origem recebe os eventos.

## Dados corrigidos (MRV)
- Renda R$ 5.100 é **Faixa 3** (R$ 4.700,01 a R$ 8.600), sem subsídio. A v1 dizia Faixa 2 com subsídio.
- `consultar_unidades` lê o espelho da **loja**, não "Salesforce da matriz". A tese é vender pra loja.
- Documento nunca entra na conversa: `documentos_caixa` manda link seguro.
- Continua marcado como "números de exemplo" no topo até ter dado da loja.

## O que ainda não está no mock
- Versão de celular (o vendedor vai usar o "Precisa de mim" no celular; a casca encolhe mas não foi desenhada).
- Editar de verdade o conector (os selects mudam de cor, não salvam).
- Fase 2: auditoria por conversa visível pro gerente; múltiplas unidades por cliente (o card "Nova unidade" da v1 saiu até ter cliente com 2 lojas).
