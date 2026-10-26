import { useState } from "react";
import Icon from "../components/Icon";
import Modal from "../components/Modal";
import StatusMessage from "../components/StatusMessage";
import { createCategory, deleteCategory, updateCategory } from "../services/api";
import { normalizeType } from "../utils/formatters";

export default function CategoriesPage({ user, categories, entries, onRefresh }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", category_type: "despesa" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", category_type: "despesa" });
    setError("");
    setModalOpen(true);
  }

  function openEdit(category) {
    setEditing(category);
    setForm({ name: category.name, category_type: normalizeType(category.category_type) });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Informe um nome para a categoria.");
    setSaving(true);
    try {
      if (editing) await updateCategory(editing.id, { name: form.name.trim(), category_type: form.category_type });
      else await createCategory({ user_id: user.id, name: form.name.trim(), category_type: form.category_type });
      setModalOpen(false);
      await onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category) {
    if (!window.confirm(`Excluir a categoria “${category.name}”? Os lançamentos existentes ficarão sem categoria.`)) return;
    try {
      await deleteCategory(category.id);
      await onRefresh();
    } catch (err) {
      window.alert(err.message);
    }
  }

  return (
    <div className="page-stack">
      <section className="page-heading"><div><span className="eyebrow">Organização</span><h1>Categorias</h1><p>Crie grupos que façam sentido para sua rotina. Nada de categorias engessadas.</p></div><button className="primary-button" onClick={openCreate}><Icon name="plus" /> Nova categoria</button></section>

      <section className="category-columns">
        {[["despesa", "Despesas"], ["receita", "Receitas"]].map(([type, title]) => {
          const items = categories.filter((category) => normalizeType(category.category_type) === type);
          return (
            <article className="panel category-panel" key={type}>
              <div className="panel-heading"><div><span className={`mini-dot ${type}`} /><h2>{title}</h2></div><span className="count-badge">{items.length}</span></div>
              {items.length === 0 ? <div className="empty-state compact"><strong>Nenhuma categoria</strong><span>Você pode criar uma quando precisar.</span></div> : (
                <div className="category-list">
                  {items.map((category) => {
                    const usage = entries.filter((entry) => entry.category_id === category.id).length;
                    return <div className="category-item" key={category.id}><div><strong>{category.name}</strong><span>{usage} {usage === 1 ? "lançamento" : "lançamentos"}</span></div><div className="row-actions"><button title="Editar" onClick={() => openEdit(category)}><Icon name="edit" size={17} /></button><button className="danger" title="Excluir" onClick={() => handleDelete(category)}><Icon name="trash" size={17} /></button></div></div>;
                  })}
                </div>
              )}
            </article>
          );
        })}
      </section>

      {modalOpen && <Modal title={editing ? "Editar categoria" : "Nova categoria"} subtitle="Use nomes curtos que você reconheça rapidamente." onClose={() => setModalOpen(false)}><form className="modal-form" onSubmit={handleSubmit}><StatusMessage>{error}</StatusMessage><label>Nome<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ex.: Alimentação" autoFocus required /></label><label>Tipo<select value={form.category_type} onChange={(event) => setForm((current) => ({ ...current, category_type: event.target.value }))}><option value="despesa">Despesa</option><option value="receita">Receita</option></select>{editing && entries.some((entry) => entry.category_id === editing.id) && <small>Se a categoria já foi usada, o tipo não poderá ser alterado.</small>}</label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancelar</button><button className="primary-button" disabled={saving}>{saving ? "Salvando..." : editing ? "Salvar alterações" : "Criar categoria"}</button></div></form></Modal>}
    </div>
  );
}
