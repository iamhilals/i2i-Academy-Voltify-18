# ⚡ Voltify (IoT Energy Analytics Platform)

Welcome to the **Voltify** repository! This project is a real-time IoT energy analytics and budget auditing platform, originally designed as part of the i2i Academy training program. 

It is proudly being built by a dedicated **3-person development team**, focusing on high-performance backend architecture, event-driven communication, and AI-powered recommendations.

## 🚀 Tech Stack
* **Backend:** Java 17, Spring Boot (Modular Monolith)[cite: 1]
* **Frontend:** React.js (Single-Page Application)[cite: 1]
* **Database & Caching:** PostgreSQL (Persistent), Apache Ignite (In-Memory Data Grid)[cite: 1]
* **Message Broker:** Apache Kafka[cite: 1]
* **AI Integration:** Google Gemini LLM[cite: 1]
* **Infrastructure:** Docker & Docker Compose[cite: 1]

## 🛠️ Getting Started

### 1. Prerequisites
Ensure you have the following installed on your local machine:
* Docker & Docker Desktop
* Java 17 (JDK)
* Node.js & npm
* Git

### 2. Infrastructure Setup
To start the database, in-memory grid, and message broker services (PostgreSQL, Ignite, Kafka, Zookeeper)[cite: 1], run the following command in the root directory:

docker-compose up -d
