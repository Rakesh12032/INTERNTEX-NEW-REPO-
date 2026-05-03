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
