# ⚡ VoltWise / Voltify - IoT Energy Analytics & Budget Auditing Platform

Welcome to **VoltWise (Voltify)**! VoltWise is a real-time IoT energy analytics, anomaly detection, and budget auditing platform designed to monitor household electricity consumption, enforce dynamic penalty tariffs, and dispatch AI-generated personalized email alerts via Google Gemini.

---

## 🚀 Quick Start Guide (3 Simple Steps for Teammates)

When you clone or pull this repository from Git, follow these 3 steps to get everything running locally:

### 1️⃣ Start Infrastructure Containers
In the root directory of the repository, run:
```bash
docker-compose up -d
```
> *This automatically provisions **PostgreSQL** (Port 5434), **Apache Kafka** (Port 9092), **Zookeeper**, and **Apache Ignite** (Port 10800), and automatically executes `schema.sql` to initialize all database tables.*

---

### 2️⃣ Run the Backend (VoltWise Core)
Open a terminal, navigate to `voltify-core`, and start the Spring Boot application:
```bash
cd voltify-core
./mvnw spring-boot:run
```
> *Backend runs on **http://localhost:8080**. OpenAPI / Swagger UI is available at **http://localhost:8080/swagger-ui.html**.*

---

### 3️⃣ Run the Frontend (VoltWise Web)
Open a second terminal, navigate to `voltify-web`, install dependencies, and start React:
```bash
cd voltify-web
npm install
npm start
```
> *Frontend dashboard opens automatically at **http://localhost:3000**.*

---

## 🏛️ Architectural Design & System Decisions

| Design Dimension | Implementation Detail | Rationale & Mentor Rule |
| :--- | :--- | :--- |
| **Telemetry Interval ($\Delta t$)** | `2.0 seconds` | Low-latency real-time telemetry stream generation. |
| **SI Physics Energy Formula** | $\text{kWh} = \text{Watt} / 1,800,000.0$ | Exact physical conversion for $\Delta t = 2.0s$ interval ($\text{kWh} = \text{Watt} \times 2 / (1000 \times 3600)$). |
| **EPDK 2026 Tariff Model** | Base: `2.07 TL/kWh`<br>Penalty: `5.18 TL/kWh` | EPDK national electric grid tariff rates. Penalty tariff applies **exclusively to incremental usage over 100% quota**. |
| **Consecutive Breach Anomaly** | `3 Consecutive Cycles` | Evaluated in Apache Ignite (`watt > safePowerLimit`). Triggers `ANOMALY_DETECTED` event, alerts user, and penalizes Eco-Pet. Resets on normal telemetry. |
| **Deduplicated Quota Alerts** | `%80` and `%100` Quotas | Ledger flags (`breach80Notified`, `breach100Notified`) ensure email notifications are dispatched **exactly ONCE** upon crossing thresholds. |
| **Single Source of Truth** | PostgreSQL Database | ACID compliance for master registries (`users`, `homes`, `appliances`), billing ledgers, event logs, and AI recommendations. |
| **High-Speed Execution Tier** | Apache Ignite IMDG | Sub-millisecond read layer for live UI polling and breach counters without persistent DB overhead. |
| **Message Broker** | Apache Kafka | Loose coupling via `telemetry` stream topic and `asset-registration` lifecycle topic. |
| **AI LLM Engine** | Google Gemini | Generates personalized energy saving advisories strictly restricted to the registered appliances in the user's home. |

---

## 🗄️ PostgreSQL Database Schema (`schema.sql`)

All 8 PostgreSQL relational tables with strict foreign key constraints:
- `users`: User profiles and login credentials
- `homes`: Residential properties, room layout, power/budget quotas, tariff rates
- `appliances`: Smart appliances with safe power limit thresholds
- `billing_ledgers`: Accumulated Watt metrics, balance in TL, penalty states, breach flags
- `consumption_snapshots`: Daily historical kWh & cost trend archives
- `event_logs`: Operational audit trails (%80, %100 quota breach, anomaly logs)
- `ai_recommendations`: Gemini AI generated personalized advice history
- `eco_pets`: Mascot level, health, XP, and status tracking

---

## 🔑 Environment Variables & Security Configuration

**No secret is ever hardcoded.** Every credential is read at runtime from an environment variable via a `${VAR:default}` placeholder in `application.properties` (Spec §5.2.2 & §5.7.2). The app runs **out of the box with safe local defaults** — if a key is missing, the AI returns a clean fallback and email dispatch is skipped, without crashing.

Two ways to provide secrets locally:

**Option A — a gitignored local properties file (recommended for dev):**
```bash
# voltify-core/src/main/resources/
cp application-local.properties.example application-local.properties
# then fill in your real values
```
> `application-local.properties` is listed in `.gitignore` (`**/application-local.properties`) and is **never committed**. Only the `.example` template is tracked.

