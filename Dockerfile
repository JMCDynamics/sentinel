FROM golang:1.24-alpine AS go-builder

RUN apk add --no-cache gcc musl-dev sqlite-dev

WORKDIR /app

COPY engine/go.mod engine/go.sum ./
RUN go mod download

COPY engine/ .

RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build -o api cmd/main.go

FROM node:22-alpine AS react-builder
WORKDIR /app

COPY app/ .
RUN rm -rf node_modules

RUN npm install

RUN sed -i 's|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=/api|' .env

RUN npm run build

FROM nginx:alpine

COPY --from=react-builder /app/dist /usr/share/nginx/html

RUN mkdir -p /db
COPY --from=go-builder /app/api /api

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["/bin/sh", "-c", "/api & nginx -g 'daemon off;'"]
