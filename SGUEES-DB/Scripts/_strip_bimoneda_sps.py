# -*- coding: utf-8 -*-
import re
import pathlib

root = pathlib.Path(r"C:\Desarrollo GIT\SGUEES\SGUEES-DB\Stored Procedures")
files = list(root.glob("dbo.PRAL_*COM_PROVISION*.sql")) + list(root.glob("dbo.PRAL_*COM_PAGO*.sql"))


def find_matching_end(s, start):
    i = start
    depth = 0
    n = len(s)
    while i < n:
        if (
            s[i : i + 4].upper() == "CASE"
            and (i + 4 >= n or not s[i + 4].isalnum())
            and (i == 0 or not s[i - 1].isalnum())
        ):
            depth += 1
            i += 4
            continue
        if (
            s[i : i + 3].upper() == "END"
            and (i + 3 >= n or not s[i + 3].isalnum())
            and (i == 0 or not s[i - 1].isalnum())
        ):
            depth -= 1
            i += 3
            if depth == 0:
                return i
            continue
        i += 1
    return -1


def simplify_es_bimoneda(s):
    marker = "CASE WHEN @ES_BIMONEDA"
    out = []
    i = 0
    upper = s.upper()
    while True:
        j = upper.find(marker.upper(), i)
        if j < 0:
            out.append(s[i:])
            break
        out.append(s[i:j])
        end = find_matching_end(s, j)
        if end < 0:
            out.append(s[j:])
            break
        block = s[j:end]
        m = re.match(r"(?is)CASE\s+WHEN\s+@ES_BIMONEDA\s*=\s*1\s+THEN\s+", block)
        if not m:
            out.append(block)
            i = end
            continue
        pos = m.end()
        k = pos
        else_pos = -1
        depth = 1
        while k < len(block):
            if (
                block[k : k + 4].upper() == "CASE"
                and (k + 4 >= len(block) or not block[k + 4].isalnum())
                and (k == 0 or not block[k - 1].isalnum())
            ):
                depth += 1
                k += 4
                continue
            if (
                block[k : k + 3].upper() == "END"
                and (k + 3 >= len(block) or not block[k + 3].isalnum())
                and (k == 0 or not block[k - 1].isalnum())
            ):
                depth -= 1
                k += 3
                if depth == 0:
                    break
                continue
            if (
                depth == 1
                and block[k : k + 4].upper() == "ELSE"
                and (k + 4 >= len(block) or not block[k + 4].isalnum())
                and (k == 0 or not block[k - 1].isalnum())
            ):
                else_pos = k
                break
            k += 1
        if else_pos < 0:
            out.append(block)
            i = end
            continue
        else_expr = block[else_pos + 4 : len(block) - 3].strip()
        out.append(else_expr)
        i = end
    return "".join(out)


def collapse_four_amounts_to_two(s):
    """
    After simplify, inserts list MONTO_CARGO, MONTO_ABONO[, CORR_AUXILIAR]
    but SELECT may still have 4 local-amount expressions (old cargo/abono/foranea/foranea).
    Detect INSERT column lists without FORANEA and trim SELECT amount tuples from 4->2
    only when we see the classic pattern of 4 consecutive CASE WHEN amount lines.
    Safer approach: remove lines that still contain FORANEA identifiers.
    """
    lines = s.splitlines(True)
    out = []
    for line in lines:
        if re.search(r"MONTO_.*FORANEA|FORANEO", line, re.I) and not line.lstrip().startswith("--"):
            # drop assignment/select of foranea values entirely
            if re.search(r"^\s*,?\s*@?MONTO_.*FORANE", line, re.I):
                continue
            if re.search(r"=@MONTO_.*FORANE|MONTO_.*FORANEA\s*=", line, re.I):
                continue
        out.append(line)
    return "".join(out)


