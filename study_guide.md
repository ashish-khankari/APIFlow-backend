# API Flow — Study Guide While Building

> **The Goal:** Every time you write a line of code, understand WHY it works.
> Then write it down in your own words. That note becomes your interview answer.

---

## The Core Rule

**Never copy-paste code you don't understand.**

Before writing any piece of code, answer these 5 questions in your notes:

```
1. WHAT does this do? (one sentence)
2. WHY do we need it? (what problem does it solve)
3. WHAT HAPPENS if we remove it? (the consequence)
4. HOW does it work internally? (at least one level deeper)
5. HOW do I explain this to an interviewer in 60 seconds?
```

Apply this to EVERY concept below as you build it.

---

## Concept 1: The Event Loop (You use this right now)

### What it is
Node.js runs on a **single thread**. It can only do one thing at a time. 
But it handles thousands of requests simultaneously using the **Event Loop**.

### How it works (simplified)
```
Request comes in
       ↓
Node starts processing it
       ↓
Hits a database query (slow I/O operation)
       ↓
Node does NOT wait. It says "Go do your DB thing, call me when done"
       ↓
Node immediately picks up the NEXT request
       ↓
When DB responds, it goes into a callback queue
       ↓
Event loop picks it up and finishes the response
```

### Why this matters for your project
When your execution engine makes an HTTP call to an external API (Node 1: POST /login), 
Node.js does not sit there frozen waiting for the response.
It moves on and processes other requests while waiting.

### What happens if you BLOCK the event loop
```typescript
// WRONG - This freezes the entire server
for (let i = 0; i < 1_000_000_000; i++) { /* heavy sync work */ }

// If flow execution runs synchronously like this inside an Express route,
// no other user can make ANY request to your server until it finishes.
// This is exactly why we need BullMQ (Phase 3).
```

### Interview Answer (write this down in your own words)
> "Node.js is single-threaded but non-blocking. It uses an event loop to handle I/O 
> operations asynchronously — when a DB query or HTTP call is made, Node registers 
> a callback and immediately moves to the next task. This is why running long jobs 
> inside an Express route is dangerous — it blocks the entire event loop. 
> In my project, I offloaded flow execution to a BullMQ worker to prevent this."

---

## Concept 2: Layered Architecture (You already built this)

### What you have built
```
Routes → Controllers → Services → Repository → Database
```

### WHY each layer exists — this is what interviewers ask

| Layer | Responsibility | What if removed? |
| :--- | :--- | :--- |
| **Routes** | Maps URL + HTTP method to a controller function | No way to receive requests |
| **Controller** | Reads request, validates input, sends response | Business logic bleeds into HTTP layer |
| **Service** | Contains business logic and rules | Cannot reuse logic across controllers |
| **Repository** | All SQL queries live here ONLY | SQL mixed with business logic = nightmare to maintain |
| **Database** | Persistent storage | Data lost on restart |

### The key insight
If tomorrow you switch from MySQL to PostgreSQL, you ONLY change the Repository layer.
If tomorrow you add a CLI tool, you reuse the Service layer without touching Routes or Controllers.
This is called **Separation of Concerns**.

### Interview Answer
> "I followed a layered architecture — Routes, Controllers, Services, and Repositories. 
> Each layer has a single responsibility. Controllers handle HTTP concerns (reading params, 
> sending responses). Services contain business logic. Repositories contain all database 
> queries. This means if I switch databases, I only change the repository. If I add a 
> new interface (CLI or WebSocket), I reuse the service without touching HTTP logic."

---

## Concept 3: JWT Authentication (You already built this)

### What it is
JWT = JSON Web Token. A way for your server to confirm "this request came from user X" 
WITHOUT storing session data on the server.

### How it works
```
1. User sends: POST /login { email, password }
2. Server verifies password with bcrypt
3. Server creates a token: sign({ id: 5, email: "user@x.com" }, SECRET_KEY)
4. Token is returned to client
5. Every future request: client sends "Authorization: Bearer <token>"
6. Server verifies the token signature → extracts user id → processes request

The server stores NO session. The token carries the user identity.
```

