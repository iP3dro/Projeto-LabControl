import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
      carregarProdutos(); // Atualiza a lista após apagar
      Alert.alert('Sucesso', 'Produto removido do estoque.');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível excluir o produto.');
    }
  };

  // Menu ao clicar no card do produto
  const abrirOpcoesProduto = (item: Produto) => {
    Alert.alert('Opções do Produto', item.nome, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Editar', onPress: () => {
          // Navega para a tela de cadastro enviando os dados do produto para editar
          router.push({
            pathname: '/cadastro',
            params: { 
              produtoEditando: JSON.stringify(item) // Envia os dados para a tela preencher os campos
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

      {carregando ? (
        <ActivityIndicator size="large" color="#89CBBF" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={produtos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum produto nesta categoria.</Text>}
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