for path in files:
    text = path.read_text(encoding="utf-8")
    orig = text

    text = re.sub(r",?\s*@CORR_MONEDA_FORANEA\s+INT", "", text, flags=re.I)
    text = re.sub(r",?\s*@CORR_MONEDA_LOCAL\s+INT", "", text, flags=re.I)
    text = re.sub(r",?\s*@CORR_MONEDA\s+INT(?!\w)", "", text, flags=re.I)
    text = re.sub(r",?\s*@FACTOR_CAMBIO\s+DECIMAL\s*\([^)]*\)", "", text, flags=re.I)
    text = re.sub(r",?\s*@OPERADOR\s+VARCHAR\s*\([^)]*\)", "", text, flags=re.I)
    text = re.sub(r",?\s*@ES_BIMONEDA\s+BIT", "", text, flags=re.I)
    text = re.sub(r",?\s*@MONTO_CARGO_DETA_FORANEA\s+DECIMAL\s*\([^)]*\)", "", text, flags=re.I)
    text = re.sub(r",?\s*@MONTO_ABONO_DETA_FORANEA\s+DECIMAL\s*\([^)]*\)", "", text, flags=re.I)
    text = re.sub(r",?\s*@MONTO_CARGO_FORANEA\s+[^\n,)]+", "", text, flags=re.I)
    text = re.sub(r",?\s*@MONTO_ABONO_FORANEA\s+[^\n,)]+", "", text, flags=re.I)
    text = re.sub(
        r"DECLARE\s+@USA_DESCRIPCION_PARTIDA BIT,@PROVISIONAR_POR_DOC BIT,+",
        "DECLARE @USA_DESCRIPCION_PARTIDA BIT,@PROVISIONAR_POR_DOC BIT",
        text,
        flags=re.I,
    )
    text = re.sub(r",\s*,", ",", text)

    text = simplify_es_bimoneda(text)

    text = re.sub(
        r"(?is)\s*SELECT\s+@CORR_MONEDA_LOCAL\s*=\s*CORR_MONEDA\s*FROM\s+GEN_EMPRESA\s+A\s*WHERE\s+A\.CORR_EMPRESA\s*=\s*@CORR_EMPRESA\s*",
        "\n",
        text,
    )
    text = re.sub(
        r"(?is)\s*SELECT\s+@CORR_MONEDA_FORANEA\s*=\s*A\.CORR_MONEDA_INTER\s*,?\s*@ES_BIMONEDA\s*=\s*A\.ES_BIMONEDA\s*FROM\s+GEN_PARAMETRO\s+A\s*WHERE\s+A\.CORR_EMPRESA\s*=\s*@CORR_EMPRESA\s*",
        "\n",
        text,
    )
    text = re.sub(
        r"(?is)\s*SELECT\s+@CORR_MONEDA_FORANEA\s*=\s*A\.CORR_MONEDA_INTER\s*FROM\s+GEN_PARAMETRO\s+A\s*WHERE\s+A\.CORR_EMPRESA\s*=\s*@CORR_EMPRESA\s*",
        "\n",
        text,
    )
    text = re.sub(
        r"(?is)\s*SELECT\s+@CORR_MONEDA\s*=\s*CORR_MONEDA\s*\r?\n\s*,\s*@FACTOR_CAMBIO\s*=\s*FACTOR_CAMBIO\s*\r?\n\s*,\s*@OPERADOR\s*=\s*OPERADOR\s*\r?\n\s*FROM\s+COM_(?:PROVISION|PAGO).*?\r?\n(?:\s*(?:WHERE|AND)[^\r\n]*\r?\n){1,5}",
        "\n",
        text,
    )
    text = re.sub(
        r"(?is),\s*@CORR_MONEDA\s*=\s*CORR_MONEDA\s*,\s*@FACTOR_CAMBIO\s*=\s*FACTOR_CAMBIO\s*,\s*@OPERADOR\s*=\s*OPERADOR",
        "",
        text,
    )
    text = re.sub(
        r"(?is)\s*@CORR_MONEDA\s*=\s*CORR_MONEDA\s*,\s*@FACTOR_CAMBIO\s*=\s*FACTOR_CAMBIO\s*,\s*@OPERADOR\s*=\s*OPERADOR\s*,?",
        "",
        text,
    )
    text = re.sub(r",\s*@CORR_MONEDA\s*,\s*@FACTOR_CAMBIO\s*,\s*@OPERADOR", "", text)
    text = re.sub(r",\s*@CORR_MONEDA\s*\r?\n\s*,\s*@FACTOR_CAMBIO\s*\r?\n\s*,\s*@OPERADOR", "", text)
    text = re.sub(r",@CORR_MONEDA,@FACTOR_CAMBIO,@OPERADOR", "", text)
    text = re.sub(r",\s*@MONTO_CARGO_DETA_FORANEA\s*\r?\n\s*,\s*@MONTO_ABONO_DETA_FORANEA", "", text)
    text = re.sub(r",\s*@MONTO_CARGO_DETA_FORANEA", "", text)
    text = re.sub(r",\s*@MONTO_ABONO_DETA_FORANEA", "", text)
    text = re.sub(r"(?m)^\s*--IF @CORR_MONEDA.*\r?\n(?:\s*--.*\r?\n)*", "", text)

    text = collapse_four_amounts_to_two(text)

    # Clean DECLARE that may end empty after stripping
    text = re.sub(
        r"(?im)^(\s*DECLARE\s+@USA_DESCRIPCION_PARTIDA BIT,@PROVISIONAR_POR_DOC BIT)\s*$",
        r"\1",
        text,
    )
    text = re.sub(r"DECLARE\s+@USA_DESCRIPCION_PARTIDA BIT,@PROVISIONAR_POR_DOC BIT\s*\r?\n", "DECLARE @USA_DESCRIPCION_PARTIDA BIT,@PROVISIONAR_POR_DOC BIT\r\n", text)

    if text != orig:
        path.write_text(text, encoding="utf-8")
        print("updated", path.name)
    else:
        print("unchanged", path.name)

pat = re.compile(r"CORR_MONEDA|FACTOR_CAMBIO|@OPERADOR|ES_BIMONEDA|FORANEA|GEN_PARAMETRO|GEN_EMPRESA", re.I)
for path in files:
    lines = path.read_text(encoding="utf-8").splitlines()
    hits = [
        (i + 1, l.strip()[:140])
        for i, l in enumerate(lines)
        if pat.search(l) and not l.strip().startswith("--")
    ]
    if hits:
        print("---", path.name, len(hits))
        for i, l in hits[:20]:
            print(f"  {i}: {l}")
