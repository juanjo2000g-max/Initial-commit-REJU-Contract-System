"""Ejecuta: python -m pytest vigia/algoritmo  (o: python vigia/algoritmo/test_triada.py)"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from simulador import ESCENARIOS, generar  # noqa: E402
from triada import PROTOCOLO, clasificar  # noqa: E402


def test_todos_los_escenarios_con_varias_semillas():
    for nombre in ESCENARIOS:
        for semilla in range(20):
            esperado, ev = generar(nombre, semilla)
            nivel, _, _ = clasificar(ev)
            assert nivel == esperado, f"{nombre} (semilla {semilla}): {nivel.name} != {esperado.name}"


if __name__ == "__main__":
    print(f"{'Escenario':50} {'Nivel':17} {'TRÍADA':>6}  v_pre  a_pico  w_pico  desliz  sep   casco  activ")
    for nombre in ESCENARIOS:
        esperado, ev = generar(nombre)
        nivel, s, r = clasificar(ev)
        ok = "✔" if nivel == esperado else "✘"
        sep = "  -" if math.isnan(r.d_sep) else f"{r.d_sep:4.1f}"
        print(f"{ok} {nombre:48} {nivel.name:17} {s:6.2f}  {r.v_pre:5.1f}  {r.a_pico:6.1f}  "
              f"{r.w_pico:6.0f}  {r.e_desliz:6.2f}  {sep}  {r.g_casco:5.1f}  {r.actividad:5.2f}")
        print(f"    → {PROTOCOLO[nivel]}")
    test_todos_los_escenarios_con_varias_semillas()
    print("\n100 simulaciones (5 escenarios × 20 semillas): todas clasificadas correctamente.")
