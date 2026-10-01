# API Flow — Full Execution Plan

> **Architecture:** Linear sequential node chain only (Node 1 → Node 2 → Node 3 → ... in order)
> **Stack:** Node.js, TypeScript, Express, MySQL, Redis, BullMQ, React + React Flow

---

## Current State ✅
- Auth (JWT, register/login)
- Flow CRUD (create, get, update, delete)
- Node Slice CRUD with `node_order`, security, reordering on delete
- Layered architecture (Routes → Controllers → Services → Repository)

---

## Phase 1: Complete Node API Configuration (1–2 days)

This is the **config stored inside each node** — the actual HTTP call details.

### What needs to happen:
Each node needs to store:
- `method` (GET, POST, PUT, PATCH, DELETE)
- `base_url` (https://api.example.com)
- `endpoint` (/users/login)
- `headers` (JSON)
- `body` (JSON)
- `auth_token` (encrypted string)

### Tasks:
- [ ] Fix `getAllNodeFlow` query bug in `node.details.repository.ts`
  - Current: `WHERE id = ? AND flow_id = ?` (uses user id wrongly)
  - Fix to: `WHERE user_id = ? AND flow_id = ? ORDER BY id ASC`
- [ ] Add `PATCH /node-api/:flowId/:id` route + controller + service + repository (update node API config)
  - Check `affectedRows === 0` → return 404
- [ ] Add `user_id` security to `deleteNodeFlow` and `getNodeFlow` queries
  - Same IDOR issue as node.repository had before the fix

### Table Relationship to confirm:
```
flow (id) → node (flow_id, node_order) → node_api (linked to node.id? or same flow_id?)
```
> ⚠️ **Important:** Clarify if `node_api` rows link to `node.id` or just `flow_id`.
> For linear execution, `node_api` should link to `node.id` (1-to-1 relationship).

---

## Phase 2: Execution Engine Core (3–5 days)

This is the **heart of the project**. It takes a flow, fetches all nodes in `node_order ASC`, runs them one by one, and passes data from each step to the next.

### 2A: Context Store (In-Memory per Execution)

Create a `ExecutionContext` object that lives for the duration of one flow run:

```typescript
// src/services/runner/execution.context.ts

interface StepResult {
    node_order: number;
    node_title: string;
    status: "success" | "failed" | "skipped";
    statusCode: number;
    responseBody: any;
    responseHeaders: Record<string, string>;
    durationMs: number;
    error?: string;
}

interface ExecutionContext {
    flowId: number;
    userId: number;
    runId: string;           // UUID for this run
    steps: StepResult[];     // Results accumulate here as steps execute
}
```

### 2B: Template Interpolator

This is what makes your project special — dynamic data passing between nodes.

Users write in their node config:
```
URL: https://api.example.com/users/{{step_1.body.userId}}
Headers: { "Authorization": "Bearer {{step_1.body.token}}" }
Body: { "orderId": "{{step_2.body.id}}" }
```

Build a function:
```typescript
// src/services/runner/interpolator.ts

export function interpolate(template: string, context: ExecutionContext): string {
    // Replace {{step_N.body.key}} with actual values from context.steps[N-1].responseBody.key
    // Use regex: /\{\{step_(\d+)\.(body|headers)\.([^}]+)\}\}/g
}
```

**Dry run example:**
- Node 1 runs: `POST /login` → returns `{ token: "abc123", userId: 42 }`
- Node 2's URL has: `https://api.example.com/users/{{step_1.body.userId}}`
- Interpolator replaces it → `https://api.example.com/users/42`
- Node 2's header has: `Authorization: Bearer {{step_1.body.token}}`
- Interpolator replaces it → `Authorization: Bearer abc123`

### 2C: HTTP Node Runner

```typescript
// src/services/runner/node.runner.ts

import axios from "axios";

export async function runSingleNode(
    nodeConfig: NodeApiConfig,      // method, base_url, endpoint, headers, body, token
    context: ExecutionContext       // to interpolate {{step_N.x.y}} placeholders
): Promise<StepResult> {
    const startTime = Date.now();
    
    // 1. Interpolate all fields
    const resolvedUrl = interpolate(nodeConfig.base_url + nodeConfig.endpoint, context);
    const resolvedHeaders = interpolate(JSON.stringify(nodeConfig.headers), context);
    const resolvedBody = interpolate(JSON.stringify(nodeConfig.body), context);

    try {
        // 2. Make the HTTP call
        const response = await axios({
            method: nodeConfig.method,
            url: resolvedUrl,
            headers: {
                ...JSON.parse(resolvedHeaders),
                ...(nodeConfig.auth_token ? { Authorization: `Bearer ${decrypt(nodeConfig.auth_token)}` } : {})
            },
            data: resolvedBody ? JSON.parse(resolvedBody) : undefined,
            timeout: 15000,     // 15 second timeout per node
        });

        return {
            node_order: nodeConfig.node_order,
            node_title: nodeConfig.node_title,
            status: "success",
            statusCode: response.status,
            responseBody: response.data,
            responseHeaders: response.headers as any,
            durationMs: Date.now() - startTime,
        };
    } catch (error: any) {
        // 3. Capture failure — do not throw, record it in context
        return {
            node_order: nodeConfig.node_order,
            node_title: nodeConfig.node_title,
            status: "failed",
            statusCode: error.response?.status ?? 0,
            responseBody: error.response?.data ?? null,
            responseHeaders: {},
            durationMs: Date.now() - startTime,
            error: error.message,
        };
    }
}
```

### 2D: Flow Runner (Orchestrator)

```typescript
// src/services/runner/flow.runner.ts

export async function runFlow(flowId: number, userId: number, runId: string): Promise<void> {
    // 1. Fetch all nodes for this flow in order
    const nodes = await getNodesWithConfig(flowId, userId); // JOIN node + node_api

    // 2. Initialize execution context
    const context: ExecutionContext = { flowId, userId, runId, steps: [] };

    // 3. Save run as "running" in execution_log table
    await saveRunStatus(runId, flowId, userId, "running");

    // 4. Execute nodes sequentially
    for (const node of nodes) {
        const result = await runSingleNode(node, context);
        context.steps.push(result);

        // 5. Save step result to DB
        await saveStepResult(runId, result);

        // 6. If node failed — stop the chain (linear flow: no point continuing)
        if (result.status === "failed") {
            await saveRunStatus(runId, flowId, userId, "failed");
            return;
        }
    }

    // 7. All nodes succeeded
    await saveRunStatus(runId, flowId, userId, "completed");
}
```

### 2E: Database Tables for Execution Logs

```sql
-- Stores one record per flow run
CREATE TABLE execution_log (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    run_id VARCHAR(36) NOT NULL UNIQUE,    -- UUID
    flow_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('running', 'completed', 'failed') NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (flow_id) REFERENCES flow(id) ON DELETE CASCADE
);

-- Stores one record per node step per run
CREATE TABLE execution_step_log (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    run_id VARCHAR(36) NOT NULL,
    node_order INT NOT NULL,
    node_title VARCHAR(255),
    status ENUM('success', 'failed', 'skipped') NOT NULL,
    status_code INT,
    response_body JSON,
    duration_ms INT,
    error_message TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (run_id) REFERENCES execution_log(run_id) ON DELETE CASCADE
);
```

---

## Phase 3: Redis + BullMQ Queue (2–3 days)

### Why this is needed:
- User clicks "Run Flow"
- Express CANNOT run the flow synchronously (it blocks the server)
- Instead: Push the job to a queue → return immediately → worker picks it up in background

### 3A: Install dependencies
```bash
npm install bullmq ioredis uuid axios
npm install @types/uuid -D
```

### 3B: Queue Setup
```typescript
// src/queue/flow.queue.ts
import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export const flowQueue = new Queue("flow-execution", {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 2,
        backoff: { type: "exponential", delay: 3000 },
    },
});
```

### 3C: Worker (Separate Process)
```typescript
// src/workers/flow.worker.ts
import { Worker } from "bullmq";
import { runFlow } from "../services/runner/flow.runner";
import { redisConnection } from "../config/redis";

const worker = new Worker(
    "flow-execution",
    async (job) => {
        const { flowId, userId, runId } = job.data;
        await runFlow(flowId, userId, runId);
    },
    {
        connection: redisConnection,
        concurrency: 5,     // Max 5 flows running simultaneously
    }
);

worker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed:`, error.message);
});
```

### 3D: Run Endpoint
```typescript
// POST /flow/:id/run
export const runFlowController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const flowId = Number(req.params.id);
        const userId = Number(req.user?.id);
        const runId = uuidv4();

        // Push to queue — do NOT await
        await flowQueue.add("run-flow", { flowId, userId, runId });

        // Return immediately with runId so frontend can poll for status
        return responseStatus(res, 202, "Flow execution started", { runId });
    } catch (error) {
        next(error);
    }
};
```

### 3E: Status Polling Endpoint
```typescript
// GET /flow/run/:runId
// Returns execution_log + all execution_step_log rows for that runId
// Frontend polls this every 2 seconds to show real-time progress
```

---

## Phase 4: Security — Encrypt API Tokens at Rest (1 day)

Tokens and API keys stored in `node_api.node_token` must NEVER be plain text.

```typescript
// src/utils/crypto.ts
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const SECRET_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, "hex"); // 32-byte hex key in .env

