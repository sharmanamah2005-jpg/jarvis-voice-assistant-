from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
import sqlite3
import datetime
import requests
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', 'your_openweather_key_here')
openai.api_key = OPENAI_API_KEY

# Database setup
DB_PATH = 'jarvis.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS chat_history
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  timestamp TEXT,
                  user_message TEXT,
                  ai_response TEXT)''')
    conn.commit()
    conn.close()

init_db()

# System prompt for JARVIS personality
JARVIS_PROMPT = """You are J.A.R.V.I.S., the advanced AI assistant from Iron Man. 
You are helpful, witty, professional, and speak like a high-tech AI with British accent style.
Keep responses concise but informative. Use "sir" when addressing the user.
For commands:
- Time/Date: Provide current info
- Weather [location]: Get weather (use provided data)
- Search [query]: Summarize search results
- Wikipedia [topic]: Give brief summary
- Open [site]: Confirm opening website
Always maintain conversation context."""

@app.route('/ai', methods=['POST'])
def ai_chat():
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        history = data.get('history', [])
        
        if not user_message:
            return jsonify({'response': 'Please provide a message.'})
        
        # Build conversation context
        messages = [{"role": "system", "content": JARVIS_PROMPT}]
        for msg in history[-5:]:  # Last 5 exchanges
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": user_message})
        
        # Handle special commands first
        response = handle_special_commands(user_message)
        if response:
            save_chat(user_message, response)
            return jsonify({'response': response})
        
        # OpenAI ChatGPT response
        if OPENAI_API_KEY and OPENAI_API_KEY != 'your_openai_key_here':
            response = get_openai_response(messages)
        else:
            response = get_fallback_response(user_message)
        
        save_chat(user_message, response)
        return jsonify({'response': response})
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'response': 'Sorry sir, I encountered an error. Please try again.'})

def handle_special_commands(message):
    message_lower = message.lower()
    
    # Time
    if any(word in message_lower for word in ['time', 'clock']):
        return f"The current time is {datetime.datetime.now().strftime('%I:%M %p')}, sir."
    
    # Date
    if 'date' in message_lower:
        return f"Today is {datetime.datetime.now().strftime('%A, %B %d, %Y')}, sir."
    
    # Weather
    if 'weather' in message_lower:
        location = extract_location(message)
        if OPENWEATHER_API_KEY != 'your_openweather_key_here':
            weather_data = get_weather(location)
            if weather_data:
                return f"In {location}, it's {weather_data['temp']}°C with {weather_data['desc']}. {weather_data['details']}"
        return "Weather service requires API key. Current conditions: Sunny with a chance of awesome, sir."
    
    # Websites
    sites = {
        'google': 'https://google.com',
        'youtube': 'https://youtube.com',
        'github': 'https://github.com'
    }
    for site, url in sites.items():
        if site in message_lower:
            return f"Opening {site.title()} for you, sir."
    
    return None

def extract_location(message):
    words = message.lower().split()
    location_words = [w for w in words if w not in ['weather', 'in', 'the']]
    return ' '.join(location_words[-2:]) or 'London'

def get_weather(location):
    if not OPENWEATHER_API_KEY or OPENWEATHER_API_KEY == 'your_openweather_key_here':
        return None
    
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={OPENWEATHER_API_KEY}&units=metric"
        resp = requests.get(url).json()
        if resp.get('cod') == 200:
            return {
                'temp': resp['main']['temp'],
                'desc': resp['weather'][0]['description'],
                'details': f"Humidity: {resp['main']['humidity']}%, Wind: {resp['wind']['speed']} m/s"
            }
    except:
        pass
    return None

def get_openai_response(messages):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=300,
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI error: {e}")
        return "AI service temporarily unavailable. Using backup mode, sir."

def get_fallback_response(message):
    message_lower = message.lower()
    if any(word in message_lower for word in ['hello', 'hi', 'hey']):
        return "Greetings, sir. How may I assist you today?"
    elif 'thank' in message_lower:
        return "You are most welcome, sir."
    elif 'bye' in message_lower or 'goodbye' in message_lower:
        return "Goodbye, sir. Have a productive day."
    else:
        return "I can help with time, date, weather, and basic commands. Internet connection required for advanced features."

def save_chat(user_message, ai_response):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    timestamp = datetime.datetime.now().isoformat()
    c.execute("INSERT INTO chat_history (timestamp, user_message, ai_response) VALUES (?, ?, ?)",
              (timestamp, user_message, ai_response))
    conn.commit()
    conn.close()

@app.route('/history', methods=['GET'])
def get_history():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM chat_history ORDER BY timestamp DESC LIMIT 50")
    rows = c.fetchall()
    conn.close()
    return jsonify([{
        'timestamp': row[1],
        'user': row[2],
        'ai': row[3]
    } for row in rows])

if __name__ == '__main__':
    app.run(debug=True, port=5000)
