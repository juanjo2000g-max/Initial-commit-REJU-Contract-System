"""
TRÍADA · Algoritmo de clasificación de caídas de Vigía Moto Systems.

CONFIDENCIAL. Secreto empresarial (Ley 1/2019 de Secretos Empresariales).
Los pesos de este archivo son valores de prototipo; los calibrados con datos
reales no se guardan en el repositorio.

Idea central: una caída no se juzga por el golpe, sino por tres momentos.

  A · ANTES   ¿Se estaba circulando? ¿El piloto estaba sobre la moto?
  B · DURANTE ¿Cómo cayó? Golpe, giro y "firma de deslizamiento" sobre asfalto.
  C · DESPUÉS ¿El piloto está separado de la moto? ¿Se mueve?

Entradas (ventana de 10 s antes y 60 s después del evento):
  - Unidad Base (en la moto): IMU 6 ejes a 100 Hz, velocidad GNSS a 1 Hz,
    ángulo de alabeo (roll) estimado y estado de contacto.
  - Clip Pulso (en el casco): IMU a 50 Hz y distancia UWB a la Base.
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from enum import IntEnum

import numpy as np

HZ_BASE = 100
HZ_PULSO = 50


class Nivel(IntEnum):
    NADA = 0            # bache, bordillo, golpe en parking
    CAIDA_APARCADA = 1  # la moto cae sola, el piloto no estaba encima
    CAIDA_LEVE = 2      # caída a baja velocidad con el piloto, que se levanta
    ACCIDENTE = 3       # caída en marcha, piloto separado pero consciente
    ACCIDENTE_GRAVE = 4  # caída en marcha y piloto inmóvil


PROTOCOLO = {
    Nivel.NADA: "Solo registro interno.",
    Nivel.CAIDA_APARCADA: "Aviso al propietario: 'Tu moto está en el suelo'. Nunca llama al 112.",
    Nivel.CAIDA_LEVE: "Vibración en el casco: '¿Estás bien?'. Se cancela solo al levantar la moto.",
    Nivel.ACCIDENTE: "Cuenta atrás 60 s → alerta LoRa al grupo + SMS/satélite a contactos.",
    Nivel.ACCIDENTE_GRAVE: "Cuenta atrás 30 s → Centro Vigía por satélite → 112 con GPS y ficha médica.",
}


@dataclass
class Evento:
    """Señales en bruto alrededor del instante t0 (caída detectada)."""
    acc: np.ndarray            # (N, 3) en g, Base, de t0-10 s a t0+60 s
    gyro: np.ndarray           # (N, 3) en grados/s
    roll: np.ndarray           # (N,) en grados, 0 = vertical
    vel_kmh: np.ndarray        # (70,) velocidad GNSS 1 Hz, índice 10 = t0
    dist_pulso_m: np.ndarray   # (70,) distancia casco-moto 1 Hz (NaN si no hay casco)
    acc_pulso: np.ndarray      # (M, 3) en g, casco, de t0-10 s a t0+60 s


@dataclass
class Rasgos:
    v_pre: float          # km/h, mediana de los 3 s previos
    piloto_montado: bool  # casco a < 1,5 m de la moto antes del evento
    a_pico: float         # g, pico de aceleración en ±2 s
    w_pico: float         # º/s, pico de giro en ±2 s
    t_tumbado: float      # s que tarda en pasar de <15º a >60º de alabeo
    e_desliz: float       # energía 15-45 Hz (arrastre sobre asfalto), g²
    d_sep: float          # m, separación casco-moto a los 10 s
    g_casco: float        # g, golpe máximo en el casco
    actividad: float      # 0-1, fracción de tiempo con el piloto moviéndose (t0+15..60 s)
    moto_tumbada: bool    # alabeo > 60º a los 30 s


def extraer_rasgos(ev: Evento) -> Rasgos:
    i0 = 10 * HZ_BASE
    ventana = slice(i0 - 2 * HZ_BASE, i0 + 2 * HZ_BASE)

    v_pre = float(np.median(ev.vel_kmh[7:10]))
    dist_pre = ev.dist_pulso_m[5:10]
    piloto_montado = bool(np.all(np.isfinite(dist_pre)) and np.median(dist_pre) < 1.5)

    a_mod = np.linalg.norm(ev.acc[ventana], axis=1)
    w_mod = np.linalg.norm(ev.gyro[ventana], axis=1)

    roll_abs = np.abs(ev.roll)
    antes = np.where(roll_abs[: i0 + 1] < 15)[0]
    despues = np.where(roll_abs[i0 - 2 * HZ_BASE:] > 60)[0]
    if len(antes) and len(despues):
        t_tumbado = max(0.0, ((i0 - 2 * HZ_BASE + despues[0]) - antes[-1]) / HZ_BASE)
    else:
        t_tumbado = math.inf

    # Firma de deslizamiento: energía en banda 15-45 Hz durante 3 s tras el golpe.
    tramo = np.linalg.norm(ev.acc[i0: i0 + 3 * HZ_BASE], axis=1)
    espectro = np.abs(np.fft.rfft(tramo - tramo.mean())) ** 2
    freqs = np.fft.rfftfreq(len(tramo), 1 / HZ_BASE)
    banda = (freqs >= 15) & (freqs <= 45)
    e_desliz = float(espectro[banda].sum() / len(tramo) ** 2 * 100)

    d_sep = float(ev.dist_pulso_m[20]) if np.isfinite(ev.dist_pulso_m[20]) else math.nan

    j0 = 10 * HZ_PULSO
    casco = np.linalg.norm(ev.acc_pulso, axis=1)
    g_casco = float(casco[j0 - 2 * HZ_PULSO: j0 + 3 * HZ_PULSO].max())
    post = casco[j0 + 15 * HZ_PULSO:]
    seg = post[: len(post) // HZ_PULSO * HZ_PULSO].reshape(-1, HZ_PULSO)
    actividad = float((seg.std(axis=1) > 0.05).mean())

    moto_tumbada = bool(roll_abs[i0 + 30 * HZ_BASE] > 60)

    return Rasgos(v_pre, piloto_montado, float(a_mod.max()), float(w_mod.max()),
                  t_tumbado, e_desliz, d_sep, g_casco, actividad, moto_tumbada)


# Pesos de prototipo. Los reales se calibran con caídas reales y de circuito.
W = dict(sesgo=-6.0, vel=2.2, golpe=1.4, giro=1.1, desliz=1.6,
         sep=1.8, casco=1.2, actividad=-2.5, vuelco_lento=-2.0)


def indice_triada(r: Rasgos) -> float:
    """Índice TRÍADA en [0, 1]: probabilidad de que haya sido un accidente en marcha."""
    sep = 0.0 if math.isnan(r.d_sep) else min(r.d_sep / 4.0, 3.0)
    vuelco_lento = 1.0 if (r.t_tumbado > 0.4 and r.v_pre < 5) else 0.0
    z = (W["sesgo"]
         + W["vel"] * math.log1p(r.v_pre / 10)
         + W["golpe"] * min(r.a_pico / 4, 3)
         + W["giro"] * min(r.w_pico / 250, 3)
         + W["desliz"] * min(r.e_desliz, 3)
         + W["sep"] * sep
         + W["casco"] * min(r.g_casco / 15, 3)
         + W["actividad"] * r.actividad
         + W["vuelco_lento"] * vuelco_lento)
    return 1 / (1 + math.exp(-z))


def clasificar(ev: Evento) -> tuple[Nivel, float, Rasgos]:
    r = extraer_rasgos(ev)

    # Puerta A: sin piloto encima y parada → nunca es un accidente de tráfico.
    if not r.piloto_montado and r.v_pre < 3:
        return (Nivel.CAIDA_APARCADA if r.moto_tumbada else Nivel.NADA), 0.0, r

    # Golpe sin tumbarse ni separarse: bache o bordillo.
    if not r.moto_tumbada and (math.isnan(r.d_sep) or r.d_sep < 2):
        return Nivel.NADA, 0.0, r

    s = indice_triada(r)
    if s < 0.35:
        return Nivel.CAIDA_LEVE, s, r
    if r.actividad < 0.15 and s >= 0.6:
        return Nivel.ACCIDENTE_GRAVE, s, r
    return Nivel.ACCIDENTE, s, r
