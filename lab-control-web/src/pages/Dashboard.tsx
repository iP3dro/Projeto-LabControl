import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Produto, ProdutoDTO } from '../types/types';
import { formatDate, statusOf } from '../utils/utils';

interface Resumo {
  totalProdutos: number;
  totalRepor: number;
  totalVencimento: number;
}

export default function Dashboard() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [repor, setRepor] = useState<ProdutoDTO[]>([]);
  const [vencimento, setVencimento] = useState<ProdutoDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarDados = async () => {
    setCarregando(true);
    setErro('');
    try {
      const [resProdutos, resRepor, resVencimento] = await Promise.all([
        api.get<Produto[]>('/produtos'),
        api.get<ProdutoDTO[]>('/produtos/repor'),
        api.get<ProdutoDTO[]>('/produtos/vencimento', { params: { dias: 30 } }),
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

  const resumo: Resumo = {
    totalProdutos: produtos.length,
    totalRepor: repor.length,
    totalVencimento: vencimento.length,
  };

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
          <span className="card-resumo-valor">{resumo.totalProdutos}</span>
          <span className="card-resumo-label">Produtos cadastrados</span>
        </div>
        <div className="card-resumo card-resumo-alerta">
          <span className="card-resumo-valor">{resumo.totalRepor}</span>
          <span className="card-resumo-label">Produtos para repor</span>
        </div>
        <div className="card-resumo card-resumo-validade">
          <span className="card-resumo-valor">{resumo.totalVencimento}</span>
          <span className="card-resumo-label">Vencem em 30 dias</span>
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
                    <th>Validade</th>
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
                    <th>Validade</th>
                    <th>Dias restantes</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {vencimento.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty-cell">Nenhum insumo próximo do vencimento.</td>
                    </tr>
                  ) : (
                    vencimento.map((produto) => (
                      <tr key={produto.id}>
                        <td>{produto.nome}</td>
                        <td>{produto.categoria.nome}</td>
                        <td>{formatDate(produto.dataValidade)}</td>
                        <td>{produto.diasParaVencimento ?? '—'}</td>
                        <td>
                          {produto.vencido ? (
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
