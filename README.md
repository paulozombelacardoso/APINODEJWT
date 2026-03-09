# API Node.js com JWT Authentication

Um projeto educacional que demonstra como implementar autenticação com **JWT (JSON Web Tokens)** e rotas públicas/privadas em uma API Node.js.

## 📋 Sobre o Projeto

Este projeto foi criado para aprender e praticar:
- ✅ Autenticação com JWT (JSON Web Tokens)
- ✅ Diferença entre rotas públicas e privadas
- ✅ Hash de senhas com bcrypt
- ✅ Integração com banco de dados MongoDB via Prisma ORM
- ✅ Middleware de autenticação em Express.js

### Arquitetura do Projeto

O projeto utiliza uma arquitetura simples e didática:
- **Rotas Públicas**: Cadastro e Login (sem autenticação necessária)
- **Rotas Privadas**: Listar Usuários (requer token JWT válido)
- **Middleware de Auth**: Verifica e valida o token JWT em rotas protegidas

---

## 🚀 Fases de Construção

### Fase 1: Configuração Inicial

#### 1.1 Criar estrutura do projeto
```bash
mkdir NodeJwt
cd NodeJwt
npm init -y
```

#### 1.2 Instalar dependências principais
```bash
npm install express jsonwebtoken bcrypt dotenv @prisma/client
npm install -D prisma
```

**Dependências utilizadas:**
- `express`: Framework web
- `jsonwebtoken`: Geração e verificação de JWT
- `bcrypt`: Hash seguro de senhas
- `dotenv`: Variáveis de ambiente
- `@prisma/client`: ORM para MongoDB
- `prisma`: CLI do Prisma (dev)

#### 1.3 Configurar arquivo `.env`
```bash
touch .env
```

**Conteúdo do `.env`:**
```
DATABASE_URL="mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/dbname?appName=Cluster0"
JWT_SECRET="sua_chave_secreta_aqui"
```

> **Nota:** Para gerar uma chave JWT segura de 32 bytes:
```javascript
const crypto = require('crypto');
console.log(crypto.randomBytes(32).toString('hex'));
```

---

### Fase 2: Configurar Prisma e Banco de Dados

#### 2.1 Inicializar Prisma
```bash
npx prisma init --db
```

#### 2.2 Definir o schema do banco de dados

Arquivo: [prisma/schema.prisma](prisma/schema.prisma)

```prisma
datasource db {
  provider = "mongodb"
  url = env("DATABASE_URL")
}

model User {
  id       String  @id @default(auto()) @map("_id") @db.ObjectId
  email    String  @unique
  name     String
  password String
}
```

#### 2.3 Sincronizar com o banco de dados
```bash
npx prisma db push
```

#### 2.4 Visualizar dados (opcional)
```bash
npx prisma studio
```

---

### Fase 3: Implementar Estrutura de Pastas

Criar a estrutura de diretórios:
```
NodeJwt/
├── middlewares/
│   └── auth.js          # Middleware de autenticação JWT
├── routes/
│   ├── public.js        # Rotas públicas (cadastro, login)
│   └── private.js       # Rotas privadas (protegidas)
├── prisma/
│   └── schema.prisma    # Schema do banco de dados
├── .env                 # Variáveis de ambiente
├── server.js            # Arquivo principal
└── package.json
```

---

### Fase 4: Desenvolver o Middleware de Autenticação

Arquivo: [middlewares/auth.js](middlewares/auth.js)

O middleware verifica se o token JWT é válido:
1. Extrai o token do header `Authorization`
2. Remove o prefixo `Bearer `
3. Verifica a assinatura do token usando a `JWT_SECRET`
4. Se válido, passa o usuário para a próxima rota

```javascript
const auth = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token)
        return res.status(401).json({message: "Acesso Negado!"});
    
    try {
        const tokenReplace = token.replace('Bearer ', '');
        const decoded = jwt.verify(tokenReplace, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({message: "Token Inválido"});
    }
}
```

---

### Fase 5: Implementar Rotas Públicas

Arquivo: [routes/public.js](routes/public.js)

#### Endpoint: POST `/cadastro`
Registra um novo usuário com senha criptografada.

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response (Sucesso):**
```json
{
  "message": "user Cadastrado com Sucesso",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "joao@example.com",
    "name": "João Silva"
  }
}
```

#### Endpoint: POST `/login`
Autentica o usuário e retorna um JWT válido por 24 horas.

**Request:**
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response (Sucesso):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Fluxo de autenticação:**
1. Busca o usuário no banco de dados pelo email
2. Compara a senha fornecida com o hash armazenado (bcrypt)
3. Se válida, gera um JWT assinado com a chave secreta
4. Token expira em 24 horas (`expiresIn: '1d'`)

