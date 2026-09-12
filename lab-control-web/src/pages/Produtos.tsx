import { useEffect, useState, type FormEvent } from 'react';
import api from '../services/api';
import type { Categoria, Produto } from '../types/types';
import { extrairErro, formatDate, statusOf } from '../utils/utils';
import Modal from '../components/Modal';

interface ProdutoForm {
  nome: string;
  categoriaId: number;
  quantidadeAtual: string;
  quantidadeMinima: string;
  dataValidade: string;
}

const formVazio: ProdutoForm = {
  nome: '',
  categoriaId: 0,
  quantidadeAtual: '',
  quantidadeMinima: '',
  dataValidade: '',
};

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [modalAberta, setModalAberta] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [form, setForm] = useState<ProdutoForm>(formVazio);
  const [salvando, setSalvando] = useState(false);
  const [formErro, setFormErro] = useState('');

  const carregar = async () => {
    setCarregando(true);
    setErro('');
    try {
      const [resProdutos, resCategorias] = await Promise.all([
        api.get<Produto[]>('/produtos'),
        api.get<Categoria[]>('/categorias'),
      ]);
      setProdutos(resProdutos.data);
      setCategorias(resCategorias.data);
    } catch {
      setErro('Não foi possível carregar os produtos.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const abrirNovo = () => {
    setEditando(null);
    setForm({ ...formVazio, categoriaId: categorias[0]?.id ?? 0 });
    setFormErro('');
    setModalAberta(true);
  };

  const abrirEdicao = (produto: Produto) => {
    setEditando(produto);
    setForm({
      nome: produto.nome,
      categoriaId: produto.categoria?.id ?? 0,
      quantidadeAtual: String(produto.quantidadeAtual),
      quantidadeMinima: String(produto.quantidadeMinima),
      dataValidade: produto.dataValidade?.split('T')[0] ?? '',
    });
    setFormErro('');
    setModalAberta(true);
  };

  const fecharModal = () => {
    setModalAberta(false);
    setEditando(null);
    setForm(formVazio);
    setFormErro('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nome = form.nome.trim();
    const quantidadeAtual = Number(form.quantidadeAtual);
    const quantidadeMinima = Number(form.quantidadeMinima);

    if (!nome) {
      setFormErro('Informe o nome do produto.');
      return;
    }
    if (!form.categoriaId) {
      setFormErro('Selecione uma categoria.');
      return;
    }
    if (form.quantidadeAtual === '' || Number.isNaN(quantidadeAtual) || quantidadeAtual < 0) {
      setFormErro('Informe uma quantidade atual válida.');
      return;
    }
    if (form.quantidadeMinima === '' || Number.isNaN(quantidadeMinima) || quantidadeMinima < 0) {
      setFormErro('Informe uma quantidade mínima válida.');
      return;
    }

    const payload = {
      nome,
      quantidadeAtual,
      quantidadeMinima,
      dataValidade: form.dataValidade || null,
      categoria: { id: form.categoriaId },
    };

    setSalvando(true);
    setFormErro('');
    try {
      if (editando) {
        await api.put(`/produtos/${editando.id}`, payload);
      } else {
        await api.post('/produtos', payload);
      }
      fecharModal();
      await carregar();
    } catch (err) {
      setFormErro(extrairErro(err, 'Não foi possível salvar o produto.'));
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (produto: Produto) => {
    if (!window.confirm(`Excluir o produto "${produto.nome}"?`)) return;
    try {
      await api.delete(`/produtos/${produto.id}`);
      await carregar();
    } catch (err) {
      setErro(extrairErro(err, 'Não foi possível excluir o produto.'));
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Produtos</h1>
        <button className="btn-primary btn-add" onClick={abrirNovo}>
          Novo Produto
        </button>
      </div>

      {erro && <div className="banner-erro">{erro}</div>}

      {carregando ? (
        <div className="app-loading">Carregando produtos...</div>
      ) : (
        <section className="section">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Estoque Atual</th>
                  <th>Mínimo</th>
                  <th>Validade</th>
                  <th>Status</th>
                  <th className="col-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-cell">Nenhum produto cadastrado.</td>
                  </tr>
                ) : (
                  produtos.map((produto) => {
                    const status = statusOf(produto.quantidadeAtual, produto.quantidadeMinima);
                    return (
                      <tr key={produto.id}>
                        <td>{produto.nome}</td>
                        <td>{produto.categoria?.nome ?? '—'}</td>
                        <td>{produto.quantidadeAtual}</td>
                        <td>{produto.quantidadeMinima}</td>
                        <td>{formatDate(produto.dataValidade)}</td>
                        <td>
                          <span className={`badge ${status === 'REPOR' ? 'badge-repor' : 'badge-ok'}`}>
                            {status}
                          </span>
                        </td>
                        <td className="col-acoes">
                          <div className="acoes">
                            <button className="btn-acao" onClick={() => abrirEdicao(produto)}>
                              Editar
                            </button>
                            <button className="btn-acao btn-acao-danger" onClick={() => excluir(produto)}>
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {modalAberta && (
        <Modal title={editando ? 'Editar Produto' : 'Novo Produto'} onClose={fecharModal}>
          <form onSubmit={handleSubmit}>
            <label htmlFor="produto-nome">Nome</label>
            <input
              id="produto-nome"
              type="text"
              placeholder="Ex.: Álcool etílico"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              autoFocus
            />

            <label htmlFor="produto-categoria">Categoria</label>
            <select
              id="produto-categoria"
              value={form.categoriaId}
              onChange={(e) => setForm({ ...form, categoriaId: Number(e.target.value) })}
            >
              <option value={0} disabled>
                Selecione...
              </option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>

            <div className="form-row">
              <div>
                <label htmlFor="produto-atual">Quantidade Atual</label>
                <input
                  id="produto-atual"
                  type="number"
                  min="0"
                  value={form.quantidadeAtual}
                  onChange={(e) => setForm({ ...form, quantidadeAtual: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="produto-minimo">Quantidade Mínima</label>
                <input
                  id="produto-minimo"
                  type="number"
                  min="0"
                  value={form.quantidadeMinima}
                  onChange={(e) => setForm({ ...form, quantidadeMinima: e.target.value })}
                />
              </div>
            </div>

            <label htmlFor="produto-validade">Data de Validade</label>
            <input
              id="produto-validade"
              type="date"
              value={form.dataValidade}
              onChange={(e) => setForm({ ...form, dataValidade: e.target.value })}
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
