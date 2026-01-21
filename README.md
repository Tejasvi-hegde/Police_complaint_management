# Police Station Complaint Management System

A Full-Stack functionality implementation of the Complaint Management System with SQL (PostgreSQL) and NoSQL (MongoDB) integration.

## 📂 Project Structure

*   **/backend**: Node.js + Express + Prisma (SQL) + Mongoose (NoSQL)
*   **/frontend**: React + Vite + TailwindCSS
*   **/docs**: Design Documents (ERD, DFD, Schema)

## 🚀 Environment Setup

### 1. Database Prerequisites
Ensure you have the following running locally:
*   **PostgreSQL** (Port `5432`)
*   **MongoDB** (Port `27017`)

*If your credentials differ from the defaults, update `backend/.env`.*

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init  # Creates SQL Tables
node prisma/seed.js                 # Seeds Sample Data (Stations, Officers)
npm run start                       # Starts Server on Port 5000
```
*(Note: If you don't have `nodemon`, use `node src/index.js`)*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Access the web app at `http://localhost:5173`.

## 🔑 Login Credentials (Sample Data)

**Role: Victim (Citizen)**
*   Email: `rahul@example.com`
*   Password: `password123`

**Role: Police Officer**
*   Email: `vijay@police.com`
*   Password: `password123`

## 🛠️ Tech Stack
*   **Frontend**: React, TailwindCSS, Lucide Icons, Axios
*   **Backend**: Node.js, Express, JWT Auth
*   **Database**: PostgreSQL (Prisma ORM), MongoDB (Mongoose)

## 📜 Key Features
*   **Hybrid Database**: SQL for relational data (Users, Complaints), NoSQL for unstructured logs (Evidence, Chat Timeline).
*   **RBAC**: Separate dashboards for Victims and Police.
*   **Real-time Timeline**: MongoDB stores dynamic case updates.
