# 🔗 StaySphere — Project Submission Links

This file compiles the necessary links required for the StaySphere project submission. You can update the placeholders below with your actual deployed webapp URL and video link.

---

## 💻 1. GitHub Repository URL
* **Repository Link**: [https://github.com/yashwanterla-cmyk/stay-sphere](https://github.com/yashwanterla-cmyk/stay-sphere)
* **Branch**: `main`

---

## 🌐 2. Deployed Web Application Link
* **Webapp URL (Frontend)**: `https://stay-sphere.vercel.app` *(Placeholder — Update this link if you deploy via Vercel/Netlify)*
* **API Documentation (Backend)**: `https://stay-sphere-api.onrender.com/docs` *(Placeholder — Update this link if you deploy via Render/Railway)*

---

## 📹 3. Application Demo Video (5 Minutes)
* **Walkthrough Video Link**: `https://youtu.be/placeholder-demo-video` *(Placeholder — Upload your screen recording to YouTube (Unlisted) or Google Drive and paste the link here)*
* **Mandatory Status**: *Not Mandatory* (but highly recommended for grading)

---

### 🚀 How to deploy this project yourself (if needed):
1. **Frontend (Vercel)**:
   - Install Vercel CLI: `npm i -g vercel`
   - Run `vercel` in the `frontend` folder.
   - Set the environment variable `VITE_API_URL` to your backend URL.
2. **Backend (Render/Railway)**:
   - Push code to GitHub.
   - Create a Web Service on Render, connect the repo.
   - Root directory: `backend`.
   - Build Command: `pip install -r requirements.txt`.
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
   - Set env vars: `DATABASE_URL` (PostgreSQL), `SECRET_KEY`, `RAZORPAY_KEY_*`, `CLOUDINARY_*`.
