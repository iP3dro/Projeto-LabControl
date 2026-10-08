import { useEffect, useState } from 'react';
import api from '../services/api';
import type { LoteDTO, ProdutoDTO } from '../types/types';
import { formatDate, statusOf } from '../utils/utils';

export default function Dashboard() {
  const [produtos, setProdutos] = useState<ProdutoDTO[]>([]);
  const [repor, setRepor] = useState<ProdutoDTO[]>([]);
  const [vencimento, setVencimento] = useState<LoteDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarDados = async () => {
    setCarregando(true);
    setErro('');
    try {
      const [resProdutos, resRepor, resVencimento] = await Promise.all([
        api.get<ProdutoDTO[]>('/produtos'),
        api.get<ProdutoDTO[]>('/produtos/repor'),
        api.get<LoteDTO[]>('/lotes/vencimento', { params: { dias: 30 } }),
      ]);
      setProdutos(resProdutos.data);
      setRepor(resRepor.data);
      setVencimento(resVencimento.data);
    } catch {
      setErro('Não foi possível conectar com o servidor.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <button className="btn-secondary" onClick={carregarDados}>
          Atualizar
        </button>
      </div>

      {erro && <div className="banner-erro">{erro}</div>}

      <div className="cards">
        <div className="card-resumo">
          <span className="card-resumo-valor">{produtos.length}</span>
          <span className="card-resumo-label">Produtos cadastrados</span>
        </div>
        <div className="card-resumo card-resumo-alerta">
          <span className="card-resumo-valor">{repor.length}</span>
          <span className="card-resumo-label">Produtos para repor</span>
        </div>
        <div className="card-resumo card-resumo-validade">
          <span className="card-resumo-valor">{vencimento.length}</span>
          <span className="card-resumo-label">Lotes vencendo em 30 dias</span>
        </div>
      </div>

      {carregando ? (
        <div className="app-loading">Carregando dados...</div>
      ) : (
        <>
          <section className="section">
            <h2>Monitoramento de Estoque</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Categoria</th>
                    <th>Estoque Atual</th>
                    <th>Mínimo</th>
                    <th>Próxima Validade</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="empty-cell">Nenhum produto cadastrado.</td>
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
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="section">
            <h2>Alertas de Validade (próximos 30 dias)</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Categoria</th>
                    <th>Lote</th>
                    <th>Quantidade</th>
                    <th>Validade</th>
                    <th>Dias restantes</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {vencimento.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="empty-cell">Nenhum lote próximo do vencimento.</td>
                    </tr>
                  ) : (
                    vencimento.map((lote) => (
                      <tr key={lote.id}>
                        <td>{lote.produtoNome}</td>
                        <td>{lote.categoria.nome}</td>
                        <td>#{lote.id}</td>
                        <td>{lote.quantidade}</td>
                        <td>{formatDate(lote.dataValidade)}</td>
                        <td>{lote.diasParaVencimento ?? '—'}</td>
                        <td>
                          {lote.vencido ? (
                            <span className="badge badge-vencido">Vencido</span>
                          ) : (
                            <span className="badge badge-validade">A vencer</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
