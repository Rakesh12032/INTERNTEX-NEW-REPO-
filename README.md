# Interntex Platform

Interntex is a learning, internship, jobs, certificate, ambassador, and admin management platform.

## Project Structure

- `client` - React frontend
- `server` - Node/Express backend

## Local Setup

### Frontend

```bash
cd client
npm install
npm start
```

### Backend

```bash
cd server
npm install
npm start
```

Create local `.env` files from the example files before running in production. Do not commit real secrets.

## Notes

- Keep `.env`, database dumps, logs, builds, and `node_modules` out of Git.
- Certificates, LOR, and MOOC PDF generation are handled in the frontend utilities.

## Vercel Deployment

Deploy this repository as two Vercel projects:

1. Backend API
   - Import this GitHub repo in Vercel.
   - Set Root Directory to `server`.
   - Add environment variables from `server/.env.example`.
   - Deploy and copy the backend URL.

2. Frontend
   - Import the same GitHub repo again.
   - Set Root Directory to `client`.
   - Add:
     - `REACT_APP_API_BASE_URL=https://your-backend-domain.vercel.app/api`
     - `REACT_APP_PUBLIC_BASE_URL=https://your-frontend-domain.vercel.app`
   - Deploy.

After frontend deployment, update backend `CLIENT_URL` to the final frontend domain.
