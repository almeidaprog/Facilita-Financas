from typing import Literal

FinancialType = Literal["receita", "despesa"]

_TYPE_ALIASES = {
    "receita": "receita",
    "entrada": "receita",
    "income": "receita",
    "despesa": "despesa",
    "saida": "despesa",
    "saída": "despesa",
    "expense": "despesa",
}


def normalize_financial_type(value: str) -> FinancialType:
    normalized = value.strip().lower()
    try:
        return _TYPE_ALIASES[normalized]  # type: ignore[return-value]
    except KeyError as exc:
        raise ValueError(
            "Tipo inválido. Use receita/despesa."
        ) from exc
