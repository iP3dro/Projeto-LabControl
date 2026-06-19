import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../src/api';
import { auth } from '../src/firebaseConfig';

export default function HomeScreen() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [nomeNovaCategoria, setNomeNovaCategoria] = useState('');
  const [salvandoCategoria, setSalvandoCategoria] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);

  useEffect(() => {
    buscarCategorias();
  }, []);

  const buscarCategorias = async () => {
    try {
      const response = await api.get('/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNovaCategoria = () => {
    setNomeNovaCategoria('');
    setIdEditando(null);
    setModalVisivel(true);
  };

  const salvarCategoria = async () => {
    if (!nomeNovaCategoria.trim()) {
      Alert.alert('Atenção', 'Digite um nome para a categoria.');
      return;
    }

    setSalvandoCategoria(true);
    try {
      if (idEditando) {
        // Update (PUT)
        await api.put(`/categorias/${idEditando}`, { id: idEditando, nome: nomeNovaCategoria });
      } else {
        // Create (POST)
        await api.post('/categorias', { nome: nomeNovaCategoria });
      }
      
      setModalVisivel(false);
      buscarCategorias(); 
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      Alert.alert('Erro', 'Não foi possível salvar a categoria.');
    } finally {
      setSalvandoCategoria(false);
    }
  };

  const excluirCategoria = async (id: number) => {
    try {
      await api.delete(`/categorias/${id}`);
      buscarCategorias();
      Alert.alert('Sucesso', 'Categoria excluída!');
    } catch (error) {
      console.error("Erro ao excluir:", error);
      Alert.alert('Aviso', 'Não é possível excluir uma categoria que tenha produtos cadastrados nela.');
    }
  };

  // Menu de opções nos 3 pontinhos
  const abrirOpcoesCategoria = (categoria: any) => {
    Alert.alert('Opções', `Categoria: ${categoria.nome}`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Editar', onPress: () => {
          setNomeNovaCategoria(categoria.nome);
          setIdEditando(categoria.id);
          setModalVisivel(true);
        } 
      },
      { text: 'Excluir', onPress: () => {
          Alert.alert('Confirmar', 'Deseja mesmo excluir esta categoria?', [
            { text: 'Não', style: 'cancel' },
            { text: 'Sim, excluir', onPress: () => excluirCategoria(categoria.id), style: 'destructive' }
          ])
        }, style: 'destructive' 
      }
    ]);
  };

  const fazerLogout = () => {
    signOut(auth).then(() => router.replace('/' as any));
  };

  const irParaEstoque = (idCategoria: number, nomeCategoria: string) => {
    router.push({ pathname: '/estoque', params: { id: idCategoria, nome: nomeCategoria } } as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerBrand}>LabControl</Text>
        <Text style={styles.headerTitle}>Painel Principal</Text>
      </View>

      <ScrollView style={styles.body}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Estoque</Text>
          <TouchableOpacity onPress={abrirModalNovaCategoria} style={styles.btnAddCategoria}>
            <Feather name="plus-circle" size={20} color="#89CBBF" />
            <Text style={styles.btnAddCategoriaTexto}>Nova</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#89CBBF" style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.grid}>
            {categorias.map((categoria: any) => (
              <TouchableOpacity 
                key={categoria.id} 
                style={styles.card} 
                onPress={() => irParaEstoque(categoria.id, categoria.nome)}
              >
                <TouchableOpacity 
                  style={styles.btnOpcoesCard}
                  onPress={() => abrirOpcoesCategoria(categoria)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="more-vertical" size={20} color="#999" />
                </TouchableOpacity>

                <Text style={styles.cardText}>{categoria.nome}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/cadastro' as any)}>
        <FontAwesome5 name="plus" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.bottomNav}>

        <TouchableOpacity onPress={fazerLogout}>
          <Feather name="log-out" size={26} color="#bdc3c7" />
        </TouchableOpacity>
      </View>

      <Modal animationType="slide" transparent={true} visible={modalVisivel} onRequestClose={() => setModalVisivel(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{idEditando ? 'Editar Categoria' : 'Nova Categoria'}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Gessos, Pinos..."
              value={nomeNovaCategoria}
              onChangeText={setNomeNovaCategoria}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnCancelar} onPress={() => setModalVisivel(false)}>
                <Text style={styles.modalBtnCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSalvar} onPress={salvarCategoria} disabled={salvandoCategoria}>
                {salvandoCategoria ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.modalBtnSalvarTexto}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    backgroundColor: '#89CBBF',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 30,
  },
  headerBrand: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    opacity: 0.8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  btnAddCategoria: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  btnAddCategoriaTexto: {
    color: '#89CBBF',
    fontWeight: '600',
    marginLeft: 5,
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 100, 
  },
 btnOpcoesCard: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10, // Garante que o clique seja detectado
  },

  card: {
    width: '47%', 
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    height: 100, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#89CBBF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 70,
    borderTopWidth: 1,
    borderColor: '#EFEFEF',
    paddingBottom: 10, 
  },
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBtnCancelar: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    marginRight: 10,
  },
  modalBtnCancelarTexto: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalBtnSalvar: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#89CBBF',
    borderRadius: 10,
  },
  modalBtnSalvarTexto: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});