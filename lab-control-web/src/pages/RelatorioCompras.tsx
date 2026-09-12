import { useEffect, useState } from 'react';
import api from '../services/api';
import type { RelatorioComprasDTO } from '../types/types';
import { formatDate } from '../utils/utils';

export default function RelatorioCompras() {
  const [relatorio, setRelatorio] = useState<RelatorioComprasDTO | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarRelatorio = async () => {
    setCarregando(true);
    setErro('');
    try {
      const response = await api.get<RelatorioComprasDTO>('/relatorios/compras');
      setRelatorio(response.data);
    } catch {
      setErro('Não foi possível gerar o relatório.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarRelatorio();
  }, []);

  const totalItens = relatorio?.categorias.reduce((acc, c) => acc + c.produtos.length, 0) ?? 0;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Relatório de Compras por Categoria</h1>
        <button className="btn-secondary" onClick={carregarRelatorio}>
          Atualizar
        </button>
      </div>

      <p className="page-description">
        Produtos com tag <span className="badge badge-repor">REPOR</span> agrupados por categoria
        (quantidade atual igual ou abaixo do mínimo).
      </p>

      {erro && <div className="banner-erro">{erro}</div>}

      {carregando ? (
        <div className="app-loading">Gerando relatório...</div>
      ) : relatorio && relatorio.categorias.length === 0 ? (
        <div className="banner-info">Nenhum produto precisa ser reposto no momento.</div>
      ) : (
        <>
          <div className="relatorio-sumario">
            <strong>{totalItens}</strong> item(ns) para compra em {relatorio?.categorias.length ?? 0} categoria(s).
          </div>

          {relatorio?.categorias.map((grupo) => (
            <section className="section" key={grupo.categoria.id}>
              <h2>{grupo.categoria.nome}</h2>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Estoque Atual</th>
                      <th>Mínimo</th>
                      <th>Faltam</th>
                      <th>Validade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupo.produtos.map((produto) => (
                      <tr key={produto.id}>
                        <td>{produto.nome}</td>
                        <td>{produto.quantidadeAtual}</td>
                        <td>{produto.quantidadeMinima}</td>
                        <td>{produto.quantidadeMinima - produto.quantidadeAtual}</td>
                        <td>{formatDate(produto.dataValidade)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