### Why the signature matters
The token is split into 3 parts: `header.payload.signature`
- Anyone can READ the payload (it's just base64 encoded)
- But nobody can MODIFY it without knowing the SECRET_KEY
- If they change the payload, the signature breaks and verification fails

### What happens if SECRET_KEY leaks?
Someone can forge tokens for any user. This is why it must be in `.env` and never committed to git.

### The IDOR bug you fixed in this project
Before the fix, deleting a node only checked `node.id` and `flow.id`:
```sql
DELETE FROM node WHERE id = ? AND flow_id = ?
```
User A could send node_id=5, flow_id=3 and delete User B's node if they guessed the IDs.
After fix, we added `AND user_id = ?` — now only the owner can modify their nodes.

### Interview Answer
> "JWT is stateless authentication. The server signs a token with a secret key on login. 
> On each request, the server verifies the signature and extracts the user identity. 
> No server-side session storage needed. While building this project, I discovered an 
> IDOR vulnerability where node deletion wasn't checking user_id — a user could delete 
> another user's nodes by guessing IDs. I fixed it by adding user_id to all WHERE clauses 
> on mutating queries."

---

## Concept 4: MySQL Transactions (You'll need this in Phase 2)

### What it is
A transaction groups multiple SQL queries into ONE atomic operation.
Either ALL queries succeed, or NONE of them are committed to the database.

### Why you need it in your project
When a flow execution completes, you need to:
1. Update `execution_log.status = "completed"`
2. Insert 5 rows into `execution_step_log`

If Step 2 fails halfway (e.g., DB connection drops), without a transaction you get:
- Status shows "completed" ✅ 
- But only 3 of 5 step logs are saved ❌
- Data is corrupted and inconsistent

With a transaction, either ALL 6 writes succeed or the entire thing rolls back.

### How to write it
```typescript
const connection = await pool.getConnection();
try {
    await connection.beginTransaction();
    
    await connection.execute(`UPDATE execution_log SET status = ? WHERE run_id = ?`, 
        ["completed", runId]);
    
    for (const step of steps) {
        await connection.execute(`INSERT INTO execution_step_log ...`, [...]);
    }
    
    await connection.commit();   // Save everything
} catch (error) {
    await connection.rollback(); // Undo everything on failure
    throw error;
} finally {
    connection.release();        // Return connection to pool
}
```

### Interview Answer
> "I used MySQL transactions when saving execution results to ensure data consistency. 
> Updating the run status and inserting step logs must be atomic — if one fails, I don't 
> want partial data in the database. With transactions, either all writes commit together 
> or everything rolls back to a clean state."

---

## Concept 5: Redis (Phase 3)

### What it is
Redis is an **in-memory key-value store**. It stores data in RAM, not on disk.
This makes it extremely fast — reads/writes in microseconds vs milliseconds for SQL.

### The two ways you use Redis in this project

**Use 1: As a Queue Broker (via BullMQ)**
BullMQ uses Redis to store job data (what flow to run, for which user).
The queue persists in Redis so jobs survive server restarts.

**Use 2: Potential execution context caching**
You could store intermediate execution context in Redis during a multi-step run
instead of reading from MySQL on every step.

### Why not use MySQL as a queue?
You could store jobs in a MySQL table and poll it every second. Problems:
- Polling wastes resources (constant "any new jobs?" queries even when idle)
- Hard to distribute across multiple workers (race conditions on job pickup)
- No built-in retry, backoff, priority, concurrency controls
- Redis with BullMQ solves all of this out of the box

### Interview Answer
> "I used Redis as the backing store for BullMQ job queues. When a user triggers a flow 
> execution, the API pushes a job to Redis and returns immediately. Redis persists the 
> job so it survives restarts. A separate worker process reads from the queue and runs 
> the execution. Redis is ideal here because it's in-memory (microsecond operations), 
> has atomic list operations for reliable job claiming, and BullMQ adds retry/backoff/
> concurrency control on top."

---

## Concept 6: BullMQ + Worker (Phase 3)

### What it is
BullMQ is a job queue library built on top of Redis.
It lets you push jobs to a queue from one process and process them in another process.

### The architecture you'll build
```
Process 1: Express API Server (src/server.ts)
    - Receives HTTP requests
    - Validates user input
    - Pushes { flowId, userId, runId } to BullMQ queue
    - Returns 202 Accepted immediately (does NOT wait)

Process 2: Worker (src/workers/flow.worker.ts)
    - Runs completely separately (node src/workers/flow.worker.ts)
    - Pulls jobs from BullMQ queue
    - Runs the flow execution engine
    - Saves logs to MySQL
    - Runs up to N flows concurrently (concurrency: 5)
```

### Why two separate processes?
If execution runs inside the Express process and a flow hangs for 5 minutes,
every user's request is blocked for 5 minutes.
Separate process = complete isolation. Express stays fast for all users.

### What "202 Accepted" means vs "200 OK"
- 200 OK = "I did the thing, here is the result"
- 202 Accepted = "I received your request and will process it. Come back later for the result"
  
Use 202 when the work will happen asynchronously.

### Interview Answer
> "I used BullMQ with Redis to decouple flow execution from the API request cycle. 
> When a user clicks Run, Express pushes a job and immediately returns 202 Accepted 
> with a runId. A separate worker process picks up the job and executes the flow. 
> This means one slow execution never blocks other users' requests. The worker runs 
> with a concurrency of 5, so up to 5 flows can execute in parallel. Failed jobs 
> automatically retry with exponential backoff."

---

## Concept 7: The Template Interpolator (Phase 2 — Your Most Unique Feature)

### What it does
Replaces placeholders like `{{step_1.body.token}}` with actual values from 
previous step responses at runtime.

### Why it's technically interesting
You are building a **mini expression evaluator / string template engine**.
This is the exact same pattern used by:
- GitHub Actions (uses `${{ steps.stepName.outputs.value }}`)
- n8n workflows (uses `{{ $node["Step1"].json.token }}`)
- Kubernetes (uses `{{ .Values.service.port }}`)

### How to build it (the algorithm)

```typescript
function interpolate(template: string, context: ExecutionContext): string {
    // Regex matches: {{step_1.body.userId}} or {{step_2.headers.content-type}}
    return template.replace(/\{\{step_(\d+)\.(body|headers)\.([^}]+)\}\}/g, 
        (match, stepNum, section, key) => {
            const stepIndex = parseInt(stepNum) - 1;  // step_1 = index 0
            const step = context.steps[stepIndex];
            
            if (!step) return match;  // placeholder not resolved, keep as-is
            
            if (section === "body") {
                return getNestedValue(step.responseBody, key) ?? match;
            }
            if (section === "headers") {
                return step.responseHeaders[key] ?? match;
            }
            
            return match;
        }
    );
}

// Handles nested keys: "user.address.city" → obj.user.address.city
function getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
}
```

### Dry Run
```
Template:  "https://api.example.com/users/{{step_1.body.userId}}/orders"
Context:   steps[0].responseBody = { userId: 42, token: "abc" }

After interpolate():
Result:    "https://api.example.com/users/42/orders"
```

### Interview Answer
> "I built a string template interpolator that resolves dynamic placeholders at runtime. 
> Users write {{step_1.body.token}} in their node's header config. When the execution 
> engine processes Node 2, it runs the template string through a regex-based resolver 
> that looks up the value from the previous step's stored response body. This creates 
> a dependency chain where each node can use any value from any previous step's response."

---

## Concept 8: AES-256-GCM Encryption (Phase 4)

### What it is
AES-256-GCM is a symmetric encryption algorithm.
Same key encrypts and decrypts (symmetric = same key both ways).

### Why you need it
Users store API keys and Bearer tokens in node configs.
If your database is ever breached (SQL injection, backup leak, etc.), 
plain text tokens mean every user's third-party API access is compromised.

### GCM = Authenticated Encryption
GCM mode adds an **authentication tag** that proves the ciphertext wasn't tampered with.
If someone modifies the encrypted data in the DB, decryption throws an error.
This prevents attackers from flipping bits to forge different data.

### The 3 components you store
```
IV (Initialization Vector): Random 16 bytes, different for every encrypt call.
   Without this, encrypting "password123" always produces the same ciphertext.
   With it, every encryption is unique even for the same input.
   
Auth Tag: Proves data integrity (GCM's tamper detection)

Ciphertext: The actual encrypted data
```

Stored in DB as: `iv:authTag:ciphertext` (all hex encoded, colon-separated)

### Interview Answer
> "API tokens stored in node configs are encrypted at rest using AES-256-GCM. GCM mode 
> gives us both confidentiality and authenticity — the auth tag ensures the ciphertext 
> wasn't tampered with. We generate a random IV for every encryption operation so the 
> same token produces different ciphertext each time. The decryption key lives only in 
> the server's environment variables and is never stored in the database."

---

## Your Note-Taking System (Use This While Building)

Create a file `NOTES.md` in your project. Every time you implement something, 
write an entry like this:

```markdown
## [DATE] — What I built: [Feature Name]

### What it does:
[One sentence]

### Why I built it this way (not another way):
[Your reasoning]

### The problem it solves:
[What was broken before]

### What I didn't understand at first:
[Honest reflection]

### How I would explain this in an interview:
[Your answer in your own words]
```

---

## How to Study a New Technology (Redis, BullMQ, etc.)

**Step 1 — Read the "Why" first, not the "How"**
Before reading BullMQ docs, Google: "Why use a job queue instead of running async code directly?"
Understand the problem BEFORE learning the solution.

**Step 2 — Draw it on paper**
Draw boxes for Express Server, Redis, Worker Process, MySQL.
Draw arrows for what data flows where and when.
If you can draw it, you understand it.

**Step 3 — Build the smallest possible version first**
Before wiring it into your full project:
- Write a 30-line script that just adds a job to BullMQ and processes it
- Make sure it works alone
- Then integrate it

**Step 4 — Break it intentionally**
- Turn off Redis while a job is queued. What happens?
- Kill the worker mid-execution. Does the job retry?
- Send an invalid flow ID. Does it fail gracefully?

Breaking things on purpose is how you learn deeply. Interviewers love when you say
"I tested what happens when X fails and here is what I found."

**Step 5 — Write your interview answer BEFORE you forget**
Do this within 24 hours of building each feature.
Use the template from the Core Rule section above.

---

## The 3 Questions Every Interviewer Will Ask

No matter what company, these always come up for backend roles.
Answer them using your project:

**Q1: "Tell me about a challenging technical problem you solved."**
Answer: The IDOR vulnerability fix, the node ordering/reindexing problem, 
or the async execution decoupling.

**Q2: "Why did you choose [Technology X] over alternatives?"**
Answer: Redis+BullMQ over in-process async, MySQL transactions for execution logs, 
AES-256-GCM for encryption. Know the "why" for every choice.

**Q3: "How does your system handle failures?"**
Answer: Node execution timeout (15s), BullMQ auto-retry with backoff, 
execution context saved per step (so you can see exactly which step failed and why), 
DB transactions for atomic log writes.
