# HungerXchange - Food Waste Redistribution Platform

HungerXchange is a modern web application designed to bridge the gap between food donors (retailers, NGOs) and receivers (communities in need). This platform streamlines food rescue operations with real-time tracking, intuitive dashboards, and verified impact analytics.

## 🚀 Project Overview

- **Donor Dashboard**: Manage listings, track rescue volume, and view daily meal impact.
- **Verified Status**: Premium badge system for trusted partners.
- **Impact Analytics**: Real-time bar graphs for food volume and meal equivalents.
- **Responsive UI**: Built with a sleek, dark-mode-first aesthetic using Vanilla CSS and Tailwind.

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Lucide Icons, Modern CSS.
- **Backend**: Node.js, Express, MongoDB (Atlas).
- **Security**: JWT Authentication, 2FA support.
- **CORS**: Configured for cross-origin resource sharing.

## 📂 Project Structure

```text
├── backend/            # Express API server
│   ├── config/         # Database connection
│   ├── controllers/    # Request handling logic
│   ├── models/         # Mongoose schemas
│   └── routes/         # API endpoints
└── frontend/           # React client
    ├── src/            # Components, pages, and context
    └── public/         # Static assets
```

## 🌐 Deployment Instructions

This project is ready for deployment:
1. **Backend**: Host the `backend/` folder on **Render** (Root: `backend`).
2. **Frontend**: Host the `frontend/` folder on **Vercel** (Root: `frontend`).
3. **Env Vars**: 
   - Backend: `MONGO_URI`, `JWT_SECRET`.
   - Frontend: `VITE_API_BASE_URL`.

---
*Created with ❤️ by Guruprashath*
