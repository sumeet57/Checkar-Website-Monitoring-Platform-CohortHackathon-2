# 🛡️ Checkar: Advanced Website Monitoring Platform

**Checkar** is a robust, high-performance monitoring solution designed to track the health, uptime, and performance of web services in real-time. Built with a scalable microservices architecture, it provides developers and businesses with actionable insights and instant alerts.

---

## 🚀 Key Features

*   **Multi-Protocol Monitoring**:
    *   **API/Server**: Monitor HTTP status codes and JSON body responses.
    *   **SSL/TLS**: Track certificate expiry dates with relative time remaining alerts.
    *   **Port Scanning**: Check if specific TCP ports are open/closed.
    *   **Frontend (AR/Fuzzy)**: Uses Playwright to verify specific text presence on dynamic web pages.
*   **Real-time Dashboard**: Interactive visualization of latency, uptime, and incident history.
*   **Intelligent Alerting**: Instant notifications when services go down or SSL certificates are about to expire.
*   **Microservices Architecture**: Decoupled services for Auth, Jobs, Scheduler, and Workers.
*   **AI Incident Analysis**: (Optional/GenAI) Automated root cause analysis for downtime.

---

## 🛠️ Technical Architecture

Checkar is built using the **MERN Stack** (MongoDB, Express, React, Node.js) and optimized for high-concurrency environments.

### System Workflow
1.  **Job Microservice**: Manages the CRUD of monitors and stores historical stats.
2.  **Scheduler**: A lightweight service that periodically pushes tasks into a **Redis-backed queue**.
3.  **Worker Microservice**: A dedicated processing engine that consumes tasks using `BRPOP` for maximum efficiency.
4.  **Checkers Engine**: The core logic utilizing `Playwright` for headless browsing and `TLS/Net` modules for network-level checks.

---

## 📈 Scalability & Performance

### 1. Manual Vertical Scaling (Current Implementation)
The platform is designed to scale vertically with ease. Using **Docker Compose**, we can precisely allocate system resources (CPU/RAM) based on the workload.
*   **Resource Management**: Each worker container is capped (e.g., 0.8 CPU, 600MB RAM) to ensure stability on entry-level servers like 1GB Droplets.
*   **Easy Upgrades**: As the monitor count grows, the platform allows for instant resource bumping by simply updating the `docker-compose.yml` limits and restarting the service.

### 2. High-Efficiency Task Processing
*   **Redis Queueing**: By using Redis as a message broker, we decoupled the scheduler from the execution logic. This ensures that even if one worker crashes, the tasks remain safe in the queue.
*   **Non-Blocking I/O**: Leveraging Node.js's asynchronous nature to handle hundreds of concurrent network checks without blocking the event loop.

---

## 🐳 Deployment Strategy

Checkar utilizes **Docker** for a "Zero-Configuration" setup.
*   **Isolation**: Each microservice runs in its own containerized environment.
*   **Networking**: Services communicate over a secure internal Docker network (`monitoring-network`), hiding sensitive services like Redis from the public internet.
*   **Automation**: Deployment is managed via `docker-compose` for local and production-ready environments.

---

## 💻 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Redux Toolkit |
| **Backend** | Node.js, Express |
| **Database** | MongoDB (Primary), Redis (Queueing) |
| **Monitoring** | Playwright (Chromium), TLS, Axios, Net |
| **DevOps** | Docker, Docker Compose, Nginx, Certbot |

---

## 🛡️ Brand Identity: Orrepo
Checkar is a flagship product developed under the **Orrepo** brand, focusing on high-quality, professional-grade technical project solutions.

> **Note**: Developed for the Cohort Hackathon 2, aiming to provide a seamless monitoring experience.
