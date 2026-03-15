# Full-Stack SaaS Platform Architecture

A complete, production-ready SaaS boilerplate featuring Authentication, Stripe Billing, role-based Team Collaboration, Analytics, and an Admin dashboard.

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Router, Recharts, Axios
- **Backend**: Python, FastAPI, SQLAlchemy, PostgreSQL, PassLib (bcrypt), Stripe
- **Infrastructure**: Docker, Docker Compose

## Features Included
1. **JWT Auth System**: Registration, secure hashed passwords, login, protected routes.
2. **Dashboard**: Metrics overview and charting using custom UI cards.
3. **Stripe Billing**: Check-out flows, webhook processing for upgrades/downgrades, auto-syncing DB state.
4. **Team System**: RBAC controls (Owner, Admin, Member), team invitations, list rendering.
5. **Admin Console**: Elevate privileges to see all users across the platform, suspend/reactivate accounts.
6. **Analytics**: Broad graphical aggregations on system revenue & usage.

## Setup Instructions

Ensure you have Docker and Docker Compose installed.

### 1. Environment Config
The pre-provided `docker-compose.yml` automatically passes standard DB secrets via environment to the FastAPI app.

To use Stripe, update the following keys in `docker/docker-compose.yml` under `backend`:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

*Note: By default Stripe functionality will gracefully error if keys are not provided.*

### 2. Run the platform
Execute the entire stack via Docker:

```shell
cd saas_platform/docker
docker compose up --build
```

**Services Booted:**
- **PostgreSQL Database**: Port `5432`
- **FastAPI Backend**: `http://localhost:8000` (auto-migrations running)
- **React Frontend**: `http://localhost:5173`

### 3. Usage
- Navigate to `http://localhost:5173` in your browser.
- Register a test account.
- The registration automatically creates a `User` entry and logs you in.
- To access the **Admin Console** natively, connect to postgres and set your user's `is_admin` to `true`:
  ```sql
  UPDATE users SET is_admin = true WHERE email = 'YOUR_EMAIL';
  ```
