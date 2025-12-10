# Deployment Guide for Digital Ocean

This guide outlines how to deploy the KuraXX application to a Digital Ocean Droplet using Docker Compose.

## Prerequisites

1.  **Digital Ocean Account**: Create an account if you don't have one.
2.  **Domain Name** (Optional but recommended): For SSL/HTTPS.

## Step 1: Create a Droplet

1.  Log in to Digital Ocean.
2.  Click **Create** -> **Droplets**.
3.  **Region**: Choose a region close to your users.
4.  **Image**: Choose **Docker** from the Marketplace (it comes with Docker and Docker Compose pre-installed).
    *   Alternatively, choose **Ubuntu 22.04** and install Docker manually.
5.  **Size**: Recommended at least **2GB RAM / 1 CPU** (Basic Plan) for running all services (Postgres, Redis, API, WS, Web).
6.  **Authentication**: Add your SSH Key.
7.  **Hostname**: Give it a name (e.g., `kuraxx-server`).
8.  Click **Create Droplet**.

## Step 2: Prepare the Server

1.  SSH into your droplet:
    ```bash
    ssh root@your_droplet_ip
    ```

2.  Clone your repository:
    ```bash
    git clone https://github.com/yourusername/KuraXX.git
    cd KuraXX
    ```
    *   *Note: You might need to generate an SSH key on the server and add it to your GitHub/GitLab to clone private repos.*

## Step 3: Configure Environment Variables

1.  Create a `.env` file in the root directory:
    ```bash
    cp .env.production.example .env
    nano .env
    ```

2.  Update the values for production:
    *   **DATABASE_URL**: `postgresql://postgres:postgres@postgres:5432/kuraxx_chat` (The password `postgres` matches the one in `docker-compose.yml`. Change both if you want a custom password).
    *   **REDIS_URL**: `redis://redis:6379`
    *   **JWT_SECRET**: Generate a strong random string.
    *   **FIREBASE_***: Add your Firebase service account details.
    *   **VITE_API_URL**: `http://your_droplet_ip:3001` (or your domain).
    *   **VITE_WS_URL**: `ws://your_droplet_ip:3002` (or your domain).

## Step 4: Build and Run

1.  Build and start the containers:
    ```bash
    docker-compose up -d --build
    ```
    *   *Note: This might take a few minutes.*

2.  Check the status:
    ```bash
    docker-compose ps
    ```

3.  View logs if needed:
    ```bash
    docker-compose logs -f
    ```

## Step 5: Database Migration

1.  Run Prisma migrations to set up the database schema:
    ```bash
    docker-compose exec api-service npx prisma migrate deploy
    ```

## Step 6: Access the Application

*   **Web App**: `http://your_droplet_ip`
*   **API**: `http://your_droplet_ip:3001`
*   **WebSocket**: `ws://your_droplet_ip:3002`

## Troubleshooting

*   **Build Fails (OOM)**: If the build fails due to Out of Memory, enable swap:
    ```bash
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
    ```
*   **Ports**: Ensure ports 80, 3001, and 3002 are open in the Droplet's firewall if you are accessing them directly.