---

### Fase 6: Implementar Rotas Privadas

Arquivo: [routes/private.js](routes/private.js)

#### Endpoint: GET `/listar-usuarios`
Lista todos os usuários registrados (requer autenticação).

**Headers necessários:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "message": "Listados com sucesso!",
  "user": [
    {
      "id": "507f1f77bcf86cd799439011",
      "email": "joao@example.com",
      "name": "João Silva"
    }
  ]
}
```

---

### Fase 7: Configurar Servidor Principal

Arquivo: [server.js](server.js)

```javascript
import express from 'express'
import publicRoutes from './routes/public.js'
import privateRoutes from './routes/private.js'
import auth from './middlewares/auth.js'

const app = express();

app.use(express.json());

// Rotas públicas (sem autenticação)
app.use('/', publicRoutes);

// Rotas privadas (com middleware de autenticação)
app.use('/', auth, privateRoutes);

const PORT = 3000;
app.listen(PORT, (error) => {
    if (error) {
        console.log("Something went wrong in server");
    }
    console.log(`Server Running on Port ${PORT}`);
});
```

---

## 📦 Instalação Completa

### 1. Clonar o repositório
```bash
git clone https://github.com/paulozombelacardoso/APINODEJWT.git
cd APINODEJWT
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

### 4. Sincronizar banco de dados
```bash
npx prisma db push
```

### 5. Iniciar o servidor
```bash
node server.js
```

O servidor estará disponível em: `http://localhost:3000`

---

## 🧪 Testando a API

### Ferramenta recomendada: Postman ou Insomnia

#### 1. Teste de Cadastro
```
POST http://localhost:3000/cadastro
Content-Type: application/json

{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "password": "senha456"
}
```

#### 2. Teste de Login
```
POST http://localhost:3000/login
Content-Type: application/json

{
  "email": "maria@example.com",
  "password": "senha456"
}
```
*Copie o token retornado*

#### 3. Teste de Acesso à Rota Privada
```
GET http://localhost:3000/listar-usuarios
Authorization: Bearer {seu_token_aqui}
```

---

## 🔐 Conceitos-Chave Implementados

### JWT (JSON Web Token)
Um JWT é composto por três partes:
- **Header**: Tipo de token e algoritmo (HS256)
- **Payload**: Dados do usuário (claims) + tempo de expiração
- **Signature**: Assinatura digital criada com a chave secreta

### bcrypt
Função de hash unidirecional para armazenar senhas:
- Cada hash é único (usa "salt")
- Impossível recuperar a senha original
- Comparação segura com `bcrypt.compare()`

### Middleware de Autenticação
Intercepta requisições em rotas protegidas e:
1. Valida a presença do token
2. Verifica a assinatura JWT
3. Extrai informações do usuário
4. Permite ou nega acesso

---

## 📁 Estrutura do Projeto

```
NodeJwt/
├── middlewares/
│   └── auth.js                    # Middleware JWT
├── routes/
│   ├── public.js                  # POST /cadastro, POST /login
│   └── private.js                 # GET /listar-usuarios
├── prisma/
│   └── schema.prisma              # Modelo de dados
├── generated/                     # Arquivos gerados pelo Prisma
├── .env                           # Variáveis de ambiente
├── .env.example                   # Exemplo de configuração
├── server.js                      # Arquivo principal da aplicação
├── package.json                   # Dependências do projeto
└── README.md                      # Este arquivo
```

---

## 🛠 Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Node.js | - | Runtime JavaScript |
| Express | 5.2.1 | Framework web |
| JWT | 9.0.3 | Autenticação |
| bcrypt | 6.0.0 | Hash de senhas |
| Prisma | 6.19.0 | ORM |
| MongoDB | - | Banco de dados |
| dotenv | 17.3.1 | Variáveis de ambiente |

---

## 📚 Recursos Adicionais

- [Documentação Express.js](https://expressjs.com/)
- [JWT Introduction](https://jwt.io/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## 📝 Notas Importantes

⚠️ **Segurança:**
- Nunca commit o arquivo `.env` (adicione ao `.gitignore`)
- Use uma chave JWT_SECRET forte em produção
- Implemente rate limiting em rotas de login
- Adicione validações mais robustas dos dados de entrada

⚠️ **Produção:**
- Use variáveis de ambiente seguras
- Implemente HTTPS
- Adicione logs e monitoramento
- Configure CORS adequadamente
- Implemente refresh tokens

---

## 👨‍💻 Autor

Paulo Zombela Cardoso

---

## 📄 Licença

ISC License - Veja o arquivo package.json para detalhes

---

## 🤝 Contribuições

Este é um projeto educacional. Sinta-se livre para fazer fork e modificar conforme necessário para seu aprendizado!