**Option B — OS / container environment variables:**
```env
GEMINI_API_KEY=your_gemini_api_key_here
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password
JWT_SECRET=change-me-to-at-least-32-characters
# Optional datasource overrides:
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5434/voltifydb
SPRING_DATASOURCE_USERNAME=voltify_user
SPRING_DATASOURCE_PASSWORD=voltify_password
```

| Variable | Purpose | Default if unset |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini advisory generation | Empty → clean AI fallback text |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | Gmail SMTP alert delivery | Empty → email dispatch skipped |
| `JWT_SECRET` | HS256 token signing key (≥ 32 chars) | Built-in dev key (override in prod) |

---

## 🌐 REST API Reference

Full interactive docs (with a **Bearer JWT** authorize button) live at **`/swagger-ui.html`**. Core endpoints:

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | ➖ | Register a user (validated), returns JWT |
| `POST` | `/api/auth/login` | ➖ | Login with **username or email**, returns JWT |
| `POST` | `/api/homes/register` | 🔒 | Create a home + appliances (persists to PostgreSQL, publishes `asset-registration` to Kafka) |
| `GET` | `/api/homes/my-homes` | 🔒 | List the current user's homes |
| `GET` | `/api/homes/status/{homeId}` | 🔒 | **Live** home metrics + per-appliance wattage/anomaly — served from **Apache Ignite** |
| `GET` | `/api/homes/history/{homeId}` | 🔒 | Paginated daily consumption snapshots — served from **PostgreSQL** |
| `PUT` / `DELETE` | `/api/homes/{homeId}` | 🔒 | Update / delete a home |
| `POST`/`PUT`/`DELETE` | `/api/homes/{homeId}/appliances/**` | 🔒 | Manage appliances |
| `POST` | `/api/ai/chat` | 🔒 | Ask the **Volty** AI energy assistant (Gemini) |
| `GET`/`POST` | `/api/eco-pet/**` | 🔒 | Eco-Pet (VoltBot) status, feed, rename |
| `POST` | `/api/telemetry/send` | ➖ | Manual telemetry injection to the `telemetry` topic (Swagger testing) |

---

## ✅ Requirements Compliance Map

How each specification section is satisfied:

| Spec Section | Requirement | Implementation |
| :--- | :--- | :--- |
| **5.1.1** | Real-time dashboard grid + home detail with live metrics | `HomeDashboard` grid + `HomeDetail` view, **polled every 2 s** (5 s on the grid) |
| **5.1.1** | Quota-breach & anomaly visual differentiation | Breached homes render with red borders/badges; anomalous appliances flagged from live Ignite anomaly state |
| **5.1.1** | Interactive charts from telemetry | Daily-trend & cost charts (Recharts) fed by the **real `/history` snapshot endpoint** |
| **5.1.2** | Fluid UI under 1–2 s polling | Interval-based polling with cleanup; no blocking re-renders |
| **5.1.2** | Skeleton / spinner loaders | Skeleton grids in dashboard & detail during first load |
| **5.1.2** | Graceful error interception (no stack traces) | Global Axios interceptor → user-friendly **toast** notifications |
| **5.2 / 5.2.2** | Modular Spring Boot monolith, functional packages | `config` · `controller` · `dto` · `entity` · `repository` · `security` · `service` · `telemetry` |
| **5.2.2** | Ignite updated **before** PostgreSQL logging; error boundaries | `TariffEngineService` writes Ignite first; `@Transactional` + `GlobalExceptionHandler` |
| **5.2.2 / 5.7.2** | No hardcoded secrets — all from env vars | `${GEMINI_API_KEY}`, `${MAIL_*}`, `${JWT_SECRET}`; gitignored local file |
| **5.2.2 / 5.7.2** | Resilient LLM fallback (never blocks threads) | `GeminiService` try/catch → clean fallback text |
| **5.3** | Autonomous, decoupled telemetry simulator | `TelemetrySimulatorService` `@Scheduled` every 2 s → Kafka only |
| **5.4** | Ignite live state + consecutive breach counters | `homeLiveState`, `applianceBreachCounter`, `applianceLiveWatt` caches |
| **5.5** | Kafka `telemetry` + `asset-registration` topics | Producer in `HomeService`; consumers in telemetry package |
| **5.6 / 5.6.2** | ACID persistence, FK constraints, DDL auto-run in Docker | `schema.sql` (matches entities, `ON DELETE CASCADE`) mounted into Postgres init |
| **5.7** | Gemini turns metrics into Turkish advisories + email | `AlertNotificationService` → `GeminiService` → `EmailService`, persisted to `ai_recommendations` |

**Deliverables:** Web App source (`voltify-web`) · Core source (`voltify-core`, env-configured) · DDL script auto-run via Docker · single `docker-compose.yml` · Swagger/OpenAPI at `/swagger-ui.html` · this README.

---

## 👥 Development Team & i2i Academy

Designed and built for the **i2i Academy Program**.
