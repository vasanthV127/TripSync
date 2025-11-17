# Vercel Deployment Instructions

⚠️ **WARNING**: Vercel has limitations for this FastAPI backend:
- ❌ MQTT service won't work
- ❌ Face recognition will be very slow (cold starts)
- ❌ Background tasks disabled
- ✅ Only REST API endpoints will work

## Steps to Deploy on Vercel:

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from backend directory:
   ```bash
   cd backend
   vercel
   ```

4. Set environment variables in Vercel dashboard:
   - MONGO_URI
   - MONGO_DB=tripsync
   - JWT_SECRET
   - SECRET_KEY
   - SENDER_EMAIL
   - SENDER_PASSWORD

5. For production:
   ```bash
   vercel --prod
   ```

## Recommended: Use Render Instead

Render is better suited for FastAPI backends:
- Free tier available
- Supports MQTT, WebSockets, background tasks
- No cold starts
- Better for ML models (face recognition)

Deploy URL: https://render.com
