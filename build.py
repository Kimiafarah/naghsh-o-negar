#!/usr/bin/env python3
"""Build Negareh into single self-contained HTML files.

    python3 build.py          -> dist/negareh.html and dist/scene-builder.html

The game is plain JavaScript with no dependencies. The files in src/game/ are
joined in name order inside one closure, so a later file can use anything an
earlier one defines. Keep the number prefixes when adding a file.
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
SRC, DIST = ROOT / 'src', ROOT / 'dist'


def read(p):
    return (p).read_text(encoding='utf-8')


def build_game():
    engine = read(SRC / 'engine.js') + '\n' + read(SRC / 'art.js')
    game = ''.join(read(p) for p in sorted((SRC / 'game').glob('*.js')))
    html = (read(SRC / 'shell.html')
            .replace('__CROPS__', '{}')
            .replace('__ENGINE__', engine)
            .replace('__GAME__', game))
    out = DIST / 'negareh.html'
    out.write_text(html, encoding='utf-8')
    return out


def build_builder():
    crops = json.dumps(json.loads(read(ROOT / 'tools' / 'crops.json')))
    html = read(ROOT / 'tools' / 'scene-builder.src.html').replace('__CROPS__', crops)
    out = DIST / 'scene-builder.html'
    out.write_text(html, encoding='utf-8')
    return out


if __name__ == '__main__':
    DIST.mkdir(exist_ok=True)
    for f in (build_game(), build_builder()):
        print(f'built {f.relative_to(ROOT)}  ({f.stat().st_size // 1024} KB)')
