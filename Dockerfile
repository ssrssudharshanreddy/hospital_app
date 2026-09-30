# ==============================================================
# Hospital Patient Queue Management System - C++ Backend
# Multi-stage Linux Build for Render Container Deployment
# ==============================================================

# --------------------------------------------------------------
# Stage 1: Build Stage (Ubuntu 22.04 LTS)
# --------------------------------------------------------------
FROM ubuntu:22.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend source tree
COPY backend/ ./backend/

WORKDIR /app/backend/build

# Configure and compile standalone C++ backend executable
RUN cmake -DCMAKE_BUILD_TYPE=Release .. && \
    cmake --build . --config Release --target hospital_queue_backend

# --------------------------------------------------------------
# Stage 2: Minimal Production Runtime Stage
# --------------------------------------------------------------
FROM ubuntu:22.04 AS runner

ENV DEBIAN_FRONTEND=noninteractive

# Install runtime dependencies and official MongoDB mongosh
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    && curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
       gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg && \
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
       tee /etc/apt/sources.list.d/mongodb-org-7.0.list && \
    apt-get update && apt-get install -y --no-install-recommends \
    mongodb-mongosh \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy compiled executable from builder stage
COPY --from=builder /app/backend/build/hospital_queue_backend /app/hospital_queue_backend

# Set executable permissions
RUN chmod +x /app/hospital_queue_backend

# Cloud providers (e.g. Render) assign dynamic PORT
ENV PORT=8080

EXPOSE 8080

# Direct execution of standalone C++ backend
CMD ["./hospital_queue_backend"]
