import { useEffect, useState, type FormEvent } from 'react';
import api from '../services/api';
import type { LoteDTO, MovimentacaoDTO, ProdutoDTO } from '../types/types';
import { extrairErro, formatDate, formatDateTime } from '../utils/utils';

type Tipo = 'ENTRADA' | 'SAIDA';

export default function Movimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoDTO[]>([]);
  const [produtos, setProdutos] = useState<ProdutoDTO[]>([]);
  const [lotes, setLotes] = useState<LoteDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [tipo, setTipo] = useState<Tipo>('ENTRADA');
  const [produtoId, setProdutoId] = useState(0);
  const [loteId, setLoteId] = useState(0);
  const [quantidade, setQuantidade] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [formErro, setFormErro] = useState('');

  const carregar = async () => {
    setCarregando(true);
    setErro('');
    try {
      const [resMovimentacoes, resProdutos] = await Promise.all([
        api.get<MovimentacaoDTO[]>('/movimentacoes'),
        api.get<ProdutoDTO[]>('/produtos'),
      ]);
      setMovimentacoes(resMovimentacoes.data);
      setProdutos(resProdutos.data);
    } catch {
      setErro('Não foi possível carregar as movimentações.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const carregarLotes = async (id: number) => {
    if (!id) {
      setLotes([]);
      return;
    }
    try {
      const response = await api.get<LoteDTO[]>('/lotes', { params: { produtoId: id } });
      setLotes(response.data.filter((lote) => lote.quantidade > 0));
    } catch {
      setLotes([]);
    }
  };

  const selecionarTipo = (novoTipo: Tipo) => {
    setTipo(novoTipo);
    setFormErro('');
    setMensagem('');
    setLoteId(0);
  };

  const selecionarProduto = (id: number) => {
    setProdutoId(id);
    setLoteId(0);
    if (tipo === 'SAIDA') {
      carregarLotes(id);
    }
  };

  const registrar = async (e: FormEvent) => {
    e.preventDefault();
    const qtd = Number(quantidade);

    if (!produtoId) {
      setFormErro('Selecione o produto.');
      return;
    }
    if (!quantidade || Number.isNaN(qtd) || qtd <= 0) {
      setFormErro('Informe uma quantidade válida.');
      return;
    }
    if (tipo === 'SAIDA' && !loteId) {
      setFormErro('Selecione o lote.');
      return;
    }

    setSalvando(true);
    setFormErro('');
    setMensagem('');
    try {
      if (tipo === 'ENTRADA') {
        await api.post('/movimentacoes/entrada', {
          produtoId,
          quantidade: qtd,
          dataValidade: dataValidade || null,
        });
      } else {
        await api.post('/movimentacoes/saida', { produtoId, loteId, quantidade: qtd });
      }
      setQuantidade('');
      setDataValidade('');
      setLoteId(0);
      setMensagem(tipo === 'ENTRADA' ? 'Entrada registrada com sucesso.' : 'Saída registrada com sucesso.');
      if (tipo === 'SAIDA') {
        await carregarLotes(produtoId);
      }
      await carregar();
    } catch (err) {
      setFormErro(extrairErro(err, 'Não foi possível registrar a movimentação.'));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Movimentações</h1>
        <button className="btn-secondary" onClick={carregar}>
          Atualizar
        </button>
      </div>

      {erro && <div className="banner-erro">{erro}</div>}

      <section className="section">
        <h2>Registrar movimentação</h2>

        <div className="segmented">
          <button
            type="button"
            className={tipo === 'ENTRADA' ? 'active' : ''}
            onClick={() => selecionarTipo('ENTRADA')}
          >
            Entrada
          </button>
          <button
            type="button"
            className={tipo === 'SAIDA' ? 'active' : ''}
            onClick={() => selecionarTipo('SAIDA')}
          >
            Saída
          </button>
        </div>

        <form className="form-movimentacao" onSubmit={registrar}>
          <div className="form-grid">
            <div className="campo">
              <label htmlFor="mov-produto">Produto</label>
              <select
                id="mov-produto"
                value={produtoId}
                onChange={(e) => selecionarProduto(Number(e.target.value))}
              >
                <option value={0} disabled>
                  Selecione...
                </option>
                {produtos.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome}
                  </option>
                ))}
              </select>
            </div>

            {tipo === 'SAIDA' && (
              <div className="campo">
                <label htmlFor="mov-lote">Lote</label>
                <select
                  id="mov-lote"
                  value={loteId}
                  onChange={(e) => setLoteId(Number(e.target.value))}
                  disabled={!produtoId}
                >
                  <option value={0} disabled>
                    Selecione...
                  </option>
                  {lotes.map((lote) => (
                    <option key={lote.id} value={lote.id}>
                      {lote.dataValidade ? formatDate(lote.dataValidade) : 'Sem validade'} — {lote.quantidade} un
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="campo">
              <label htmlFor="mov-quantidade">Quantidade</label>
              <input
                id="mov-quantidade"
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>

            {tipo === 'ENTRADA' && (
              <div className="campo">
                <label htmlFor="mov-validade">Validade (opcional)</label>
                <input
                  id="mov-validade"
                  type="date"
                  value={dataValidade}
                  onChange={(e) => setDataValidade(e.target.value)}
                />
              </div>
            )}
          </div>

          {formErro && <p className="form-error">{formErro}</p>}
          {mensagem && <p className="form-success">{mensagem}</p>}

          <div className="form-actions">
            <button type="submit" className="btn-primary btn-add" disabled={salvando}>
              {salvando ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </section>

      <section className="section">
        <h2>Histórico de movimentações</h2>
        {carregando ? (
          <div className="app-loading">Carregando movimentações...</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Lote</th>
                  <th>Usuário</th>
                </tr>
              </thead>
              <tbody>
                {movimentacoes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-cell">Nenhuma movimentação registrada.</td>
                  </tr>
                ) : (
                  movimentacoes.map((movimentacao) => (
                    <tr key={movimentacao.id}>
                      <td>{formatDateTime(movimentacao.data)}</td>
                      <td>
                        <span className={`badge ${movimentacao.tipo === 'ENTRADA' ? 'badge-ok' : 'badge-repor'}`}>
                          {movimentacao.tipo}
                        </span>
                      </td>
                      <td>{movimentacao.produtoNome}</td>
                      <td>{movimentacao.quantidade}</td>
                      <td>{movimentacao.loteId ?? '—'}</td>
                      <td>{movimentacao.usuarioEmail ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
