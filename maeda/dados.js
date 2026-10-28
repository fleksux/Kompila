/* Cardápio Maeda 2026 · fonte única: o site e a Liz da Maeda leem daqui.
   Rotisserie: "Cardápio Rotisserie Maeda 2026 (Canva v2)". Natal: "Cardápio de Natal Maeda 2026 (Canva v2).pptx".
   Item: n = nome, d = descrição, p = preço (R$), v = variações [rótulo, preço], f = foto em img/. */
window.MAEDA = {
  contato: {
    whatsapp: '5511994621532',
    telefone: '(11) 99462-1532',
    email: 'simone.maeda@maedagastronomia.com.br',
    site: 'maedagastronomia.com.br',
    instagram: '@maedagastronomia',
    endereco: 'Rua Paul Valery, 75 · Chácara Santo Antônio · São Paulo, SP'
  },
  condicoes: [
    ['Pedidos', 'Pronta entrega, com alguns itens sob encomenda.'],
    ['Pagamento', 'Pix ou transferência.'],
    ['Entrega', 'Retirada no ateliê ou entrega. Frete não incluso.'],
    ['Pesos', 'Todos os pesos são aproximados.'],
    ['Nota fiscal', 'NF = 18,45%.']
  ],

  rotisserie: [
    {
      id: 'entradinhas', titulo: 'Para abrir', it: 'a mesa.', rotulo: 'Entradinhas',
      foto: 'r-mini-piramide-de-chevre-presunto-cru-e-figos.webp',
      destaques: ['r-brie-folhado-com-favo-de-mel-e-nuts-caramelizado.webp', 'r-burrata-em-seu-jardim-de-tomates.webp', 'r-tartar-de-salmao-defumado-com-creme-azedo-e-pank.webp'],
      grupos: [
        { itens: [
          { n: 'Cylinder roll de gorgonzola, damasco e amêndoas laminadas', d: '400 g', p: 99.90, f: 'r-cylinder-roll-de-gorgonzola-damasco-e-amendoas.webp' },
          { n: 'Cylinder roll de cereja e romã', d: '400 g', p: 99.90, f: 'r-cylinder-roll-de-cereja-e-roma.webp' },
          { n: 'Mini pirâmide de chèvre, presunto cru e figos frescos', d: '500 g. Acompanha tostatas.', p: 169.00, f: 'r-mini-piramide-de-chevre-presunto-cru-e-figos.webp' },
          { n: 'Burrata em seu jardim de tomates', d: 'Burrata (120 g) e tomates (200 g). Acompanha molho pesto e torradinhas (90 g).', p: 112.00, f: 'r-burrata-em-seu-jardim-de-tomates.webp' },
          { n: 'Gorgonzola com peras glaceadas e nuts caramelizados', d: 'Gorgonzola (300 g), peras (200 g) e nuts (100 g). Acompanha torradinhas (90 g).', p: 169.00, f: 'r-gorgonzola-com-peras-glaceadas-e-nuts-carameliza.webp' },
          { n: 'Brie frio duplo com nuts caramelizados e favo de mel', d: 'Brie (250 g) e nuts (200 g). Acompanha torradinhas (90 g).', p: 138.00, f: 'r-brie-frio-duplo-com-nuts-caramelizados-e-favo-de.webp' },
          { n: 'Brie folhado padrão com favo de mel e nuts caramelizados', d: 'Brie (400 g) e nuts (100 g). Acompanha torradinhas (90 g).', p: 169.00, f: 'r-brie-folhado-com-favo-de-mel-e-nuts-caramelizado.webp' },
          { n: 'Mini brie folhado com figos e favo de mel', d: '250 g', p: 120.00, f: 'r-mini-brie-folhado-com-figos-e-favo-de-mel.webp' },
          { n: 'Trilogia de brie folhado', d: '3 bries folhados de 250 g: figo e favo de mel, nuts caramelizados, frutas vermelhas e sua calda. Acompanha torradinhas (180 g).', p: 299.00 },
          { n: 'Brie folhado grande com 3 toppings', d: '1,5 kg. Nuts caramelizados, favo de mel e geleia de frutas vermelhas. Acompanha torradinhas (180 g).', p: 439.00 },
          { n: 'Mousse de tomate seco e manjericão', d: '200 g', p: 49.90, f: 'r-mousse-de-tomate-seco-e-manjericao.webp' },
          { n: 'Patê de azeitonas pretas', d: '200 g', p: 49.90 },
          { n: 'Caponata de berinjela', d: '500 g', p: 89.90, f: 'r-caponata-de-berinjela.webp' },
          { n: 'Catupiry coberto com lâminas de alho frito', d: '350 g. Regado de azeite extra virgem.', p: 89.90, f: 'r-catupiry-coberto-com-laminas-de-alho-frito.webp' },
          { n: 'Guacamole', d: '300 g. Acompanha nachos coloridos (150 g).', p: 89.90, f: 'r-guacamole-com-nachos-coloridos.webp' },
          { n: 'Tartar de salmão defumado com creme azedo e panko trufado', d: '800 g. Acompanha blinis de arroz (100 g).', p: 259.00, f: 'r-tartar-de-salmao-defumado-com-creme-azedo-e-pank.webp' },
          { n: 'Rosbife de filet mignon com rúculas fritas e mostarda Dijon', d: 'Rosbife (500 g) e mostarda Dijon (300 ml).', p: 242.00, f: 'r-rosbife-de-filet-mignon-com-ruculas-fritas-e-mos.webp' }
        ] },
        { t: 'Para completar', itens: [
          { n: 'Lâminas de alho frito', d: '100 g', p: 55.00 },
          { n: 'Torradinhas', d: '90 g', p: 20.00 },
          { n: 'Nachos coloridos', d: '150 g', p: 25.00 }
        ] }
      ]
    },
    {
      id: 'grazing', titulo: 'A mesa que', it: 'já é festa.', rotulo: 'Grazing e tábuas',
      foto: 'r-grazing-table.webp',
      destaques: ['r-tabua-degustacao-maeda.webp', 'r-grazing-cup.webp'],
      grupos: [
        { itens: [
          { n: 'Grazing Table', d: 'Brie, parmesão, gouda, presunto parma, salame, copa, catupiry com lâminas de alho frito regado de azeite, mix de nuts, frutas frescas, frutas secas e mel. Acompanha pãezinhos e torradas. A de 2 pessoas vem na caixa, aprox. 1,2 kg.', f: 'r-grazing-table.webp',
            v: [['2 pessoas', 242.00], ['3 pessoas', 344.00], ['4 pessoas', 460.00], ['5 pessoas', 575.00], ['6 pessoas', 690.00], ['7 pessoas', 790.00], ['8 pessoas', 890.00]] },
          { n: 'Tábua Degustação Maeda', d: 'A Grazing Table completa, mais burrata em seu jardim de tomates e pesto, gorgonzola com peras adocicadas e nuts caramelizados, guacamole com nachos coloridos e mini brie folhado com figos e favo de mel. Acompanha pãezinhos e torradas.', f: 'r-tabua-degustacao-maeda.webp',
            v: [['4 pessoas', 640.00], ['6 pessoas', 890.00], ['8 pessoas', 1000.00]] },
          { n: 'Grazing Cup', d: 'Copinho individual de frios, queijos e frutas. Mínimo de 10 unidades.', f: 'r-grazing-cup.webp', min: 10,
            v: [['Pequeno · 120 g · cada', 25.00], ['Médio · 250 g · cada', 44.90]] }
        ] }
      ]
    },
    {
      id: 'massas', titulo: 'Massas', it: '& molhos.', rotulo: 'Massas e molhos',
      foto: 'r-capeletti.webp',
      destaques: ['r-conchiglione.webp', 'r-rondelli.webp', 'r-molhos.webp'],
      grupos: [
        { t: 'Massas', nota: 'Embalagens com 500 g.', itens: [
          { n: 'Canelone de queijo e presunto', p: 46.20 },
          { n: 'Canelone de ricota e espinafre', p: 48.30 },
          { n: 'Capeletti de queijo', p: 48.30, f: 'r-capeletti.webp' },
          { n: 'Capeletti de carne', p: 48.30 },
          { n: 'Conchiglione de queijo e manjericão', p: 51.00, f: 'r-conchiglione.webp' },
          { n: 'Nhoque de batata', p: 41.90 },
          { n: 'Nhoque recheado de calabresa', p: 54.60 },
          { n: 'Nhoque recheado de mussarela', p: 54.60 },
          { n: 'Panqueca de carne, cogumelos e azeitona', p: 54.60 },
          { n: 'Panqueca Kids', d: 'Leite, leite em pó, margarina, cenoura, creme de leite, Ajinomoto, farinha de trigo e ovo.', p: 54.60 },
          { n: 'Rondelli de shimeji', p: 54.60 },
          { n: 'Rondelli verde de queijo brie', p: 69.00, f: 'r-rondelli.webp' },
          { n: 'Sofioli 4 queijos', p: 53.40 },
          { n: 'Tortelloni de queijo e tomate seco', p: 54.60 },
          { n: 'Tortelone bicolor de queijo e alho-poró', p: 57.30 },
          { n: 'Tortelone de figo ao vinho e queijos', p: 81.00 },
          { n: 'Mezzaluna verde de mussarela de búfala', p: 62.80 }
        ] },
        { t: 'Massas veganas', nota: 'Embalagens com 500 g.', itens: [
          { n: 'Tortelloni de zucca', p: 58.80 },
          { n: 'Conchiglione de berinjela', p: 58.80 },
          { n: 'Sofioli de abobrinha e grão-de-bico', p: 58.80 }
        ] },
        { t: 'Molhos', nota: 'Embalagens com 500 g.', itens: [
          { n: 'Molho de tomates frescos', p: 44.90, f: 'r-molhos.webp' },
          { n: 'Molho ao sugo', p: 44.90 },
          { n: 'Molho à putanesca', p: 51.70 },
          { n: 'Molho branco', p: 44.90 },
          { n: 'Molho emmental', p: 51.70 },
          { n: 'Molho branco trufado', p: 83.20 }
        ] },
        { t: 'Molhos especiais', nota: 'Embalagens com 300 ml.', itens: [
          { n: 'Molho pesto com tomatinhos confit', p: 69.90 },
          { n: 'Molho de mel e mostarda', p: 44.90 },
          { n: 'Molho balsâmico, romã, shoyu e gergelim', p: 44.90 },
          { n: 'Molho mostarda Dijon', p: 44.90 }
        ] }
      ]
    },
    {
      id: 'principais', titulo: 'O prato', it: 'principal.', rotulo: 'Pratos principais e caldos',
      foto: 'r-picanha-assada-com-alho-frito-ao-demi-glace.webp',
      destaques: ['r-camarao-rosa-e-pupunha-selados-a-provencal.webp', 'r-beef-wellington-tradicional.webp', 'r-lombo-de-abadejo-em-cama-de-creme-de-pupunha.webp'],
      grupos: [
        { t: 'Pratos principais', itens: [
          { n: 'Maminha assada', d: '1 peça fatiada · 1,2 kg. Acompanha batatinhas e ceboletes caramelizadas.', p: 318.00, f: 'r-maminha-assada.webp' },
          { n: 'Picanha assada coberta com alho frito ao demi-glace', d: '1 peça fatiada · 1 kg. Acompanha batatinhas e ceboletes caramelizadas.', p: 348.60, f: 'r-picanha-assada-com-alho-frito-ao-demi-glace.webp' },
          { n: 'Filet mignon assado com miolo rosado', d: '1 kg. Ao molho de mostarda Dijon, coberto com rúculas fritas.', p: 418.90, f: 'r-filet-mignon-assado-com-miolo-rosado.webp' },
          { n: 'Beef Wellington tradicional', d: '1 kg. Presunto cru, cogumelos frescos e ervas.', p: 418.90, f: 'r-beef-wellington-tradicional.webp' },
          { n: 'Postas de bacalhau à Gomes de Sá', d: '1 kg', p: 481.00, f: 'r-postas-de-bacalhau-a-gomes-de-sa.webp' },
          { n: 'Lombo de abadejo em cama de creme de pupunha', d: '1 kg. Com crocantes de castanha-do-pará.', p: 348.60, f: 'r-lombo-de-abadejo-em-cama-de-creme-de-pupunha.webp' },
          { n: 'Camarão rosa e pupunha selados à provençal', d: '1,2 kg', p: 586.00, f: 'r-camarao-rosa-e-pupunha-selados-a-provencal.webp' },
          { n: 'Salmão assado coberto com ragu de shimeji e shitake', d: '1 kg', p: 348.60, f: 'r-salmao-assado-com-ragu-de-shimeji-e-shitake.webp' },
          { n: 'Sobrecoxa desossada, marinada na laranja, gengibre e mel', d: '1 kg. Assada em baixa temperatura. Acompanha batatinhas e ceboletes caramelizadas.', p: 120.00, f: 'r-sobrecoxa-desossada-marinada-na-laranja-gengibre.webp' }
        ] },
        { t: 'Caldos e cremes', nota: 'Embalagens com 500 ml.', itens: [
          { n: 'Creme de palmito', p: 35.00 },
          { n: 'Creme de mandioquinha e requeijão', p: 35.00, f: 'r-creme-de-mandioquinha-com-requeijao.webp' },
          { n: 'Caldo de kabotiá e gengibre', d: 'Vegano.', p: 35.00 },
          { n: 'Caldinho de feijão', p: 35.00, f: 'r-caldinho-de-feijao.webp' },
          { n: 'Caldo verde', p: 35.00, f: 'r-caldo-verde.webp' },
          { n: 'Creme de ervilha com bacon', p: 35.00 },
          { n: 'Creme de mandioca com requeijão, crisps de carne seca e pimenta biquinho', p: 41.90, f: 'r-creme-de-mandioca-com-requeijao-e-crisps-de-carn.webp' }
        ] }
      ]
    },
    {
      id: 'guarnicoes', titulo: 'Para', it: 'acompanhar.', rotulo: 'Guarnições e saladas',
      foto: 'r-cuscuz-paulista.webp',
      destaques: ['r-pure-de-mandioquinha-com-ragu-de-costelinha-barb.webp', 'r-cuscuz-marroquino-com-legumes.webp', 'r-arroz-com-amendoas.webp'],
      grupos: [
        { t: 'Guarnições', itens: [
          { n: 'Arroz branco', d: '500 g', p: 46.90 },
          { n: 'Arroz com brócolis', d: '500 g', p: 46.90 },
          { n: 'Arroz com amêndoas', d: '500 g', p: 64.40, f: 'r-arroz-com-amendoas.webp' },
          { n: 'Farofa de banana-da-terra e pimenta-de-cheiro', d: '300 g', p: 46.90, f: 'r-farofa-de-banana-da-terra.webp' },
          { n: 'Farofa caseira com linguiça fresca, pancetta e azeitonas pretas fatiadas', d: '300 g', p: 52.20 },
          { n: 'Batata sauté', d: '500 g', p: 46.90 },
          { n: 'Legumes na manteiga com ervas', d: '500 g', p: 46.90 },
          { n: 'Couve refogada', d: '300 g', p: 46.90 },
          { n: 'Mandioca frita', d: '500 g', p: 46.90 },
          { n: 'Banana à milanesa', d: '500 g', p: 46.90 }
        ] },
        { t: 'Purês e escondidinhos', itens: [
          { n: 'Purê de mandioquinha coberto com ragu de costelinha barbecue', d: '500 g', p: 94.20, f: 'r-pure-de-mandioquinha-com-ragu-de-costelinha-barb.webp' },
          { n: 'Escondidinho de bacalhau', d: '500 g', p: 99.90 },
          { n: 'Escondidinho de carne seca', d: '500 g', p: 94.20 }
        ] },
        { t: 'Saladas e frios', itens: [
          { n: 'Mix de folhas verdes e roxas, nozes, tomatinhos e grana padano', d: '500 g. Acompanha molho de mel e mostarda (300 ml).', p: 92.00 },
          { n: 'Original Caesar Salad', d: '400 g. Alface romana, frango selado, parmesão ralado e croutons. Acompanha molho Caesar (300 ml).', p: 112.00 },
          { n: 'Salada mediterrânea', d: '500 g. Berinjela, abobrinha, figo turco, tâmara, uva-passa, queijo fresco, nozes, amêndoas e romã.', p: 112.00, f: 'r-salada-mediterranea.webp' },
          { n: 'Maionese de legumes', d: '500 g', p: 59.50, f: 'r-maionese-de-legumes.webp' },
          { n: 'Salpicão de frango', d: '500 g. Batata palha e uva-passa à parte.', p: 67.00, f: 'r-salpicao-de-frango.webp' },
          { n: 'Tabule de cuscuz marroquino com lâminas de amêndoas tostadas', d: '500 g', p: 69.00, f: 'r-tabule-de-cuscuz-marroquino-com-amendoas.webp' },
          { n: 'Cuscuz marroquino com legumes, curry, cogumelos e uvas-passas', d: '500 g', p: 69.00, f: 'r-cuscuz-marroquino-com-legumes.webp' },
          { n: 'Cuscuz paulista', d: '1,5 kg', p: 183.20, f: 'r-cuscuz-paulista.webp' },
          { n: 'Cuscuz paulista individual', d: '12 unidades de 110 g', p: 183.20 }
        ] }
      ]
    },
    {
      id: 'quiches', titulo: 'Do forno', it: 'para a mesa.', rotulo: 'Quiches e tortas',
      foto: 'r-quiche-de-aspargos.webp',
      destaques: ['r-quiche-de-abobrinha-e-queijo-brie.webp', 'r-quiche-de-bacalhau-e-tomate-confit.webp', 'r-torta-de-frango.webp'],
      grupos: [
        { t: 'Quiches', nota: 'Aro 20 cm com 7 cm de altura. Peso em torno de 1,5 kg a 1,8 kg.', itens: [
          { n: 'Quiche de abobrinha e queijo brie', p: 180.00, f: 'r-quiche-de-abobrinha-e-queijo-brie.webp' },
          { n: 'Quiche de alho-poró', p: 142.00, f: 'r-quiche-de-alho-poro.webp' },
          { n: 'Quiche de aspargos', p: 230.00, f: 'r-quiche-de-aspargos.webp' },
          { n: 'Quiche Lorraine', p: 142.00 },
          { n: 'Quiche de escarola e ricota', p: 142.00, f: 'r-quiche-de-escarola-e-ricota.webp' },
          { n: 'Quiche de queijo coberta com mix de cogumelos silvestres', p: 247.00, f: 'r-quiche-de-queijo-com-cogumelos-silvestres.webp' },
          { n: 'Quiche de lascas de bacalhau e tomate confit', p: 376.00, f: 'r-quiche-de-bacalhau-e-tomate-confit.webp' }
        ] },
        { t: 'Tortas', nota: 'Aro 20 cm com 7 cm de altura. Peso em torno de 1,5 kg a 1,8 kg.', itens: [
          { n: 'Torta de bacalhau', p: 293.00, f: 'r-torta-de-bacalhau.webp' },
          { n: 'Torta de camarão', p: 302.00 },
          { n: 'Torta de frango, com ou sem catupiry', p: 142.00, f: 'r-torta-de-frango.webp' },
          { n: 'Torta de palmito', p: 142.00 },
          { n: 'Torta de carne acebolada e cogumelos', p: 272.00, f: 'r-torta-de-carne-acebolada-e-cogumelos.webp' }
        ] }
      ]
    },
    {
      id: 'sobremesas', titulo: 'Para', it: 'adoçar.', rotulo: 'Sobremesas',
      foto: 'r-trifle-oreo-leite-ninho-e-nutella.webp',
      destaques: ['r-original-cheesecake-de-frutas-vermelhas.webp', 'r-pavlova-de-frutas-vermelhas.webp', 'r-banoffee-desconstruida.webp'],
      grupos: [
        { t: 'Tortas e taças', itens: [
          { n: 'Torta de chocolate intenso com muito chocolate', d: 'Aro 20.', p: 214.00, f: 'r-torta-de-chocolate-intenso.webp' },
          { n: 'Original cheesecake de frutas vermelhas', d: 'Aro 20. Calda à parte.', p: 239.00, f: 'r-original-cheesecake-de-frutas-vermelhas.webp' },
          { n: 'Max palha italiana', d: '20 cm · aprox. 1 kg', p: 214.00, f: 'r-max-palha-italiana.webp' },
          { n: 'Merengue de morango com mousse de chocolate branco', d: '1 kg', p: 225.00 },
          { n: 'Trifle Oreo, Leite Ninho e Nutella', v: [['1 kg', 214.00], ['500 g', 128.40]], f: 'r-trifle-oreo-leite-ninho-e-nutella.webp' },
          { n: 'Banoffee desconstruída', d: 'Castanhas, doce de leite caseiro, chantilly e banana.', v: [['1 kg', 160.00], ['500 g', 96.00]], f: 'r-banoffee-desconstruida.webp' },
          { n: 'Taça de verrine de frutas vermelhas com ganache de chocolate', v: [['1 kg', 160.00], ['500 g', 96.00]], f: 'r-taca-de-verrine-de-frutas-vermelhas.webp' },
          { n: 'Panacotta de abacaxi em sua calda caramelada e toque de hortelã', v: [['1 kg', 160.00], ['500 g', 96.00]], f: 'r-panacotta-de-abacaxi.webp' },
          { n: 'Panacotta de frutas vermelhas', v: [['1 kg', 160.00], ['500 g', 96.00]] },
          { n: 'Mousse de ricota com goiabada coração', v: [['1 kg', 160.00], ['500 g', 96.00]], f: 'r-mousse-de-ricota-com-goiabada.webp' }
        ] },
        { t: 'Cocadas', itens: [
          { n: 'Cocada mole', v: [['1 kg', 160.00], ['500 g', 96.00]], f: 'r-cocada-mole.webp' },
          { n: 'Cocada com baba de moça e chips de coco', d: '1 kg', p: 225.00 },
          { n: 'Coquinho', d: '2 unidades na caixinha. Chocolate ao leite e branco recheado de cocada mole.', p: 49.90, f: 'r-coquinho.webp' },
          { n: 'Cocão', d: '1,4 kg. Coco de chocolate ao leite e branco recheado de cocada mole.', p: 265.00 }
        ] },
        { t: 'Individuais', itens: [
          { n: 'Pavlovas individuais', d: 'Unidade. Frutas vermelhas, Leite Ninho com Nutella, limão-siciliano ou mousse de chocolate com morango.', p: 18.90, f: 'r-pavlova-de-frutas-vermelhas.webp' },
          { n: 'Donuts', d: 'Unidade.', p: 14.00, f: 'r-donuts.webp' },
          { n: 'Mini Bavarian', d: 'Porções de 10 unidades.', p: 4.00 },
          { n: 'Mini donuts rosquinha', d: 'Porções de 10 unidades.', p: 6.00 },
          { n: 'Mini pudim de leite', p: 15.00, f: 'r-mini-pudim-de-leite.webp' },
          { n: 'Churros espanhol', d: '12 unidades. Acompanha doce de leite, açúcar e canela.', p: 68.00, f: 'r-churros-espanhol.webp' },
          { n: 'Pocket churros', d: '6 unidades.', p: 40.00, f: 'r-pocket-churros.webp' }
        ] }
      ]
    },
    {
      id: 'beliscar', titulo: 'Para', it: 'beliscar.', rotulo: 'Para beliscar',
      foto: 'r-mini-salgados-assados-e-fritos.webp',
      destaques: ['r-dadinho-de-tapioca-com-melaco-de-cana.webp', 'r-mini-salgados-para-fritar.webp'],
      grupos: [
        { t: 'Lanchinhos', nota: 'Kit com 20 unidades.', itens: [
          { n: 'Carne louca', d: 'Carne louca (800 g) + 20 mini pães franceses.', p: 265.00 },
          { n: 'Mini cheeseburger', d: '20 mini hambúrgueres de fraldinha com cheddar + 20 mini pães de hambúrguer + maionese caseira.', p: 342.00 },
          { n: 'Pernil estilo Estadão', d: 'Pernil assado em baixa temperatura, desfiado e refogado com cebola, pimentão e tomate (800 g) + 20 mini pães franceses.', p: 254.00 }
        ] },
        { t: 'Lanchinho frio', nota: 'Embalado individualmente. Mínimo de 10 unidades.', itens: [
          { n: 'Lanchinho frio · unidade', d: 'Rosbife, mix de mostarda e rúcula · Frango, cenoura e alface · Mousse de tomate seco e rúcula · Mousse de azeitona, cenoura e alface · Mousse de brie e damasco · Peito de peru, queijo branco e alface · Salame, cheddar e rúcula · Ricota, nozes e uva-passa.', p: 14.50, min: 10 }
        ] },
        { t: 'Mini salgados', itens: [
          { n: 'Mini salgados assados', d: 'Bandeja com 20 unidades. Esfiha de carne · Esfiha de frango · Doguinho · Pão de batata com requeijão · Croissant de queijo e presunto · Empadinha de palmito ou frango · Quiche de queijo ou alho-poró · Mini pizza de mussarela ou calabresa.', p: 48.00, f: 'r-mini-salgados-assados-e-fritos.webp' },
          { n: 'Mini salgados para fritar', d: 'Bandeja com 20 unidades. Coxinha de frango e requeijão · Kibe · Croquete de carne · Bolinha de queijo · Trouxinha bauru.', p: 32.00, f: 'r-mini-salgados-para-fritar.webp' },
          { n: 'Mini salgados já fritos', d: 'Bandeja com 20 unidades. Coxinha de frango e requeijão · Kibe · Croquete de carne · Bolinha de queijo · Trouxinha bauru · Dadinho de tapioca com melaço de cana.', p: 54.80 },
          { n: 'Coxinha de frango com massa de batata', d: 'Para fritar.', p: 59.80 },
          { n: 'Bolinho de abóbora e carne seca', v: [['Para fritar', 46.90], ['Já frito', 75.60]] },
          { n: 'Mini risoles de camarão', d: 'Para fritar.', p: 74.50 },
          { n: 'Mini pastel de carne, queijo ou palmito', d: 'Para fritar.', p: 65.00, f: 'r-mini-pastel.webp' },
          { n: 'Mini pastel de queijo brie', d: 'Para fritar. Acompanha geleia de pimenta.', p: 99.60 },
          { n: 'Dadinho de tapioca', d: '250 g · aprox. 20 unidades. Acompanha melaço de cana.', p: 48.00, f: 'r-dadinho-de-tapioca-com-melaco-de-cana.webp' }
        ] }
      ]
    },
    {
      id: 'caixas', titulo: 'Para', it: 'presentear.', rotulo: 'Caixas presente',
      foto: 'r-caixa-experiencia.webp',
      destaques: ['r-caixa-cafe-da-manha.webp', 'r-caixa-boteco.webp'],
      grupos: [
        { itens: [
          { n: 'Café da manhã individual', d: 'Pão artesanal com fermentação natural (80 g) · Waffle (2 unidades) · Nutella (140 g) · Frios (80 a 100 g / 6 fatias) · Suco integral (300 ml) · Insumos (açúcar, adoçante e guardanapo).', p: 105.00, f: 'r-caixa-cafe-da-manha.webp' },
          { n: 'Café da manhã · 1 a 2 pessoas', d: 'Grissinis artesanais (75 g) · Pão artesanal com fermentação natural (80 g) · Waffles (2 unidades) · Nutella (140 g) · Mel (60 g) · Geleia caseira (60 g) · Mini manteiga (60 g) · Mini queijinho (2 unidades) · Frios (80 a 100 g / 6 fatias) · Suco integral (300 ml) · Frutas frescas (150 g) · Sachê de chá (1 unidade) · Drip coffee (1 unidade) · Insumos (açúcar, adoçante e guardanapo).', p: 197.20, f: 'r-caixa-cafe-da-manha.webp' },
          { n: 'Café da manhã premium · 2 a 3 pessoas', d: '6 unidades de pães variados (mini baguete, croissant, focaccia de alecrim, micro australiano, bagel, brezel) · Waffle (2 unidades) · Cruffin de doce de leite · Cinnamon roll · Nutella (140 g) · Frios (200 g / 12 fatias) · Mel, geleia caseira, manteiga e catupiry (60 g cada) · Mini queijinho (2 unidades) · Suco integral (500 ml) · Frutas frescas (200 g) · Sachês de chá e drip coffee (2 unidades de cada) · Insumos (açúcar, adoçante, copo de papel, talheres e guardanapo).', p: 375.00 },
          { n: 'Caixa Boteco', d: 'Coxinha de frango e croquete de carne (10 unidades de cada, fritos) · Frios: salame, copa, parmesão, ovo de codorna, picles e azeitonas (200 g) · 1 cerveja especial (350 ml).', p: 132.00, f: 'r-caixa-boteco.webp' },
          { n: 'Pocket Tapas', d: 'Tartar de salmão defumado, creme azedo e panko trufado (150 g) · Brie frio com figos e favo de mel (200 g) · Guacamole (150 g) · Mousse de tomate seco (100 g) · Catupiry com lâminas de alho frito regado de azeite extra virgem (100 g) · Torradinhas (90 g) · Blinis de arroz (50 g) · Nachos coloridos (75 g).', p: 320.00 },
          { n: 'Caixa Happy Hour · 8 a 10 pessoas', d: 'Coxinha de frango, croquete de carne e bolinho de abóbora com carne seca (20 unidades de cada, fritos) · Dadinho de tapioca (250 g) com melaço de cana · Catupiry coberto com lâminas de alho frito, regado de azeite extra virgem (350 g) · Tábua de frios: copa, salame e presunto cru, quadradinhos de queijo, ovo de codorna, picles e azeitonas (600 g) · Pernil estilo Estadão (800 g) · Pãezinhos fatiados (10 unidades) e torradinhas (180 g).', p: 600.00 },
          { n: 'Caixa Experiência · 6 a 8 pessoas', d: 'Tartar de salmão defumado, creme azedo e panko trufado (250 g) · Gorgonzola com peras glaceadas e nuts caramelizados (300 g) · Mini brie folhado com figos e favo de mel (250 g) · Guacamole (200 g) · Mini Grazing Table (300 g) · Burrata em seu jardim de tomates e pesto (200 g) · Catupiry com lâminas de alho frito regado de azeite extra virgem (150 g) · Mousse de azeitonas pretas (150 g) · Torradinhas (90 g) · Blinis de arroz (50 g) · Nachos coloridos (100 g) · Grissinis (100 g) · Pães (2 unidades).', p: 680.00, f: 'r-caixa-experiencia.webp' }
        ] }
      ]
    },
    {
      id: 'kitfesta', titulo: 'A ilha fria', it: 'na sua casa.', rotulo: 'Kit festa · Ilha fria',
      intro: 'Grazing Table com brie, parmesão, gouda, presunto parma, salame, copa, geleia, mix de nuts sortidos, frutas frescas e secas e mel, mais entradas da casa, em quatro tamanhos.',
      foto: 'r-tabua-degustacao-maeda.webp',
      kits: [
        { n: 'Kit 01', pessoas: '10 a 15 pessoas', p: 1948.70, itens: ['Grazing Table 2', 'Cesta de pães (6 pães, 180 g de torradinhas e 200 g de grissinis)', 'Gorgonzola (300 g) com peras glaceadas (200 g) e nuts caramelizados (100 g)', 'Mousse de tomate seco e manjericão (200 g)', 'Catupiry coberto com lâminas de alho frito, regado de azeite extra virgem (350 g)', 'Guacamole (300 g) com nachos coloridos (150 g)', 'Tartar de salmão com creme azedo e panko trufado (400 g) com blinis de arroz (50 g)', 'Mini rosbife de filet mignon e rúculas fritas (500 g) ao molho de mostarda Dijon (300 ml)'] },
        { n: 'Kit 02', pessoas: '20 a 25 pessoas', p: 2998.80, itens: ['Grazing Table 4', 'Cesta de pães (12 pães, 360 g de torradinhas e 400 g de grissinis)', 'Gorgonzola (600 g) com peras glaceadas (400 g) e nuts caramelizados (200 g)', 'Mousse de tomate seco e manjericão (400 g)', 'Catupiry coberto com lâminas de alho frito, regado de azeite extra virgem (700 g)', 'Guacamole (600 g) com nachos coloridos (300 g)', 'Tartar de salmão com creme azedo e panko trufado (800 g) com blinis de arroz (100 g)', 'Mini rosbife de filet mignon e rúculas fritas (1 kg) ao molho de mostarda Dijon (600 ml)'] },
        { n: 'Kit 03', pessoas: '30 a 35 pessoas', p: 4202.70, itens: ['Grazing Table 6', 'Cesta de pães (18 pães, 540 g de torradinhas e 600 g de grissinis)', 'Gorgonzola (900 g) com peras glaceadas (600 g) e nuts caramelizados (300 g)', 'Mousse de tomate seco e manjericão (600 g)', 'Catupiry coberto com lâminas de alho frito, regado de azeite extra virgem (1 kg)', 'Guacamole (900 g) com nachos coloridos (450 g)', 'Tartar de salmão com creme azedo e panko trufado (1,2 kg) com blinis de arroz (150 g)', 'Mini rosbife de filet mignon e rúculas fritas (1,5 kg) ao molho de mostarda Dijon (900 ml)'] },
        { n: 'Kit 04', pessoas: '40 a 45 pessoas', p: 5212.30, itens: ['Grazing Table 8', 'Cesta de pães (24 pães, 720 g de torradinhas e 800 g de grissinis)', 'Gorgonzola (1,2 kg) com peras glaceadas (800 g) e nuts caramelizados (400 g)', 'Mousse de tomate seco e manjericão (800 g)', 'Catupiry coberto com lâminas de alho frito, regado de azeite extra virgem (1,4 kg)', 'Guacamole (1,2 kg) com nachos coloridos (600 g)', 'Tartar de salmão com creme azedo e panko trufado (1,6 kg) com blinis de arroz (200 g)', 'Mini rosbife de filet mignon e rúculas fritas (2 kg) ao molho de mostarda Dijon (1,2 l)'] }
      ]
    }
  ],

  natal: {
    farofinha: 'Farofinha molhadinha de Natal: farofa, bacon, uva-passa, figo turco, pêssego em calda, nozes e salsinha.',
    pacotes: [
      { id: 'pacote-1', n: 'Pacote 1', pessoas: '4 pessoas', min: 4, max: 4, p: 798.60, foto: 'n-18.webp', grupos: [
        ['Entradas', [['Cylinder roll de cereja e romã', '400 g', 99.90], ['Patê de azeitonas pretas', '200 g', 49.90], ['Pãezinhos (2 unidades) e torradinhas (90 g)', '', 36.00]]],
        ['Prato principal', [['Peito de peru marinado', '1,2 kg. Assado em baixa temperatura na manteiga de alho e ervas. Acompanha batatas bolinhas, brócolis e tomatinhos assados no alecrim, farofinha molhadinha de Natal e molho cítrico de laranja e limão-siciliano.', 328.90]]],
        ['Acompanhamentos', [['Maionese de legumes', '500 g', 59.50], ['Arroz com amêndoas levemente tostadas', '500 g', 64.40]]],
        ['Sobremesa', [['Banoffee desconstruída', '1 kg', 160.00]]]
      ] },
      { id: 'pacote-2', n: 'Pacote 2', pessoas: '4 a 6 pessoas', min: 4, max: 6, p: 1015.60, foto: 'n-6.webp', grupos: [
        ['Entradas', [['Cylinder roll de gorgonzola, damasco e amêndoas laminadas', '400 g', 99.90], ['Caponata de berinjela', '500 g', 89.90], ['Pãezinhos (4 unidades) e torradinhas (180 g)', '', 72.00]]],
        ['Prato principal', [['Pernil desossado, marinado em vinho espumante, mel e laranja', '1,2 kg. Assado em baixa temperatura. Acompanha batatas rústicas assadas com sálvia, cenouras caramelizadas no mel, mini cebolas glaceadas, farofinha molhadinha de Natal e molho de maracujá com toque de mostarda e alecrim.', 328.90]]],
        ['Acompanhamentos', [['2 × Conchiglione de queijo e manjericão', '500 g cada', 110.00], ['2 × Molho de tomates frescos', '500 ml cada', 89.90]]],
        ['Sobremesa', [['Merengue de morango com mousse de chocolate branco', '1 kg', 225.00]]]
      ] },
      { id: 'pacote-3', n: 'Pacote 3', pessoas: '8 a 10 pessoas', min: 8, max: 10, p: 1789.10, foto: 'n-8.webp', grupos: [
        ['Entradas', [['Brie folhado grande coberto com figos frescos', '1,5 kg. Acompanha geleia de frutas vermelhas, peras glaceadas e nuts caramelizados (230 g de cada topping).', 439.00], ['Pãezinhos (8 unidades) e torradinhas (180 g)', '', 104.00]]],
        ['Pratos principais', [['Peito de peru marinado', '1,2 kg. Assado em baixa temperatura na manteiga de alho e ervas. Acompanha batatas bolinhas, brócolis e tomatinhos assados no alecrim, farofinha molhadinha de Natal e molho cítrico de laranja e limão-siciliano.', 328.90], ['Tender bolinha assado com mel, laranja e especiarias', '1,2 kg. Acompanha brunoise de abacaxi salteado ao mel de laranjeiras e finalizado com hortelã, mini cebolas caramelizadas em vinho do Porto e alecrim, farofinha molhadinha de Natal e molho de mostarda Dijon e estragão.', 299.00]]],
        ['Acompanhamentos', [['2 × Farofa caseira com linguiça fresca, pancetta e azeitonas pretas fatiadas', '300 g cada', 104.40], ['2 × Arroz festivo', '500 g cada. Arroz soltinho, uva-passa, bacon crocante, lâminas de alho-poró e damasco.', 128.80]]],
        ['Sobremesas', [['Pavê de abacaxi com coco', '1 kg', 160.00], ['Tiramisù', '1 kg', 225.00]]]
      ] },
      { id: 'pacote-4', n: 'Pacote 4', pessoas: '10 a 12 pessoas', min: 10, max: 12, p: 2516.30, foto: 'n-10.webp', grupos: [
        ['Entradas', [['Burrata em seu jardim de tomates', 'Burrata (120 g) e tomates (200 g). Acompanha molho pesto (80 ml).', 112.00], ['Guacamole e seus nachos coloridos', 'Guacamole (300 g) e nachos (150 g).', 89.90], ['Brie folhado padrão com favo de mel e nuts caramelizados', 'Brie (400 g) e nuts (100 g). Acompanha torradinhas.', 169.00], ['Pãezinhos (8 unidades) e torradinhas (270 g)', '', 124.00]]],
        ['Pratos principais', [['Peito de peru marinado', '1,2 kg. Assado em baixa temperatura na manteiga de alho e ervas. Acompanha batatas bolinhas, brócolis e tomatinhos assados no alecrim, farofinha molhadinha de Natal e molho cítrico de laranja e limão-siciliano.', 328.90], ['Filet mignon assado com miolo rosado', '1 kg. Ao molho de mostarda Dijon e rúculas fritas.', 418.90, 'ou'], ['Boeuf Wellington tradicional', '1 kg', 418.90, 'alt'], ['Postas de bacalhau à Gomes de Sá', '1 kg', 481.00]]],
        ['Acompanhamentos', [['2 × Arroz com amêndoas', '500 g cada', 128.80], ['2 × Arroz negro com castanha e romã', '500 g cada. Finalizado com azeite trufado.', 159.80], ['2 × Maionese de legumes', '500 g cada', 119.00]]],
        ['Sobremesas', [['Taça de banoffee desconstruída', '1 kg', 160.00], ['Merengue de morango com mousse de chocolate branco', '1 kg', 225.00]]]
      ] },
      { id: 'pacote-5', n: 'Pacote 5', pessoas: '14 a 16 pessoas', min: 14, max: 16, p: 3212.70, foto: 'n-11.webp', grupos: [
        ['Entradas', [['Grazing table para 4 pessoas', 'Brie, parmesão, gouda, presunto parma, salame, copa, catupiry com lâminas de alho frito regado de azeite extra virgem, mix de nuts, frutas frescas e secas e mel.', 460.00], ['Mini pirâmide de chèvre, presunto cru e figos frescos', '500 g. Com zest de limão-siciliano. Acompanha tostatas.', 169.00], ['Homus da terra', '500 g. Homus coberto com caponata de berinjela, flor de jambu e pó de cogumelo Yanomami. Acompanha torradas sírias.', 112.00], ['Pãezinhos (8 unidades) e torradinhas (270 g)', '', 124.00]]],
        ['Pratos principais', [['Peru inteiro, marinado em ervas e vinho', '5 kg. Finalizado na manteiga de ervas. Acompanha batatas bolinhas, brócolis e tomatinhos assados no alecrim, farofinha molhadinha de Natal e molho cítrico de laranja e limão-siciliano.', 585.20, 'ou'], ['Pernil inteiro, marinado por 72 horas', '6 kg. Assado em baixa temperatura na manteiga e glaceado com abacaxi. Acompanha batatas rústicas assadas com sálvia, cenouras caramelizadas no mel, mini cebolas glaceadas, aspargos, cogumelos, farofinha molhadinha de Natal e molho de maracujá com toque de mostarda e alecrim.', 585.20, 'alt'], ['Boeuf Wellington tradicional', '1 kg', 418.90, 'ou'], ['Filet mignon assado com miolo rosado', '1 kg. Ao molho de mostarda Dijon e rúculas fritas.', 418.90, 'alt']]],
        ['Saladas e acompanhamentos', [['2 × Salada mediterrânea', '500 g cada. Berinjela, abobrinha, figo turco, tâmara, uva-passa, queijo fresco, nozes, amêndoas e romã.', 224.00], ['2 × Salada de figos grelhados, jamón e búfala', '500 g cada. Mix de folhas com figos tostados, presunto cru crocante e pérolas de muçarela de búfala.', 224.00], ['2 × Arroz com amêndoas', '500 g cada', 128.80], ['2 × Arroz festivo', '500 g cada. Arroz soltinho, uva-passa, bacon crocante, lâminas de alho-poró e damasco.', 128.80]]],
        ['Sobremesas', [['Original cheesecake de frutas vermelhas', 'Calda à parte.', 239.00], ['Torta de chocolate intenso com macadâmia e arabescos de chocolate', '', 239.00], ['Panacotta de abacaxi com hortelã', '', 160.00]]]
      ] },
      { id: 'pacote-8', n: 'Pacote 8', pessoas: '18 a 20 pessoas', min: 18, max: 20, p: 3706.30, foto: 'n-14.webp', grupos: [
        ['Entradas', [['Tábua degustação para 6 pessoas', 'Burrata (240 g) em seu jardim de tomates (200 g) com molho pesto (80 ml) · Gorgonzola (300 g) com peras glaceadas (200 g) e nuts caramelizados (100 g) · Guacamole (300 g) e seus nachos coloridos (150 g) · Brie folhado (400 g) com figos e favos de mel · Parmesão, gouda, brie, presunto parma, salame, copa, catupiry com lâminas de alho frito regado no azeite, frutas frescas, frutas secas e nuts.', 890.00], ['Mousse de tomate seco', '200 g', 49.90], ['Cylinder roll de cereja e romã', '400 g', 99.90], ['Pãezinhos (10 unidades) e torradinhas (360 g)', '', 160.00]]],
        ['Pratos principais', [['Peru inteiro, marinado em ervas e vinho', '5 kg. Finalizado na manteiga de ervas. Acompanha batatas bolinhas, brócolis e tomatinhos assados no alecrim, farofinha molhadinha de Natal e molho cítrico de laranja e limão-siciliano.', 585.20], ['Tender bolinha assado com mel, laranja e especiarias', '1,2 kg. Acompanha brunoise de abacaxi salteado ao mel de laranjeiras e finalizado com hortelã, mini cebolas caramelizadas em vinho do Porto e alecrim, farofinha molhadinha de Natal e molho de mostarda Dijon e estragão.', 299.00], ['Pernil desossado, marinado em vinho espumante, mel e laranja', '1,2 kg. Assado em baixa temperatura. Acompanha batatas rústicas assadas com sálvia, cenouras caramelizadas no mel, mini cebolas glaceadas, farofinha molhadinha de Natal e molho de maracujá com toque de mostarda e alecrim.', 328.90]]],
        ['Acompanhamentos', [['2 × Arroz festivo', '500 g cada. Arroz soltinho, uva-passa, bacon crocante, lâminas de alho-poró e damasco.', 128.80], ['2 × Arroz negro com castanha e romã', '500 g cada. Finalizado com azeite trufado.', 159.80], ['2 × Tabule de cuscuz marroquino com lâminas de amêndoas tostadas', '500 g cada', 138.00], ['2 × Batata sauté', '500 g cada', 93.80], ['2 × Maionese de legumes', '500 g cada', 119.00], ['2 × Salpicão de frango', '500 g cada. Batata palha e uva-passa separadas.', 119.80]]],
        ['Sobremesas', [['Panacotta de frutas vermelhas', '1 kg', 160.00], ['Banoffee desconstruída', '1 kg', 160.00], ['Trifle Oreo, Leite Ninho e Nutella', '1 kg', 214.00]]]
      ] },
      { id: 'premium', n: 'Pacote Premium', pessoas: '25 a 30 pessoas', min: 25, max: 30, p: 5642.20, foto: 'n-20.webp', grupos: [
        ['Entradas', [['Tábua degustação para 8 pessoas', 'Burrata (120 g) em seu jardim de tomates (200 g) com molho pesto (80 ml) · Gorgonzola (300 g) com peras glaceadas (200 g) e nuts caramelizados (100 g) · Guacamole (300 g) e seus nachos coloridos (150 g) · Mini brie folhado (250 g) com figos e favos de mel · Parmesão, gouda, brie, presunto parma, salame, copa, catupiry com lâminas de alho frito regado no azeite, frutas frescas, frutas secas e nuts.', 1000.00], ['Pãezinhos (12 unidades) e torradinhas (450 g)', '', 196.00], ['Cylinder roll de gorgonzola, damasco e amêndoas laminadas', '400 g', 99.90], ['Tartar de salmão defumado com creme azedo e panko trufado', '800 g. Acompanha blinis de arroz (100 g).', 259.00], ['Homus da terra', '500 g. Homus coberto com caponata de berinjela, flor de jambu e pó de cogumelo Yanomami. Acompanha torradas sírias.', 112.00]]],
        ['Pratos principais', [['Peru inteiro, marinado em ervas e vinho', '5 kg. Finalizado na manteiga de ervas. Acompanha batatas bolinhas, brócolis e tomatinhos assados no alecrim, farofinha molhadinha de Natal e molho cítrico de laranja e limão-siciliano.', 585.20], ['Pernil inteiro, marinado por 72 horas', '6 kg. Assado em baixa temperatura na manteiga e glaceado com abacaxi. Acompanha batatas rústicas assadas com sálvia, cenouras caramelizadas no mel, mini cebolas glaceadas, aspargos, cogumelos, farofinha molhadinha de Natal e molho de maracujá com toque de mostarda e alecrim.', 585.20], ['2 × Postas de bacalhau à Gomes de Sá', '1 kg cada', 962.00]]],
        ['Acompanhamentos', [['2 × Cuscuz marroquino com legumes, curry, cogumelos e uvas-passas', '500 g cada', 138.00], ['3 × Maionese de legumes', '500 g cada', 178.50], ['3 × Arroz festivo', '500 g cada. Arroz soltinho, uva-passa, bacon crocante, lâminas de alho-poró e damasco.', 193.20], ['3 × Arroz com amêndoas', '500 g cada', 193.20], ['2 × Batata sauté', '500 g cada', 93.80], ['Cuscuz paulista', '1,5 kg', 183.20]]],
        ['Sobremesas', [['Pavê de abacaxi com coco', '1 kg', 160.00], ['Tiramisù', '1 kg', 225.00], ['Original cheesecake de frutas vermelhas', 'Calda à parte.', 239.00], ['Torta de chocolate intenso com macadâmia e arabescos de chocolate', '', 239.00]]]
      ] }
    ],
    avulsos: [
      { t: 'Entradas e saladas', itens: [
        { n: 'Homus da terra', d: '500 g. Homus coberto com caponata de berinjela, flor de jambu e pó de cogumelo Yanomami. Acompanha torradas sírias.', p: 112.00 },
        { n: 'Chibé', d: '500 g. Cuscuz de farinha de Uarini, tucupi, arubé, camarões selados, vinagrete de abacaxi e teriyaki de tucupi.', p: 153.20 },
        { n: 'Mix de folhas verdes, peras laminadas, Roquefort e amêndoas caramelizadas', d: '500 g. Alface americana e romana. Acompanha molho de mel e mostarda (200 ml).', p: 92.00 },
        { n: 'Salada de figos grelhados, jamón e búfala', d: '500 g. Mix de folhas com figos tostados, presunto cru crocante e pérolas de muçarela de búfala.', p: 112.00, f: 'n-12.webp' },
        { n: 'Salada de bacalhau com grão-de-bico', d: '500 g. Amêndoas defumadas, cebola roxa e maçã verde.', p: 112.00 }
      ] },
      { t: 'Arrozes', itens: [
        { n: 'Arroz festivo', d: '500 g. Arroz soltinho, uva-passa, bacon crocante, lâminas de alho-poró e damasco.', p: 64.40 },
        { n: 'Arroz negro com castanha e romã', d: '500 g. Finalizado com azeite trufado.', p: 79.90 },
        { n: 'Arroz negro com lascas de bacalhau e tomate confit', d: '500 g', p: 112.00 },
        { n: 'Arroz de lentilha com damasco, amêndoas, especiarias e romã', d: '500 g. Com leve toque de água de rosas.', p: 79.90 }
      ] },
      { t: 'Assados', itens: [
        { n: 'Peru cortado em leque, marinado em ervas e vinho', d: '8 kg. Finalizado na manteiga de ervas. Acompanha batatas bolinhas, brócolis e tomatinhos assados no alecrim, farofinha molhadinha de Natal, molho cítrico de laranja e limão-siciliano e frutas frescas e secas.', p: 1848.00, f: 'n-17.webp' },
        { n: 'Pernil de cordeiro marinado no vinho branco, hortelã, alho, alecrim e louro', d: '3 kg. Assado em baixa temperatura e finalizado com manteiga. Acompanha aspargos frescos selados, batata-doce roxa assada com cenouras glaceadas e noz-pecã, farofinha molhadinha de Natal e molho de hortelã e iogurte grego.', p: 585.20 }
      ] },
      { t: 'Sobremesas', itens: [
        { n: 'Doce de tabuleiro Pé de moça', d: '1,5 kg', p: 295.00 },
        { n: 'Pavê de abacaxi com coco', d: '1 kg', p: 160.00 },
        { n: 'Tiramisù', d: '1 kg', p: 225.00 },
        { n: 'Torta de chocolate intenso com macadâmia e arabescos de chocolate', p: 239.00 }
      ] }
    ]
  }
};
