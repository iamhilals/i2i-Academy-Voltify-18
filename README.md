# ⚡ Voltify (IoT Energy Analytics Platform)

Welcome to the **Voltify** repository! This project is a real-time IoT energy analytics and budget auditing platform, originally designed as part of the i2i Academy training program. 

It is proudly being built by a dedicated **3-person development team**, focusing on high-performance backend architecture, event-driven communication, and AI-powered recommendations.

## 🚀 Tech Stack
* **Backend:** Java 17, Spring Boot (Modular Monolith)
* **Frontend:** React.js (Single-Page Application)
* **Database & Caching:** PostgreSQL (Persistent), Apache Ignite (In-Memory Data Grid)
* **Message Broker:** Apache Kafka
* **AI Integration:** Google Gemini LLM
* **Infrastructure:** Docker & Docker Compose

## 🛠️ Getting Started

### 1. Prerequisites
Ensure you have the following installed on your local machine:
* Docker & Docker Desktop
* Java 17 (JDK)
* Node.js & npm
* Git

### 2. Infrastructure Setup
To start the database, in-memory grid, and message broker services (PostgreSQL, Ignite, Kafka, Zookeeper), run the following command in the root directory:

docker-compose up -d

### 3. Running the Backend (Voltify Core)
Navigate to the `voltify-core` directory and run the Spring Boot application:

cd voltify-core
./mvnw spring-boot:run
*The backend will be available at `http://localhost:8080`.*

### 4. Running the Frontend (Voltify Web)
Navigate to the `voltify-web` directory to start the React application:

cd voltify-web
npm install
npm start
*The frontend will be available at `http://localhost:3000`.*

## 📡 Current Features
* **Infrastructure:** Fully dockerized environment for PostgreSQL, Kafka, and Ignite.
* **Home Registration API:** Exposed a REST POST endpoint (`/api/homes/register`) to save new homes and their appliance topologies seamlessly into the PostgreSQL database.
