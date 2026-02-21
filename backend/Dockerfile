# ── Stage 1: build ───────────────────────────────────────────────────────────
FROM rust:alpine AS builder

# musl-dev provides the C toolchain required by some crates when targeting musl
RUN apk add --no-cache musl-dev

WORKDIR /app

COPY Cargo.toml Cargo.lock ./
COPY src ./src

RUN cargo build --release

# ── Stage 2: minimal runtime ──────────────────────────────────────────────────
FROM alpine:3

# ca-certificates is required for outbound TLS (Last.fm & Spotify APIs)
RUN apk add --no-cache ca-certificates

WORKDIR /app

COPY --from=builder /app/target/release/lastfm-backend .

EXPOSE 3001

CMD ["./lastfm-backend"]
