# ── Stage 1: build ───────────────────────────────────────────────────────────
FROM rust:alpine AS builder

# musl-dev: C toolchain for musl target
# pkgconf: required by cargo to find system libraries (pkg-config alternative)
# openssl-dev: OpenSSL headers needed by reqwest and other crates
# openssl-libs-static: static OpenSSL libraries for fully static binary
RUN apk add --no-cache musl-dev pkgconf openssl-dev openssl-libs-static

WORKDIR /app

COPY Cargo.toml Cargo.lock ./
COPY src ./src

# Build with static linking for maximum portability and minimal runtime dependencies
ENV RUSTFLAGS="-C target-feature=+crt-static"
RUN cargo build --release --target x86_64-unknown-linux-musl

# ── Stage 2: minimal runtime ──────────────────────────────────────────────────
FROM alpine:3

# ca-certificates is required for outbound TLS (Last.fm & Spotify APIs)
RUN apk add --no-cache ca-certificates

WORKDIR /app

COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/lastfm-backend .

EXPOSE 3001

CMD ["./lastfm-backend"]
