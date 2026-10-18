#!/usr/bin/env python3
"""Monta a pasta publicar/ com os posts do feed_ia conferidos contra a loja (17/10/2026):
escolhe a versão de cada slide, troca os slides corrigidos, corrige as legendas e gera os reels em MP4."""
import os, shutil, subprocess
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
FIX = os.path.join(AQUI, 'corrigidos_2026-10-17')
OUT = os.path.join(AQUI, 'publicar')

# post -> lista de slides (versão/arquivo); slide corrigido = 'fix/<nome>'
POSTS = {
    '01_da_tempo': ['cine/01', 'cine/02', 'cine/03', 'fix/f01_04_b', 'cine/05', 'cine/06'],
    '03_sem_decorador': ['nano/01', 'cine/02', 'cine/03', 'cine/04', 'cine/05', 'cine/06'],
    '04_comeca_aqui': ['cine/01', 'cine/02', 'cine/03', 'cine/04', 'cine/05', 'fix/f04_06_b'],
    '06_tamanhos': ['cine/0%d' % i for i in range(1, 7)],
    '07_monte_o_seu': ['cine/0%d' % i for i in range(1, 6)],
    '09_combinacoes': ['cine/0%d' % i for i in range(1, 7)],
    '10_sets_prontos': ['cine/0%d' % i for i in range(1, 7)],
    '12_numeros': ['cine/0%d' % i for i in range(1, 6)],
    '13_primeira_festa': ['cine/0%d' % i for i in range(1, 7)] + ['fix/f13_07_a'],
    '14_cha_revelacao': ['cine/01'],
    '15_cores_do_tema': ['cine/01', 'cine/02', 'fix/f15_03_b', 'cine/04', 'cine/05', 'cine/06', 'cine/07'],
    '16_kits': ['fix/f16_01_a'] + ['cine/0%d' % i for i in range(2, 7)] + ['fix/f16_07_a'],
    '18_cromados': ['cine/01', 'cine/02', 'fix/f18_03_a', 'cine/04', 'cine/05', 'fix/f18_06_a'],
    '19_avaliacoes': ['fix/f19_01_a', 'cine/03', 'cine/04', 'cine/05', 'cine/06'],
    '20_prazer': ['cine/01'],
}
REELS = ['02_reel_relogio', '05_reel_arco', '11_reel_sets', '17_reel_candy']

# correções de legenda: o que a loja não sustenta
LEGENDA = {
    '01_da_tempo': [('Motoboy da própria loja, SP e Grande SP, frete R$ 10.', 'Motoboy no mesmo dia em SP e Grande SP, frete R$ 12,90.')],
    '04_comeca_aqui': [('Kit de arco com fita, a partir de R$ 31,99.', 'Kit de arco 60 peças, R$ 35,99. Com fita e dupla face, o Kit 100 peças sai R$ 52,99.')],
    '15_cores_do_tema': [('Praia e ilha: turquesa, coral e bege', 'Praia e ilha: turquesa, laranja e bege')],
    '16_kits': [('Em todos, você escolhe as cores. Balões Joy, certificados pelo Inmetro.', 'Em todos, você escolhe as cores. Os kits de 60 a 120 peças vêm com balões Joy, certificados pelo Inmetro.')],
    '18_cromados': [('Metalizados de 18" pro destaque', 'Metalizados de 17" e 18" pro destaque')],
    '19_avaliacoes': [('69 mil', '67 mil')],
    '20_prazer': [('69 mil', '67 mil'), ('Frete R$ 10.', 'Frete R$ 12,90.')],
}


def legenda(post):
    t = open(os.path.join(AQUI, post, 'legenda.txt'), encoding='utf-8').read().strip()
    for de, para in LEGENDA.get(post, []):
        if de not in t:
            raise SystemExit(f'{post}: trecho não achado na legenda: {de}')
        t = t.replace(de, para)
    return t


def slide(post, ref):
    if ref.startswith('fix/'):
        return os.path.join(FIX, ref[4:] + '.png')
    return os.path.join(AQUI, post, ref + '.jpg')


shutil.rmtree(OUT, ignore_errors=True)
for post, refs in POSTS.items():
    d = os.path.join(OUT, post)
    os.makedirs(d)
    for i, ref in enumerate(refs, 1):
        im = Image.open(slide(post, ref)).convert('RGB').resize((1080, 1440), Image.LANCZOS)
        im.save(os.path.join(d, f'{i:02d}.jpg'), quality=92)
    open(os.path.join(d, 'legenda.txt'), 'w', encoding='utf-8').write(legenda(post))
    print(post, len(refs), 'slides')

for post in REELS:
    d = os.path.join(OUT, post)
    os.makedirs(d)
    quadros = sorted(f for f in os.listdir(os.path.join(AQUI, post, 'cine')) if f.endswith('.jpg'))
    lista = os.path.join(d, 'quadros.txt')
    with open(lista, 'w') as f:
        for q in quadros:
            f.write(f"file '{os.path.join(AQUI, post, 'cine', q)}'\nduration 2.6\n")
        f.write(f"file '{os.path.join(AQUI, post, 'cine', quadros[-1])}'\n")
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lista,
                    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest',
                    '-vf', 'scale=1080:1920,fps=30,format=yuv420p', '-c:v', 'libx264', '-profile:v', 'high',
                    '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', os.path.join(d, 'reel.mp4')], check=True)
    os.remove(lista)
    open(os.path.join(d, 'legenda.txt'), 'w', encoding='utf-8').write(legenda(post))
    print(post, 'reel', len(quadros), 'quadros')