export function encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    // Store as: iv:authTag:encryptedData (all hex)
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(ciphertext: string): string {
    const [ivHex, authTagHex, encryptedHex] = ciphertext.split(":");
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
    return decipher.update(Buffer.from(encryptedHex, "hex")).toString("utf8") + decipher.final("utf8");
}
```

Use `encrypt()` before saving to DB, `decrypt()` before using in the HTTP runner.

---

## Phase 5: Frontend — React + React Flow Canvas (5–7 days)

### Stack:
- React (Vite + TypeScript)
- React Flow (node graph canvas library)
- TanStack Query (data fetching + polling)
- Axios

### Pages:
1. **Login / Register**
2. **Dashboard** — List of all flows, create new flow button
3. **Flow Canvas Page** — The main feature page

### Flow Canvas Page:
```
┌─────────────────────────────────────────────────────┐
│  [Flow Name]                    [Run Flow] [Save]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐  │
│  │  Node 1  │─────▶│  Node 2  │─────▶│  Node 3  │  │
│  │ POST     │      │ GET      │      │ PUT      │  │
│  │ /login   │      │ /profile │      │ /update  │  │
│  └──────────┘      └──────────┘      └──────────┘  │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Execution Log Panel (shows step status in real-time)│
│  ✅ Node 1 — 200 OK — 312ms                         │
│  ✅ Node 2 — 200 OK — 187ms                         │
│  🔄 Node 3 — Running...                             │
└─────────────────────────────────────────────────────┘
```

### Real-time Execution Status:
- After clicking "Run Flow", get back `runId`.
- Poll `GET /flow/run/:runId` every 2 seconds.
- Update node colors in the canvas: Grey → Blue (running) → Green (success) → Red (failed).

---

## Phase 6: Polish & Resume-Ready Features (2–3 days)

- [ ] **Execution History Page** — Show all past runs for a flow with expand-to-see-steps
- [ ] **Error messages in UI** — Show exactly which node failed and why
- [ ] **README.md** — Architecture diagram, setup instructions, screenshots/demo GIF
- [ ] **Environment config** — `.env.example` with all required variables documented

---

## Full Timeline

| Phase | What | Duration |
| :--- | :--- | :--- |
| Phase 1 | Complete Node API Config | 1–2 days |
| Phase 2 | Execution Engine (Runner + Context + Interpolator) | 3–5 days |
| Phase 3 | Redis + BullMQ Queue + Worker | 2–3 days |
| Phase 4 | AES-256 Token Encryption | 1 day |
| Phase 5 | React Frontend + React Flow Canvas | 5–7 days |
| Phase 6 | Polish + README + History | 2–3 days |
| **Total** | | **~3–4 weeks** |

---

## Order of Implementation (Daily Focus)

```
Week 1:  Phase 1 → Phase 2A (Context + Interpolator)
Week 2:  Phase 2B (HTTP Runner) → Phase 2C (Flow Orchestrator) → Phase 2D (DB tables + logs)
Week 3:  Phase 3 (Redis + BullMQ) → Phase 4 (Encryption)
Week 4:  Phase 5 (React Frontend + Canvas)
+ 3 days: Phase 6 (Polish + README)
```

---

## What You Can Say in an Interview After This

> *"I built an API orchestration engine where users visually chain REST API calls in a sequential flow. Each node stores encrypted credentials and HTTP config. When a user triggers a run, the Express server pushes the job to a BullMQ queue backed by Redis and returns a 202 immediately. A separate worker process picks up the job, executes each node in order, interpolates dynamic values from previous step responses (e.g., {{step_1.body.token}}), stores execution logs per step in MySQL, and the React frontend polls for real-time status updates rendered on a React Flow canvas."*

That answer gets you a **Strong Hire** at any product startup.
