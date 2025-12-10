# Digital Ocean App Platform Deployment Guide

## Overview

Digital Ocean App Platform is a **Platform as a Service (PaaS)**. It manages the infrastructure (servers, operating systems, security, load balancers) for you. You simply connect your GitHub repository, and it builds and deploys your code automatically.

## Pros & Cons

### ✅ Pros
1.  **Auto-Scaling**: This is the biggest advantage. You can configure it to automatically add more "containers" (instances) when CPU usage gets high.
    *   *Example*: If traffic spikes, it spins up `ws-service-2`, `ws-service-3`, etc. automatically.
2.  **Zero Downtime Deployments**: When you push code, it builds the new version, starts it, and only switches traffic once the new version is healthy. The old version is then removed.
3.  **Managed Infrastructure**: No need to SSH into servers, update Ubuntu, or configure firewalls.
4.  **Integrated SSL**: HTTPS certificates are automatically generated and renewed for your domains.
5.  **DDoS Protection**: Built-in protection at the edge.

### ❌ Cons
1.  **Cost**: It is generally more expensive per GB of RAM compared to a raw Droplet.
2.  **Ephemeral Filesystem**: You cannot save files to the disk (e.g., `uploads/image.jpg`) because the disk is wiped every time the app redeploys.
    *   *Solution*: You are already using **Firebase Storage**, so this is **NOT** a problem for you! ✅
3.  **Connection Limits**: The load balancers have timeouts. Your WebSocket implementation handles heartbeats (ping/pong), so this should be fine.

---

## How Scaling Works

### "Does it make a new app platform during scaling?"

**No.** It does not create a new "App" or a new account.

Think of your App as a **Cluster**.
*   Currently, you have **1 Instance** (Container) of `ws-service`.
*   When you scale (horizontally), App Platform simply spins up **Another Instance** of `ws-service` inside the *same* App.
*   It puts a **Load Balancer** in front of them.
*   **Traffic Flow**:
    *   User A -> Load Balancer -> `ws-service-instance-1`
    *   User B -> Load Balancer -> `ws-service-instance-2`

Because you are using **Redis Pub/Sub**, these two instances can talk to each other. If User A sends a message to Instance 1, Redis ensures User B on Instance 2 receives it. **Your architecture is already perfect for this.**

---

## Deployment Steps

### Option 1: The Easy Way (UI)

1.  **Push your code** to GitHub (you just did this).
2.  Log in to Digital Ocean and go to **Apps** -> **Create App**.
3.  **Source**: Select **GitHub** and choose your repository (`santoshkunwar8/microservice-kurax-socialmedia`).
4.  **Resources**: It will try to auto-detect services. Since you have a monorepo with Dockerfiles, you might need to edit them:
    *   **Service 1 (API)**:
        *   **Source Directory**: `/`
        *   **Dockerfile Path**: `apps/api-service/Dockerfile`
        *   **HTTP Port**: `3001`
    *   **Service 2 (WS)**:
        *   **Source Directory**: `/`
        *   **Dockerfile Path**: `apps/ws-service/Dockerfile`
        *   **HTTP Port**: `3002`
    *   **Service 3 (Web)**:
        *   **Source Directory**: `/`
        *   **Dockerfile Path**: `apps/web/Dockerfile`
        *   **HTTP Port**: `80`
5.  **Environment Variables**: Click "Edit" on each service and add the variables from your `.env.production.example`.
    *   *Note*: For `DATABASE_URL` and `REDIS_URL`, you can add a **Database** component in the App Platform wizard, and it will automatically inject these variables (Magic! ✨).
6.  **Review & Launch**: Click **Create Resources**.

### Option 2: The "Pro" Way (App Spec)

I have generated an `app.yaml` file in your repository. This file describes your entire infrastructure.

1.  Install `doctl` (Digital Ocean CLI) if you want to deploy from CLI, OR:
2.  Go to **Create App** in Digital Ocean.
3.  Look for an option to **"Create from App Spec"** or upload `app.yaml`.
4.  This will pre-fill all the services, ports, and database configurations for you.

## Post-Deployment

1.  **Domain**: Go to the "Settings" tab of your App and add your custom domain (e.g., `chat.yourdomain.com`).
2.  **Scale**: Go to the "Settings" -> "Components" -> "ws-service".
    *   Change **Instance Count** from `1` to `2` (or enable Autoscale).
    *   Click **Save**.
    *   Digital Ocean will instantly spin up a second copy of your WebSocket server.
