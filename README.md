# Smart Study Material Sharing Platform

A full-stack web application built on the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) specifically designed for B.Tech Computer Science & Engineering students to upload, organize, discover, view, download, rate, review, and save verified academic notes, lecture slides, question banks, and formula cheat-sheets.

---

## 📌 Table of Contents

- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
- [Database Schema (MongoDB / Mongoose)](#-database-schema-mongodb--mongoose)
- [REST API Endpoints Specification](#-rest-api-endpoints-specification)
- [Local Setup & Installation Guide](#-local-setup--installation-guide)
- [Database Seeding & Default Admin Account](#-database-seeding--default-admin-account)
- [Postman API Testing Guide](#-postman-api-testing-guide)
- [Production Deployment Guide](#-production-deployment-guide)
  - [1. MongoDB Atlas Setup](#1-mongodb-atlas-setup)
  - [2. Cloudinary File Storage Setup](#2-cloudinary-file-storage-setup)
  - [3. Backend Deployment on Render](#3-backend-deployment-on-render)
  - [4. Frontend Deployment on Vercel](#4-frontend-deployment-on-vercel)
  - [5. Connecting Live Frontend & Backend](#5-connecting-live-frontend--backend)
- [GitHub Upload Guide](#-github-upload-guide)

---

## 🚀 Key Features

### 👨‍🎓 For Students:
- **JWT-Protected Authentication**: Secure registration and login with bcrypt password hashing.
- **Academic Categorization**: Subject-wise navigation for core B.Tech CSE topics (DSA, DBMS, OS, Computer Networks, MERN, AI/ML).
- **Study Material Upload**: Fast upload for PDF documents and images (up to 10 MB) with title, subject, and description.
- **Search & Filter Engine**: Instant title/keyword search, subject filtering, and sorting (by rating, download count, newest).
- **In-Browser Document Preview & Download**: Instant preview or direct download with real-time download counter tracking.
- **5-Star Peer Review System**: Interactive 1–5 star rating with verified written reviews. Duplicate reviews by the same student on the same note are prevented.
- **Saved Favorites**: Save exam-critical notes to personal favorites with single-click bookmarking.
- **My Uploads Dashboard**: Track submission status (`pending`, `approved`, or `rejected`) and manage/delete own uploads.

### 🛡️ For Administrators:
- **Pending Moderation Queue**: Review student submissions, preview attachments, and approve or reject notes before they appear on the public catalog.
- **Content Moderation**: Permanently delete inappropriate or duplicate uploads.
- **Subject Management**: Add new curriculum subjects or remove unlinked subjects dynamically.
- **User Management & Analytics**: Monitor all registered students, total materials, total downloads, and platform health.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | Single Page Application (SPA), React Router v6, Axios |
| **Styling** | Vanilla CSS3 | Custom responsive white & light-blue academic design (No Bootstrap/Tailwind) |
| **Backend** | Node.js & Express.js | Modular MVC architecture, RESTful API, JSON responses |
| **Database** | MongoDB Atlas / Mongoose | Object modeling, compound unique indexes, data validation |
| **Authentication** | JWT & bcryptjs | JSON Web Tokens with Bearer auth headers, 10-round salted password hashing |
| **File Storage** | Multer & Cloudinary | In-memory upload stream to Cloudinary (Production) with local filesystem fallback (Development) |
| **Hosting** | Render & Vercel | Render for Node.js API, Vercel for React SPA |

---

## 📂 Project Architecture & Directory Structure

```text
smart-study-platform/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection handler
│   │   └── cloudinary.js         # Cloudinary configuration & upload stream
│   ├── controllers/
│   │   ├── adminController.js    # Moderation, stats, user overview
│   │   ├── authController.js     # Register, login, getMe
│   │   ├── favoriteController.js # Add/remove/check user favorites
│   │   ├── materialController.js # Upload, catalog list, search, download
│   │   ├── reviewController.js   # Rating and review submission
│   │   └── subjectController.js  # Subject CRUD
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & role authorization (protect, authorize)
│   │   ├── errorMiddleware.js    # 404 handler and global error formatter
│   │   └── uploadMiddleware.js   # Multer file size & MIME type validation
│   ├── models/
│   │   ├── Favorite.js           # User-material favorite compound relationship
│   │   ├── Material.js           # Study material schema with text & compound indexes
│   │   ├── Review.js             # Review schema with unique student-material index
│   │   ├── Subject.js            # Academic subject categories
│   │   └── User.js               # User accounts (student & admin roles)
│   ├── routes/
│   │   ├── adminRoutes.js        # /api/admin/*
│   │   ├── authRoutes.js         # /api/auth/*
│   │   ├── favoriteRoutes.js     # /api/favorites/*
│   │   ├── materialRoutes.js     # /api/materials/*
│   │   ├── reviewRoutes.js       # /api/reviews/*
│   │   └── subjectRoutes.js      # /api/subjects/*
│   ├── uploads/                  # Local uploaded files (development fallback)
│   ├── utils/
│   │   └── seedData.js           # Database seeder (Admin, subjects, sample notes)
│   ├── .env.example              # Sample environment variables template
│   ├── .gitignore                # Excludes node_modules, .env, and uploads
│   ├── package.json              # Backend dependencies and scripts
│   └── server.js                 # Express server initialization
│
├── frontend/
│   ├── public/                   # Static favicon and assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminRoute.jsx    # Admin-only route guard
│   │   │   ├── AlertMessage.jsx  # Notification alert banners (success, error)
│   │   │   ├── Footer.jsx        # Responsive academic footer
│   │   │   ├── Icons.jsx         # Clean, lightweight custom SVG icons
│   │   │   ├── LoadingSpinner.jsx# Loading indicator
│   │   │   ├── MaterialCard.jsx  # Card displaying note, subject, rating, downloads
│   │   │   ├── Navbar.jsx        # Navigation bar with user dropdown & mobile toggle
│   │   │   ├── ProtectedRoute.jsx# Auth route guard for logged-in students
│   │   │   └── StarRating.jsx    # Interactive & display 5-star rating component
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state & token persistence
│   │   ├── pages/
│   │   │   ├── AdminDashboardPage.jsx # Moderation queue, subjects, users
│   │   │   ├── DashboardPage.jsx      # Student dashboard & quick actions
│   │   │   ├── FavoritesPage.jsx      # Saved study materials
│   │   │   ├── HomePage.jsx           # Landing page with hero & popular notes
│   │   │   ├── LoginPage.jsx          # JWT login with one-click demo credentials
│   │   │   ├── MaterialDetailsPage.jsx# Full details, preview/download, reviews
│   │   │   ├── MaterialsPage.jsx      # Search, filter, and sort catalog
│   │   │   ├── MyUploadsPage.jsx      # Student upload tracking & management
│   │   │   ├── RegisterPage.jsx       # Student account registration
│   │   │   └── UploadPage.jsx         # Note upload form with validation
│   │   ├── services/
│   │   │   └── api.js                 # Axios instance with auth interceptor
│   │   ├── styles/
│   │   │   ├── App.css                # Component styling (white & light-blue theme)
│   │   │   └── index.css              # Reset & CSS custom variables
│   │   ├── App.jsx                    # Routing configuration
│   │   └── main.jsx                   # React DOM entry point
│   ├── .env.example                   # Frontend environment template
│   ├── .gitignore                     # Excludes node_modules & dist
│   ├── index.html                     # HTML root with Inter font
│   ├── package.json                   # Frontend dependencies
│   └── vite.config.js                 # Vite development proxy configuration
│
└── README.md                          # Project documentation
```

---

## 🗄️ Database Schema (MongoDB / Mongoose)

### 1. `users`
- `name` (String, required, min 2 chars)
- `email` (String, required, unique, lowercase)
- `password` (String, required, min 6 chars, hashed with bcrypt, hidden in queries by default)
- `role` (String, enum: `['student', 'admin']`, default: `'student'`)
- `timestamps` (`createdAt`, `updatedAt`)

### 2. `subjects`
- `subjectName` (String, required, unique, trimmed)
- `description` (String, optional)
- `timestamps` (`createdAt`, `updatedAt`)

### 3. `materials`
- `title` (String, required, trimmed)
- `description` (String, required)
- `subject` (ObjectId, ref: `'Subject'`, required)
- `uploadedBy` (ObjectId, ref: `'User'`, required)
- `fileUrl` (String, required)
- `fileName` (String)
- `fileType` (String, enum: `['pdf', 'image']`)
- `filePublicId` (String, for Cloudinary file management)
- `fileSize` (Number, in bytes)
- `status` (String, enum: `['pending', 'approved', 'rejected']`, default: `'pending'`)
- `downloadCount` (Number, default 0)
- `averageRating` (Number, default 0, min 0, max 5)
- `totalReviews` (Number, default 0)
- `timestamps` (`createdAt`, `updatedAt`)
- *Indexes*: Text search index on `{ title: 'text', description: 'text' }`, compound index on `{ status: 1, averageRating: -1 }`, `{ status: 1, downloadCount: -1 }`.

### 4. `reviews`
- `userId` (ObjectId, ref: `'User'`, required)
- `materialId` (ObjectId, ref: `'Material'`, required)
- `rating` (Number, 1 to 5, required)
- `comment` (String, required, max 500 chars)
- `timestamps` (`createdAt`, `updatedAt`)
- *Index*: Compound unique index `{ userId: 1, materialId: 1 }` (strictly prevents duplicate reviews by the same student on the same material).

### 5. `favorites`
- `userId` (ObjectId, ref: `'User'`, required)
- `materialId` (ObjectId, ref: `'Material'`, required)
- `timestamps` (`createdAt`, `updatedAt`)
- *Index*: Compound unique index `{ userId: 1, materialId: 1 }`.

---

## 🌐 REST API Endpoints Specification

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new student (`name`, `email`, `password`, `confirmPassword`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Private | Get profile of logged-in user |

### Subjects (`/api/subjects`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/subjects` | Public | List all subjects with material counts |
| `POST` | `/api/subjects` | Admin | Create a new subject category |
| `DELETE` | `/api/subjects/:id` | Admin | Delete a subject (if not linked to materials) |

### Materials (`/api/materials`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/materials/upload` | Private | Upload PDF/image study material (Multer, sets status `'pending'`) |
| `GET` | `/api/materials` | Public | List approved materials with `?search=`, `?subject=`, `?sort=` |
| `GET` | `/api/materials/popular` | Public | List top-rated & most downloaded materials |
| `GET` | `/api/materials/recent` | Public | List latest approved materials |
| `GET` | `/api/materials/my-uploads` | Private | List all uploads belonging to current student |
| `GET` | `/api/materials/search` | Public | Quick search query `?q=` |
| `GET` | `/api/materials/:id` | Public/Owner/Admin | Get detailed material info |
| `GET` | `/api/materials/:id/download` | Public | Increment download count & download file |
| `DELETE` | `/api/materials/:id` | Owner/Admin | Delete material and associated reviews/favorites |

### Reviews (`/api/reviews`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reviews/:materialId` | Private | Submit 1–5 star rating & comment (recalculates average rating) |
| `GET` | `/api/reviews/:materialId` | Public | Get all reviews for a material |

### Favorites (`/api/favorites`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/favorites` | Private | Get student's saved favorite materials |
| `GET` | `/api/favorites/check/:materialId` | Private | Check if a material is favorited |
| `POST` | `/api/favorites/:materialId` | Private | Add material to student favorites |
| `DELETE` | `/api/favorites/:materialId` | Private | Remove material from favorites |

### Admin Moderation (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/materials/pending` | Admin Only | Get all materials waiting for moderation |
| `PUT` | `/api/admin/materials/:id/approve` | Admin Only | Approve material and make it public |
| `PUT` | `/api/admin/materials/:id/reject` | Admin Only | Reject material |
| `DELETE` | `/api/admin/materials/:id` | Admin Only | Delete inappropriate material |
| `GET` | `/api/admin/users` | Admin Only | List registered users with upload counts |
| `GET` | `/api/admin/stats` | Admin Only | Summary statistics for admin dashboard |

---

## 💻 Local Setup & Installation Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18, v20, or v22 recommended)
- [MongoDB](https://www.mongodb.com/) (MongoDB Community Server locally OR a free MongoDB Atlas cloud connection URI)
- Git

### Step 1: Open Terminal & Clone or Navigate to the Project
```bash
cd smart-study-platform
```

### Step 2: Set Up Backend
1. Navigate into the backend folder:
   ```bash
   cd backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
4. Verify the `.env` settings:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://127.0.0.1:27017/smart_study_db
   JWT_SECRET=smart_study_jwt_secret_key_super_secure_btech_cse_2026
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ADMIN_EMAIL=admin@smartstudy.edu
   ADMIN_PASSWORD=Admin@123
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```
   *(Note: In local development, leaving Cloudinary variables blank automatically saves uploads to the local `backend/uploads/` directory without needing Cloudinary keys!)*

5. Seed initial data (Admin account, subjects, and sample notes):
   ```bash
   npm run seed
   ```

6. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   *The backend will be running at `http://localhost:5000`.*

---

### Step 3: Set Up Frontend
1. Open a new terminal window and navigate to the `frontend` folder:
   ```bash
   cd smart-study-platform/frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your web browser and go to:
   ```text
   http://localhost:5173
   ```

---

## 🔑 Database Seeding & Default Admin Account

The project includes an automated database seeder (`backend/utils/seedData.js`). Running:
```bash
npm run seed
```
Creates:
1. **Default Administrator Account**:
   - **Email**: `admin@smartstudy.edu`
   - **Password**: `Admin@123`
   - **Role**: `admin`
2. **Sample Student Account**:
   - **Email**: `student@smartstudy.edu`
   - **Password**: `Student@123`
   - **Role**: `student`
3. **8 Academic B.Tech CSE Subjects** (DSA, DBMS, OS, Computer Networks, MERN Full Stack, Software Engineering, AI & ML, OOP).
4. **4 Sample Study Materials** with ratings, review comments, and download counts.

*(On the Login page, you can also click the "Student Demo" or "Admin Demo" buttons to automatically fill these credentials for rapid viva demonstration).*

---

## 📬 Postman API Testing Guide

You can test all REST endpoints using Postman or any HTTP client:

1. **Register Student**:
   - `POST http://localhost:5000/api/auth/register`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "name": "Amit Kumar",
       "email": "amit@college.edu",
       "password": "Password@123",
       "confirmPassword": "Password@123"
     }
     ```
   - Copy the returned `token`.

2. **Login**:
   - `POST http://localhost:5000/api/auth/login`
   - Body (raw JSON):
     ```json
     {
       "email": "admin@smartstudy.edu",
       "password": "Admin@123"
     }
     ```

3. **Get Approved Materials**:
   - `GET http://localhost:5000/api/materials?sort=popular`

4. **Upload Study Material (Multer)**:
   - `POST http://localhost:5000/api/materials/upload`
   - Headers: `Authorization: Bearer <TOKEN>`
   - Body format: `form-data`
     - `title`: `Operating System CPU Scheduling Guide`
     - `description`: `Handwritten notes covering Round Robin, SJF, and Priority Scheduling algorithms.`
     - `subject`: `<SUBJECT_ID>`
     - `file`: *(Select a PDF or Image file under 10 MB)*

5. **Approve Material (Admin)**:
   - `PUT http://localhost:5000/api/admin/materials/<MATERIAL_ID>/approve`
   - Headers: `Authorization: Bearer <ADMIN_TOKEN>`

6. **Submit Rating & Review**:
   - `POST http://localhost:5000/api/reviews/<MATERIAL_ID>`
   - Headers: `Authorization: Bearer <STUDENT_TOKEN>`, `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "rating": 5,
       "comment": "Exceptionally clear notes! Helped me score an A in my midterms."
     }
     ```

---

## ☁️ Production Deployment Guide

Follow these exact steps to deploy the application online with persistent cloud database and file storage.

### 1. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database) and sign in or create a free account.
2. Click **Build a Database** and select the **M0 Free Cluster**.
3. Under **Security Quickstart**:
   - Create a database user (e.g., username: `studyadmin`, password: `YourStrongPassword123`).
   - Under **IP Access List**, click **Allow Access from Anywhere** (`0.0.0.0/0`).
4. Click **Database** &rarr; **Connect** &rarr; **Drivers** (Node.js).
5. Copy the connection string. It looks like:
   ```text
   mongodb+srv://studyadmin:YourStrongPassword123@cluster0.abcde.mongodb.net/smart_study_db?retryWrites=true&w=majority
   ```

---

### 2. Cloudinary File Storage Setup
Render instances have ephemeral (temporary) disk storage, so Cloudinary provides permanent cloud storage for uploaded PDFs and images.
1. Sign up for a free account at [Cloudinary](https://cloudinary.com/).
2. On your Cloudinary Dashboard, copy:
   - **Cloud Name** (e.g. `dxyza123`)
   - **API Key** (e.g. `123456789012345`)
   - **API Secret** (e.g. `abcdefghijklmnopqrstuv_12345`)

---

### 3. Backend Deployment on Render
1. Push your project to GitHub (see [GitHub Upload Guide](#-github-upload-guide)).
2. Go to [Render](https://render.com/) and click **New +** &rarr; **Web Service**.
3. Connect your GitHub repository.
4. Fill in the settings:
   - **Name**: `smart-study-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
5. Click **Advanced** &rarr; **Add Environment Variables**:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGO_URI` | *Your MongoDB Atlas Connection String from Step 1* |
   | `JWT_SECRET` | *A secure random string (e.g. `btech_cse_prod_secret_2026_xyz`)* |
   | `CLIENT_URL` | *Your Vercel frontend URL (or `*` temporarily)* |
   | `CLOUDINARY_CLOUD_NAME` | *Your Cloudinary Cloud Name* |
   | `CLOUDINARY_API_KEY` | *Your Cloudinary API Key* |
   | `CLOUDINARY_API_SECRET` | *Your Cloudinary API Secret* |
6. Click **Deploy Web Service**.
7. Once deployed, copy your Render live service URL (e.g., `https://smart-study-backend.onrender.com`).

---

### 4. Frontend Deployment on Vercel
1. Go to [Vercel](https://vercel.com/) and log in with GitHub.
2. Click **Add New...** &rarr; **Project**.
3. Select your repository.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click Edit and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://smart-study-backend.onrender.com` *(Your Render backend URL from Step 3 without trailing slash)*
6. Click **Deploy**.
7. Vercel will build and output your live frontend website URL (e.g., `https://smart-study-platform.vercel.app`).

---

### 5. Connecting Live Frontend & Backend
1. Go back to Render &rarr; `smart-study-backend` &rarr; **Environment**.
2. Update `CLIENT_URL` with your exact live Vercel URL:
   ```env
   CLIENT_URL=https://smart-study-platform.vercel.app
   ```
3. Save changes. Render will automatically redeploy with CORS configured to allow your Vercel frontend!

---

## 🐙 GitHub Upload Guide

To upload this project to GitHub without exposing secrets:

```bash
# 1. Initialize Git repository in the project root
cd smart-study-platform
git init

# 2. Check that .gitignore is properly preventing .env and node_modules from staging
git status

# 3. Add all project files
git add .

# 4. Commit files
git commit -m "feat: complete Smart Study Material Sharing Platform with MERN stack"

# 5. Create a new empty repository on GitHub named "smart-study-platform"

# 6. Link and push to GitHub
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/smart-study-platform.git
git push -u origin main
```

---

## 🎓 Academic Viva & Presentation Highlights

When demonstrating this project to professors and external examiners:
1. **Architecture**: Clean separation of frontend SPA and backend REST API adhering to MVC pattern.
2. **Database Integrity**: Compound unique index prevents students from submitting multiple reviews for the same study material or creating duplicate bookmarks.
3. **Security**: Passwords hashed with bcrypt (salt rounds: 10), JWT verification middleware, role-based route protection preventing unauthorized student access to admin endpoints.
4. **Resilient File Handling**: Automatic fallback from Cloudinary cloud streaming to local disk storage ensures seamless local development and reliable cloud production.
5. **Real-Time Responsiveness**: Pure CSS implementation ensuring full adaptability across mobile, tablet, and desktop viewports without heavy external CSS frameworks.
