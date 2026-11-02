# The screenshots of tools/shots.mjs: each .png under the folder given becomes a .webp beside it, and the .png goes.
#   python3 tools/webp.py src/shots
import pathlib
import sys

from PIL import Image

root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'src/shots')
for png in sorted(root.rglob('*.png')):
    with Image.open(png) as im:
        im.convert('RGB').save(png.with_suffix('.webp'), 'WEBP', quality=82, method=6)
    png.unlink()
    print(png.with_suffix('.webp').relative_to(root), png.with_suffix('.webp').stat().st_size // 1024, 'KB')
