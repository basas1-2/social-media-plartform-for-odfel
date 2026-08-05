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
CLIENT_URL=http://localhost:3000
```

**Client** (`client/.env`):
```
REACT_APP_API_URL=http://localhost:5000/api
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

### 4. Run the Application

**Server:**
```bash
cd server
npm run dev
```
Server runs on `http://localhost:5000`

**Client:**
```bash
cd client
npm start
```
Client runs on `http://localhost:3000`

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
