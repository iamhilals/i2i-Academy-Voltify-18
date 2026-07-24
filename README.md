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

The project operates out of the box with safe local defaults. Optional environment variable overrides:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5434/voltifydb
SPRING_DATASOURCE_USERNAME=voltify_user
SPRING_DATASOURCE_PASSWORD=voltify_password
GEMINI_API_KEY=your_gemini_api_key_here
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password
```

---

## 👥 Development Team & i2i Academy

Designed and built for the **i2i Academy Program**.
