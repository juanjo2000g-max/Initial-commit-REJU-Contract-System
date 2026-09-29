"""Genera señales sintéticas de escenarios reales para probar TRÍADA."""
from __future__ import annotations

import numpy as np

from triada import HZ_BASE, HZ_PULSO, Evento, Nivel

T_TOTAL = 70  # s: 10 antes + 60 después


def _evento(rng, *, v_antes, v_despues, roll_ini, roll_fin, t_vuelco, g_golpe,
            w_giro, desliz, dist_antes, dist_despues, g_casco, actividad,
            t_levanta=None) -> Evento:
    n = T_TOTAL * HZ_BASE
    i0 = 10 * HZ_BASE
    t = np.arange(n) / HZ_BASE

    acc = rng.normal(0, 0.03, (n, 3))
    acc[:, 2] += 1.0
    gyro = rng.normal(0, 2, (n, 3))
    if v_antes > 5:  # vibración normal de marcha
        acc += rng.normal(0, 0.12, (n, 3)) * (t < 10)[:, None]

    # Vuelco: el alabeo pasa de roll_ini a roll_fin en t_vuelco segundos.
    roll = np.full(n, float(roll_ini))
    k = max(1, int(t_vuelco * HZ_BASE))
    roll[i0 - k: i0] = np.linspace(roll_ini, roll_fin, k)
    roll[i0:] = roll_fin
    if t_levanta is not None:
        roll[int((10 + t_levanta) * HZ_BASE):] = 5.0
    roll += rng.normal(0, 0.5, n)

    # Golpe y giro.
    acc[i0: i0 + 5, 0] += g_golpe
    gyro[i0 - k: i0 + 10, 0] += w_giro

    # Arrastre sobre asfalto: vibración de 25-35 Hz que se apaga en 2 s.
    if desliz > 0:
        s = np.arange(3 * HZ_BASE) / HZ_BASE
        onda = desliz * np.sin(2 * np.pi * 30 * s) * np.exp(-s * 1.2)
        acc[i0: i0 + 3 * HZ_BASE, 1] += onda + rng.normal(0, desliz * 0.3, len(s))

    vel = np.concatenate([np.full(10, float(v_antes)), np.full(60, float(v_despues))])
    vel = np.clip(vel + rng.normal(0, 0.3, 70), 0, None)

    dist = np.concatenate([np.full(10, dist_antes), np.full(60, dist_despues)])

    m = T_TOTAL * HZ_PULSO
    j0 = 10 * HZ_PULSO
    casco = rng.normal(0, 0.01, (m, 3))
    casco[:, 2] += 1.0
    casco[j0: j0 + 3, 0] += g_casco
    post = np.arange(j0 + 15 * HZ_PULSO, m)
    moviendo = rng.random(len(post) // HZ_PULSO) < actividad
    casco[post, 1] += np.repeat(moviendo, HZ_PULSO)[: len(post)] * rng.normal(0, 0.3, len(post))

    return Evento(acc, gyro, roll, vel, dist, casco)


ESCENARIOS = {
    "Moto aparcada se cae (viento o empujón)": (Nivel.CAIDA_APARCADA, dict(
        v_antes=0, v_despues=0, roll_ini=12, roll_fin=85, t_vuelco=0.8, g_golpe=3,
        w_giro=120, desliz=0, dist_antes=np.nan, dist_despues=np.nan, g_casco=0, actividad=0)),
    "Bache fuerte a 80 km/h": (Nivel.NADA, dict(
        v_antes=80, v_despues=80, roll_ini=3, roll_fin=6, t_vuelco=0.2, g_golpe=5,
        w_giro=60, desliz=0, dist_antes=0.5, dist_despues=0.5, g_casco=2, actividad=1)),
    "Se le va la moto parado en un semáforo": (Nivel.CAIDA_LEVE, dict(
        v_antes=2, v_despues=0, roll_ini=5, roll_fin=85, t_vuelco=0.9, g_golpe=2.5,
        w_giro=110, desliz=0, dist_antes=0.5, dist_despues=1.2, g_casco=1, actividad=0.9,
        t_levanta=40)),
    "Caída en curva a 70 km/h, el piloto se levanta": (Nivel.ACCIDENTE, dict(
        v_antes=70, v_despues=0, roll_ini=40, roll_fin=90, t_vuelco=0.25, g_golpe=7,
        w_giro=480, desliz=1.5, dist_antes=0.5, dist_despues=15, g_casco=25, actividad=0.8)),
    "Choque contra coche a 90 km/h, piloto inmóvil": (Nivel.ACCIDENTE_GRAVE, dict(
        v_antes=90, v_despues=0, roll_ini=2, roll_fin=88, t_vuelco=0.3, g_golpe=14,
        w_giro=700, desliz=2.0, dist_antes=0.5, dist_despues=25, g_casco=80, actividad=0.0)),
}


def generar(nombre: str, semilla: int = 0) -> tuple[Nivel, Evento]:
    esperado, params = ESCENARIOS[nombre]
    return esperado, _evento(np.random.default_rng(semilla), **params)
