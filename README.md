# InteriorX — Full-Stack Interior Home Designer

InteriorX is a portfolio-ready full-stack web application for exploring interior styles, customizing a room preview, selecting furniture, estimating a budget, and saving design projects.

## Technology stack
- Frontend: React, Vite, JavaScript, CSS
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- API: REST

## Features
- Responsive dashboard and interior style cards
- Interactive room preview with wall color and room-style selection
- Furniture selection and live estimated budget
- Save, view, update, and delete design projects
- MongoDB persistence when configured
- Demo/local fallback mode when MongoDB is not configured (projects remain in browser localStorage)

## Requirements
- Node.js 18+
- npm
- MongoDB local instance or MongoDB Atlas (optional for demo mode)

## Run locally
1. Install dependencies from the project root:
   ```bash
   npm install
   npm run install:all
   ```
2. Optional: configure MongoDB. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI`.
3. Start frontend and backend from the project root:
   ```bash
   npm run dev
   ```
4. Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

Backend runs at `http://localhost:5000`. API health check: `http://localhost:5000/api/health`.

## API endpoints
- `GET /api/designs` — list saved designs
- `POST /api/designs` — create a design
- `PUT /api/designs/:id` — update a design
- `DELETE /api/designs/:id` — delete a design
- `GET /api/health` — API status

## GitHub publishing
Create a new repository named `interiorx`, then from this folder run:
```bash
git init
git add .
git commit -m "Build InteriorX full-stack interior designer"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/interiorx.git
git push -u origin main
```
Replace `YOUR-USERNAME` with your GitHub username. Do not upload your `.env` file.

## AAT-1 report screenshots
Run the application and capture screenshots of:
1. Home dashboard
2. Room designer with selected colors and furniture
3. Budget estimate
4. My Projects with a saved design
5. GitHub repository page

## Note
This is an educational portfolio project. The displayed furniture prices and budget estimates are sample values, not professional quotations.
