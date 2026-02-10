# 🚀 Encurtador de URL Escalável

Este projeto é um encurtador de URLs de alta performance desenvolvido com **FastAPI** e **Redis**, focado em escalabilidade, estatísticas detalhadas e código limpo.

O sistema permite encurtar URLs, redirecionar usuários de forma eficiente (usando cache) e coletar métricas de acesso (navegador, sistema operacional, país). Agora com **interface web moderna e intuitiva**!

## 🛠️ Tecnologias Utilizadas

- **[FastAPI](https://fastapi.tiangolo.com/)**: Framework web moderno e assíncrono para construção de APIs.
- **[Redis](https://redis.io/)**: Armazenamento em memória para cache de URLs e contagem de acessos em tempo real.
- **[SQLModel](https://sqlmodel.tiangolo.com/)**: ORM moderno para interagir com o banco de dados (SQLite por padrão, fácil migração para PostgreSQL).
- **[Docker](https://www.docker.com/) & Docker Compose**: Para containerização e fácil orquestração do ambiente.
- **[Pytest](https://docs.pytest.org/)**: Framework de testes robusto para garantir a qualidade do código.
- **HTML5, CSS3, JavaScript**: Interface web moderna com tema dark e efeitos glassmorphism.

## ✨ Funcionalidades

- **Interface Web Moderna**: Design premium com tema dark, gradientes e animações suaves
- **Encurtamento de URL**: Gera códigos curtos e únicos para URLs longas
- **Redirecionamento Rápido**: Utiliza Redis para cachear URLs acessadas recentemente
- **Estatísticas Detalhadas**: Registra cada clique, coletando informações como Browser, OS e País
- **Expiração de Links**: Define um tempo de vida (TTL) para os links
- **API Documentada**: Swagger UI automático em `/docs`

## 🚀 Como Rodar

### Opção 1: Com Docker (Recomendado)

A maneira mais fácil de rodar o projeto é usando **Docker Compose**.

#### Pré-requisitos
- Docker e Docker Compose instalados

#### Passo a Passo

1. **Clone o repositório** (se aplicável) e entre na pasta:
   ```bash
   cd projeto
   ```

2. **Suba os containers**:
   ```bash
   docker-compose up --build
   ```
   Isso iniciará a API e o Redis.

3. **Acesse a aplicação**:
   - **Interface Web**: `http://localhost:8000`
   - **Documentação da API (Swagger)**: `http://localhost:8000/docs`
   - **Página de Estatísticas**: `http://localhost:8000/static/stats.html`

### Opção 2: Sem Docker (Local)

#### Pré-requisitos
- Python 3.11+
- Redis instalado e rodando

#### Passo a Passo

1. **Crie um ambiente virtual**:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   ```

2. **Instale as dependências**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Inicie o Redis** (em outro terminal):
   ```bash
   redis-server
   ```

4. **Inicie a aplicação**:
   ```bash
   python -m uvicorn app.main:app --reload
   ```

5. **Acesse a aplicação**:
   - **Interface Web**: `http://localhost:8000`
   - **Documentação da API (Swagger)**: `http://localhost:8000/docs`

## 🎨 Usando a Interface Web

### Encurtar uma URL

1. Acesse `http://localhost:8000`
2. Cole a URL longa no campo de entrada
3. (Opcional) Ajuste o tempo de expiração em dias
4. Clique em "✨ Encurtar URL"
5. Copie o link encurtado usando o botão "📋 Copiar"

### Ver Estatísticas

1. Após encurtar uma URL, clique em "📊 Ver Estatísticas"
2. Ou acesse `http://localhost:8000/static/stats.html`
3. Digite o código curto (ex: `abc123`)
4. Visualize métricas detalhadas:
   - Total de cliques
   - Navegadores utilizados
   - Sistemas operacionais
   - Países de origem

## 🧪 Como Rodar os Testes

Para garantir que tudo está funcionando, você pode rodar a suíte de testes automatizados.

Com os containers rodando:
```bash
docker-compose exec web pytest
```

Ou se tiver o ambiente local configurado:
```bash
pytest
```

## 📝 Endpoints da API

### `POST /shorten`
Cria uma nova URL encurtada.

**Body:**
```json
{
  "target_url": "https://google.com",
  "expires_in_days": 7
}
```

**Response:**
```json
{
  "target_url": "https://google.com",
  "short_url": "http://localhost:8000/abc123",
  "admin_url": "http://localhost:8000/stats/abc123",
  "expires_at": "2026-02-16T22:30:00"
}
```

### `GET /{short_code}`
Redireciona para a URL original. Se a URL estiver em cache no Redis, o redirecionamento é quase instantâneo.

### `GET /stats/{short_code}`
Retorna estatísticas de acesso.

**Response:**
```json
{
  "total_clicks": 42,
  "browsers": {"Chrome": 30, "Firefox": 12},
  "countries": {"Unknown": 42},
  "os": {"Windows": 20, "Mac OS X": 22}
}
```

## 📂 Estrutura do Projeto

```
projeto/
├── app/
│   ├── static/         # Interface Web
│   │   ├── index.html
│   │   ├── stats.html
│   │   ├── css/
│   │   │   └── styles.css
│   │   └── js/
│   │       └── app.js
│   ├── api/            # Definição dos endpoints
│   ├── core/           # Configurações (DB, Logs, Settings)
│   ├── models/         # Modelos do Banco de Dados
│   ├── schemas/        # Schemas Pydantic (Request/Response)
│   ├── services/       # Regras de Negócio (Cache, Shortener, Stats)
│   └── main.py         # Entrypoint da aplicação
├── tests/              # Testes Unitários e de Integração
├── Dockerfile          # Configuração da Imagem Docker
├── docker-compose.yml  # Orquestração dos serviços
└── requirements.txt
```

## 🎨 Características da Interface

- **Design Dark Theme**: Tema escuro moderno e elegante
- **Glassmorphism**: Efeitos de vidro com blur e transparência
- **Gradientes Vibrantes**: Cores purple, pink e cyan
- **Animações Suaves**: Transições e micro-interações
- **Responsivo**: Funciona perfeitamente em mobile, tablet e desktop
- **Acessível**: Suporte a navegação por teclado e leitores de tela

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

---

**Desenvolvido com ❤️ usando FastAPI, Redis e muito café ☕**