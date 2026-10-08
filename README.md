# LabControl 🧪 — Gestão de Estoque Laboratorial

O LabControl é um sistema Full-Stack desenvolvido como Projeto de TCC para controlar insumos e materiais de um laboratório de próteses dentárias. O sistema gerencia categorias e produtos, registra cada entrada e saída de estoque com autoria, acompanha a validade por lote e gera um relatório simplificado dos itens que precisam de atenção.

## 📁 Estrutura do Projeto (Monorepo)

| Pasta | Descrição | Status |
| --- | --- | --- |
| `lab-control/` | Backend — API REST em Java/Spring Boot | Ativo |
| `lab-control-web/` | Frontend web em React + Vite | Ativo |
| `lab-control-mobile/` | Frontend mobile em React Native/Expo | **Suspenso** (desenvolvimento futuro) |

> O app mobile está congelado nesta etapa. Os arquivos permanecem no repositório para trabalho futuro, mas o foco atual são apenas o backend e o web. O antigo repositório Git aninhado foi renomeado para `lab-control-mobile/.git-backup-mobile` e está ignorado pelo Git.

## 🛠️ Tecnologias Utilizadas

**Backend (`lab-control`)**
- Java 21 / Spring Boot
- Spring Data JPA + Hibernate
- PostgreSQL
- Flyway (versionamento do schema)
- Spring Security + Firebase Admin (validação dos tokens)
- Bean Validation
- Maven

**Web (`lab-control-web`)**
- React + TypeScript
- Vite
- React Router
- Axios
- Firebase Auth

## 🗃️ Modelo de Dados

- **Categoria** — agrupador dos produtos.
- **Produto** — nome, quantidade mínima e categoria. A quantidade atual é um valor derivado (cache), sempre recalculado a partir dos lotes.
- **Lote** — representa cada entrada física de um produto, com quantidade e data de validade próprias. A validade passou a ser controlada por lote.
- **Movimentação** — histórico de entradas e saídas, com data, quantidade, lote relacionado e o usuário responsável (`usuario_uid` / `usuario_email`).

O estoque **só é alterado por movimentações** — não é editado diretamente no cadastro do produto. Isso garante rastreabilidade e evita divergências entre o saldo e o histórico.

## 📋 Funcionalidades

- Autenticação de usuários via Firebase.
- CRUD de categorias e de produtos.
- Registro de entradas (com validade opcional) e de saídas por lote.
- Histórico completo de movimentações com autoria.
- Alertas visuais de quantidade mínima (`REPOR` / `OK`).
- Controle de validade por lote e alertas de vencimento.
- Relatório de compras agrupado por categoria.
- Tratamento de sessão expirada no frontend.

## 🔐 Autenticação e Perfis

O login é feito pelo Firebase. O frontend envia o `idToken` no cabeçalho `Authorization: Bearer <token>`, validado no backend pelo SDK Admin.

Nesta etapa existe **um único perfil, com permissões de administrador**. O conceito de perfil já está isolado no backend (o filtro lê a claim `perfil` do token e assume `ADMIN` por padrão), de forma que a criação de novos perfis com permissões distintas seja uma evolução simples no futuro.

## ⚙️ Como Executar

### 1. Banco de Dados

Crie um banco PostgreSQL:

```sql
CREATE DATABASE estoquedb;
```

As credenciais padrão estão em `lab-control/src/main/resources/application.properties` (`postgres` / `postgres`). Ajuste conforme seu ambiente. O schema é criado e versionado automaticamente pelo **Flyway** na inicialização.

> ⚠️ O modelo de dados mudou (foram introduzidos os lotes). Se você já tinha o banco antigo criado, **recrie o banco** para que as migrations rodem limpas. Para preservar dados, faça um backup antes (`pg_dump`).

### 2. Backend (Spring Boot)

```bash
cd lab-control
mvnw spring-boot:run   # Windows
./mvnw spring-boot:run # Linux/macOS
```

A API sobe em `http://localhost:8080`.

### 3. Frontend Web

```bash
cd lab-control-web
npm install
npm run dev
```

O web sobe em `http://localhost:5173`. A URL da API é configurada por `VITE_API_URL` (veja `.env.example`).

## 🔌 Endpoints Principais

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/categorias` | Lista categorias |
| POST/PUT/DELETE | `/categorias`, `/categorias/{id}` | CRUD de categorias |
| GET | `/produtos` | Lista produtos (com status e próxima validade) |
| GET | `/produtos/repor` | Produtos com estoque no mínimo ou abaixo |
| POST/PUT/DELETE | `/produtos`, `/produtos/{id}` | CRUD de produtos |
| GET | `/lotes?produtoId=` | Lotes de um produto |
| GET | `/lotes/vencimento?dias=30` | Lotes próximos do vencimento |
| GET | `/movimentacoes` | Histórico de movimentações |
| POST | `/movimentacoes/entrada` | Registra entrada (cria lote) |
| POST | `/movimentacoes/saida` | Registra saída (consome lote) |
| GET | `/relatorios/compras` | Relatório de compras por categoria |

Todas as rotas exigem autenticação.
