# Backend API Documentation

## Required Express API Endpoints

Your Express backend on Render should implement these endpoints:

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user (returns JWT token)
- `GET /api/auth/verify` - Verify JWT token

### Medical Records
- `GET /api/medical-records` - Get all user records
- `POST /api/medical-records/upload` - Upload file to Cloudinary
- `DELETE /api/medical-records/:id` - Delete record

### Emergency Card
- `GET /api/emergency-card` - Get user's emergency card
- `POST /api/emergency-card` - Save emergency card (generates QR)

### Chatbot
- `POST /api/chatbot` - Send message to Gemini/OpenAI

## Environment Variables
Set these in your Render backend:
- `MONGODB_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `OPENAI_API_KEY` or `GEMINI_API_KEY`

## Frontend Configuration
Update `src/config/api.ts` with your Render backend URL after deployment.
