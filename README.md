# DevOps Node API

A Node.js + PostgreSQL RESTful API with Swagger documentation and a basic HTML UI for managing users. Built as part of a DevOps learning journey.

## 🚀 Features

- REST API with Express.js
- PostgreSQL integration
- Swagger UI (`/api-docs`)
- Dockerized (Dockerfile + Docker Compose)
- Deployed on [Render](https://render.com)
- Frontend form and table to add/delete users
- Clean structure, ready for CI/CD

---

## 📁 Project Structure

devops-node-db/
├── app.js # Main Express server
├── public/ # Static HTML/CSS UI
├── docker-compose.yml # For local dev with DB
├── Dockerfile # For building app container
├── swagger.js # Swagger doc config
├── backup.sql # Optional PostgreSQL dump
└── README.md # You are here

## 🛠️ Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/DrunkensteinRobot/devops-node-db.git
cd devops-node-db
2. Add .env
Create a .env file:

env
DB_HOST=your_host
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_db
PORT=3000
3. Run locally (optional)
npm install
node app.js
🐳 Run with Docker Compose
docker-compose up --build
App: http://localhost:3000
Swagger: http://localhost:3000/api-docs

📦 API Endpoints
GET /users
POST /users
DELETE /users/:id

View full docs at: /api-docs

🌐 Deployment
This project is deployed on Render.
See live: https://devops-node-db.onrender.com

🤖 GitHub Actions
This project includes a CI pipeline to install dependencies and run tests.
See: .github/workflows/node.yml

✍️ Author
Lutendo Kone
📧 lutendokone7@gmail.com
🌐 LinkedIn
