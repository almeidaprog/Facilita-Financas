import { useMemo, useState } from "react";
import Icon from "../components/Icon";
import Modal from "../components/Modal";
import StatusMessage from "../components/StatusMessage";
import { createCategory, createEntry, deleteEntry, updateEntry } from "../services/api";
import { formatCurrency, formatDate, normalizeType, todayInputValue, typeLabel } from "../utils/formatters";
import { sortEntries } from "../utils/finance";

const makeEmptyForm = () => ({
  entry_type: "despesa",
  description: "",
  amount: "",
  category_id: "",
  entry_date: todayInputValue(),
  notes: "",
});

export default function EntriesPage({ user, entries, categories, onRefresh, openCreateOnMount = false }) {
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(openCreateOnMount);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(makeEmptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);

  const visibleEntries = useMemo(() => {
    const filtered = entries.filter((entry) => {
      const typeMatch = filter === "todos" || normalizeType(entry.entry_type) === filter;
      const query = search.trim().toLowerCase();
      const categoryName = categories.find((category) => Number(category.id) === Number(entry.category_id))?.name || "";
      const searchableText = [entry.description, entry.notes, categoryName, typeLabel(entry.entry_type), entry.entry_date]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return typeMatch && (!query || searchableText.includes(query));
    });

    return sortEntries(filtered);
  }, [entries, categories, filter, search]);

  function resetInlineCategory() {
    setNewCategoryOpen(false);
    setNewCategoryName("");
    setCategoryError("");
  }

  function openCreate() {
    setEditing(null);
    setForm(makeEmptyForm());
    setError("");
    resetInlineCategory();
    setModalOpen(true);
  }

  function openEdit(entry) {
    setEditing(entry);
    setForm({
      entry_type: normalizeType(entry.entry_type),
      description: entry.description,
      amount: String(entry.amount),
      category_id: entry.category_id ? String(entry.category_id) : "",
      entry_date: entry.entry_date,
      notes: entry.notes || "",
    });
    setError("");
    resetInlineCategory();
    setModalOpen(true);
  }

  const availableCategories = categories.filter((category) => normalizeType(category.category_type) === form.entry_type);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "entry_type" ? { category_id: "" } : {}),
    }));

    if (field === "entry_type") {
      resetInlineCategory();
    }
  }

  function handleCategoryChange(value) {
    if (value === "__new__") {
      setForm((current) => ({ ...current, category_id: "" }));
      setNewCategoryOpen(true);
      setCategoryError("");
      return;
    }

    setForm((current) => ({ ...current, category_id: value }));
    resetInlineCategory();
  }

  async function handleCreateInlineCategory() {
    const name = newCategoryName.trim();
    setCategoryError("");

    if (!name) {
      setCategoryError("Informe um nome para a categoria.");
      return;
    }

    setCategorySaving(true);
    try {
      const created = await createCategory({
        user_id: user.id,
        name,
        category_type: form.entry_type,
      });

      await onRefresh();
      setForm((current) => ({ ...current, category_id: String(created.id) }));
      resetInlineCategory();
    } catch (err) {
      setCategoryError(err.message);
    } finally {
      setCategorySaving(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.description.trim()) {
      setError("Dê um nome ao lançamento para encontrá-lo depois.");
      return;
    }

    if (Number(form.amount) <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }

    const payload = {
      description: form.description.trim(),
      amount: Number(form.amount),
      entry_type: form.entry_type,
      category_id: form.category_id ? Number(form.category_id) : null,
      entry_date: form.entry_date,
      notes: form.notes.trim() || null,
    };

    setSaving(true);
    try {
      if (editing) {
        await updateEntry(editing.id, payload);
      } else {
        await createEntry({ ...payload, user_id: user.id });
      }
      setModalOpen(false);
      await onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(entry) {
    if (!window.confirm(`Excluir “${entry.description}”? Essa ação não pode ser desfeita.`)) return;
    try {
      await deleteEntry(entry.id);
      await onRefresh();
    } catch (err) {
      window.alert(err.message);
    }
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div><span className="eyebrow">Histórico financeiro</span><h1>Lançamentos</h1><p>Registre entradas e despesas e acompanhe seu dinheiro sem planilha.</p></div>
        <button className="primary-button" onClick={openCreate}><Icon name="plus" /> Novo lançamento</button>
      </section>

      <section className="panel">
        <div className="toolbar">
          <div className="segmented-control">
            {[["todos","Todos"], ["receita","Receitas"], ["despesa","Despesas"]].map(([value, label]) => (
              <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{label}</button>
            ))}
          </div>
          <input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar lançamento..." />
        </div>

        {visibleEntries.length === 0 ? (
          <div className="empty-state"><strong>Nada por aqui</strong><span>{entries.length ? "Nenhum lançamento corresponde aos filtros." : "Registre sua primeira entrada ou despesa para começar."}</span>{!entries.length && <button onClick={openCreate}>Criar primeiro lançamento</button>}</div>
        ) : (
          <div className="entries-table-wrap">
            <table className="entries-table">
              <thead><tr><th>Descrição</th><th>Categoria</th><th>Data</th><th>Tipo</th><th className="amount-cell">Valor</th><th /></tr></thead>
              <tbody>
                {visibleEntries.map((entry) => {
                  const isIncome = normalizeType(entry.entry_type) === "receita";
                  return (
                    <tr key={entry.id}>
                      <td><strong>{entry.description}</strong>{entry.notes && <span className="table-note">{entry.notes}</span>}</td>
                      <td>{categories.find((category) => Number(category.id) === Number(entry.category_id))?.name || "Sem categoria"}</td>
                      <td>{formatDate(entry.entry_date)}</td>
                      <td><span className={`type-badge ${isIncome ? "income" : "expense"}`}>{typeLabel(entry.entry_type)}</span></td>
                      <td className={`amount-cell ${isIncome ? "positive" : "negative"}`}>{isIncome ? "+ " : "− "}{formatCurrency(entry.amount)}</td>
                      <td><div className="row-actions"><button title="Editar" onClick={() => openEdit(entry)}><Icon name="edit" size={17} /></button><button className="danger" title="Excluir" onClick={() => handleDelete(entry)}><Icon name="trash" size={17} /></button></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen && (
        <Modal title={editing ? "Editar lançamento" : "Novo lançamento"} subtitle="Preencha apenas o necessário. Você pode editar depois." onClose={() => setModalOpen(false)}>
          <form className="modal-form" onSubmit={handleSubmit}>
            <StatusMessage>{error}</StatusMessage>
            <div className="type-selector">
              <button type="button" className={form.entry_type === "despesa" ? "active expense" : ""} onClick={() => update("entry_type", "despesa")}><Icon name="down" /> Despesa</button>
              <button type="button" className={form.entry_type === "receita" ? "active income" : ""} onClick={() => update("entry_type", "receita")}><Icon name="up" /> Receita</button>
            </div>
            <label>Descrição<input value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Ex.: Mercado, aluguel, freelance..." autoFocus required /></label>
            <div className="form-grid two"><label>Valor (R$)<input type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => update("amount", event.target.value)} placeholder="0,00" required /></label><label>Data<input type="date" value={form.entry_date} onChange={(event) => update("entry_date", event.target.value)} required /></label></div>
            <label>
              Categoria
              <select value={form.category_id} onChange={(event) => handleCategoryChange(event.target.value)}>
                <option value="">Sem categoria</option>
                {availableCategories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
                <option value="__new__">＋ Criar nova categoria</option>
              </select>
            </label>

            {newCategoryOpen && (
              <div className="inline-category-create">
                <div>
                  <strong>Nova categoria de {form.entry_type}</strong>
                  <span>Ela será criada e selecionada neste lançamento.</span>
                </div>
                {categoryError && <StatusMessage>{categoryError}</StatusMessage>}
                <div className="inline-category-row">
                  <input
                    value={newCategoryName}
                    onChange={(event) => { setNewCategoryName(event.target.value); setCategoryError(""); }}
                    placeholder={form.entry_type === "despesa" ? "Ex.: Academia" : "Ex.: Comissão"}
                    maxLength={100}
                    autoFocus
                  />
                  <button type="button" className="secondary-button" onClick={handleCreateInlineCategory} disabled={categorySaving}>
                    {categorySaving ? "Criando..." : "Criar e usar"}
                  </button>
                </div>
              </div>
            )}

            <label>Observação <span className="optional">opcional</span><textarea rows="3" value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Algum detalhe que ajude você a lembrar deste lançamento." /></label>
            <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancelar</button><button className="primary-button" disabled={saving || categorySaving}>{saving ? "Salvando..." : editing ? "Salvar alterações" : "Adicionar lançamento"}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
