# GymCRM — Microsserviço de Estoque (MongoDB)

**Integrantes:** Igor Thiago Lara da Silva · Leonardo Ceccon Sobol · Leonardo Godoi Siemens · Rafael Augusto de Oliveira Souza

Responsável pelo **controle de estoque** da academia (suplementos, acessórios, vestuário, materiais de manutenção — RF06) com **alerta de estoque mínimo** (RF07). Persistência no **MongoDB Atlas (Free Tier)**.
Arquitetura: `Microfrontend → API Gateway → BFF → (MS Estoque | MS Matrículas | Azure Function)`.

## Arquitetura
- **Clean Architecture:** `src/domain` (entidade `Product`, categorias, regra `lowStock`, `ProductRepository`) · `src/application` (casos de uso) · `src/infrastructure` (driver MongoDB) · `src/api` (controllers REST, DTOs, Swagger).
- **Vertical Slice:** `src/application/features/` → `create-product`, `get-product`, `list-products`, `list-low-stock-products`, `update-product`, `delete-product`. Uma feature nunca importa outra.
- **Database per service:** único dono do banco `gymcrm_estoque`.
- **Regra de alerta:** `lowStock = minStock > 0 && stock <= minStock`. Entradas/saídas de estoque são feitas ajustando o saldo (`PUT`).

## Endpoints
| Método | Rota | Descrição |
|---|---|---|
| POST | `/products` | Cadastra item (`name`, `price`, `stock`, `category`, `minStock`) |
| GET | `/products?page=&limit=` | Lista itens (paginado) |
| GET | `/products/low-stock` | **Alerta:** itens com saldo ≤ estoque mínimo |
| GET | `/products/:id` | Busca por id |
| PUT | `/products/:id` | Atualiza item / saldo |
| DELETE | `/products/:id` | Remove item |
| GET | `/health` · `/swagger` | Health check (ping no Mongo) · Swagger UI |

Categorias: `SUPPLEMENT`, `ACCESSORY`, `APPAREL`, `MAINTENANCE`, `OTHER`. Erros: `{ "code": "PRODUCT_NOT_FOUND" | "VALIDATION_ERROR", "message": "..." }`.

## Variáveis de ambiente
| Variável | Descrição | Padrão |
|---|---|---|
| `PORT` | Porta HTTP | `3001` |
| `MONGODB_URI` | Connection string do Atlas | — (obrigatória) |
| `MONGODB_DB` | Nome do banco | `gymcrm_estoque` |

## Rodar
```bash
npm install
cp .env.example .env    # preencha MONGODB_URI
npm run start:dev       # Swagger: http://localhost:3001/swagger
```
Docker: `docker build -t <usuario>/gymcrm/ms-estoque:v1 .` → `docker login` → `docker push <usuario>/gymcrm/ms-estoque:v1`

## Testes
`npm test` (todos) · `npm run test:unit` · `npm run test:e2e` · `npm run test:arch` (dependências entre camadas e vertical slice).

## MongoDB Atlas
Cluster M0 → *Database Access* (usuário/senha) → *Network Access* (`0.0.0.0/0` para a atividade) → *Connect → Drivers* (copiar a URI).
