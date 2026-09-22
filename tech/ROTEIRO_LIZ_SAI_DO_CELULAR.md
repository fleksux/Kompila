# Roteiro · "A Liz sai do celular" (hero da home tech, 22/09)

Método: BUDO (foundation + 3d-cgi + conector Magnific). Vídeo de 10 s, Seedance 2.0 (ou 2.5) via Magnific,
depois quebrado em ~120 quadros e conduzido pelo scroll no site. Cada bloco abaixo vira um trecho de rolagem com um título ao lado.

## Ideia principal (uma frase)

**O dono da empresa não precisa estar no celular: a Liz sai dele e trabalha.**
O lead chega, o dono está ocupado, a Liz pula pra fora da tela, atende, marca e move o pipeline. Ele só recebe o aviso.

## Por que essa e não outra

- É a tese da venda ("se chega lead, a Liz já tem trabalho") em imagem, sem texto explicando.
- Sai da caixa do SaaS genérico (objeto 3D parado) sem virar mascote de brinquedo: ela aparece porque tem serviço.
- O celular é o objeto do cliente. Ele se reconhece na cena antes de ler qualquer linha.

## Personagem e mundo (fixos)

- **Liz**: robô branco Pixar, capacete redondo com visor preto brilhante, dois olhos ovais brancos acesos, sorriso pequeno, dois tufos verdes na cabeça, corpo branco com detalhes verdes, boneca de pano verde no braço. Referência: `07_IMAGES/01_MARCA_LIZ__liz_k_A_nanobananapro.png`. Escala: 15 cm, cabe na mão.
- **Dono**: nunca aparece o rosto. Só mãos, antebraço e a camisa, sempre fora de foco ou fora do quadro. A câmera fica na altura da mesa, na escala da Liz (15 cm): o mundo é grande, ela é pequena. É "qualquer dono".
- **Cena**: escritório escuro, uma luminária quente à esquerda (3200 K), monitor e celular como luzes práticas. Paleta: carbono #0A0B0E, verde #2FD67B só onde a Liz e o WhatsApp acendem. Nada de azul.

## Os 5 tempos (10 s)

| # | s | Na tela | O que o scroll escreve ao lado |
|---|---|---|---|
| 1 | 0,0 a 2,0 | **Gancho**: close no celular apoiado na mesa, tela escura. Acende com uma notificação verde do WhatsApp; o brilho verde bate no tampo da mesa. Ao fundo, desfocadas, só as mãos do dono digitando no notebook; ninguém olha pro celular. | "Chegou lead. Você está ocupado." |
| 2 | 2,0 a 4,0 | A tela do celular vira um portal de luz verde; a Liz **sai de dentro** (primeiro a cabeça, depois o corpo), pula e aterrissa na mesa ao lado do aparelho. Olha pro celular. | "A Liz atende em 8 segundos." |
| 3 | 4,0 a 6,0 | Ela toca a tela; um ponto de luz (o lead) sobe do celular e fica pairando na frente dela. Ela conversa com o ponto, gesticula com a mão livre, faz que sim. | "Qualifica. Sem interrogatório." |
| 4 | 6,0 a 8,0 | Ela levanta o pulso como quem olha um relógio; um pequeno calendário holográfico verde aparece e uma data acende. O ponto de luz entra no calendário. | "Marca a reunião." |
| 5 | 8,0 a 10,0 | No notebook atrás, a tela mostra o pipeline do CRM (tela real); a última coluna acende verde. Uma mão do dono entra no quadro e pega o celular (só a mão). Ela acena pra câmera. Quadro final: Liz na mesa, celular aceso, pipeline verde ao fundo. | "Fechado. Você só recebe o aviso." |

## Prompt de vídeo (Seedance 2.0, Magnific)

