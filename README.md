# Lerni Backend Setup

## Development Environment Variables

Create a file called `development.env` in `./config/env/`

```env
ENVIRONMENT=development

DATABASE_URL=postgres://postgres:postgres@db:5432/lerni
POSTGRES_DB=lerni
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

PORT=3000
```
## Run Container

To run the app, run the following command on the terminal

```bash
docker compose --env-file config/env/development.env up --build
```
