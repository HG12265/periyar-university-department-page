# Production Docker Deployment Guide

This guide describes how to deploy the Periyar Department Portal using **Docker Compose** for the frontend, backend, and database, with **Nginx** running on the host machine for secure reverse proxying and SSL management.

---

## 1. Prerequisites
On your clean Ubuntu/Linux server, install Docker and Docker Compose:
```bash
sudo apt update
sudo apt install docker.io docker-compose-v2 -y
sudo systemctl enable docker --now
```

---

## 2. Environment Setup
Create a `.env` file in the **project root directory** (where `docker-compose.yml` resides) to manage production credentials:
```env
# Database Configuration
DB_PASSWORD=your_secure_mysql_root_password
DB_NAME=periyar_univ

# Security
SECRET_KEY=generate_a_random_long_secret_key_here
JWT_SECRET=generate_a_random_long_secret_key_here

# Senior Database Credentials (Legacy Resume DB)
RESUME_DB_USER=centeruser
RESUME_DB_PASSWORD=center@123
RESUME_DB_HOST=172.16.255.15
RESUME_DB_PORT=3306
RESUME_DB_NAME=periyar_faculty_db
```

---

## 3. Starting the Stack
To build images and start the frontend, backend, and MySQL database in the background:
```bash
# From the project root
docker compose up -d --build
```
Verify all containers are running successfully:
```bash
docker compose ps
```

---

## 4. Restoring Database Dump
Once the database container is active, import your existing database SQL schema (`full-final-db.sql` or `final-datas-db.sql`) directly into the containerized MySQL database:
```bash
# Import SQL file into container's mysql instance
docker exec -i periyar_database mysql -u root -p"your_secure_mysql_root_password" periyar_univ < full-final-db.sql
```

---

## 5. Host Nginx Setup (Reverse Proxy & SSL)
To keep SSL certificates (`certbot`) easy to manage, run Nginx directly on the host server.

### 5.1 Install Nginx & Certbot on Host:
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

### 5.2 Server Block: `/etc/nginx/sites-available/periyar-portal`
Create the file and add:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificate Paths (Will be filled by Certbot automatically)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Proxy Headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # 1. Frontend Proxy (Next.js - running in Docker)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    # 2. Backend Proxy (FastAPI - running in Docker)
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_buffering off;
        client_max_body_size 10M;
    }
}
```

Enable the site configuration and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/periyar-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5.3 Fetch SSL Certificate:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Certbot will obtain the certificate and automatically update the Nginx configuration with the SSL keys.

---

## 6. Useful Operations

### 6.1 View Logs
```bash
# View backend logs
docker compose logs -f backend

# View frontend logs
docker compose logs -f frontend
```

### 6.2 Stop Stack
```bash
docker compose down
```
*(Your data inside MySQL will persist securely in the docker volume `mysql_data`)*.
