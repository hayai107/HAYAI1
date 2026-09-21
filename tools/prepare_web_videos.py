"""Generate browser-friendly copies; keep vd/ originals untouched.

Usage: python tools/prepare_web_videos.py --ffmpeg /path/to/ffmpeg
"""
import argparse
from pathlib import Path
import re
import subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--ffmpeg', default='ffmpeg')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
output = root / 'web-videos'
output.mkdir(exist_ok=True)

for index in range(17):
    source = root / 'vd' / f'vd{index}.mp4'
    target = output / source.name
    info = subprocess.run([args.ffmpeg, '-hide_banner', '-i', str(source)],
                          capture_output=True, text=True).stderr
    match = re.search(r'Duration: (\d+):(\d+):([\d.]+)', info)
    if not match:
        raise RuntimeError(f'Cannot read duration: {source}')
    duration = int(match[1]) * 3600 + int(match[2]) * 60 + float(match[3])
    # Bound even the longest clip below GitHub's 100 MiB file limit.
    maxrate = min(2000, int(85 * 1024 * 1024 * 8 / duration / 1000) - 128)
    scale = "scale=w='min(1280,iw)':h='min(720,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,setsar=1"
    if not target.exists():
        print(f'Encoding {source.name} ({duration:.1f}s)', flush=True)
        temporary = output / f'vd{index}.partial.mp4'
        subprocess.run([args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-y',
                        '-i', str(source), '-map', '0:v:0', '-map', '0:a:0?',
                        '-vf', scale, '-r', '30', '-c:v', 'libx264',
                        '-preset', 'fast', '-crf', '24', '-maxrate', f'{maxrate}k',
                        '-bufsize', f'{maxrate * 2}k', '-pix_fmt', 'yuv420p',
                        '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart',
                        str(temporary)], check=True)
        if temporary.stat().st_size >= 100 * 1024 * 1024:
            raise RuntimeError(f'Web copy exceeds size limit: {temporary}')
        temporary.replace(target)
    poster = output / f'vd{index}.jpg'
    if not poster.exists():
        subprocess.run([args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-y',
                        '-ss', '1', '-i', str(target), '-frames:v', '1',
                        '-vf', 'scale=480:-2', '-q:v', '3', str(poster)], check=True)
    print(f'Ready {target.name}: {target.stat().st_size / 1024**2:.1f} MiB', flush=True)
