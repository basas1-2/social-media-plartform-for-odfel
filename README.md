# Codfel Social Media Platform

A full-stack social media platform built with React, Node.js, Express, MongoDB, and Socket.IO.

## Features

### User Features
- Register and login (JWT authentication)
- Edit profile
- Upload profile and cover photos
- Follow/Add friends
- Search users
- Change password
- Notifications

### Posts
- Create text posts
- Upload multiple images
- Upload videos (MP4, MOV, etc.)
- Edit and delete posts
- Like and unlike posts
- Comment on posts
- Share/repost posts
- Save posts

### Private Messaging
- One-to-one private chat
- Send text messages
- Send images
- Send videos
- Read receipts (Seen)
- Online/offline status
- Typing indicator
- Message timestamps
- Delete messages
- Conversation list

### Notifications
- New likes
- New comments
- New followers
- New messages
- Mention notifications

### Admin Panel
- Manage users
- Delete inappropriate posts
- Suspend accounts
- View reports
- Dashboard with statistics

## Tech Stack

### Frontend
- React (Create React App)
- React Router
- Axios
- Tailwind CSS
- Socket.IO Client

### Backend
- Node.js
- Express.js
- Socket.IO
- JWT
- Multer (file uploads, local storage - no Cloudinary)

### Database
- MongoDB (Atlas)

## Folder Structure

```
codfel-social-media/
├── client/          # React frontend
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── context/
│       ├── services/
│       └── App.jsx
└── server/          # Node.js backend
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── sockets/
    ├── uploads/
    ├── utils/
    └── server.js
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)

### 1. Setup Environment Variables

**Server** (`server/.env`):
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>.mongodb.net/codfel-social-media?retryWrites=true&w=majority
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5000
```

**Client** (`client/.env`):
```
REACT_APP_API_URL=/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 2. Install Dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd client
npm install
```

### 3. Create Admin User (Optional)

```bash
cd server
node scripts/seedAdmin.js
```

Default admin credentials:
- Username: `admin`
- Password: `admin123`

### 4. Run the Application (Single Host)

The project is configured to run on **one URL**. The Express server serves both the API (under `/api`) and the built React frontend. No separate hosting is needed.

**Step 1 — Build the frontend:**
```bash
cd client
npm run build
```
This creates `client/build/` which the server serves automatically.

**Step 2 — Start the server:**
```bash
cd server
npm run dev
```

**That's it.** Open `http://localhost:5000` — you'll see the full app (login, feed, messages, etc.) all on this single URL. The API is served at `http://localhost:5000/api` and Socket.IO runs on the same server.

> **For development only (optional):** Run `cd client && npm start` separately to use the hot-reloading dev server on port 3000. But for a single hosted URL, use `npm run build` + the server.

---

## Deploying on Render (Single Web Service)

The whole app (React frontend + Express API + Socket.IO) runs on **one Render web service**. The client is built automatically during install and served by the same Express server.

### Method 1 — Blueprint (recommended, uses `render.yaml`)
1. Push this repository to GitHub.
2. In Render Dashboard → **New** → **Blueprint**.
3. Connect your GitHub repo.
4. Render reads `render.yaml` and creates the service automatically.
5. **Set the environment variables** in the Render dashboard (Red dash = required):
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a long random secret
   - `CLIENT_URL` — your Render URL, e.g. `https://codfel-social-media.onrender.com`
6. Deploy. Render runs `npm install` (which builds the client via `postinstall`) then `npm start`.

### Method 2 — Manual (Web Service)
1. Push repo to GitHub.
2. Render Dashboard → **New** → **Web Service**.
3. Connect repo, choose the root directory.
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Root Directory:** `.`
   - **Health Check Path:** `/api/health`
5. Add the same env vars (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`).
6. Deploy.

### ⚠️ Important notes for Render
- **Uploads are ephemeral** on Render's free tier — files saved to `server/uploads/` are lost whenever the service restarts. For persistent media hosting, connect a storage service (e.g., Cloudinary, AWS S3, or Render Disks). This does not affect text posts, likes, comments, messages, or users (those live in MongoDB Atlas).
- **Socket.IO** works on the same URL — the client connects to `window.location.origin` automatically, so no extra config needed.
- Set `CLIENT_URL` to your actual Render URL for correct CORS.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `PUT /api/auth/change-password` - Change password

### Users
- `GET /api/users/:username` - Get profile
- `PUT /api/users/me` - Update profile
- `PUT /api/users/:id/follow` - Follow/Unfollow
- `GET /api/users/search?q=` - Search users
- `GET /api/users/suggestions` - Suggestions
- `GET /api/users/:id/friends` - Get friends

### Posts
- `POST /api/posts` - Create post
- `GET /api/posts/feed` - Get feed
- `GET /api/posts/all` - Get all posts
- `GET /api/posts/user/:userId` - Get user posts
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `PUT /api/posts/:id/like` - Like/Unlike
- `PUT /api/posts/:id/share` - Share
- `PUT /api/posts/:id/save` - Save
- `POST /api/posts/:id/comments` - Add comment

### Conversations & Messages
- `POST /api/conversations` - Create conversation
- `GET /api/conversations` - Get conversations
- `GET /api/conversations/:id/messages` - Get messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/seen` - Mark as seen

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/read-all` - Mark all read

### Reports
- `POST /api/reports` - Create report
- `GET /api/reports` - Get reports (admin)

### Admin
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/users` - All users
- `PUT /api/admin/users/:id/suspend` - Suspend user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/posts` - All posts
- `DELETE /api/admin/posts/:id` - Delete post

## Security
- JWT authentication
- Password hashing with bcrypt
- Protected API routes
- File type validation
- File size limits
- Rate limiting
- CORS protection
- Helmet security headers
