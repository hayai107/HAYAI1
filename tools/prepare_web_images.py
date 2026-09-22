"""Create small gallery images without changing the full-size originals."""
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
output = root / 'web-images'
output.mkdir(exist_ok=True)
for source in sorted((root / 'img').glob('*.jpg')):
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original).convert('RGB')
        image.thumbnail((720, 720))
        image.save(output / source.name, quality=80, optimize=True, progressive=True)
print(f'Prepared {len(list(output.glob("*.jpg")))} gallery images')
