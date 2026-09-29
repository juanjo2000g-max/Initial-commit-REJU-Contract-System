"""Banda sonora sintetizada del anuncio YAKAFÉ (30 s, 128 BPM). Uso: python3 music.py salida.wav"""
import sys, wave
import numpy as np

SR = 44100
DUR = 30.0
BEAT = 60 / 128
BAR = BEAT * 4
N = int(SR * DUR)
out = np.zeros(N)
rng = np.random.default_rng(7)


def add(sig, t0, gain=1.0):
    i = int(t0 * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    out[i:i + len(sig)] += sig * gain


def tt(d):
    return np.arange(int(d * SR)) / SR


def env(d, a=0.005, decay=8.0):
    t = tt(d)
    return np.minimum(t / a, 1) * np.exp(-t * decay)


def hz(note):  # midi -> Hz
    return 440 * 2 ** ((note - 69) / 12)


def hp(x):  # paso alto sencillo
    return np.diff(x, prepend=0)


# ---------- Acto 1 (0 - 7.5 s): tic-tac triste ----------
for k in range(15):
    t = tt(0.03)
    add(np.sin(2 * np.pi * (2400 if k % 2 else 1800) * t) * np.exp(-t * 150), k * 0.5, 0.25)
for i, n in enumerate([45, 41, 43, 40]):  # A2 F2 G2 E2
    t = tt(BAR)
    tone = np.sin(2 * np.pi * hz(n) * t) + 0.3 * np.sin(2 * np.pi * hz(n + 12) * t)
    add(tone * np.exp(-t * 1.2), i * BAR, 0.18)

# Trombón triste "wah wah wah waaah"
for i, (n, d) in enumerate([(58, .45), (57, .45), (56, .45), (55, 1.4)]):
    t = tt(d)
    vib = 1 + (0.012 * np.sin(2 * np.pi * 6 * t) if i == 3 else 0)
    ph = 2 * np.cumsum(np.pi * hz(n) * vib / SR)
    tone = sum(np.sin(h * ph) / h for h in range(1, 7))
    wah = 0.55 + 0.45 * np.sin(np.pi * np.minimum(t / d, 1))
    add(tone * wah * np.minimum(t / 0.04, 1) * np.minimum((d - t) / 0.08, 1), 5.3 + i * 0.48, 0.2)

# ---------- ¡BASTA! (7.5 s): rayón de disco + golpe ----------
t = tt(0.35)
add(np.sin(2 * np.pi * np.cumsum(900 - 700 * t / 0.35) / SR) * rng.uniform(-1, 1, len(t)) * np.exp(-t * 6), 7.45, 0.5)


def impact(t0, g=1.0):
    t = tt(1.2)
    f = 40 + 110 * np.exp(-t * 9)
    add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2), t0, 0.9 * g)
    add(rng.uniform(-1, 1, len(t)) * np.exp(-t * 14), t0, 0.35 * g)


impact(7.5)

# Subida (riser) hasta que cae el logo
t = tt(1.8)
riser = rng.uniform(-1, 1, len(t)) * (t / 1.8) ** 2 + 0.6 * np.sin(2 * np.pi * np.cumsum(200 + 900 * (t / 1.8) ** 2) / SR) * (t / 1.8)
add(hp(riser), 7.575, 0.35)
impact(9.375, 1.1)

# ---------- Beat (9.375 - 29.4 s) ----------
chords = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [60, 64, 69]), (41, [60, 65, 69])]  # C G Am F
start, end = 9.375, 29.3


def kick():
    t = tt(0.35)
    return np.sin(2 * np.pi * np.cumsum(45 + 110 * np.exp(-t * 30)) / SR) * np.exp(-t * 9)


def clap():
    t = tt(0.2)
    return hp(rng.uniform(-1, 1, len(t))) * np.exp(-t * 22)


def hat():
    t = tt(0.06)
    return hp(hp(rng.uniform(-1, 1, len(t)))) * np.exp(-t * 60)


def pluck(note, d, bright=5):
    t = tt(d)
    ph = 2 * np.pi * hz(note) * t
    return (np.sign(np.sin(ph)) * 0.35 + np.sin(ph)) * np.exp(-t * bright)


b = 0
while start + b * BEAT < end:
    t0 = start + b * BEAT
    bar = int(b // 4)
    root, tones = chords[bar % 4]
    add(kick(), t0, 0.9)
    if b % 2 == 1:
        add(clap(), t0, 0.35)
    add(hat(), t0 + BEAT / 2, 0.25)
    add(pluck(root - 12 + 12, BEAT / 2, 7) * 0.8, t0 + BEAT / 2, 0.35)  # bajo en contratiempo
    for s in range(4):  # arpegio en semicorcheas
        add(pluck(tones[(b * 4 + s) % 3] + 12, BEAT / 4, 14), t0 + s * BEAT / 4, 0.09)
    b += 1

# ---------- Efectos de escena ----------
def whoosh(t_cut):
    t = tt(0.45)
    add(hp(rng.uniform(-1, 1, len(t))) * np.sin(np.pi * t / 0.45) ** 2, t_cut - 0.35, 0.35)


for cut in [11.25, 16.875, 20.625, 24.375]:
    whoosh(cut)

# Giro del termo (17.3 - 19.1 s)
t = tt(1.8)
spin = hp(rng.uniform(-1, 1, len(t))) * (0.5 + 0.5 * np.sin(2 * np.pi * (4 + 6 * t) * t)) * np.sin(np.pi * t / 1.8)
add(spin, 17.3, 0.3)
impact(19.175, 0.6)

# Pitidos del código y campanita del casillero
for i in range(4):
    t = tt(0.09)
    add(np.sin(2 * np.pi * 1320 * t) * np.exp(-t * 20), 22.025 + i * 0.3, 0.3)
t = tt(1.5)
bell = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in [(1568, 3), (2349, 4), (3136, 6)])
add(bell, 23.25, 0.25)
add(bell, 23.45, 0.2)
impact(24.375, 0.9)

# Acorde final
t = tt(1.4)
final = sum(pluck(n, 1.4, 2.2) for n in [48, 60, 64, 67, 72])
add(final, 28.6, 0.25)

# Mezcla y fundido
fade = np.ones(N)
fi = int(29.4 * SR)
fade[fi:] = np.linspace(1, 0, N - fi)
out *= fade
out = np.tanh(out * 1.3)
out /= np.max(np.abs(out)) * 1.05
data = (out * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(data.tobytes())
print("ok", len(data) / SR, "s")
