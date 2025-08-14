# Express Media Stream App (MongoDB Version)

A Node.js + Express API for managing and streaming media assets with secure, time-limited access links, admin authentication, and logging of media views.

---

## Features
- **Admin authentication** with JWT-based login/signup.
- **Media asset management** (add videos or audio files with metadata).
- **Secure streaming links** that expire after 10 minutes.
- **View logging** with IP tracking.
- MongoDB for persistence via **Mongoose**.

---

## API Routes

### Authentication
#### POST `/auth/signup`
Creates a new admin user.
**Body:** `{ "email": "string", "password": "string" }`

#### POST `/auth/login`
Authenticates a user and returns a JWT.
**Body:** `{ "email": "string", "password": "string" }`

---

### Media Management
#### POST `/media`
Adds a media asset (Authenticated).
**Headers:** `Authorization: Bearer <JWT_TOKEN>`
**Body:** `{ "title": "string", "type": "video|audio", "file_url": "string" }`

#### GET `/media/:id/stream-url`
Returns a secure URL valid for 10 minutes.
**Response:** `{ "url": "string", "expires_in_seconds": 600 }`

#### GET `/media/stream?token=<STREAM_TOKEN>`
Validates the token, logs the view, and redirects to the `file_url`.

---

## Postman Testing Guide

### 1. Sign Up
`POST http://localhost:3000/auth/signup`
```json
{
  "email": "admin@example.com",
  "password": "mypassword"
}
```

### 2. Login
`POST http://localhost:3000/auth/login`
```json
{
  "email": "admin@example.com",
  "password": "mypassword"
}
```
Save the returned `token`.

### 3. Add Media
`POST http://localhost:3000/media`
**Headers:** `Authorization: Bearer <token>`
```json
{
  "title": "Sample Video",
  "type": "video",
  "file_url": "https://example.com/video.mp4"
}
```

### 4. Get Secure Stream URL
`GET http://localhost:3000/media/<media_id>/stream-url`

### 5. Stream Media
Open the URL from step 4.

---

## How to Run

### Prerequisites
- Node.js >= 16
- MongoDB (local or cloud instance)

### Installation
1. Clone the repo and `cd` into it.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file from `.env.example`:
   ```env
   PORT=3000
   JWT_SECRET=replace_this_with_a_strong_secret
   MONGO_URI=mongodb://localhost:27017/media_app
   BASE_URL=http://localhost:3000
   ```
4. Start the server:
   ```bash
   npm run dev  # for development
   npm start    # for production
   ```

---

## Required npm Packages
- express
- mongoose
- dotenv
- body-parser
- cors
- bcrypt
- jsonwebtoken
- nodemon (dev)

---

## Assumptions & Decisions
- **Authentication**: Admin-only media management.
- **JWT Expiry**: Admin tokens expire in 7 days.
- **Stream token**: 10-minute validity for security.
- **Storage**: File URLs are assumed to be externally hosted (e.g., S3, CDN) — API redirects rather than streams directly.
- **Logging**: View logs store media reference, viewer IP, and timestamp.
- **DB Choice**: MongoDB for flexible schema and rapid prototyping.

# Analytics Routes README

## Overview
This module adds analytics capabilities to your media streaming application. It tracks:
- **Who** is watching (by IP address)
- **When** they watch (timestamp)
- **From where** (IP-based analytics)

It also provides aggregated analytics data per media item.

## Features
1. **Log Views** – Store IP and timestamp for each view.
2. **Get Analytics** – Fetch total views, unique viewers, and daily view counts.
3. **JWT-Protected Routes** – Both endpoints require authentication.
4. **Error Handling** – Covers invalid tokens, missing media, and bad IDs.

## Endpoints

### 1. POST `/media/:id/view`
**Description:** Logs a view for the specified media item.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Body:**
```json
{}
```

**Example Response:**
```json
{
  "message": "View logged"
}
```

### 2. GET `/media/:id/analytics`
**Description:** Retrieves analytics for the specified media.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Example Response:**
```json
{
  "total_views": 3,
  "unique_ips": 2,
  "views_per_day": {
    "2025-08-13": 2,
    "2025-08-14": 1
  }
}
```


const analyticsRoutes = require('./analyticsRoutes');
app.use('/analytics', analyticsRoutes);

```



## Postman Testing

### Log a View
- **Method:** POST
- **URL:** `http://localhost:3000/media/<media_id>/view`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Body:** `{}`

### Get Analytics
- **Method:** GET
- **URL:** `http://localhost:3000/media/<media_id>/analytics`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