```
[GENRE / STYLE]
Level 2 — stylized 3D with soft shading (Pixar range) for the robot, blended into a live-action-looking night office.
Arnold render look, HDRI environment, subsurface scattering on the doll fabric, PBR materials, ray-traced reflections
on the phone glass, shallow depth of field, 24 fps, 4K detail. Palette: near-black carbon office, one warm tungsten
practical, emerald green (#2FD67B) only from the phone screen, the robot's accents and the CRM pipeline.

[OPENING HOOK — 0 to 2s]
Extreme close-up of a smartphone standing in a small desk stand on a dark wooden desk at night, screen off.
At 0.4s the screen wakes with a green WhatsApp notification; green light spills onto the desk surface.
Behind, out of focus, only the hands and forearms of a man in a light shirt typing on a laptop; no face ever in frame.

[MAIN ACTION — 2 to 8s]
2.0s: the phone screen turns into a soft green light portal. A small white Pixar-style robot (round white helmet head,
black glossy visor face, two glowing white oval eyes, small smile, two green leaf tufts on top, white rounded body with
green accents, a small green rag doll under one arm), 15 cm tall, climbs out of the screen head first, hops and lands on
the desk beside the phone with a soft bounce.
4.0s: she taps the phone screen; a single glowing green dot rises from the screen and hovers at her eye level. She talks
to the dot, gesturing with her free hand, nods twice.
6.0s: she raises her wrist; a small holographic green calendar appears above it, one date lights up; the dot flies into
the calendar and disappears.
7.5s: on the laptop screen behind her, a CRM kanban board with pastel columns is visible; its last column glows green.

[CAMERA]
35mm equivalent, f/2.0, camera at desk height, at the robot's scale (she is 15 cm tall, the world is big); phone and robot in focus, hands soft in the background, no human face at any moment. Slow push-in from 0 to 6s (about 10 cm),
then a gentle 15° orbit to the right from 6 to 10s that brings the laptop screen into view. Subtle motion blur.

[LIGHTING]
Key: warm tungsten desk lamp from upper left (3200K). Fill: cool spill from the laptop screen (6500K, 25%).
Practical: the phone screen, green, becomes the strongest light on the robot from 2s on. Rim on the robot from the
laptop. Volumetric haze very light.

[COLOR & GRADE]
Deep blacks, low saturation everywhere except the green light. Clean, no film grain.

[CLOSING BEAT — 8 to 10s]
A man's hand enters the frame and picks up the phone (hand only, no face). The robot turns to camera and waves. Final frame: robot on the desk in front, phone lit beside her, laptop with the green pipeline behind. Hold 0.6s
for a clean freeze frame.

[TECHNICAL]
model: seedance_2_0; duration: 10; aspect_ratio: 16:9; resolution: 1080p; references: Liz 3D still (character);
no keyframe together with reference (Seedance rejects the pair).
```

## Como vira o hero com scroll

1. Vídeo pronto → `ffmpeg` extrai 120 quadros (12 fps) em WebP 1280 px, ~3 a 4 MB no total.
2. O hero fica fixo (`position: sticky`) por 5 alturas de tela; o scroll escolhe o quadro (0 a 119) e desenha num `<canvas>`.
3. Os 5 títulos da tabela entram com fade conforme o trecho. Botão "Quero ver a Liz atendendo" aparece no tempo 5.
4. Sem scroll (celular parado, reduced-motion): mostra o quadro final parado com o título 5.
5. Mouse: no quadro final, a cabeça dela acompanha o cursor (duas camadas: corpo e cabeça recortada, 6° de giro).

## Ordem de produção

1. **Quadro-chave** (imagem parada) do tempo 2: a Liz saindo do celular na mesa. Aprovar antes de vídeo.
2. Vídeo de 10 s no Seedance 2.0 com a referência dela. Duas gerações, escolher uma.
3. Quadros + canvas no `tech/index.html`.
4. Só depois: vídeo curto do mesmo material pra Instagram (9:16).

## Limites

- A boneca e os tufos podem variar entre gerações; conferir quadro a quadro antes de cortar.
- Rosto do dono: nunca. Se o modelo puser um rosto em qualquer quadro, a geração é descartada.
- O pipeline no notebook precisa ser a tela real do CRM; se o modelo inventar outra, cobrir com a tela real na pós (é o último plano, parado).
