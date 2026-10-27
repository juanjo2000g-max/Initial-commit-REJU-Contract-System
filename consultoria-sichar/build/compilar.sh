#!/usr/bin/env bash
# Regenera el .tex desde el .docx y compila el PDF.
# Requisitos: pandoc (>= 3.1) y TeX Live con tcolorbox, titlesec, babel-spanish.
set -euo pipefail
cd "$(dirname "$0")/.."
pandoc build/Consultoria_Estrategica_completa_SICHAR.docx -f docx -t latex \
  --template=build/plantilla.tex --lua-filter=build/sichar.lua --columns=100 \
  -o Consultoria_Estrategica_completa_SICHAR.tex
# El encabezado de cada tabla se imprime solo en su primera página: con \endhead,
# longtable deja un encabezado "fantasma" cuando el salto cae justo antes de la tabla.
sed -i 's/^\\endhead$/\\endfirsthead/' Consultoria_Estrategica_completa_SICHAR.tex
for _ in 1 2; do
  pdflatex -interaction=nonstopmode -halt-on-error Consultoria_Estrategica_completa_SICHAR.tex >/dev/null || { tail -40 Consultoria_Estrategica_completa_SICHAR.log; exit 1; }
done
grep -E "Overfull|Warning" Consultoria_Estrategica_completa_SICHAR.log | grep -v "Font shape" > build/avisos.txt || true
rm -f ./*.aux ./*.log ./*.out ./*.toc
echo "PDF generado: $(pwd)/Consultoria_Estrategica_completa_SICHAR.pdf"
