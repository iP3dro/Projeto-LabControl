import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../src/api';
import { auth } from '../src/firebaseConfig';

export default function CadastroProduto() {
  const params = useLocalSearchParams(); // Captura os parâmetros enviados por outras telas
  
  const [nome, setNome] = useState('');
  const [quantidadeAtual, setQuantidadeAtual] = useState('');
  const [quantidadeMinima, setQuantidadeMinima] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null); 
  const [idEditando, setIdEditando] = useState<number | null>(null); // Controla se é edição
  
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const responseCat = await api.get('/categorias');
        setCategorias(responseCat.data);

        // Verifica se estam editando um produto
        if (params.produtoEditando) {
          const produto = JSON.parse(params.produtoEditando as string);
          
          setIdEditando(produto.id);
          setNome(produto.nome);
          setQuantidadeAtual(produto.quantidadeAtual.toString());
          setQuantidadeMinima(produto.quantidadeMinima.toString());
          
          if (produto.categoria) {
            setCategoriaId(produto.categoria.id);
          }
        } else if (responseCat.data.length > 0) {
          // Se for produto novo, apenas seleciona a primeira categoria por padrão
          setCategoriaId(responseCat.data[0].id);
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoadingCategorias(false);
      }
    };

    carregarDados();
  }, [params]);

  const handleSalvar = async () => {
    if (!nome || !quantidadeAtual || !quantidadeMinima || !categoriaId) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos e selecione uma categoria.');
      return;
    }

    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const payloadProduto = {
        nome: nome,
        quantidadeAtual: parseInt(quantidadeAtual),
        quantidadeMinima: parseInt(quantidadeMinima),
        categoria: { id: categoriaId }
      };

      if (idEditando) {
        await api.put(`/produtos/${idEditando}`, payloadProduto, config);
        Alert.alert('Sucesso!', 'Produto atualizado com sucesso!');
      } else {
        await api.post('/produtos', payloadProduto, config);
        Alert.alert('Sucesso!', 'Produto cadastrado com sucesso!');
      }
      
      router.back(); 
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      Alert.alert('Erro', 'Não foi possível conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerBrand}>LabControl</Text>
        <Text style={styles.headerTitle}>{idEditando ? 'Editar Produto' : 'Novo Produto'}</Text>
      </View>

      <ScrollView style={styles.body}>
        <Text style={styles.label}>Categoria</Text>
        
        {loadingCategorias ? (
          <ActivityIndicator color="#89CBBF" />
        ) : (
          <View style={styles.chipsContainer}>
            {categorias.map((cat: any) => (
              <TouchableOpacity 
                key={cat.id}
                style={[styles.chip, categoriaId === cat.id && styles.chipSelecionado]}
                onPress={() => setCategoriaId(cat.id)}
              >
                <Text style={[styles.chipTexto, categoriaId === cat.id && styles.chipTextoSelecionado]}>
                  {cat.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {categorias.length === 0 && !loadingCategorias && (
          <Text style={{color: 'red', marginBottom: 10}}>Crie uma categoria na Home primeiro!</Text>
        )}

        <Text style={styles.label}>Nome do Produto</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Porcelana Noritake"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>Quantidade Atual</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 50"
          keyboardType="numeric"
          value={quantidadeAtual}
          onChangeText={setQuantidadeAtual}
        />

        <Text style={styles.label}>Quantidade Mínima</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 10"
          keyboardType="numeric"
          value={quantidadeMinima}
          onChangeText={setQuantidadeMinima}
        />

        <TouchableOpacity style={styles.botao} onPress={handleSalvar} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.botaoTexto}>{idEditando ? 'Salvar Alterações' : 'Salvar Produto'}</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.botaoCancelar} onPress={() => router.back()}>
          <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: {
    backgroundColor: '#89CBBF',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 30,
    marginBottom: 20,
  },
  headerBrand: { color: '#FFFFFF', fontSize: 20, fontWeight: '600', opacity: 0.8 },
  headerTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginTop: 5 },
  body: { flex: 1, paddingHorizontal: 20 },
  label: { fontSize: 16, color: '#333', fontWeight: '600', marginBottom: 8, marginTop: 10 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  chip: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    elevation: 1,
  },
  chipSelecionado: { backgroundColor: '#89CBBF', borderColor: '#89CBBF' },
  chipTexto: { color: '#888', fontSize: 14, fontWeight: '600' },
  chipTextoSelecionado: { color: '#FFFFFF', fontWeight: 'bold' },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
    elevation: 2,
  },
  botao: { backgroundColor: '#89CBBF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  botaoTexto: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  botaoCancelar: { padding: 16, alignItems: 'center', marginTop: 5, marginBottom: 30 },
  botaoCancelarTexto: { color: '#bdc3c7', fontSize: 16, fontWeight: '600' },
});