# APIFlow — Distributed API Workflow & Execution Engine ⚡

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg?style=flat-square&logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg?style=flat-square&logo=express)](https://expressjs.com)
[![BullMQ](https://img.shields.io/badge/Queue-BullMQ-orange.svg?style=flat-square)](https://docs.bullmq.io)
[![Redis](https://img.shields.io/badge/Redis-Upstash_Cloud-red.svg?style=flat-square&logo=redis)](https://upstash.com)
[![MySQL](https://img.shields.io/badge/Database-Aiven_MySQL-blue.svg?style=flat-square&logo=mysql)](https://aiven.io)
[![Render](https://img.shields.io/badge/Backend_Deploy-Render-black.svg?style=flat-square&logo=render)](https://render.com)
[![Vercel](https://img.shields.io/badge/Frontend_Deploy-Vercel-black.svg?style=flat-square&logo=vercel)](https://vercel.com)

**APIFlow** is a distributed workflow automation platform designed to chain, execute, and monitor sequential HTTP API calls. It features asynchronous background processing, dynamic token rotation across workflow steps, and step-by-step audit logging.

---

## 🏗️ Architecture Overview

```mermaid
flowchart TD
    Client["Client (Next.js / Frontend)"]
    API["Express API Server (Render)"]
    Queue["BullMQ Queue (Upstash Redis)"]
    Worker["Background Worker (Node.js)"]
    DB[("MySQL Database (Aiven)")]
    ExtAPIs["Downstream External APIs"]

    Client -->|1. POST /execute/:flowId| API
    API -->|2. Enqueue Job| Queue
    API -.->|3. 202 Accepted + runId| Client
    Queue -->|4. Pull Job| Worker
    Worker -->|5. Fetch Node Steps| DB
    Worker -->|6. Execute HTTP Chain + Token Rotation| ExtAPIs
    Worker -->|7. Persist Step & Run Logs| DB
    Client -->|8. Poll GET /execution/:runId| API
    API -->|9. Return Live Execution Status| Client
```

---

## ✨ Key Features

- **Asynchronous Task Queue (BullMQ + Redis):**
  Offloads long-running and heavy chained HTTP requests away from the main Express HTTP thread. Immediately responds with `202 Accepted` and a unique `runId` for client polling.

- **Dynamic Token Rotation:**
  Allows responses from previous API steps (e.g., Auth tokens, IDs, session headers) to be extracted and injected dynamically into subsequent downstream request headers, query parameters, or payloads.

- **Resilience & Fault Tolerance:**
  Configured with exponential backoff retries, request timeout controls, and isolated step error handling so downstream failures are clearly audited without crashing the worker.

- **Granular Audit Logs:**
  Stores comprehensive execution history with per-step metrics: HTTP status code, request duration in milliseconds, response bodies, and specific error messages.

- **Production Cloud Architecture:**
  Engineered with TLS-encrypted connections to cloud-hosted Redis (Upstash) and SSL-enforced connection pooling to cloud-hosted MySQL (Aiven).

---

## 🛠️ Tech Stack

- **Runtime & Language:** Node.js (v20+), TypeScript
- **Framework:** Express 5.x
- **Asynchronous Job Queue:** BullMQ, ioredis
- **Database & Pooling:** MySQL 8 (`mysql2/promise`), Aiven Cloud
- **Cache & Message Broker:** Upstash Serverless Redis (TLS/SSL)
- **Validation & Security:** Zod, JWT (`jsonwebtoken`), Bcrypt, CORS
- **Hosting & Infrastructure:** Render (Backend), Vercel (Frontend)

---

## 🗄️ Database Schema

The relational schema ensures strict referential integrity with cascading updates and deletes:

```mermaid
erDiagram
    users ||--o{ flow : "owns"
    flow ||--o{ node : "contains"
    node ||--o| node_api : "configures"
    flow ||--o{ execution_log : "triggers"
    execution_log ||--o{ execution_step_log : "records"

    users {
        int id PK
        string full_name
        string email UK
        string password
        string company_name
    }
    flow {
        int id PK
        int user_id FK
        string flow_name
        string flow_description
        string token_key
    }
    node {
        int id PK
        int flow_id FK
        int user_id FK
        string node_title
        int node_order
    }
    node_api {
        int id PK
        int node_id FK
        enum node_api_method
        string node_api_base_url
        string node_api_end_point
        json node_api_headers
        json node_api_request_body
    }
    execution_log {
        int id PK
        string run_id UK
        int flow_id FK
        enum status
        timestamp started_at
        timestamp completed_at
    }
    execution_step_log {
        int id PK
        string run_id FK
        int node_id
        enum status
        int status_code
        json response_body
        int duration_ms
        text error_message
    }
```

---

## 🚀 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register a new user account |
| `POST` | `/login` | Authenticate user & return JWT token |
| `GET` | `/auth/verify` | Verify current JWT token validity |

### 🔄 Flows
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/flow` | List all flows belonging to the user |
| `POST` | `/flow` | Create a new workflow definition |
| `GET` | `/flow/:id` | Fetch details of a single workflow |
| `PATCH` | `/flow/:id` | Update workflow title/description |
| `DELETE` | `/flow/:id` | Delete workflow and cascade delete nodes |

### 🧩 Nodes & API Steps
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/node` | Add a sequential node to a flow |
| `GET` | `/node/:flowId` | Fetch all ordered nodes for a flow |
| `POST` | `/node-api` | Attach HTTP request configuration to a node |
| `PUT` | `/node-api/:id` | Update HTTP request method, URL, headers, or body |

### ⚡ Execution Engine
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/execute/:flowId` | Enqueue asynchronous flow execution (`202 Accepted`) |
| `GET` | `/execution/:runId` | Poll real-time progress and step logs for a run |

---

## ⚙️ Environment Configuration

Create a `.env` file in the root of the `/Server` directory:

```dotenv
# Server
PORT=8080
CLIENT_URL=http://localhost:3000

# Security
JWT_SECRET=your_super_secret_jwt_key

# MySQL Database (Aiven or Local)
DB_HOST=mysql-xxxxxx.aivencloud.com
DB_PORT=26389
DB_USER=avnadmin
DB_PASSWORD=your_database_password
DB_NAME=defaultdb
DB_SSL=true

# Redis Cache & Queue (Upstash or Local)
REDIS_URL=rediss://default:your_redis_password@your-endpoint.upstash.io:6379
```

---

## 💻 Local Setup & Development

### 1. Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher)
- [npm](https://www.npmjs.com)
- MySQL instance (local or cloud)
- Redis instance (local or Upstash)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/ashish-khankari/APIFlow-backend.git
cd APIFlow-backend

# Install dependencies
npm install
```

### 3. Database Initialization
Run the built-in database migration script to create all schema tables:
```bash
npx ts-node src/scripts/initDb.ts
```

### 4. Start Development Server
```bash
npm run dev
```
The server will start listening at `http://localhost:8080`.

---

## 📦 Production Build & Deployment

```bash
# Compile TypeScript to dist/
npm run build

# Start production server
npm start
```

### Deployment Configuration
- **Platform:** [Render](https://render.com) (Web Service)
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Health Check Path:** `/`

---

## 🛡️ License

This project is licensed under the [ISC License](LICENSE).
