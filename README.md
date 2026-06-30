# FocusRoom 🎯
**Real-Time Social Accountability Platform**

Create a timed focus room, share a 6-character join code, and see your teammates' live status — what they're working on, how long they've been at it — with silent emoji nudges to keep everyone motivated without breaking anyone's focus.

### Stack
React + Tailwind CSS (frontend) · Node.js + Express + Socket.io (backend) · MongoDB (data) · JWT (auth)

---

## 1. Run it locally (5 minutes)

### Prerequisites
- Node.js 18+
- A free MongoDB Atlas cluster (or local MongoDB)

### Backend
```bash
cd backend
cp .env.example .env
# edit .env: paste your MONGO_URI and a JWT_SECRET (any random long string)
npm install
npm run dev
```
Backend runs on `http://localhost:5000`.

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`. Open it, register two different users (use two browser tabs / incognito), create a room in one, join with the code in the other — you'll see live presence and reactions sync instantly.

---

## 2. Get a free MongoDB database (2 minutes)
1. Go to mongodb.com/cloud/atlas → sign up free → create a free "M0" cluster.
2. Database Access → add a user with a password.
3. Network Access → "Allow access from anywhere" (0.0.0.0/0) — fine for a demo project.
4. Cluster → Connect → "Drivers" → copy the connection string, replace `<password>` and add `/focusroom` before the `?` → that's your `MONGO_URI`.

---

## 3. Deploy for free (so you can demo from any laptop/phone)

**Backend → Render.com**
1. Push this project to a GitHub repo.
2. Render.com → New → Web Service → connect your repo → set root directory to `backend`.
3. Build command: `npm install` · Start command: `npm start`.
4. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your future frontend URL, e.g. `https://focusroom.vercel.app`), `PORT` is auto-set by Render.
5. Deploy. Note the URL it gives you, e.g. `https://focusroom-backend.onrender.com`.

**Frontend → Vercel**
1. Vercel.com → New Project → import the same repo → set root directory to `frontend`.
2. Add environment variable: `VITE_API_URL` = your Render backend URL.
3. Deploy. You'll get a live link like `https://focusroom.vercel.app`.
4. Go back to Render and update `CLIENT_URL` to this exact Vercel URL, then redeploy the backend (so CORS allows it).

That's it — a fully live, shareable link for your demo. Note: Render's free tier sleeps after inactivity, so open the backend URL once ~30 seconds before presenting to "wake it up."

---

## 4. What to say in your presentation
- **Architecture**: React talks to Express over REST for auth/room creation, then upgrades to a persistent Socket.io WebSocket connection for everything real-time (presence, task updates, reactions) — so the UI updates instantly with zero polling.
- **Auth**: Passwords are hashed with bcrypt; JWTs are issued on login/register and also used to authenticate the socket handshake itself, so only logged-in users can join a room's live feed.
- **Data model**: Rooms store a unique 6-char code, host, and duration in MongoDB; live participant state (who's online, their current task) lives in an in-memory map on the server, since presence is transient and shouldn't bloat the database.
- **The "cool" feature**: the silent emoji reaction system — a low-friction way to show support mid-session without sending a message that could break someone's focus, which is the actual product insight behind the "social accountability" idea.

Good luck with the internship presentation! 🚀
