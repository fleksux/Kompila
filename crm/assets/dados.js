/* kompila lead recovery · v2 · dados de exemplo por empresa
   Um código, um playbook por empresa. O que muda entre P1LED e MRV está aqui; a casca e as telas são as mesmas.
   P1LED: time, fases, templates, produtos e preços vêm do HubSpot (12 set 2026) e da tabela do Copiloto. Volumes do mês são projeção (31 leads/dia medidos).
   MRV: números de exemplo até ter dado da loja. Faixas do MCMV são as vigentes em 2026. */
window.K2_DATA = (function(){
  const M=60000, H=3600000, D=86400000;
  const now=Date.now();
  const ago=(min)=>now-min*M;
  const em=(min)=>now+min*M;

  return {
  /* ======================================================= P1LED ======================================================= */
  p1led:{
    id:'p1led', nome:'P1LED', setor:'Painéis de LED · B2B', moeda:'R$', logo:'assets/p1led.svg', exemplo:false,
    fonte:'time, fases, templates e preços: HubSpot e Copiloto da P1LED, 12 set 2026 · volumes do mês: projeção sobre 31 leads/dia medidos',
    pipeline:['Novo','Qualificado','Cotado','Visita','Proposta','Fechado'],
    ia:{nome:'assistente da P1LED', assinatura:'assistente · P1LED', frente:'Haiku 4.5', retaguarda:'Claude 5', tom:'direto, trata por você, sem gíria, sem emoji; se apresenta como assistente na primeira frase', resposta_s:11, custo_atend:0.06},
    regra:{ humano_min:15, limite_h:24, toques:[1,3,7,14], janela_meta_h:24, expediente_humano:'seg a sex, 08:00 às 18:00', ia_horario:'24 h, todos os dias' },
    pessoas:[
      {id:'mar',nome:'Marcos',leads_mes:14,visitas:2,propostas:0,fechados:0,valor:0,ini:'MA',papel:'gerente',faz:'aprova desconto acima de 15% e proposta acima de R$ 100 mil',online:true,sla_min:22,pend_hoje:3,pend_mes:31},
      {id:'bea',nome:'Beatriz',leads_mes:96,visitas:15,propostas:12,fechados:2,valor:99000,ini:'BE',papel:'vendedora',faz:'visita, proposta formal, fechamento',online:true,sla_min:9,pend_hoje:4,pend_mes:58},
      {id:'ces',nome:'Cesar',leads_mes:92,visitas:17,propostas:10,fechados:1,valor:115110,ini:'CE',papel:'vendedor',faz:'visita, proposta formal, fechamento · técnico',online:true,sla_min:14,pend_hoje:3,pend_mes:49},
      {id:'raf',nome:'Rafaela',leads_mes:88,visitas:10,propostas:7,fechados:0,valor:0,ini:'RA',papel:'vendedora',faz:'visita, proposta formal, fechamento',online:false,sla_min:41,pend_hoje:2,pend_mes:27},
      {id:'sth',nome:'Sthefany',leads_mes:0,visitas:0,propostas:0,fechados:0,valor:0,ini:'ST',papel:'supervisora da IA',faz:'revisa as conversas que a IA marcou como incerta, corrige o playbook',online:true,sla_min:6,pend_hoje:5,pend_mes:74}
    ],
    /* o que a IA pode fazer sozinha, o que pede aprovação, o que nunca faz. Editável por empresa. */
    autonomia:[
      {acao:'Responder lead novo',nivel:'sozinha',como:'em até 15 s, 24 h por dia, assinando como assistente'},
      {acao:'Qualificar: espaço, medida, distância, indoor ou outdoor, prazo, quem decide',nivel:'sozinha',como:'no máximo 8 perguntas por conversa; aceita foto e áudio'},
      {acao:'Cotar faixa de preço',nivel:'sozinha',como:'chama o Copiloto; nunca calcula de cabeça, nunca arredonda pra baixo'},
      {acao:'Gerar render do painel na foto do cliente',nivel:'sozinha',como:'motor de render; manda como prévia, sem valor no render'},
      {acao:'Marcar visita técnica',nivel:'sozinha',como:'na agenda do vendedor do lead, só até 150 km do hub; acima disso pede'},
      {acao:'Enviar proposta formal (PDF do Copiloto)',nivel:'aprovacao',quem:'vendedor do lead',como:'a IA monta, o vendedor aprova com um toque'},
      {acao:'Dar desconto',nivel:'aprovacao',quem:'até 15% vendedor · acima Marcos',como:'sobre projeto instalado, nunca só equipamento'},
      {acao:'Follow-up nos dias 1, 3, 7 e 14',nivel:'sozinha',como:'dentro da janela: mensagem normal; fora: template retorno_24h'},
      {acao:'Reabrir base esquecida',nivel:'sozinha',como:'1 vez por ciclo, só com consentimento; 30 por dia no máximo'},
      {acao:'Dar o lead como perdido',nivel:'sozinha',como:'só quando o lead disse o motivo; se sumiu, mantém no ciclo de reabertura'},
      {acao:'Prometer prazo de entrega ou instalação',nivel:'nunca',como:'diz que o vendedor confirma'},
      {acao:'Falar de garantia, crédito ou parcelamento',nivel:'nunca',como:'encaminha pro vendedor'},
      {acao:'Atender licitação ou órgão público',nivel:'nunca',como:'escala direto pro Marcos'},
      {acao:'Pedir nota de 1 a 10 ao fechar a conversa',nivel:'sozinha',como:'valida o número, grava no lead; nota até 6 avisa o Marcos. Sem placar público',opcional:true}
    ],
    /* quando a IA para e chama gente */
    escalada:[
      {regra:'Lead pediu pra falar com uma pessoa',para:'vendedor do lead',sla_min:15,depois:'passa pro próximo vendedor online; ninguém online, avisa o Marcos'},
      {regra:'Valor estimado acima de R$ 100 mil',para:'Marcos',sla_min:30,depois:'a IA segue qualificando e avisa de novo em 30 min'},
      {regra:'Desconto pedido acima da alçada',para:'vendedor · Marcos',sla_min:30,depois:'a IA responde ao lead que o gerente decide até o fim do dia'},
      {regra:'Proposta pronta esperando aprovação',para:'vendedor do lead',sla_min:60,depois:'vai pro Marcos aprovar; em 24 h, a IA manda sem desconto'},
      {regra:'Confiança da IA abaixo de 70% em 2 mensagens seguidas',para:'Sthefany',sla_min:15,depois:'passa pro vendedor do lead'},
      {regra:'Reclamação, cliente antigo ou assunto de garantia',para:'Marcos',sla_min:15,depois:'avisa de novo a cada 15 min até ele responder'},
      {regra:'Órgão público, licitação, pregão',para:'Marcos',sla_min:60,depois:'a IA responde ao lead que o gerente retorna em 1 dia útil'}
    ],
    motores:[
      {nome:'cotar',fonte:'Copiloto P1LED (API)',desc:'Pitch pela distância, gabinetes pela medida, processadora, instalação por distância e quantidade de placas, frete.',versao:'API v1',dono:'Alexsandro (Copiloto)',chamadas:171,erros:0,
        teste:{inp:{ambiente:'indoor',largura_m:3.84,altura_m:1.92,distancia_m:4,cep:'13010-000'},out:{pitch:'P2.5',gabinete:'imantado 960×960',quantidade:'8 un',equipamento:'R$ 53.200',instalacao:'R$ 4.400 (até 100 placas, até 23 km)',frete:'R$ 0 (até 23 km)',faixa:'R$ 57.600 instalado'}}},
      {nome:'gerar_render',fonte:'Magnific · skill p1led-render',desc:'Insere o painel na foto do espaço do cliente, na escala certa, sem moldura.',versao:'1.2',dono:'Alexsandro (marketing)',chamadas:63,erros:2,teste:{inp:{foto:'fachada.jpg',largura_m:5.76,altura_m:2.88},out:{render:'render_fachada.webp',tempo:'48 s',custo:'R$ 0,90'}}},
      {nome:'agenda',fonte:'Google Calendar dos vendedores',desc:'Lê a agenda de quem é dono do lead e oferece 2 horários; grava com o endereço.',versao:'1.0',dono:'kompila',chamadas:44,erros:0,teste:{inp:{vendedor:'bea',cidade:'Ribeirão Preto',duracao_min:60},out:{opcoes:['ter 16/09 10:00','qui 18/09 15:00']}}},
      {nome:'distancia',fonte:'ViaCEP + BrasilAPI',desc:'CEP do lead até o hub; decide frete e se a IA pode marcar visita sozinha.',versao:'1.0',dono:'kompila',chamadas:238,erros:1,teste:{inp:{cep:'14010-000'},out:{cidade:'Ribeirão Preto, SP',km:313,visita_sozinha:false}}}
    ],
    templates:[
      {nome:'retorno_24h',cat:'utilidade',status:'aprovado',usos:214,custo:0.05,texto:'Oi {{1}}, aqui é a assistente da P1LED. A gente ficou sem se falar. Ainda posso te ajudar com o painel?'},
      {nome:'ficha_cadastral_pf',cat:'utilidade',status:'aprovado',usos:9,custo:0.05,texto:'{{1}}, pra fechar o pedido preciso da sua ficha. Preenche por aqui: {{2}}',nota:'o link abre o formulário do Copiloto; CPF não passa pela conversa nem fica no CRM'},
      {nome:'ficha_cadastral_pj',cat:'utilidade',status:'aprovado',usos:6,custo:0.05,texto:'{{1}}, pra emitir a nota preciso dos dados da empresa. Preenche por aqui: {{2}}',nota:'mesma regra: dado fiscal só no Copiloto'},
      {nome:'render_pronto',cat:'utilidade',status:'em análise',usos:0,custo:0.05,texto:'{{1}}, o render do painel no seu espaço ficou pronto. Posso te mandar?'}
    ],
    conv:{atual:0.018,anterior:0.015,hist:[0.011,0.012,0.014,0.015,0.015,0.017,0.018],ate5:0.041,depois5:0.009},
    hoje:{entraram:31,fora_exp:14,resp_s:11,ia_resolveu:24,chamou_humano:7,agendou:4,cotou:17,reabriu:30,reabriu_resp:5},
    mes:{dia:12,dias:30,entraram:372,hist_leads:[24,29,31,27,33,30,31],qualificou:238,cotou:171,agendou:44,proposta:29,fechou:3,perdeu:38,reabriu:360,reabriu_resp:61,sem_humano:0.78,
         hist_resp_s:[14,13,12,12,11,11,11], hist_humano_pct:[0.31,0.28,0.26,0.24,0.23,0.22,0.22]},
    resultado:{meta:250000, total:214110, n:3, hist:[92000,118000,140000,131000,165000,188000,214110],
      fechados:[
        {o:'Clínica de cirurgia plástica · Ribeirão Preto',p:'P1.5 GOB 3,84 × 1,92',v:115110,q:'Cesar',ia:'qualificou, render, cotou; Cesar fez visita e fechou'},
        {o:'Escritório · São Paulo',p:'P2.5 indoor 3,84 × 1,92',v:79000,q:'Beatriz',ia:'qualificou e cotou; proposta aprovada pela Beatriz em 6 min'},
        {o:'Loja · Guarulhos',p:'P2.5 outdoor 2,88 × 1,92',v:20000,q:'Beatriz',ia:'fechou sem humano: cotou, mandou proposta padrão, cliente aceitou'}
      ],
      pipe:[['Qualificando',22,0.05,118000],['Cotado',31,0.15,612000],['Visita marcada',9,0.4,414000],['Proposta',8,0.6,326000]]},
    perdas:{motivos:[['Sem retorno em 14 dias',19,'volta em 30 d'],['Ficou acima da verba',8,'volta em 90 d'],['Letreiro ou TV, não é painel',6,'arquiva'],['Comprou do concorrente',3,'arquiva'],['Só pesquisa de preço',2,'volta em 60 d']]},
    /* leads: o estado é da IA. 'ia' conduzindo · 'lead' esperando o lead · 'humano' precisa de gente · 'agendado' · 'proposta' · 'fechado' · 'perdido' · 'reabrindo' */
    leads:[
      {id:1,fase:'Cotado',fase_por:'IA',fase_t:ago(5),nome:'Rogério Gonçalves',origem:'Site',cidade:'Campinas, SP',interesse:'Fachada de loja, outdoor',valor:82062,estado:'ia',dono:'ces',criado:ago(6),conf:0.92,
        ia:{apurado:[['aplicação','fachada de loja, outdoor, pega sol'],['medida','6 × 3 m pedido; fecha em 5,76 × 2,88 (18 gabinetes 960×960)'],['distância','15 m, rua movimentada'],['pitch','P10 outdoor'],['equipamento','R$ 82.062 (Copiloto)'],['decisor','ele, dono da loja'],['foto','recebida, render em andamento']],falta:['prazo que ele quer','energia na fachada'],proximo:'Mandar o render, oferecer visita do Cesar quinta ou sexta.',temperatura:'quente'},
        proximo:{acao:'enviar render + 2 horários de visita',quando:em(1)},
        msgs:[
          {de:'lead',t:ago(6),x:'Olá, vi o site de vocês. Preciso de um painel pra fachada da loja, 6 metros por 3. Qual o valor?'},
          {de:'ia',t:ago(5.8),x:'Oi, Rogério. Sou a assistente da P1LED. Pra te passar uma faixa certa: o painel fica onde?',botoes:['Fachada, pega sol','Dentro da loja','Vitrine, atrás do vidro']},
          {de:'lead',t:ago(5.2),x:'Fachada, pega sol',toque:true},{de:'ia',t:ago(5.15),x:'E a que distância as pessoas veem o painel?',botoes:['Até 5 m','Uns 10 m','15 m ou mais']},{de:'lead',t:ago(5.1),x:'15 m ou mais',toque:true},
          {de:'tool',t:ago(5.1),name:'distancia',inp:{cep:'13010-000'},out:{cidade:'Campinas, SP',km:96,visita_sozinha:true}},
          {de:'tool',t:ago(5),name:'cotar',inp:{ambiente:'outdoor',largura_m:6,altura_m:3,distancia_m:15,cep:'13010-000'},out:{pitch:'P10 outdoor',gabinete:'rental 960×960',quantidade:'18 un (5,76 × 2,88 m)',equipamento:'R$ 82.062',instalacao:'R$ 4.430',frete:'R$ 438',faixa:'R$ 86.930 instalado'}},
          {de:'ia',t:ago(4.8),x:'Pela tabela da P1LED, 6 × 3 visto a 15 m pede P10 outdoor. Fecha em 5,76 × 2,88 m com 18 gabinetes. Fica em torno de R$ 87 mil instalado em Campinas, sem desconto. Se me mandar uma foto da fachada eu te mostro como fica.'},
          {de:'lead',t:ago(3),x:'Segue a foto'},
          {de:'tool',t:ago(2.8),name:'gerar_render',inp:{foto:'fachada.jpg',largura_m:5.76,altura_m:2.88},out:{status:'processando',previsto:'60 s'}},
          {de:'ia',t:ago(2.7),x:'Recebi. Estou montando o painel na sua fachada, em 1 minuto te mando. Enquanto isso: você tem um prazo em mente?'}
        ]},
      {id:2,fase:'Novo',nome:'Prefeitura de Atibaia',origem:'Site',cidade:'Atibaia, SP',interesse:'Painel outdoor 8 × 4 na praça',valor:210000,estado:'humano',dono:'mar',criado:ago(38),conf:0.55,
        pend:{tipo:'Órgão público',regra:'Órgão público, licitação, pregão',para:'mar',desde:ago(36),sla_min:60,
          sugestao:'A IA parou na primeira mensagem, como manda a regra. Sugestão: Marcos responde pedindo o edital ou o termo de referência e o prazo do certame.'},
        ia:{apurado:[['quem','Secretaria de Cultura, servidor identificado'],['pedido','8 × 4 m outdoor na praça central, com nota e garantia'],['pitch provável','P10 ou P8'],['valor de referência','R$ 210 mil pelo Copiloto']],falta:['tudo do processo: edital, prazo, modalidade'],proximo:'Marcos assume.',temperatura:'morna'},
        msgs:[{de:'lead',t:ago(38),x:'Solicitamos orçamento de painel de LED outdoor 8x4 m para a praça central, com nota fiscal e garantia.'},{de:'ia',t:ago(37.8),x:'Bom dia. Sou a assistente da P1LED. Pedido de órgão público a gente trata com o Marcos, nosso gerente. Já passei pra ele e ele responde por aqui.'},{de:'sys',t:ago(37.7),x:'Escalado pro Marcos · regra: órgão público'}]},
      {id:3,fase:'Proposta',fase_por:'IA',fase_t:ago(52),nome:'Dr. Henrique Sales',origem:'Site',cidade:'Ribeirão Preto, SP',interesse:'Fachada de clínica, indoor atrás da vitrine',valor:57600,estado:'humano',dono:'bea',criado:ago(1440*2),conf:0.9,
        pend:{tipo:'Proposta esperando aprovação',regra:'Proposta pronta esperando aprovação',para:'bea',desde:ago(52),sla_min:60,
          sugestao:'Proposta P2.5 indoor 3,84 × 1,92, 8 gabinetes, R$ 57.600 instalado, sem desconto. Aprovar envia o PDF do Copiloto na conversa.'},
        ia:{apurado:[['aplicação','atrás da vitrine da clínica, indoor'],['medida','3,84 × 1,92 (8 gabinetes 960×960)'],['pitch','P2.5 indoor imantado'],['valor','R$ 57.600 instalado'],['render','enviado, ele gostou'],['visita','313 km: a IA não marcou sozinha']],falta:[],proximo:'Beatriz aprova a proposta; visita fica pra depois do aceite.',temperatura:'quente'},
        msgs:[{de:'lead',t:ago(1440*2),x:'Preciso de painel para fachada da clínica, 3x2 m'},{de:'ia',t:ago(1440*2-0.2),x:'Olá, Dr. Henrique. Sou a assistente da P1LED. O painel fica exposto ao tempo ou atrás do vidro?'},{de:'lead',t:ago(1440*2-25),x:'Atrás do vidro da vitrine'},{de:'tool',t:ago(1440*2-25.5),name:'cotar',inp:{ambiente:'indoor',largura_m:3,altura_m:2,distancia_m:4,cep:'14010-000'},out:{pitch:'P2.5 indoor',gabinete:'imantado 960×960',quantidade:'8 un (3,84 × 1,92 m)',equipamento:'R$ 53.200',instalacao:'R$ 4.430',frete:'R$ 0 (incluso na instalação acima de 23 km)',faixa:'R$ 57.600 instalado'}},{de:'ia',t:ago(1440*2-26),x:'Atrás do vidro é indoor. Pra 3 × 2 o tamanho que fecha é 3,84 × 1,92 em P2.5, 8 gabinetes. Fica em torno de R$ 57.600 instalado em Ribeirão. Me manda uma foto da vitrine que eu te mostro o painel nela?'},{de:'lead',t:ago(1440*2-60),x:'Segue a foto'},{de:'ia',t:ago(1440*2-63),x:'Aqui está o painel na sua vitrine (imagem). Quer que eu mande a proposta formal?'},{de:'lead',t:ago(52),x:'Gostei. Pode mandar a proposta'},{de:'sys',t:ago(52),x:'Proposta montada · esperando Beatriz aprovar'}]},
      {id:4,fase:'Proposta',nome:'Lar Cabral Móveis',origem:'Indicação',cidade:'Osasco, SP',interesse:'Vitrine digital em 3 lojas',valor:172800,estado:'humano',dono:'mar',criado:ago(1440*6),conf:0.88,
        pend:{tipo:'Desconto acima da alçada',regra:'Desconto pedido acima da alçada',para:'mar',desde:ago(140),sla_min:30,
          sugestao:'Cliente pediu 20% nas 3 lojas (R$ 172.800 → R$ 138.240). Beatriz aprovou até 15%. Acima disso é com Marcos. A IA sugere 15% + instalação das 3 no mesmo dia.'},
        ia:{apurado:[['pedido','3 lojas, vitrine 1,92 × 0,96 P2.5 cada'],['valor','R$ 172.800 instalado'],['desconto pedido','20%'],['alçada','Beatriz até 15%; acima Marcos']],falta:[],proximo:'Marcos decide.',temperatura:'quente'},
        msgs:[{de:'lead',t:ago(1440*6),x:'A Casa Bella indicou vocês. Quero vitrine digital nas 3 lojas.'},{de:'ia',t:ago(1440*6-0.2),x:'Que bom, obrigada pela confiança. Sou a assistente da P1LED. As 3 vitrines têm o mesmo tamanho?'},{de:'lead',t:ago(140),x:'Recebi a proposta. Fecho hoje se fizer 20% nas três.'},{de:'ia',t:ago(139.8),x:'Entendi. Desconto desse tamanho passa pelo nosso gerente. Te respondo ainda hoje.'},{de:'sys',t:ago(139.7),x:'Escalado pro Marcos · desconto 20% acima da alçada'}]},
      {id:5,fase:'Visita',fase_por:'IA',fase_t:ago(1440*3-40),nome:'Igreja Renovar',origem:'Site',cidade:'Barueri, SP',interesse:'Painel P2.5 indoor 5,76 × 2,88',valor:118750,estado:'agendado',dono:'ces',criado:ago(1440*4),conf:0.94,
        proximo:{acao:'visita do Cesar',quando:em(1440*2+600)},
        ia:{apurado:[['aplicação','altar, indoor'],['medida','5,76 × 2,88 (18 gabinetes imantado)'],['pitch','P2.5'],['valor','R$ 118.750 instalado'],['render','enviado'],['visita','marcada, Cesar, terça 10h']],falta:[],proximo:'IA lembra o pastor na véspera.',temperatura:'quente'},
        msgs:[{de:'lead',t:ago(1440*4),x:'Orçamento de painel indoor pro altar, 6x3'},{de:'ia',t:ago(1440*4-0.2),x:'Olá. Sou a assistente da P1LED. Pra igreja a gente costuma usar P2.5. A última fileira fica a quantos metros do altar?'},{de:'lead',t:ago(1440*4-30),x:'Uns 25 metros'},{de:'tool',t:ago(1440*4-30.5),name:'cotar',inp:{ambiente:'indoor',largura_m:6,altura_m:3,distancia_m:25,cep:'06401-000'},out:{pitch:'P2.5 indoor',gabinete:'imantado 960×960',quantidade:'18 un (5,76 × 2,88 m)',equipamento:'R$ 119.700',instalacao:'R$ 4.400',frete:'R$ 0',faixa:'R$ 124.100 instalado'}},{de:'ia',t:ago(1440*4-31),x:'6 × 3 fecha em 5,76 × 2,88 com 18 gabinetes P2.5. Em torno de R$ 124 mil instalado. Me manda uma foto do altar?'},{de:'lead',t:ago(1440*3),x:'Segue. Podemos receber uma visita?'},{de:'tool',t:ago(1440*3-1),name:'agenda',inp:{vendedor:'ces',cidade:'Barueri',duracao_min:60},out:{opcoes:['ter 16/09 10:00','qua 17/09 15:00']}},{de:'ia',t:ago(1440*3-2),x:'Claro. O Cesar, nosso técnico, pode ir. Qual horário fica melhor?',botoes:['Terça 10h','Quarta 15h','Outro dia']},{de:'lead',t:ago(1440*3-40),x:'Terça 10h'},{de:'sys',t:ago(1440*3-40),x:'Visita marcada na agenda do Cesar · ter 16/09 10:00'}]},
      {id:6,fase:'Novo',nome:'Camila Duarte',origem:'Instagram',cidade:'São Paulo, SP',interesse:'Painel pra evento (anúncio)',valor:null,estado:'lead',dono:null,criado:ago(41),conf:0.8,
        proximo:{acao:'follow-up dia 1',quando:em(1440-41)},
        ia:{apurado:[['origem','anúncio Instagram, campanha Eventos']],falta:['data e local','tamanho','compra ou locação'],proximo:'Esperar. Se não responder em 24 h, follow-up dia 1.',temperatura:'morna'},
        msgs:[{de:'lead',t:ago(41),x:'Olá, vi seu anúncio no Instagram e gostaria de mais informações'},{de:'ia',t:ago(40.8),x:'Oi, Camila. Sou a assistente da P1LED. O painel é pra um evento? Me conta a data e o tamanho da parede que eu já te passo uma faixa.'}]},
      {id:7,fase:'Cotado',nome:'Hotel Costa Verde',origem:'Site',cidade:'Ubatuba, SP',interesse:'Painel no lobby',valor:57600,estado:'humano',dono:'raf',criado:ago(240),conf:0.9,
        pend:{tipo:'Lead pediu pessoa',regra:'Lead pediu pra falar com uma pessoa',para:'raf',desde:ago(75),sla_min:15,
          sugestao:'Ele quer saber prazo de entrega, coisa que a IA não promete. Rascunho pronto: "Oi, aqui é a Rafaela. O prazo pra Ubatuba costuma ser de X dias após o aceite."'},
        ia:{apurado:[['aplicação','lobby, indoor'],['medida','3,84 × 1,92'],['valor','R$ 57.600 instalado'],['pergunta aberta','prazo de entrega']],falta:['prazo (só humano responde)'],proximo:'Rafaela responde o prazo.',temperatura:'quente'},
        msgs:[{de:'lead',t:ago(240),x:'Bom dia, queremos um painel no lobby do hotel, 3x2'},{de:'ia',t:ago(239.8),x:'Bom dia. Sou a assistente da P1LED. O lobby tem pé-direito alto? A ideia é parede ou totem?'},{de:'lead',t:ago(200),x:'Parede, atrás da recepção'},{de:'ia',t:ago(199),x:'3 × 2 fecha em 3,84 × 1,92 em P2.5. Em torno de R$ 57.600 instalado. Me manda uma foto?'},{de:'lead',t:ago(75),x:'Segue a foto. Qual o prazo de entrega? Prefiro falar com alguém.'},{de:'ia',t:ago(74.8),x:'Prazo quem confirma é a Rafaela, que cuida do seu atendimento. Já chamei ela aqui.'},{de:'sys',t:ago(74.7),x:'Escalado pra Rafaela · lead pediu pessoa · Rafaela offline: alerta no celular'}]},
      {id:8,fase:'Proposta',fase_por:'IA',fase_t:ago(190),nome:'Academia Corpo Livre',origem:'WhatsApp',cidade:'São Bernardo, SP',interesse:'Painel recepção 5,76 × 1,92',valor:83500,estado:'proposta',dono:'ces',criado:ago(600),conf:0.93,
        proximo:{acao:'follow-up dia 1 se não responder',quando:em(1440-190)},
        ia:{apurado:[['medida','6,20 de parede: fecha em 5,76 × 1,92 (12 gabinetes)'],['pitch','P2.5'],['valor','R$ 83.500 instalado'],['proposta','enviada há 3 h, aprovada pelo Cesar em 4 min']],falta:[],proximo:'Esperar 24 h; depois follow-up.',temperatura:'quente'},
        msgs:[{de:'lead',t:ago(600),x:'Quanto sai um painel de 6x2 pra recepção?'},{de:'ia',t:ago(599.8),x:'Oi. Sou a assistente da P1LED. A parede tem quanto de largura exata?'},{de:'lead',t:ago(420),x:'6,20 de largura. Manda proposta?'},{de:'tool',t:ago(419),name:'cotar',inp:{ambiente:'indoor',largura_m:6.2,altura_m:2,distancia_m:5,cep:'09700-000'},out:{pitch:'P2.5 indoor',quantidade:'12 un (5,76 × 1,92 m)',equipamento:'R$ 79.800',instalacao:'R$ 4.400',faixa:'R$ 84.200 instalado'}},{de:'ia',t:ago(418),x:'Fecha em 5,76 × 1,92 com 12 gabinetes P2.5, R$ 84.200 instalado. Vou montar a proposta e o Cesar te manda por aqui.'},{de:'sys',t:ago(190),x:'Proposta aprovada pelo Cesar em 4 min · enviada'},{de:'ia',t:ago(190),x:'Segue a proposta (PDF). Qualquer dúvida é só falar por aqui.'}]},
      {id:9,fase:'Novo',nome:'Padaria Doce Pão',origem:'Instagram',cidade:'Mogi das Cruzes, SP',interesse:'Menu board',valor:null,estado:'ia',dono:null,criado:ago(2),conf:0.85,
        ia:{apurado:[['origem','anúncio Instagram']],falta:['o que ele quer','tamanho'],proximo:'Esperar a resposta.',temperatura:'morna'},
        msgs:[{de:'lead',t:ago(2),x:'Olá, vi seu anúncio no Instagram e gostaria de mais informações'},{de:'ia',t:ago(1.8),x:'Oi. Sou a assistente da P1LED. É pra padaria? Me conta onde o painel ficaria (parede, vitrine, balcão) e o tamanho que você imagina.'}]},
      {id:10,fase:'Qualificado',nome:'Construtora Almeida',origem:'Site',cidade:'Jundiaí, SP',interesse:'Painel no stand de vendas',valor:57600,estado:'humano',dono:'sth',criado:ago(120),conf:0.58,
        pend:{tipo:'IA insegura',regra:'Confiança da IA abaixo de 70% em 2 mensagens seguidas',para:'sth',desde:ago(9),sla_min:15,
          sugestao:'O lead perguntou se o painel "roda o vídeo do apartamento decorado direto do celular". A IA não sabe se a processadora aceita isso. Sthefany confirma e corrige o playbook.'},
        ia:{apurado:[['aplicação','stand de vendas, indoor'],['medida','3,84 × 1,92'],['dúvida','conteúdo pelo celular']],falta:['resposta técnica'],proximo:'Sthefany responde e ensina a IA.',temperatura:'morna'},
        msgs:[{de:'lead',t:ago(120),x:'Orçamento de painel de LED para stand de vendas de empreendimento'},{de:'ia',t:ago(119.8),x:'Olá. Sou a assistente da P1LED. Qual o tamanho da parede do stand?'},{de:'lead',t:ago(30),x:'Uns 4 x 2. Dá pra rodar o vídeo do decorado direto do celular?'},{de:'ia',t:ago(29.8),x:'4 × 2 fecha em 3,84 × 1,92 em P2.5, em torno de R$ 57.600 instalado. Sobre o vídeo pelo celular, vou confirmar com o time e te respondo em minutos.'},{de:'sys',t:ago(9),x:'Escalado pra Sthefany · confiança 58% e 61%'}]},
      {id:11,fase:'Cotado',nome:'Bar do Zé',origem:'Instagram',cidade:'São Paulo, SP',interesse:'Painel 3 × 2 pra bar',valor:57600,estado:'reabrindo',dono:null,criado:ago(1440*30),conf:0.7,
        proximo:{acao:'2ª mensagem de reabertura',quando:em(1440*3)},
        ia:{apurado:[['histórico','sumiu depois da faixa de preço, em agosto'],['reabertura','template retorno_24h enviado hoje 09:10']],falta:[],proximo:'Se responder, retoma; se não, mais 1 tentativa em 3 dias e arquiva por 60 d.',temperatura:'fria'},
        msgs:[{de:'lead',t:ago(1440*30),x:'Quanto fica um painel pro bar, 3x2?'},{de:'ia',t:ago(1440*30-1),x:'Oi. Sou a assistente da P1LED. Indoor ou na fachada?'},{de:'lead',t:ago(1440*30-20),x:'Indoor'},{de:'ia',t:ago(1440*30-22),x:'3 × 2 fecha em 3,84 × 1,92 P2.5, em torno de R$ 57.600 instalado.'},{de:'tpl',t:ago(770),x:'Oi Zé, aqui é a assistente da P1LED. A gente ficou sem se falar. Ainda posso te ajudar com o painel?'}]},
      {id:12,fase:'Perdido',nome:'Clínica Sorriso',origem:'Site',cidade:'Campinas, SP',interesse:'Letreiro luminoso',valor:null,estado:'perdido',dono:null,criado:ago(1440*9),conf:0.9,perda:{motivo:'Letreiro ou TV, não é painel',t:ago(1440*9+5),volta:null},
        ia:{apurado:[['pedido','letreiro luminoso simples']],falta:[],proximo:'Arquivado. Indicou parceiro.',temperatura:'fria'},
        msgs:[{de:'lead',t:ago(1440*9),x:'Queria um letreiro luminoso simples'},{de:'ia',t:ago(1440*9-0.2),x:'Oi. Sou a assistente da P1LED. A gente faz painel de LED de vídeo; letreiro simples não é o nosso produto. Posso te indicar um parceiro?'},{de:'lead',t:ago(1440*9-5),x:'Pode sim, obrigado'},{de:'sys',t:ago(1440*9-5),x:'Perdido · motivo dito pelo lead · arquivado'}]},
      {id:13,fase:'Cotado',nome:'Ótica Visão Clara',origem:'Instagram',cidade:'Taubaté, SP',interesse:'Vitrine 1,92 × 0,96',valor:19100,estado:'lead',dono:null,criado:ago(190),conf:0.86,
        proximo:{acao:'follow-up dia 1',quando:em(1440-190)},
        ia:{apurado:[['medida','vitrine, 2 × 1 pedido: fecha em 1,92 × 0,96 (2 gabinetes)'],['valor','R$ 19.100 instalado']],falta:['foto'],proximo:'Esperar; follow-up amanhã.',temperatura:'morna'},
        msgs:[{de:'lead',t:ago(190),x:'Olá, vi seu anúncio no Instagram e gostaria de mais informações'},{de:'ia',t:ago(189.8),x:'Oi. Sou a assistente da P1LED. É pra vitrine da ótica? Qual o tamanho?'},{de:'lead',t:ago(170),x:'Sim, uns 2 por 1'},{de:'ia',t:ago(169),x:'2 × 1 fecha em 1,92 × 0,96 com 2 gabinetes P2.5, em torno de R$ 19.100 instalado. Me manda uma foto da vitrine que eu te mostro como fica?'}]},
      {id:14,fase:'Perdido',nome:'Escola Crescer',origem:'Site',cidade:'Guarulhos, SP',interesse:'Painel pátio 5,76 × 2,88',valor:124100,estado:'perdido',dono:null,criado:ago(1440*20),conf:0.9,perda:{motivo:'Ficou acima da verba',t:ago(1440*5),volta:em(1440*85)},
        ia:{apurado:[['motivo','verba só em 2027, dito pelo lead']],falta:[],proximo:'Reabre em 90 dias.',temperatura:'fria'},
        msgs:[{de:'lead',t:ago(1440*20),x:'Orçamento de painel pro pátio, 5x3'},{de:'ia',t:ago(1440*20-1),x:'Olá. Sou a assistente da P1LED. Coberto ou ao ar livre?'},{de:'lead',t:ago(1440*20-30),x:'Coberto'},{de:'ia',t:ago(1440*20-32),x:'Em torno de R$ 124 mil instalado (18 gabinetes P2.5).'},{de:'lead',t:ago(1440*5),x:'Ficou acima da verba deste ano, vamos ver em 2027'},{de:'ia',t:ago(1440*5-1),x:'Entendido. Te procuro em dezembro, antes do fechamento do orçamento de 2027. Obrigada.'},{de:'sys',t:ago(1440*5-1),x:'Perdido · acima da verba · reabre em 90 d'}]}
    ],
    /* o que a IA fez hoje, do mais novo pro mais velho */
    feed:[
      {t:ago(2.7),tipo:'ia',x:'Rogério Gonçalves: cotou pelo Copiloto (R$ 86.930 instalado), moveu pra Cotado e pediu a foto. Render em andamento.',lead:1},
      {t:ago(9),tipo:'esc',x:'Construtora Almeida: confiança caiu pra 58%. Parou e chamou a Sthefany.',lead:10},
      {t:ago(40),tipo:'lembrete',x:'Follow-up dia 3: Ótica Visão Clara não respondeu desde quinta. Mandou "posso te mostrar o painel na sua vitrine?" e agendou o dia 7.',lead:13},
      {t:ago(52),tipo:'esc',x:'Dr. Henrique Sales: montou a proposta (R$ 57.600) e mandou pra Beatriz aprovar. Se ela não aprovar em 60 min, vai pro Marcos.',lead:3},
      {t:ago(75),tipo:'esc',x:'Hotel Costa Verde pediu pessoa e perguntou prazo. Chamou a Rafaela; ela está offline, avisou no celular.',lead:7},
      {t:ago(130),tipo:'lembrete',x:'Janela da Meta fechando em 1 h pra 3 conversas paradas: mandou o template retorno_24h (R$ 0,15) e manteve as três vivas.'},
      {t:ago(140),tipo:'esc',x:'Lar Cabral pediu 20% de desconto. Acima da alçada da Beatriz: foi pro Marcos.',lead:4},
      {t:ago(190),tipo:'ok',x:'Academia Corpo Livre: Cesar aprovou a proposta em 4 min. IA enviou o PDF, moveu pra Proposta e agendou follow-up pra amanhã.',lead:8},
      {t:ago(300),tipo:'ia',x:'06:40, fora do expediente: 4 leads entraram. IA respondeu em 11 s, qualificou 3, cotou 2. Ninguém acordou.'},
      {t:ago(420),tipo:'lembrete',x:'Escola Crescer disse "verba só em 2027": marcou perdido com motivo e agendou a volta pra 11 de dezembro, antes do orçamento fechar.',lead:14},
      {t:ago(770),tipo:'lembrete',x:'Base esquecida: reabriu 30 leads de agosto que nunca responderam (R$ 1,50 em templates). 5 responderam até agora.',lead:11},
      {t:ago(900),tipo:'lembrete',x:'Igreja Renovar: lembrete da visita de terça enviado ao pastor. Confirmou. Avisou o Cesar na agenda.',lead:5}
    ]
  },

  /* ======================================================= MRV ======================================================= */
  mrv:{
    id:'mrv', nome:'MRV · Loja Itaquera', setor:'Incorporadora · MCMV', moeda:'R$', logo:'assets/mrv.svg', exemplo:true,
    fonte:'números de exemplo até ter dado da loja · faixas do MCMV: vigentes em 2026 · regras da Caixa: jul/2026',
    pipeline:['Novo','Simulado','Visita marcada','Documentos','Análise Caixa','Fechado'],
    ia:{nome:'assistente da MRV Itaquera', assinatura:'assistente · MRV Itaquera', frente:'Haiku 4.5', retaguarda:'Claude 5', tom:'acolhedor, simples, fala de "sua casa", nunca de "unidade"; se apresenta como assistente', resposta_s:9, custo_atend:0.05},
    regra:{ humano_min:10, limite_h:24, toques:[1,2,5,10], janela_meta_h:24, expediente_humano:'todos os dias, 09:00 às 20:00', ia_horario:'24 h, todos os dias' },
    pessoas:[
      {id:'ger',nome:'Gerente da loja',leads_mes:30,visitas:0,propostas:0,fechados:0,valor:0,ini:'GL',papel:'gerente',faz:'aprova condição especial, cuida de reclamação',online:true,sla_min:18,pend_hoje:6,pend_mes:70},
      {id:'jul',nome:'Juliana',leads_mes:180,visitas:38,propostas:21,fechados:4,valor:1050000,ini:'JU',papel:'corretora',faz:'visita ao decorado, proposta, assinatura',online:true,sla_min:7,pend_hoje:9,pend_mes:120},
      {id:'mrc',nome:'Marcos',leads_mes:172,visitas:31,propostas:18,fechados:3,valor:780000,ini:'MA',papel:'corretor',faz:'visita ao decorado, proposta, assinatura',online:true,sla_min:12,pend_hoje:8,pend_mes:104},
      {id:'pau',nome:'Paulo',leads_mes:160,visitas:27,propostas:15,fechados:1,valor:299000,ini:'PA',papel:'corretor',faz:'visita ao decorado, proposta, assinatura',online:true,sla_min:26,pend_hoje:6,pend_mes:88},
      {id:'ren',nome:'Renata',leads_mes:148,visitas:22,propostas:10,fechados:1,valor:231000,ini:'RE',papel:'corretora',faz:'visita ao decorado, proposta, assinatura',online:false,sla_min:44,pend_hoje:4,pend_mes:61}
    ],
    autonomia:[
      {acao:'Responder lead novo',nivel:'sozinha',como:'em até 15 s, 24 h por dia, assinando como assistente'},
      {acao:'Pré-qualificar: renda familiar, FGTS, restrição, dependentes, região',nivel:'sozinha',como:'no máximo 8 perguntas; nunca pede CPF na conversa'},
      {acao:'Simular financiamento MCMV',nivel:'sozinha',como:'motor com as regras da Caixa; sempre diz "estimativa, a Caixa confirma"'},
      {acao:'Mostrar unidades disponíveis',nivel:'sozinha',como:'espelho de vendas da loja; só tipologia e faixa de preço'},
      {acao:'Marcar visita ao decorado',nivel:'sozinha',como:'agenda dos corretores, rodízio por quem tem menos visitas no dia'},
      {acao:'Pedir documentos pra análise de crédito',nivel:'aprovacao',quem:'corretor do lead',como:'manda o link seguro; a IA não recebe documento na conversa'},
      {acao:'Falar de condição especial (entrada parcelada, bônus)',nivel:'aprovacao',quem:'gerente da loja',como:'a IA nunca cita valor de bônus sem aprovação'},
      {acao:'Follow-up nos dias 1, 2, 5 e 10',nivel:'sozinha',como:'dentro da janela: mensagem normal; fora: template retorno_24h'},
      {acao:'Reabrir base esquecida quando abre faixa nova',nivel:'sozinha',como:'template faixa_nova_mcmv, com opção SAIR; 100 por dia'},
      {acao:'Dar o lead como perdido',nivel:'sozinha',como:'só com motivo dito pelo lead (renda, região, comprou em outra)'},
      {acao:'Prometer aprovação de crédito',nivel:'nunca',como:'diz que só a Caixa aprova'},
      {acao:'Falar de prazo de entrega da obra',nivel:'nunca',como:'encaminha pro corretor'},
      {acao:'Atender reclamação de cliente que já comprou',nivel:'nunca',como:'escala pro gerente'},
      {acao:'Pedir nota de 1 a 10 ao fechar a conversa',nivel:'sozinha',como:'valida o número, grava no lead; nota até 6 avisa o gerente da loja',opcional:true}
    ],
    escalada:[
      {regra:'Lead pediu pra falar com uma pessoa',para:'corretor do lead',sla_min:10,depois:'passa pro corretor com menos visitas no dia'},
      {regra:'Renda acima da Faixa 4 (R$ 12 mil): não é MCMV',para:'corretor',sla_min:30,depois:'a IA oferece o decorado mesmo assim'},
      {regra:'Restrição no nome e quer saber "como resolver"',para:'corretor',sla_min:30,depois:'a IA manda o roteiro padrão de regularização'},
      {regra:'Pediu condição especial ou bônus',para:'gerente da loja',sla_min:30,depois:'a IA responde que o gerente retorna hoje'},
      {regra:'Confiança da IA abaixo de 70% em 2 mensagens seguidas',para:'gerente da loja',sla_min:15,depois:'passa pro corretor do lead'},
      {regra:'Cliente que já comprou, reclamação, obra',para:'gerente da loja',sla_min:15,depois:'avisa de novo a cada 15 min'}
    ],
    motores:[
      {nome:'simular_mcmv',fonte:'Regras da Caixa (jul/2026) + tabela de preços da loja',desc:'Faixa pela renda familiar, comprometimento de 30%, subsídio (só Faixas 1 e 2), parcela e entrada com FGTS.',versao:'2.2',dono:'Gerente da loja + crédito MRV',chamadas:1840,erros:2,
        teste:{inp:{renda_bruta_familiar:5100,fgts:22000,dependentes:true,empreendimento:'Itaquera'},out:{faixa:'Faixa 3 (R$ 4.700,01 a R$ 8.600)',subsidio:'não tem nesta faixa',parcela_max:'R$ 1.530 (30% da renda)',entrada:'R$ 22.000 (FGTS)',cabe:'unidades até R$ 275 mil, a Caixa confirma'}}},
      {nome:'consultar_unidades',fonte:'Espelho de vendas da loja (planilha da gerência)',desc:'Unidades por tipologia e faixa de preço. Sem número de apartamento na conversa.',versao:'1.0',dono:'Gerente da loja',chamadas:960,erros:0,teste:{inp:{empreendimento:'Itaquera',dormitorios:2},out:{disponiveis:'37 un',a_partir_de:'R$ 261.990'}}},
      {nome:'agenda_decorado',fonte:'Agenda dos corretores',desc:'Oferece 2 horários no decorado; grava com nome e telefone.',versao:'1.0',dono:'kompila',chamadas:410,erros:0,teste:{inp:{dia:'sábado'},out:{opcoes:['sáb 13/09 10:00','sáb 13/09 14:00']}}}
    ],
    templates:[
      {nome:'retorno_24h',cat:'utilidade',status:'aprovado',usos:412,custo:0.05,texto:'Oi {{1}}, aqui é a assistente da MRV Itaquera. Ficou alguma dúvida sobre a simulação? Posso te ajudar.'},
      {nome:'visita_confirmada',cat:'utilidade',status:'aprovado',usos:188,custo:0.05,texto:'{{1}}, sua visita ao decorado está confirmada pra {{2}}. Leve RG e comprovante de renda.'},
      {nome:'documentos_caixa',cat:'utilidade',status:'aprovado',usos:97,custo:0.05,texto:'{{1}}, pra pré-análise na Caixa envie seus documentos por este link seguro: {{2}}',nota:'documento nunca entra na conversa'},
      {nome:'faixa_nova_mcmv',cat:'marketing',status:'aprovado',usos:1260,custo:0.35,texto:'{{1}}, mudou a faixa do Minha Casa Minha Vida. Sua renda pode caber agora. Quer refazer a simulação? Responda SAIR pra não receber mais.'}
    ],
    conv:{atual:0.013,anterior:0.011,hist:[0.008,0.009,0.010,0.011,0.011,0.012,0.013],ate5:0.029,depois5:0.007},
    hoje:{entraram:58,fora_exp:22,resp_s:9,ia_resolveu:47,chamou_humano:11,agendou:9,cotou:38,reabriu:100,reabriu_resp:17},
    mes:{dia:12,dias:30,entraram:690,hist_leads:[49,55,58,52,61,57,58],qualificou:520,cotou:455,agendou:118,proposta:64,fechou:9,perdeu:96,reabriu:1200,reabriu_resp:214,sem_humano:0.81,
         hist_resp_s:[12,11,10,10,9,9,9], hist_humano_pct:[0.29,0.26,0.24,0.22,0.21,0.19,0.19]},
    resultado:{meta:2100000, total:2360000, n:9, hist:[1310000,1570000,1830000,1780000,2050000,2280000,2360000],
      fechados:[
        {o:'Casal, 2 dorm. · Faixa 2',p:'Residencial Itaquera',v:261990,q:'Juliana',ia:'simulou, marcou decorado; Juliana fechou na visita'},
        {o:'Mãe solo, 2 dorm. · Faixa 1',p:'Residencial Itaquera',v:239000,q:'Marcos',ia:'reaberta da base (faixa nova); simulou e marcou'},
        {o:'Casal, 3 dorm. · Faixa 3',p:'Residencial Itaquera',v:299000,q:'Paulo',ia:'qualificou fora do horário (23h), visita no sábado'}
      ],
      pipe:[['Qualificando',140,0.03,36000000],['Simulado',210,0.1,55000000],['Visita marcada',64,0.35,17000000],['Proposta',31,0.6,8200000]]},
    perdas:{motivos:[['Sem retorno em 10 dias',51,'volta em 30 d'],['Renda não cabe',22,'volta em 90 d'],['Restrição no nome',13,'volta em 60 d'],['Comprou em outra construtora',6,'arquiva'],['Quer outra região',4,'arquiva']]},
    leads:[
      {id:1,fase:'Simulado',fase_por:'IA',fase_t:ago(1.9),nome:'Diego Ramos',origem:'Meta Ads',cidade:'Itaquera, SP',interesse:'2 dormitórios',valor:261990,estado:'ia',dono:null,criado:ago(4),conf:0.9,
        ia:{apurado:[['renda familiar','R$ 5.100'],['FGTS','R$ 22 mil'],['faixa','Faixa 3, sem subsídio'],['parcela máxima','R$ 1.530'],['cabe','unidades até R$ 275 mil']],falta:['restrição no nome','dia da visita'],proximo:'Oferecer 2 horários no decorado.',temperatura:'quente'},
        proximo:{acao:'oferecer visita',quando:em(1)},
        msgs:[{de:'lead',t:ago(4),x:'Oi, vi o anúncio do apartamento em Itaquera. Quanto fica a parcela?'},{de:'ia',t:ago(3.8),x:'Oi, Diego. Sou a assistente da MRV Itaquera. Pra te dar uma estimativa boa: qual a renda da família somada, e você tem FGTS?'},{de:'lead',t:ago(2),x:'Eu e minha esposa, uns 5.100. Tenho 22 mil de FGTS'},{de:'tool',t:ago(1.9),name:'simular_mcmv',inp:{renda_bruta_familiar:5100,fgts:22000,dependentes:null,empreendimento:'Itaquera'},out:{faixa:'Faixa 3',subsidio:'não tem',parcela_max:'R$ 1.530',entrada:'R$ 22.000 (FGTS)',cabe:'até R$ 275 mil'}},{de:'ia',t:ago(1.7),x:'Com R$ 5.100 vocês entram na Faixa 3 do Minha Casa Minha Vida. A parcela fica em até R$ 1.530 e o FGTS entra como entrada. Tem 2 dormitórios a partir de R$ 261.990 que cabe. É estimativa, a Caixa confirma. Quer visitar o decorado?',botoes:['Sábado 10h','Sábado 14h','Outro dia']}]},
      {id:2,fase:'Visita marcada',nome:'Patrícia Souza',origem:'Base esquecida',cidade:'Guaianases, SP',interesse:'2 dormitórios',valor:239000,estado:'agendado',dono:'jul',criado:ago(1440*90),conf:0.92,
        proximo:{acao:'lembrete da visita',quando:em(1440-120)},
        ia:{apurado:[['histórico','lead de junho, renda não cabia'],['reabertura','faixa nova; agora cabe na Faixa 2'],['visita','sábado 10h com a Juliana']],falta:[],proximo:'Lembrar na sexta à noite.',temperatura:'quente'},
        msgs:[{de:'tpl',t:ago(1440*2),x:'Patrícia, mudou a faixa do Minha Casa Minha Vida. Sua renda pode caber agora. Quer refazer a simulação?'},{de:'lead',t:ago(1440*2-40),x:'Quero sim!'},{de:'tool',t:ago(1440*2-41),name:'simular_mcmv',inp:{renda_bruta_familiar:4200,fgts:9000,dependentes:true,empreendimento:'Itaquera'},out:{faixa:'Faixa 2',subsidio:'até R$ 55 mil, a confirmar',parcela_max:'R$ 1.260',cabe:'até R$ 250 mil'}},{de:'ia',t:ago(1440*2-42),x:'Agora cabe: Faixa 2, com subsídio, parcela em até R$ 1.260. Quer ver o decorado no sábado 10h ou 14h?'},{de:'lead',t:ago(1440*2-60),x:'10h'},{de:'sys',t:ago(1440*2-60),x:'Visita marcada · Juliana · sáb 10:00'}]},
      {id:3,fase:'Novo',nome:'Marcelo Pinto',origem:'Site',cidade:'Itaquera, SP',interesse:'3 dormitórios',valor:299000,estado:'humano',dono:'ger',criado:ago(1440),conf:0.9,
        pend:{tipo:'Condição especial',regra:'Pediu condição especial ou bônus',para:'ger',desde:ago(35),sla_min:30,sugestao:'Ele perguntou se tem bônus de entrada. A IA não cita valor sem aprovação. Gerente decide e a IA responde.'},
        ia:{apurado:[['renda','R$ 7.800, Faixa 3'],['FGTS','R$ 31 mil'],['pergunta','bônus de entrada']],falta:['decisão do gerente'],proximo:'Gerente decide.',temperatura:'quente'},
        msgs:[{de:'lead',t:ago(1440),x:'Vi o de 3 dormitórios. Tem bônus na entrada?'},{de:'ia',t:ago(1439.8),x:'Oi, Marcelo. Sou a assistente da MRV Itaquera. Condição especial quem confirma é o gerente da loja. Já pedi e te respondo por aqui.'},{de:'sys',t:ago(35),x:'Escalado pro gerente · condição especial'}]},
      {id:4,fase:'Novo',nome:'Simone Batista',origem:'Meta Ads',cidade:'São Mateus, SP',interesse:'2 dormitórios',valor:261990,estado:'humano',dono:'pau',criado:ago(300),conf:0.88,
        pend:{tipo:'Lead pediu pessoa',regra:'Lead pediu pra falar com uma pessoa',para:'pau',desde:ago(52),sla_min:10,sugestao:'Ela quer saber se o FGTS de dois nomes pode juntar. Resposta padrão do playbook: pode, se os dois forem compradores. Rascunho pronto pra Paulo aprovar.'},
        ia:{apurado:[['renda','R$ 4.300, Faixa 2'],['FGTS','dela e do marido'],['pergunta','somar FGTS']],falta:[],proximo:'Paulo aprova o rascunho.',temperatura:'quente'},
        msgs:[{de:'lead',t:ago(300),x:'Oi, quero saber do apê de 2 quartos'},{de:'ia',t:ago(299.8),x:'Oi, Simone. Sou a assistente da MRV Itaquera. Qual a renda da família somada, e vocês têm FGTS?'},{de:'lead',t:ago(52),x:'4.300. Eu e meu marido temos FGTS, pode juntar? Queria falar com alguém'},{de:'ia',t:ago(51.8),x:'Pode sim, quando os dois entram como compradores. O Paulo, corretor da loja, te explica direitinho. Já chamei ele.'},{de:'sys',t:ago(51.7),x:'Escalado pro Paulo · lead pediu pessoa'}]},
      {id:5,fase:'Perdido',nome:'Carlos Eduardo',origem:'Site',cidade:'Itaquera, SP',interesse:'2 dormitórios',valor:null,estado:'perdido',dono:null,criado:ago(1440*6),conf:0.9,perda:{motivo:'Renda não cabe',t:ago(1440*5),volta:em(1440*85)},
        ia:{apurado:[['renda','R$ 2.100, abaixo da Faixa 1 sem subsídio suficiente']],falta:[],proximo:'Reabre em 90 d ou quando mudar faixa.',temperatura:'fria'},
        msgs:[{de:'lead',t:ago(1440*6),x:'Quanto é a parcela?'},{de:'ia',t:ago(1440*6-0.2),x:'Oi, Carlos. Sou a assistente da MRV Itaquera. Qual a renda da família somada?'},{de:'lead',t:ago(1440*5),x:'2.100'},{de:'ia',t:ago(1440*5-1),x:'Hoje a parcela mínima do 2 dormitórios fica acima do que a Caixa aprova pra essa renda. Se mudar a faixa ou a renda, eu te aviso. Tudo bem?'},{de:'sys',t:ago(1440*5-1),x:'Perdido · renda · reabre em 90 d'}]},
      {id:6,fase:'Novo',nome:'Ana Lúcia',origem:'Base esquecida',cidade:'Itaquera, SP',interesse:'2 dormitórios',valor:null,estado:'reabrindo',dono:null,criado:ago(1440*120),conf:0.7,
        proximo:{acao:'2ª tentativa',quando:em(1440*2)},
        ia:{apurado:[['histórico','abril, sumiu depois da simulação'],['reabertura','faixa_nova_mcmv enviado hoje 09:00']],falta:[],proximo:'Esperar 2 dias.',temperatura:'fria'},
        msgs:[{de:'tpl',t:ago(780),x:'Ana Lúcia, mudou a faixa do Minha Casa Minha Vida. Sua renda pode caber agora. Quer refazer a simulação? Responda SAIR pra não receber mais.'}]},
      {id:7,fase:'Documentos',nome:'Fernando Alves',origem:'Meta Ads',cidade:'Cidade Tiradentes, SP',interesse:'2 dormitórios',valor:261990,estado:'proposta',dono:'mrc',criado:ago(1440*3),conf:0.93,
        proximo:{acao:'follow-up dia 1',quando:em(600)},
        ia:{apurado:[['renda','R$ 6.000, Faixa 3'],['visita','feita ontem com o Marcos'],['proposta','enviada; documentos pelo link seguro']],falta:['análise da Caixa'],proximo:'Esperar a Caixa.',temperatura:'quente'},
        msgs:[{de:'sys',t:ago(1440),x:'Visita feita · Marcos'},{de:'tpl',t:ago(900),x:'Fernando, pra pré-análise na Caixa envie seus documentos por este link seguro: mrv.link/doc'},{de:'lead',t:ago(700),x:'Enviei tudo'},{de:'ia',t:ago(699),x:'Recebido. A Caixa costuma responder em alguns dias. Te aviso por aqui assim que chegar.'}]}
    ],
    feed:[
      {t:ago(1.7),tipo:'ia',x:'Diego Ramos: simulou Faixa 3 (R$ 5.100, sem subsídio), parcela até R$ 1.530, moveu pra Simulado. Ofereceu o decorado com botões.',lead:1},
      {t:ago(35),tipo:'esc',x:'Marcelo Pinto perguntou de bônus de entrada. Escalado pro gerente.',lead:3},
      {t:ago(52),tipo:'esc',x:'Simone Batista pediu pessoa. Rascunho pronto pro Paulo.',lead:4},
      {t:ago(120),tipo:'lembrete',x:'Follow-up dia 2: 14 leads que simularam e sumiram. Mandou "ficou alguma dúvida na simulação?" e agendou o dia 5. 3 já responderam.'},
      {t:ago(260),tipo:'lembrete',x:'Fernando Alves: 3 dias sem resposta da Caixa. Cobrou o status pro Marcos e avisou o lead que está acompanhando.',lead:7},
      {t:ago(420),tipo:'ia',x:'23h de ontem: 6 leads entraram fora do horário. IA respondeu em 9 s, simulou 5, marcou 2 visitas pro sábado.'},
      {t:ago(600),tipo:'lembrete',x:'Patrícia Souza: lembrete da visita de sábado 10h enviado. Confirmou. Juliana avisada.',lead:2},
      {t:ago(780),tipo:'lembrete',x:'Base esquecida: 100 leads de abril a junho reabertos com faixa_nova_mcmv. 17 responderam, 4 simularam de novo.',lead:6},
      {t:ago(900),tipo:'ok',x:'Fernando Alves: link de documentos enviado depois do ok do Marcos (2 min).',lead:7}
    ]
  }
  };
})();
