# Darussunnah VPS Deploy

This folder contains the Docker Compose and nginx snippets used to deploy the
Next.js frontend and Go backend for `darussunnahparung.com`.

Expected persistent data paths beside `docker-compose.yml`:

- `./data/darussunnah.db`
- `./data/darussunnah.db-wal`
- `./data/darussunnah.db-shm`
- `./data/uploads/`

The backend mounts the whole `./data` directory into `/data` so SQLite WAL/SHM
sidecar files stay in sync with the main database file.

Required environment file:

- `./.env`
