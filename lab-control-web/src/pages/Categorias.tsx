import { useEffect, useState, type FormEvent } from 'react';
import api from '../services/api';
import type { Categoria } from '../types/types';
import { extrairErro } from '../utils/utils';
import Modal from '../components/Modal';

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [modalAberta, setModalAberta] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [formErro, setFormErro] = useState('');

  const carregar = async () => {
    setCarregando(true);
    setErro('');
    try {
      const response = await api.get<Categoria[]>('/categorias');
      setCategorias(response.data);
    } catch {
      setErro('Não foi possível carregar as categorias.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const abrirNova = () => {
    setEditando(null);
    setNome('');
    setFormErro('');
    setModalAberta(true);
  };

  const abrirEdicao = (categoria: Categoria) => {
    setEditando(categoria);
    setNome(categoria.nome);
    setFormErro('');
    setModalAberta(true);
  };

  const fecharModal = () => {
    setModalAberta(false);
    setEditando(null);
    setNome('');
    setFormErro('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      setFormErro('Informe o nome da categoria.');
      return;
    }

    setSalvando(true);
    setFormErro('');
    try {
      if (editando) {
        await api.put(`/categorias/${editando.id}`, { nome: nomeLimpo });
      } else {
        await api.post('/categorias', { nome: nomeLimpo });
      }
      fecharModal();
      await carregar();
    } catch (err) {
      setFormErro(extrairErro(err, 'Não foi possível salvar a categoria.'));
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (categoria: Categoria) => {
    if (!window.confirm(`Excluir a categoria "${categoria.nome}"?`)) return;
    try {
      await api.delete(`/categorias/${categoria.id}`);
      await carregar();
    } catch (err) {
      setErro(extrairErro(err, 'Não foi possível excluir a categoria.'));
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Categorias</h1>
        <button className="btn-primary btn-add" onClick={abrirNova}>
          Nova Categoria
        </button>
      </div>

      {erro && <div className="banner-erro">{erro}</div>}

      {carregando ? (
        <div className="app-loading">Carregando categorias...</div>
      ) : (
        <section className="section">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th className="col-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {categorias.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="empty-cell">Nenhuma categoria cadastrada.</td>
                  </tr>
                ) : (
                  categorias.map((categoria) => (
                    <tr key={categoria.id}>
                      <td>{categoria.nome}</td>
                      <td className="col-acoes">
                        <div className="acoes">
                          <button className="btn-acao" onClick={() => abrirEdicao(categoria)}>
                            Editar
                          </button>
                          <button className="btn-acao btn-acao-danger" onClick={() => excluir(categoria)}>
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {modalAberta && (
        <Modal title={editando ? 'Editar Categoria' : 'Nova Categoria'} onClose={fecharModal}>
          <form onSubmit={handleSubmit}>
            <label htmlFor="categoria-nome">Nome</label>
            <input
              id="categoria-nome"
              type="text"
              placeholder="Ex.: Reagentes"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
            />

            {formErro && <p className="form-error">{formErro}</p>}

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={fecharModal}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
