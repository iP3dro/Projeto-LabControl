LabControl 🧪 - Gestão de Estoque Laboratorial
O LabControl é um sistema Full-Stack desenvolvido como Projeto de TCC para facilitar o controle de insumos e materiais em laboratórios. O sistema permite gerenciar categorias dinâmicas, controlar níveis críticos de estoque e garantir a segurança através de autenticação.

Este repositório contém tanto o Frontend (Mobile) quanto o Backend (API REST), organizados em suas respectivas pastas.

📁 Estrutura do Projeto (Monorepo)
/lab-control: Código-fonte do Backend (Java/Spring Boot).

/lab-control-mobile: Código-fonte do Frontend (React Native/Expo).

🛠️ Tecnologias Utilizadas
Frontend (/lab-control-mobile)
React Native / Expo: Desenvolvimento mobile multiplataforma.

Expo Router: Navegação baseada em arquivos.

Firebase Auth: Gerenciamento de usuários e tokens de segurança de sessão.

Axios: Consumo da API REST.

Backend (/lab-control)
Java 17 / Spring Boot: Estrutura robusta para o servidor.

Spring Data JPA: Persistência de dados e mapeamento objeto-relacional.

H2 Database: Banco de dados em memória para facilitar testes e avaliação.

Maven: Gerenciamento de dependências.

📋 Funcionalidades Principais
Autenticação: Login seguro via Firebase.

Painel Principal: Visualização de categorias dinâmicas carregadas diretamente do banco de dados.

Filtro Inteligente: Ao selecionar uma categoria, o sistema exibe exclusivamente os produtos vinculados a ela.

Alertas de Estoque: Indicação visual de status (OK / REPOR) para produtos de acordo com a quantidade mínima estipulada.

Gestão Total: Funcionalidade de adicionar, editar e excluir (CRUD) produtos e categorias de forma intuitiva.

⚙️ Como Executar o Projeto Localmente
1. Iniciando o Backend (Spring Boot)
Certifique-se de ter o JDK 17 e o Maven instalados em sua máquina.

# Navegue até a pasta do backend
cd lab-control

# Execute o projeto com o Maven
mvn spring-boot:run
A API estará rodando em http://localhost:8080.

2. Iniciando o Frontend (React Native)
Certifique-se de ter o Node.js instalado.

Nota: Se for testar no celular físico, atualize o IP no arquivo src/api.ts para o IP local da sua máquina.

# Navegue até a pasta do frontend
cd lab-control-mobile

# Instale as dependências
npm install

# Inicie o servidor do Expo
npx expo start
Utilize o aplicativo Expo Go em seu smartphone para ler o QR Code ou execute em um emulador Android/iOS.