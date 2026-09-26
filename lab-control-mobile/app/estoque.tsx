import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../src/services/api';

const colors = {
  primary: '#89cbbf',
  primaryDark: '#5aa89b',
  success: '#5eb366',
  danger: '#e74c3c',
  bg: '#f7f9fc',
  text: '#2c3e50',
  textMuted: '#7f8c8d',
  border: '#e8ecf1',
};

interface Produto {
  id: number;
  nome: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  dataValidade?: string | null;
  categoria?: { id: number; nome: string };
}

export default function EstoqueScreen() {
  const { id, nome } = useLocalSearchParams();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busca, setBusca] = useState('');

  const carregarProdutos = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<Produto[]>('/produtos');

      if (id) {
        const filtrados = response.data.filter((p) => p.categoria?.id === Number(id));
        setProdutos(filtrados);
      } else {
        setProdutos(response.data);
      }
    } catch {
      setError('Não foi possível carregar os produtos. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, [id]);

  const excluirProduto = async (produtoId: number) => {
    try {
      await api.delete(`/produtos/${produtoId}`);
      carregarProdutos();
      Alert.alert('Sucesso', 'Produto removido do estoque.');
    } catch {
      Alert.alert('Erro', 'Não foi possível excluir o produto.');
    }
  };

  const abrirOpcoesProduto = (item: Produto) => {
    Alert.alert('Opções do Produto', item.nome, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Editar',
        onPress: () => {
          router.push({
            pathname: '/cadastro',
            params: { produtoEditando: JSON.stringify(item) },
          } as any);
        },
      },
      {
        text: 'Excluir',
        onPress: () => {
          Alert.alert('Atenção', 'Deseja remover este produto definitivamente?', [
            { text: 'Não', style: 'cancel' },
            { text: 'Sim, Excluir', onPress: () => excluirProduto(item.id), style: 'destructive' },
          ]);
        },
        style: 'destructive',
      },
    ]);
  };

  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  const renderItem = ({ item }: { item: Produto }) => {
    const estoqueBaixo = item.quantidadeAtual <= item.quantidadeMinima;

    return (
      <TouchableOpacity
        style={[styles.card, estoqueBaixo && styles.cardAlerta]}
        onPress={() => abrirOpcoesProduto(item)}
      >
        <View style={styles.cardInfo}>
          <Text style={styles.nomeProduto}>{item.nome}</Text>
          <Text style={styles.categoriaProduto}>{item.categoria?.nome ?? '—'}</Text>
          <Text style={styles.quantidadeProduto}>Quantidade atual: {item.quantidadeAtual}</Text>
        </View>

        <View style={[styles.badge, estoqueBaixo ? styles.badgeAlerta : styles.badgeOk]}>
          <Text style={styles.badgeText}>{estoqueBaixo ? 'Estoque Baixo' : 'OK'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.titulo}>{nome ? nome : 'Estoque Geral'}</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produto..."
          placeholderTextColor={colors.textMuted}
          value={busca}
          onChangeText={setBusca}
        />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca('')}>
            <Feather name="x-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={44} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.btnTentarNovamente} onPress={carregarProdutos}>
            <Text style={styles.btnTentarNovamenteTexto}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={produtosFiltrados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {busca.length > 0
                ? 'Nenhum produto encontrado na busca.'
                : 'Nenhum produto nesta categoria.'}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    width: 32,
    alignItems: 'center',
  },
  titulo: {
    flex: 1,
    textAlign: 'center',
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: colors.text,
  },
  lista: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardAlerta: {
    borderLeftColor: colors.danger,
    backgroundColor: '#fdf1f0',
  },
  cardInfo: {
    flex: 1,
    paddingRight: 12,
  },
  nomeProduto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  categoriaProduto: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  quantidadeProduto: {
    fontSize: 14,
    color: colors.text,
    marginTop: 6,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeOk: {
    backgroundColor: colors.success,
  },
  badgeAlerta: {
    backgroundColor: colors.danger,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  btnTentarNovamente: {
    backgroundColor: colors.success,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  btnTentarNovamenteTexto: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: colors.textMuted,
    fontSize: 16,
  },
});
