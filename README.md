# Lerni Backend Setup

## Development Environment Variables

Create a file called `development.env` in `./config/env/`

```env
ENVIRONMENT=development

DATABASE_URL=postgres://postgres:postgres@db:5432/lerni
POSTGRES_DB=lerni
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
JWT_SECRET=secret
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=email
EMAIL_PASSWORD=password
SPRING_SERVICE_URL=http://spring-service:8080
SENTRY_DSN=sentry

PORT=3000
```
## Run Container

To run the app, run the following command on the terminal

```bash
docker compose --env-file config/env/development.env up --build
```
