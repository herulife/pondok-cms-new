FROM golang:1.25-alpine AS builder
WORKDIR /app/apps/backend
COPY apps/backend/go.mod apps/backend/go.sum ./
RUN go mod download
COPY apps/backend ./
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /tmp/darussunnah-api ./cmd/api

FROM alpine:3.22
WORKDIR /app/apps/backend
RUN apk add --no-cache ca-certificates tzdata
COPY --from=builder /tmp/darussunnah-api ./darussunnah-api
COPY apps/backend/public.key ./public.key
COPY apps/backend/. ./
RUN mkdir -p ./public/uploads /data
EXPOSE 8080
CMD ["./darussunnah-api"]
