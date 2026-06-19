import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../src/api';
import { auth } from '../src/firebaseConfig';

interface Produto {
  id: number;
  nome: string;
  quantidadeAtual: number; 
  quantidadeMinima: number;
  dataValidade?: string; 
  categoria?: { id: number; nome: string; };
}

export default function EstoqueScreen() {
  const { id, nome } = useLocalSearchParams(); 
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  // NOVO: Estado para guardar o que está sendo digitado na busca
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarProdutos();
  }, [id]); 

  const carregarProdutos = async () => {
    setCarregando(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await api.get('/produtos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (id) {
        const filtrados = response.data.filter((p: Produto) => p.categoria?.id === Number(id));
        setProdutos(filtrados);
      } else {
        setProdutos(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  const excluirProduto = async (produtoId: number) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      await api.delete(`/produtos/${produtoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      carregarProdutos(); 
      Alert.alert('Sucesso', 'Produto removido do estoque.');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível excluir o produto.');
    }
  };

  const abrirOpcoesProduto = (item: Produto) => {
    Alert.alert('Opções do Produto', item.nome, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Editar', onPress: () => {
          router.push({
            pathname: '/cadastro',
            params: { 
              produtoEditando: JSON.stringify(item) 
            }
          } as any);
        }
      },
      { text: 'Excluir', onPress: () => {
          Alert.alert('Atenção', 'Deseja remover este produto definitivamente?', [
            { text: 'Não', style: 'cancel' },
            { text: 'Sim, Excluir', onPress: () => excluirProduto(item.id), style: 'destructive' }
          ])
        }, style: 'destructive' 
      }
    ]);
  };

  // NOVO: Filtro em tempo real
  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const renderItem = ({ item }: { item: Produto }) => (
    <TouchableOpacity style={styles.cardItem} onPress={() => abrirOpcoesProduto(item)}>
      <View style={styles.infoArea}> 
        <Text style={styles.nomeProduto}>{item.nome}</Text>
        <Text style={styles.detalheProduto}>Estoque: {item.quantidadeAtual}</Text>
      </View>
      
      <View 
        style={[
          styles.statusBadge, 
          { backgroundColor: item.quantidadeAtual > item.quantidadeMinima ? '#5EB366' : '#e74c3c' }
        ]}
      >
        <Text style={styles.statusText}>
          {item.quantidadeAtual > item.quantidadeMinima ? 'OK' : 'REPOR'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.titulo}>{nome ? nome : 'Estoque Geral'}</Text>
        <View style={{ width: 24 }} /> 
      </View>

      {/* NOVO: Barra de Pesquisa */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produto..."
          value={busca}
          onChangeText={setBusca}
        />
        {/* Mostra um X para limpar a busca apenas se tiver algo digitado */}
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca('')}>
            <Feather name="x-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#89CBBF" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={produtosFiltrados} // NOVO: Passamos a lista filtrada no lugar da original
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {busca.length > 0 ? 'Nenhum produto encontrado na busca.' : 'Nenhum produto nesta categoria.'}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFF'
  },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  
  /* NOVO: Estilos da barra de busca */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  /* ------------------------------- */

  lista: { padding: 20 },
  cardItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 1
  },
  infoArea: {
    flex: 1,
  },
  nomeProduto: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  detalheProduto: { fontSize: 14, color: '#7f8c8d', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }
});