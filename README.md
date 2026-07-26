<div align="center">

# ⚡ Voltify

### IoT Energy Analytics &amp; Budget Auditing Platform

A real-time, event-driven platform that streams household appliance telemetry, computes live **kWh &amp; TL billing**, enforces **dynamic penalty tariffs**, detects **device anomalies**, and dispatches **AI-generated Turkish advisories** by email — all rendered in a live React dashboard with a gamified Eco-Pet mascot.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-voltify.com.tr-3E7B27?style=for-the-badge)](http://34.179.235.4)
[![Source](https://img.shields.io/badge/GitHub-Repository-14331B?style=for-the-badge&logo=github)](https://github.com/iamhilals/i2i-Academy-Voltify-18)

![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?logo=springboot&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Apache_Kafka-231F20?logo=apachekafka&logoColor=white)
![Apache Ignite](https://img.shields.io/badge/Apache_Ignite-EC1C24?logo=apache&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?logo=googlegemini&logoColor=white)
![Docker](https://img.shields.io/badge/Docker_Compose-2496ED?logo=docker&logoColor=white)

</div>

---

## 📸 Preview

![Dashboard](docs/images/02-dashboard.png)

> The dashboard grid: every home with live consumption, aggregate billing, and the gamified **Eco-Pet (VoltBot)**.

---

## 📑 Table of Contents

- [What is Voltify?](#-what-is-voltify)
- [Quick Start](#-quick-start-3-steps)
- [System Architecture](#-system-architecture)
- [Where Data Lives](#-where-data-lives-storage-model)
- [Database Schema (ER Diagram)](#-database-schema-er-diagram)
- [Telemetry Data Flow](#-telemetry-data-flow)
- [Billing &amp; Penalty Engine](#-billing--penalty-engine)
- [Anomaly Detection](#-anomaly-detection)
- [AI Advisory &amp; Email Pipeline](#-ai-advisory--email-pipeline)
- [Application Walkthrough](#-application-walkthrough)
- [REST API Reference](#-rest-api-reference)
- [Security](#-security)
- [Tech Stack &amp; Design Rationale](#-tech-stack--design-rationale)
- [Project Structure](#-project-structure)
- [Team](#-team)

---

## 🎯 What is Voltify?

Voltify (a.k.a. **VoltWise**) simulates smart-home appliances that emit a power reading every **2 seconds**. Readings flow through **Apache Kafka** into a modular **Spring Boot** core that converts watts to kWh, accrues a running TL bill, evaluates **80% / 100%** quota thresholds, flips homes into a **penalty tariff** once the budget is breached, and flags appliances that exceed their safe limit for **3 consecutive cycles**. Every breach triggers a **Google Gemini** advisory that is emailed to the household and archived. A **React** SPA renders everything live, with sub-second polling served from an in-memory **Apache Ignite** tier.

| ⏱️ Telemetry | 🧩 Components | 🗄️ SQL Tables | ⚡ Ignite Caches |
|:---:|:---:|:---:|:---:|
| every **2 s** | **7** | **8** | **5** |

> [!NOTE]
> **Voltify does not use Redis.** Its fast, in-memory tier is **Apache Ignite (IMDG)**, which fills the role Redis would otherwise play — live counters, ephemeral state, and sub-millisecond reads.

---

## 🚀 Quick Start (3 Steps)

> **Prerequisites:** Docker Desktop · JDK 17+ · Node.js 18+

### 1️⃣ Start infrastructure (PostgreSQL + Kafka + Zookeeper + Ignite)

```bash
docker-compose up -d
```

Provisions **PostgreSQL** (`5434`), **Kafka** (`9092`), **Zookeeper**, and **Ignite** (`10800`), and auto-runs `schema.sql` to create all tables.

### 2️⃣ Run the backend (Spring Boot — `voltify-core`)

```bash
cd voltify-core
./mvnw spring-boot:run
```

Backend → **http://localhost:8080** · Swagger UI → **http://localhost:8080/swagger-ui.html**

### 3️⃣ Run the frontend (React — `voltify-web`)

```bash
cd voltify-web
npm install
npm start
```

Dashboard → **http://localhost:3000**

> 💡 **One-click demo login:** the backend seeds a demo account on startup — **username `admin`, password `admin123`** — with a sample home and appliances. Just click *"Admin Login"* on the login screen.

---

## 🏛 System Architecture

Voltify is a **modular Spring Boot monolith** backed by three storage tiers, each with a clearly separated responsibility. Telemetry is written to Ignite **first**, then persisted to PostgreSQL, so a slow database never blocks a live UI read. Kafka decouples the simulator from the billing engine.

```mermaid
flowchart LR
    SIM["🛰️ Telemetry Simulator<br/>every 2s"] -->|telemetry topic| KAFKA[("📨 Apache Kafka")]
    KAFKA -->|Kafka listener| CONS["⚙️ Telemetry Consumer"]
    CONS --> TARIFF["🧮 Tariff Engine<br/>kWh · TL · quota"]
    CONS --> ANOM["🔥 Anomaly Check<br/>3 consecutive breaches"]
    TARIFF -->|1 · write first| IGNITE[("⚡ Apache Ignite<br/>live state")]
    TARIFF -->|2 · then persist| PG[("🐘 PostgreSQL<br/>billing_ledgers")]
    TARIFF -->|on breach| ALERT["📣 Alert Notification"]
    ANOM -->|on anomaly| ALERT
    ALERT --> GEMINI["🤖 Google Gemini"]
    ALERT --> MAIL["✉️ Email (SMTP)"]
    ALERT --> PGREC[("🐘 ai_recommendations")]
    PG --> API["🌐 REST API :8080"]
    IGNITE --> API
    API <-->|"2–5s polling"| WEB["🖥️ React Dashboard :3000"]
```

| Concern | Served from | Why |
| :--- | :--- | :--- |
| Live home / appliance metrics | **Apache Ignite** | Sub-millisecond reads shield the DB from high-frequency polling |
| Registries, ledgers, history, logs | **PostgreSQL** | ACID single source of truth, durable across restarts |
| Telemetry &amp; asset registration | **Apache Kafka** | Loose coupling between simulator and core |

---

## 🗄 Where Data Lives (Storage Model)

Three tiers, three clearly separated responsibilities.

### 🐘 PostgreSQL — durable, ACID (port `5434`)
Master registries, financial ledgers, audit trails, and permanent AI recommendations. Eight tables, all with `ON DELETE CASCADE`. DDL runs automatically on first container boot.

`users` · `homes` · `appliances` · `billing_ledgers` · `consumption_snapshots` · `event_logs` · `ai_recommendations` · `eco_pets`

### ⚡ Apache Ignite — ephemeral, in-memory (port `10800`)
Sub-millisecond live state and counters. Reset on restart **by design** — a startup task also zeroes the SQL ledger so the dashboard begins consistent.

`homeLiveState` · `applianceBreachCounter` · `applianceLiveWatt` · `applianceHistory` · `applianceCumulativeWatt`

### 📨 Apache Kafka — event stream (port `9092`)
`telemetry` · `asset-registration`

> [!IMPORTANT]
> Because Ignite is in-memory, [`LedgerResetOnStartup`](voltify-core/src/main/java/com/voltify/core/service/LedgerResetOnStartup.java) zeroes every `billing_ledger` on boot so live dashboards start consistent and quota/penalty logic can re-trigger cleanly. Durable daily history is never lost — it lives in `consumption_snapshots`.

---

## 🧬 Database Schema (ER Diagram)

```mermaid
erDiagram
    USERS ||--o{ HOMES : owns
    USERS ||--|| ECO_PETS : has
    HOMES ||--o{ APPLIANCES : contains
    HOMES ||--|| BILLING_LEDGERS : has
    HOMES ||--o{ CONSUMPTION_SNAPSHOTS : archives
    HOMES ||--o{ EVENT_LOGS : logs
    HOMES ||--o{ AI_RECOMMENDATIONS : receives

    USERS {
        bigint id PK
        varchar username UK
        varchar email UK
        varchar password "BCrypt hash"
    }
    HOMES {
        bigint id PK
        bigint owner_id FK
        double power_quota_watt "default 8800"
        double budget_quota_try "default 1500"
        double base_rate "default 2.07"
        double penalty_rate "default 5.18"
    }
    APPLIANCES {
        bigint id PK
        bigint home_id FK
        double safe_power_limit
        boolean power_on
    }
    BILLING_LEDGERS {
        bigint id PK
        bigint home_id FK "unique"
        double current_balance "TL"
        boolean is_penalty_active
        boolean breach80_notified
        boolean breach100_notified
    }
    CONSUMPTION_SNAPSHOTS {
        bigint id PK
        bigint home_id FK
        date snapshot_date
        double daily_watt
        double daily_cost
    }
    EVENT_LOGS {
        bigint id PK
        bigint home_id FK
        varchar event_type
        text metadata "JSON"
    }
    AI_RECOMMENDATIONS {
        bigint id PK
        bigint home_id FK
        text generated_text
        boolean email_sent
    }
    ECO_PETS {
        bigint id PK
        bigint user_id FK "unique"
        int health_score
        int level
        int experience
        int food_count
    }
```

---

## 🔄 Telemetry Data Flow

One packet through the system. **Order matters:** the consumer writes live state to Ignite **before** persisting the ledger to PostgreSQL.

```mermaid
sequenceDiagram
    participant Sim as 🛰️ Simulator
    participant Kaf as 📨 Kafka
    participant Con as ⚙️ Consumer
    participant Ign as ⚡ Ignite
    participant Pg as 🐘 PostgreSQL
    participant AI as 🤖 Gemini + Mail

    loop every 2 s
        Sim->>Kaf: emit watt per appliance
    end
    Kaf->>Con: telemetry JSON
    Con->>Ign: 1) live watt · balance · counter
    Con->>Pg: 2) update ledger (transactional)
    alt quota ≥ 80% / 100% (first time)
        Con->>Pg: EventLog + set breach / penalty flag
        Con->>AI: prompt → advice → email
        AI->>Pg: persist ai_recommendation (Inbox)
    end
    alt 3 consecutive appliance breaches
        Con->>Pg: EventLog ANOMALY_DETECTED
        Con->>AI: anomaly advisory + email
        Con->>Pg: Eco-Pet health −10
    end
```

---

## 💰 Billing &amp; Penalty Engine

The heart of the system is [`TariffEngineService`](voltify-core/src/main/java/com/voltify/core/service/TariffEngineService.java), which runs on every telemetry packet.

### Physical energy formula (SI)

Telemetry arrives every **Δt = 2.0 s**, so a single constant converts watts to energy:

```
kWh = (Watt / 1000) × (2.0 / 3600) = Watt / 1,800,000
```

### Normal vs. penalty billing

```java
double addedKwh  = watt / 1_800_000.0;
double rate      = isPenaltyActive ? penaltyRate : baseRate; // 5.18 vs 2.07 TL/kWh
double addedCost = addedKwh * rate;
currentBalance  += addedCost;
```

### Quota evaluation &amp; penalty lifecycle

Two independent ratios are computed; the **larger** decides breaches. The power ratio uses the **instantaneous** total draw — not cumulative watts — so the limit reflects real overload rather than tripping within seconds.

```java
wattRatio   = instantTotalWatt / powerQuotaWatt;  // instantaneous
budgetRatio = currentBalance   / budgetQuotaTry;  // accumulated TL
maxRatio    = max(wattRatio, budgetRatio);
```

```mermaid
stateDiagram-v2
    [*] --> NORMAL
    NORMAL --> WARNING : maxRatio >= 80%
    WARNING --> PENALTY : maxRatio >= 100%
    PENALTY --> NORMAL : app restart, ledger reset

    NORMAL : NORMAL<br/>base rate 2.07 TL/kWh
    WARNING : WARNING (80%)<br/>email once, still 2.07
    PENALTY : PENALTY (100%)<br/>penalty rate 5.18 TL/kWh
```

> [!TIP]
> The `breach80_notified` / `breach100_notified` flags in `billing_ledgers` guarantee each threshold notifies the user **exactly once**, preventing duplicate emails. Once penalty activates, **all subsequent** usage bills at the premium rate (~2.5× base) — there is no retroactive recompute.

The engine, visualised live in the home detail view:

![Home Detail](docs/images/03-home-detail.png)

> Per-appliance live draw vs. safe limit (left), accumulated bill and total energy (right), and a **live power-trend chart** — all updated every 2 s from Ignite.

---

## 🔥 Anomaly Detection

Independent of billing, each appliance carries a consecutive-breach counter in Ignite. Exceed the safe limit for **3 cycles in a row** and the device is flagged anomalous — an event is logged, an AI email is sent, and the owner's Eco-Pet loses 10 health. Returning to normal resets the counter and logs a resolution, so alerts never spam. See [`TelemetryConsumerService`](voltify-core/src/main/java/com/voltify/core/telemetry/TelemetryConsumerService.java).

```mermaid
flowchart LR
    A["watt > safeLimit<br/>cycle 1"] --> B["still over<br/>cycle 2"]
    B --> C["counter = 3<br/>🔥 ANOMALY"]
    C --> D["EventLog + AI email<br/>Eco-Pet −10 HP"]
    C -.->|device returns to normal| E["counter reset<br/>ANOMALY_RESOLVED"]
```

---

## 🤖 AI Advisory &amp; Email Pipeline

On any breach or anomaly, the core assembles home, appliance, and billing context into a strict prompt, sends it to **Google Gemini**, persists the reply to `ai_recommendations` (the in-app Inbox), and emails it as rendered HTML. Gemini may only reference appliances actually registered to that home. If the API key is missing or the call fails, a clean fallback text is returned — the server and Kafka consumers **never block**. See [`GeminiService`](voltify-core/src/main/java/com/voltify/core/service/GeminiService.java) and [`AlertNotificationService`](voltify-core/src/main/java/com/voltify/core/service/AlertNotificationService.java).

![Inbox](docs/images/08-inbox.png)

> Real Gemini-generated anomaly advisories, each also delivered to the household's contact email.

---

## 🖥 Application Walkthrough

<table>
<tr>
<td width="50%"><img src="docs/images/01-login.png" alt="Login"/><br/><sub><b>Authentication</b> — JWT login by username <i>or</i> email, plus one-click demo entry. Passwords BCrypt-hashed.</sub></td>
<td width="50%"><img src="docs/images/06-analytics.png" alt="AI Prediction"/><br/><sub><b>AI Prediction Report</b> — 30-day cost projection, carbon footprint, and Gemini savings tips.</sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/images/05-billing.png" alt="Billing"/><br/><sub><b>Billing</b> — outstanding balance, due date, and per-home invoice history from PostgreSQL.</sub></td>
<td width="50%"><img src="docs/images/09-meta-home.png" alt="Meta-House 3D"/><br/><sub><b>Meta-House 3D</b> — a walkable Three.js twin of the home with room layout and ambience.</sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/images/04-devices.png" alt="Devices"/><br/><sub><b>Devices</b> — manage appliances, safe limits, and real on/off power control.</sub></td>
<td width="50%"><img src="docs/images/07-statistics.png" alt="Statistics"/><br/><sub><b>Statistics</b> — consumption analytics and historical trends.</sub></td>
</tr>
</table>

---

## 🌐 REST API Reference

Full interactive docs (with a **Bearer JWT** authorize button) live at **`/swagger-ui.html`**.

![Swagger](docs/images/11-swagger.png)

| Method | Endpoint | Source | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` · `/login` | PG | Register / login (username **or** email), returns JWT |
| `POST` | `/api/homes/register` | PG + Kafka | Create home + appliances, publish `asset-registration` |
| `GET` | `/api/homes/my-homes` | PG | List the user's homes |
| `GET` | `/api/homes/status/{id}` | **Ignite** | Live metrics + per-appliance watt / anomaly |
| `GET` | `/api/homes/history/{id}` | **PG** | Daily snapshots (paged, date-filtered) |
| `GET` | `.../appliances/{id}/readings` | **Ignite** | Real per-appliance history (1h / 6h / 24h) |
| `PUT` | `.../appliances/{id}/power?on=` | PG + Ignite | Toggle appliance (off ⇒ 0 W) |
| `POST` | `/api/ai/chat` | Gemini | Ask the **Volty** assistant |
| `GET`/`POST` | `/api/eco-pet/**` | PG | Eco-Pet status / feed / rename |
| `GET` | `/api/inbox` | PG | AI advisory history |
| `POST` | `/api/telemetry/send` | Kafka | Manual telemetry injection (Swagger testing) |

---

## 🔐 Security

| Concern | Implementation |
| :--- | :--- |
| Authentication | **JWT** (HS256), 24 h expiry |
| Passwords | **BCrypt** hashing (never plaintext) |
| Sessions | **Stateless** |
| Ownership | `assertOwnership` → 403 (users only access their own homes) |
| Secrets | `${VAR:default}` — read from env, `application-local.properties` git-ignored |

> [!NOTE]
> **No secret is hardcoded.** The Gemini key, mail credentials, and JWT secret are all injected at runtime. The app boots with safe local defaults and degrades gracefully when they are absent (AI fallback text, email skipped).

**Provide secrets locally** via a git-ignored file:

```bash
cd voltify-core/src/main/resources/
cp application-local.properties.example application-local.properties
# then fill in GEMINI_API_KEY, MAIL_USERNAME, MAIL_PASSWORD, JWT_SECRET
```

---

## 🧰 Tech Stack &amp; Design Rationale

| Layer | Technology |
| :--- | :--- |
| **Backend** | Java 17 · Spring Boot (Web, Data JPA, Security, Kafka, Mail) · Maven |
| **Data &amp; messaging** | PostgreSQL 15 · Apache Ignite 2.15 · Apache Kafka 7.4 + Zookeeper |
| **Frontend** | React 19 · React Router 6 · Recharts · Three.js / R3F · Framer Motion · Axios |
| **AI, docs &amp; infra** | Google Gemini · OpenAPI / Swagger · Docker Compose |

| Decision | Rationale |
| :--- | :--- |
| Write Ignite **before** PostgreSQL | Live reads must be sub-millisecond and never blocked by DB latency |
| Ignite (not Redis) as the fast tier | Native Java object caching &amp; indexed types fit the Spring/Kafka stack with no extra glue |
| **Instantaneous** watts for the power quota | Cumulative watts would trip the limit within seconds; instantaneous draw reflects true overload |
| One-time breach flags | Alert exactly once per threshold crossing — no duplicate emails |
| Kafka between simulator &amp; engine | Loose coupling: neither side can stall the other |
| Resilient AI/email chain | Missing key → fallback text; missing mail creds → skip. The app never crashes or blocks a thread |

---

## 📁 Project Structure

```
i2i-Academy-Voltify-18/
├── docker-compose.yml          # PostgreSQL + Kafka + Zookeeper + Ignite
├── README.md
├── docs/images/                # screenshots used in this README
├── voltify-core/               # Spring Boot backend
│   └── src/main/
│       ├── java/com/voltify/core/
│       │   ├── config/         # Ignite, Security, OpenAPI
│       │   ├── controller/     # Auth, Home, Ai, EcoPet, Inbox
│       │   ├── dto/ · entity/ · repository/ · security/
│       │   ├── service/        # TariffEngine, Home, Gemini, Email, schedulers…
│       │   └── telemetry/      # Simulator + Kafka consumer
│       └── resources/
│           ├── application.properties
│           └── schema.sql      # DDL (auto-run by Docker)
└── voltify-web/                # React frontend
    └── src/
        ├── components/         # Slideovers, modals, VoltBot widget
        ├── pages/              # Dashboard, HomeDetail, Devices, Billing, MetaHome (3D)…
        └── services/           # Axios API layer (JWT + toast interceptors)
```

---

## 👥 Team

Designed and built for the **i2i Academy Program** by the **Voltify Team**:

**Hilal Ayşe Akgül** · **Sude Naz Aktaş** · **Volkan Yüksel**

<div align="center">

[![Live Demo](https://img.shields.io/badge/🌐_Try_the_Live_Demo-3E7B27?style=for-the-badge)](http://34.179.235.4)

</div>
