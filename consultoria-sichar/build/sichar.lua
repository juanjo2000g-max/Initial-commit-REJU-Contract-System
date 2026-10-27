-- Filtro de Pandoc: adapta la estructura del .docx de SICHAR a LaTeX.
--  * Sustituye la portada y la tabla "Contenido" por \portada y \tableofcontents.
--  * Tablas de una sola celda -> cajas destacadas (tcolorbox).
--  * Encabezados "PRIORIDAD n" -> ficha \hallazgo.
--  * Tabla FODA (tablas anidadas 2x2) -> cuadrícula de cajas.

local stringify = pandoc.utils.stringify

local function latex(blocks)
  return pandoc.write(pandoc.Pandoc(blocks), 'latex')
end

local function raw(s)
  return pandoc.RawBlock('latex', s)
end

local function cells_of(row)
  return row.cells
end

local function header_cells(tbl)
  local rows = tbl.head.rows
  if #rows == 0 then return {} end
  return cells_of(rows[1])
end

local function body_rows(tbl)
  local out = {}
  for _, b in ipairs(tbl.bodies) do
    for _, r in ipairs(b.body) do out[#out + 1] = r end
  end
  return out
end

local function para_texts(blocks)
  local out = {}
  for _, b in ipairs(blocks) do
    if b.t == 'Para' or b.t == 'Plain' then out[#out + 1] = b end
  end
  return out
end

-- Caja destacada --------------------------------------------------------
local function callout(blocks)
  local title, rest = nil, {}
  for i, b in ipairs(blocks) do
    if i == 1 and (b.t == 'Para' or b.t == 'Plain') and #b.content == 1
        and b.content[1].t == 'Strong' then
      title = b.content[1].content
    else
      rest[#rest + 1] = b
    end
  end
  if title == nil then
    -- caja sin título (p. ej. tabla de puntajes envuelta): se emite tal cual
    return rest
  end
  local t = stringify(title)
  local style = 'info'
  if t:match('grave') or t:match('Precauciones') then
    style = 'alerta'
  elseif t:match('Importante') or t:match('Lectura') or t:match('Por qué ocupa') then
    style = 'aviso'
  elseif t:match('Mensaje final') then
    style = 'marca'
  end
  return {
    raw('\\begin{caja' .. style .. '}{' .. latex({ pandoc.Plain(title) }) .. '}'),
    table.unpack(rest),
  }, raw('\\end{caja' .. style .. '}')
end

-- Ficha de hallazgo -----------------------------------------------------
local function hallazgo(tbl)
  local h = header_cells(tbl)
  local num = stringify(para_texts(h[1].contents)[2])
  local nombre = para_texts(h[2].contents)[2].content
  local r = cells_of(body_rows(tbl)[1])
  local urg = stringify(para_texts(r[1].contents)[2])
  local cuando = para_texts(r[2].contents)[2].content
  local quien = para_texts(r[3].contents)[2].content
  local plainname = stringify(nombre)
  local s = string.format(
    '\\hallazgo{%s}{%s}{%s}{%s}{%s}{%s}',
    num,
    latex({ pandoc.Plain(nombre) }),
    plainname,
    urg,
    latex({ pandoc.Plain(cuando) }),
    latex({ pandoc.Plain(quien) }))
  return raw(s)
end

-- FODA ------------------------------------------------------------------
local function foda_box(inner, style)
  local head = stringify(header_cells(inner)[1].contents)
  local body = cells_of(body_rows(inner)[1])[1].contents
  return '\\begin{foda' .. style .. '}{' .. head .. '}\n' .. latex(body) ..
      '\n\\end{foda' .. style .. '}\n'
end

local function foda(tbl)
  local h = header_cells(tbl)
  local b = cells_of(body_rows(tbl)[1])
  local function inner(cell) return cell.contents[1] end
  return raw('\\begin{tcbraster}[raster columns=2, raster equal height=rows, raster column skip=3mm, raster row skip=3mm]\n' ..
    foda_box(inner(h[1]), 'F') .. foda_box(inner(h[2]), 'D') ..
    foda_box(inner(b[1]), 'O') .. foda_box(inner(b[2]), 'A') ..
    '\\end{tcbraster}')
end

-- Despacho de tablas ----------------------------------------------------
local function is_single_cell(tbl)
  local h = header_cells(tbl)
  return #tbl.colspecs == 1 and #h == 1 and #body_rows(tbl) == 0
end

local function contains_table(blocks)
  for _, b in ipairs(blocks) do
    if b.t == 'Table' then return true end
  end
  return false
end

local function transform_table(tbl)
  local h = header_cells(tbl)
  if #h >= 1 and stringify(h[1].contents):match('^PRIORIDAD') then
    return { hallazgo(tbl) }
  end
  if #h == 2 and contains_table(h[1].contents) then
    return { foda(tbl) }
  end
  if is_single_cell(tbl) then
    local open, close = callout(h[1].contents)
    local out = {}
    for _, b in ipairs(open) do
      if b.t == 'Table' then
        for _, x in ipairs(transform_table(b)) do out[#out + 1] = x end
      else
        out[#out + 1] = b
      end
    end
    if close then out[#out + 1] = close end
    return out
  end
  return { tbl }
end

function Pandoc(doc)
  local blocks = {}
  local skipping = true
  local in_hallazgos = false
  for i, b in ipairs(doc.blocks) do
    if skipping then
      if b.t == 'Header' and stringify(b):match('^1%.') then
        skipping = false
        blocks[#blocks + 1] = raw('\\portada\n\\tableofcontents\n\\clearpage')
        blocks[#blocks + 1] = b
      end
    elseif b.t == 'Table' then
      local out = transform_table(b)
      if out[1].t == 'RawBlock' and out[1].text:match('^\\hallazgo') then
        in_hallazgos = true
      end
      for _, x in ipairs(out) do blocks[#blocks + 1] = x end
    elseif b.t == 'Header' then
      if b.level == 1 then
        in_hallazgos = false
      elseif in_hallazgos then
        b.classes:insert('unlisted')
        b.classes:insert('unnumbered')
      end
      if b.level > 1 then
        -- evita títulos huérfanos al pie de página; si sigue una tabla, se
        -- reserva más espacio para que longtable no parta título y encabezado
        local next_block = doc.blocks[i + 1]
        local lines = (next_block and next_block.t == 'Table') and 12 or 6
        blocks[#blocks + 1] = raw('\\needspace{' .. lines .. '\\baselineskip}')
      end
      blocks[#blocks + 1] = b
    else
      blocks[#blocks + 1] = b
    end
  end
  doc.blocks = blocks
  return doc
end

-- Los saltos de línea forzados (\) del párrafo "2.1 Como priorizamos"
-- se convierten en un subtítulo real.
function Para(p)
  local s = stringify(p)
  if s:match('2%.1 Como Priorizamos') then
    local inl = p.content
    local out = {}
    -- separar en trozos por LineBreak
    local chunks, cur = {}, {}
    for _, x in ipairs(inl) do
      if x.t == 'LineBreak' then
        chunks[#chunks + 1] = cur; cur = {}
      else
        cur[#cur + 1] = x
      end
    end
    chunks[#chunks + 1] = cur
    for _, c in ipairs(chunks) do
      local txt = stringify(c)
      if txt:match('^%s*$') then
      elseif txt:match('2%.1 Como Priorizamos') then
        out[#out + 1] = pandoc.Header(2, '2.1 Cómo priorizamos')
      else
        out[#out + 1] = pandoc.Para(c)
      end
    end
    return out
  end
end
