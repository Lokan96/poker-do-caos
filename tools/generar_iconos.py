#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gera os ícones do Pôquer do Caos em PNG (sem dependências externas).
Desenha: quadrado verde arredondado + carta creme com borda dourada
+ losango vermelho no centro (emoção de uma carta de Copas).

Executar:  python tools/generar_iconos.py
"""
import os
import struct
import zlib

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASTA_ICONES = os.path.join(RAIZ, 'app', 'icons')


def desenhar(tam):
    """Retorna lista de linhas RGBA para o tamanho dado."""
    # paleta
    verde = (11, 61, 46)
    verde_claro = (23, 96, 73)
    dourado = (212, 160, 23)
    dourado_claro = (240, 201, 74)
    creme = (247, 240, 220)
    vermelho = (180, 20, 30)
    preto = (12, 12, 10)

    raio = tam * 0.22          # canto arredondado
    card_w = tam * 0.62
    card_h = tam * 0.80
    card_x = (tam - card_w) / 2
    card_y = tam * 0.10

    losango_r = tam * 0.20     # semi-largura e semi-altura do losango
    losango_cx = tam / 2
    losango_cy = tam * 0.52

    linhas = []
    for y in range(tam):
        linha = []
        for x in range(tam):
            # fundo verde com gradiente radial
            dx = (x / tam - 0.5)
            dy = (y / tam - 0.5)
            dist = (dx * dx + dy * dy) ** 0.5 * 1.2
            cor = tuple(int(verde[i] + (verde_claro[i] - verde[i]) * min(1, dist))
                        for i in range(3))

            alpha = 255
            # canto arredondado do fundo
            if x < raio and y < raio:
                if ((x - raio) ** 2 + (y - raio) ** 2) > raio ** 2:
                    alpha = 0
            elif x >= tam - raio and y < raio:
                if ((x - (tam - raio)) ** 2 + (y - raio) ** 2) > raio ** 2:
                    alpha = 0
            elif x < raio and y >= tam - raio:
                if ((x - raio) ** 2 + (y - (tam - raio)) ** 2) > raio ** 2:
                    alpha = 0
            elif x >= tam - raio and y >= tam - raio:
                if ((x - (tam - raio)) ** 2 + (y - (tam - raio)) ** 2) > raio ** 2:
                    alpha = 0

            # carta
            dentro_carta = (card_x <= x <= card_x + card_w and
                            card_y <= y <= card_y + card_h)
            if dentro_carta:
                b_y = y - card_y        # distância da borda (margem)
                b_x = x - card_x
                borda = tam * 0.035
                if (card_y + borda <= y <= card_y + card_h - borda and
                        card_x + borda <= x <= card_x + card_w - borda):
                    cor = creme
                else:
                    cor = dourado_claro

            # losango (rotacionar 45°): |dx'| + |dy'| <= r
            lx = x - losango_cx
            ly = y - losango_cy
            dxr = (lx + ly) / 1.41421
            dyr = (lx - ly) / 1.41421
            if abs(dxr) <= losango_r and abs(dyr) <= losango_r:
                # borda dourada interna
                margem = losango_r * 0.28
                if abs(dxr) <= losango_r - margem and abs(dyr) <= losango_r - margem:
                    cor = vermelho
                else:
                    cor = dourado

            linha.append((cor[0], cor[1], cor[2], alpha))
        linhas.append(linha)
    return linhas


def salvar_png(caminho, linhas):
    altura = len(linhas)
    largura = len(linhas[0])

    def filtro(fila):
        saida = bytearray()
        saida.append(0)  # filtro None
        for p in fila:
            saida.extend(p)
        return bytes(saida)

    dados = b''.join(filtro(l) for l in linhas)
    def chunk(tipo, conteudo):
        c = struct.pack('>I', len(conteudo)) + tipo + conteudo
        c += struct.pack('>I', zlib.crc32(tipo + conteudo))
        return c

    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', largura, altura, 8, 6, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(dados, 6))
    png += chunk(b'IEND', b'')

    with open(caminho, 'wb') as f:
        f.write(png)


def main():
    os.makedirs(PASTA_ICONES, exist_ok=True)
    for tam in (512, 192, 144, 96, 72, 48, 16):
        caminho = os.path.join(PASTA_ICONES, 'icono-%d.png' % tam)
        salvar_png(caminho, desenhar(tam))
        print('gerado:', os.path.relpath(caminho, RAIZ), '(%dx%d)' % (tam, tam))


if __name__ == '__main__':
    main()