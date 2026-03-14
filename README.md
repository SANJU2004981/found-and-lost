Found & Lost — Community Lost & Found Platform
Overview
A modern web platform that helps people report lost items and connect with others who have found them. Users can post lost/found reports, mark locations on a map, communicate through built‑in messaging, and manage their reports through a personal dashboard.
Features
• Secure user authentication
• Post lost and found items
• Interactive map with location marking
• Image upload support
• Personal user dashboard
• Messaging between item owner and finder
• Admin panel for moderation
• Modern dark theme responsive UI
Tech Stack
Frontend: React, Vite, Leaflet, Axios
Backend: Node.js, Express.js
Database/Auth: Supabase (PostgreSQL + Authentication)
Maps: Leaflet + OpenStreetMap
Project Structure
Found-and-Lost/
  frontend/
    src/pages
    src/components
    src/services
    src/router
    src/styles
  backend/
    routes/
    middleware/
    config/
    server.js
Setup Instructions
1. Clone the repository
   git clone https://github.com/SANJU2004981/found-and-lost.git

2. Install frontend dependencies
   cd frontend
   npm install

3. Install backend dependencies
   cd ../backend
   npm install

4. Configure environment variables in backend .env
   SUPABASE_URL=your_project_url
   SUPABASE_ANON_KEY=your_key
   PORT=5000

5. Start backend
   node server.js

6. Start frontend
   cd ../frontend
   npm run dev



Security
• Supabase Row Level Security (RLS)
• Auth middleware protection
• Ownership verification for edit/delete operations
• Role-based access (Admin/User)


Future Improvements
• Smart matching between lost and found items
• Email notifications
• Mobile application
• Image recognition for items
• Advanced filters and search



Author
Sanju B
Found & Lost Web Application Project
