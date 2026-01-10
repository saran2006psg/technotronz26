# Stranger Things portal

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/varu905-3066s-projects/technotronz26)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/vuPqVirJ9nM)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/varu905-3066s-projects/technotronz26](https://vercel.com/varu905-3066s-projects/technotronz26)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/vuPqVirJ9nM](https://v0.app/chat/vuPqVirJ9nM)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/technotronz2026

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here

# Email Server Configuration (SMTP)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@technotronz.com
```

### Notes

- **NEXTAUTH_SECRET**: Generate a random secret using `openssl rand -base64 32`
- **EMAIL_SERVER_PASSWORD**: For Gmail, use an App Password (not your regular password)
- **EMAIL_FROM**: The email address that will appear as the sender
- For production, update `NEXTAUTH_URL` to your production domain