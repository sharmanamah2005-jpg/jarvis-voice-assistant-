# 🚀 J.A.R.V.I.S. Voice Assistant

Advanced Iron Man-style voice assistant with futuristic UI, AI integration, and voice commands.

## ✨ Features
- **Futuristic HUD UI** with animated AI core and glowing effects
- **Real-time Voice Recognition** using Web Speech API
- **Text-to-Speech** with JARVIS-like voice
- **Wake Word Detection** ("Hey Jarvis")
- **AI Chat** powered by OpenAI GPT-4o-mini
- **Special Commands**: Time, Date, Weather, Website opening
- **Chat History** stored in SQLite
- **Responsive Design** for desktop/mobile

## 🛠️ Quick Setup (Local)

### 1. Backend Setup
```bash
cd jarvis-voice-assistant/backend
python -m venv venv
# Windows
venv\\Scripts\\activate
# Mac/Linux
source venv/bin/activate

pip install -r ../requirements.txt
```

### 2. Environment Variables
Create `.env` file in backend folder:
```
OPENAI_API_KEY=your_openai_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

**Get API Keys:**
- [OpenAI](https://platform.openai.com/api-keys)
- [OpenWeatherMap](https://openweathermap.org/api) (free tier)

### 3. Run Backend
```bash
cd backend
python app.py
```
Backend runs on `http://localhost:5000`

### 4. Frontend
Open `frontend/index.html` in browser (Chrome/Firefox recommended)

**Or serve locally:**
```bash
# Install live-server globally
npm install -g live-server
cd frontend
live-server
```

## 🎮 How to Use
1. Click mic button or say **"Hey Jarvis"**
2. Speak your command
3. JARVIS responds with voice + text
4. Type commands manually if needed

**Commands:**
- "What time is it?"
- "What's the date?"
- "Weather in London"
- "Open YouTube"
- Any question for GPT AI

## 📁 Project Structure
```
jarvis-voice-assistant/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── .env (create this)
├── jarvis.db (auto-created)
└── README.md
```

## ☁️ Deployment

### Backend (Render/Railway)
1. Push to GitHub
2. Connect to Render/Railway
3. Set env vars: `OPENAI_API_KEY`, `OPENWEATHER_API_KEY`
4. Build command: `pip install -r requirements.txt`
5. Start command: `python app.py`

### Frontend (Vercel/Netlify)
1. Deploy `frontend/` folder
2. Update `script.js`: change `backendUrl` to your deployed backend URL

## 🔧 Advanced Features (Optional)

### 1. Custom Wake Word
Edit `wakeWord` in `script.js`

### 2. Sound Effects
Add audio files to `assets/` and play on interactions

### 3. Login System
Add simple auth to `/login` endpoint

### 4. Face Recognition
Integrate face-api.js for visual login

## 🐛 Troubleshooting
- **Mic not working**: Use Chrome, allow microphone permission
- **AI not responding**: Check OpenAI API key and backend server
- **CORS errors**: Backend CORS enabled for all origins
- **Voice sounds robotic**: Try different browser voices

## 📱 Browser Support
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ⚠️ Limited speech recognition

## 🎨 Customization
- Colors: Edit CSS gradients (`#00ffff` = cyan)
- Animations: Modify `@keyframes` in CSS
- Voice: Adjust `pitch`, `rate` in JS

**Built for BCA Final Projects - Production Ready!**

**J.A.R.V.I.S. at your service, sir. 🚀**

