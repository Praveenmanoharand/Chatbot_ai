import os
import base64
import json
import re
import requests
import uuid
import datetime
import bcrypt
from pymongo import MongoClient
from flask import Flask, request, jsonify, send_from_directory, render_template_string
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Note: Look one level up for static files since we are in /api/
app = Flask(__name__, static_folder='..', static_url_path='')
CORS(app)

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/ChatBot_AI")
# Add timeout to prevent hanging on connection failure
mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = mongo_client.get_database()
users_collection = db.users
conversations_collection = db.conversations
notifications_collection = db.notifications

@app.errorhandler(Exception)
def handle_exception(e):
    # Pass through HTTP errors
    return jsonify({"error": str(e)}), 500

# Paths also look one level up
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads', 'avatars')
DOCS_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads', 'documents')

try:
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(DOCS_FOLDER, exist_ok=True)
except OSError:
    UPLOAD_FOLDER = '/tmp/uploads/avatars'
    DOCS_FOLDER = '/tmp/uploads/documents'
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(DOCS_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['DOCS_FOLDER'] = DOCS_FOLDER

@app.route('/')
def home():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/status')
def status():
    return jsonify({
        "status": "online",
        "message": "Aura AI Backend is running!",
        "version": "2.4.1"
    })

# Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
KNOWLEDGE_FILE = os.path.join(os.path.dirname(__file__), "..", "AI Knowledge.txt")

GROQ_MODELS = [
    "llama-3.3-70b-versatile",
    "llama3-70b-8192",
    "llama3-8b-8192",
    "mixtral-8x7b-32768"
]

FREE_MODELS = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-3-27b-it:free",
    "google/gemma-3-12b-it:free",
    "mistralai/mistral-small-24b-instruct-2501:free",
    "microsoft/phi-3-mini-128k-instruct:free",
]

def load_knowledge():
    """Reads and parses the AI Knowledge text file into sections."""
    if not os.path.exists(KNOWLEDGE_FILE):
        return []
    
    with open(KNOWLEDGE_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    sections = re.split(r'-{10,}|={10,}', content)
    
    processed_sections = []
    for section in sections:
        cleaned = section.strip()
        if cleaned and len(cleaned) > 20:
            processed_sections.append(cleaned)
            
    return processed_sections

def get_relevant_context(query, knowledge_base, top_n=3):
    """Simple keyword-based retrieval for context."""
    query_words = set(re.findall(r'\w+', query.lower()))
    
    scored_sections = []
    for section in knowledge_base:
        section_words = set(re.findall(r'\w+', section.lower()))
        score = len(query_words.intersection(section_words))
        if score > 0:
            scored_sections.append((score, section))
            
    scored_sections.sort(key=lambda x: x[0], reverse=True)
    return [s[1] for s in scored_sections[:top_n]]

def call_openrouter(messages):
    """Try each model in FREE_MODELS until one succeeds."""
    if not OPENROUTER_API_KEY:
        return None, "OpenRouter API key not configured."

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    for model in FREE_MODELS:
        try:
            payload = {
                "model": model,
                "messages": messages
            }
            
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                data=json.dumps(payload),
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if 'choices' in result and result['choices']:
                    return result['choices'][0]['message']['content'], None
            
            # On ANY non-200 code, skip to the next model
            print(f"OpenRouter model {model} failed with status {response.status_code}, trying next...")
            continue

        except Exception as e:
            print(f"OpenRouter exception for {model}: {str(e)}")
            continue

    return None, "All OpenRouter models are currently unavailable."

def call_groq(messages):
    """Try to call Groq API for lightning fast responses."""
    if not GROQ_API_KEY:
        return None, "Groq API key not configured."

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    for model in GROQ_MODELS:
        payload = {
            "model": model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 1024,
            "top_p": 1,
            "stream": False
        }
        
        try:
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                data=json.dumps(payload),
                timeout=20
            )
            
            if response.status_code == 200:
                result = response.json()
                if 'choices' in result and result['choices']:
                    return result['choices'][0]['message']['content'], None
            
            # On ANY non-200 code, skip to the next model
            print(f"Groq model {model} failed with status {response.status_code}, trying next...")
            continue
                
        except Exception as e:
            print(f"Groq API Error for {model}: {str(e)}")
            continue

    return None, "Groq models unavailable."

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    dob = data.get('dob')
    mobile = data.get('mobile')
    password = data.get('password')
    
    if not all([username, email, dob, mobile, password]):
        return jsonify({"error": "All fields are required"}), 400
        
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email is already registered"}), 400
        
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user_id = str(uuid.uuid4())
    
    new_user = {
        "user_id": user_id,
        "username": username,
        "email": email,
        "dob": dob,
        "mobile": mobile,
        "password": hashed_password,
        "created_at": datetime.datetime.now(),
        "total_messages": 0,
        "total_chats": 0
    }
    
    users_collection.insert_one(new_user)
    return jsonify({"message": "User registered successfully", "user_id": user_id}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    user = users_collection.find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({"error": "Invalid email or password"}), 401
        
    profile_data = {
        "user_id": user['user_id'],
        "name": user["username"],
        "email": user["email"],
        "phone": user.get("mobile", ""),
        "dob": user.get("dob", ""),
        "bio": user.get("bio", ""),
        "location": user.get("location", ""),
        "avatar_url": user.get("avatar_url", ""),
        "stats": {
            "total_messages": user.get("total_messages", 0),
            "total_chats": user.get("total_chats", 0),
            "member_since": user.get("created_at").strftime("%b %Y") if user.get("created_at") else "Mar 2024"
        }
    }
    return jsonify({"message": "Login successful", "profile": profile_data}), 200

# --- Profile APIs ---

@app.route('/api/profile/update', methods=['POST'])
def update_profile():
    data = request.json
    user_id = data.get('user_id')
    update_data = {
        "username": data.get('name'),
        "mobile": data.get('phone'),
        "bio": data.get('bio'),
        "location": data.get('location')
    }
    update_data = {k: v for k, v in update_data.items() if v is not None}
    users_collection.update_one({"user_id": user_id}, {"$set": update_data})
    return jsonify({"message": "Profile updated successfully"})

@app.route('/api/profile/avatar', methods=['POST'])
def upload_avatar():
    user_id = request.form.get('user_id')
    file = request.files['avatar']
    if file:
        file_bytes = file.read()
        avatar_base64 = base64.b64encode(file_bytes).decode('utf-8')
        avatar_data_url = f"data:{file.content_type};base64,{avatar_base64}"
        avatar_url = avatar_data_url
        users_collection.update_one({"user_id": user_id}, {"$set": {"avatar_url": avatar_url, "avatar_data": avatar_data_url}})
        return jsonify({"message": "Avatar uploaded", "avatar_url": avatar_url})

# --- Conversation APIs ---

@app.route('/api/conversations', methods=['GET'])
def get_conversations():
    user_id = request.args.get('user_id')
    convs = list(conversations_collection.find({"user_id": user_id}).sort("updated_at", -1))
    for c in convs: c['_id'] = str(c['_id'])
    return jsonify(convs)

@app.route('/api/conversations', methods=['POST'])
def create_conversation():
    data = request.json
    new_conv = {
        "user_id": data.get('user_id'),
        "title": data.get('title', 'New Chat'),
        "messages": [],
        "is_pinned": False,
        "is_archived": False,
        "created_at": datetime.datetime.now(),
        "updated_at": datetime.datetime.now()
    }
    result = conversations_collection.insert_one(new_conv)
    # Increment user's total_chats statistic
    users_collection.update_one({"user_id": data.get('user_id')}, {"$inc": {"total_chats": 1}})
    return jsonify({"conversation_id": str(result.inserted_id)})

@app.route('/api/conversations/<conv_id>', methods=['GET'])
def get_conversation_details(conv_id):
    from bson.objectid import ObjectId
    try:
        obj_id = ObjectId(conv_id)
    except:
        return jsonify({"error": "Invalid conversation ID format"}), 400
        
    conv = conversations_collection.find_one({"_id": obj_id})
    if not conv: return jsonify({"error": "Not found"}), 404
    conv['_id'] = str(conv['_id'])
    return jsonify(conv)

@app.route('/api/conversations/<conv_id>', methods=['PATCH'])
def update_conversation(conv_id):
    from bson.objectid import ObjectId
    try:
        obj_id = ObjectId(conv_id)
    except:
        return jsonify({"error": "Invalid conversation ID format"}), 400
        
    data = request.json
    update_data = {k: v for k, v in data.items() if k in ['is_pinned', 'is_archived', 'title']}
    update_data['updated_at'] = datetime.datetime.now()
    conversations_collection.update_one({"_id": obj_id}, {"$set": update_data})
    return jsonify({"success": True})

@app.route('/api/conversations/<conv_id>', methods=['DELETE'])
def delete_conversation(conv_id):
    from bson.objectid import ObjectId
    try:
        obj_id = ObjectId(conv_id)
    except:
        return jsonify({"error": "Invalid conversation ID format"}), 400
        
    # Find conversation first to get user_id for stat decrement
    conv = conversations_collection.find_one({"_id": obj_id})
    if conv:
        conversations_collection.delete_one({"_id": obj_id})
        # Decrement user's total_chats statistic
        users_collection.update_one({"user_id": conv['user_id']}, {"$inc": {"total_chats": -1}})
        
    return jsonify({"success": True})

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    user_id = request.args.get('user_id')
    return jsonify([
        {"id": "1", "title": "Welcome to Aura AI", "message": "Start your first conversation now!", "time": "Just now", "type": "info"},
        {"id": "2", "title": "New Model Available", "message": "Try the new Llama 3.3 for faster responses.", "time": "2h ago", "type": "success"}
    ])

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_id = data.get('user_id')
    conv_id = data.get('conversation_id')
    user_message = data.get('message', '')
    
    knowledge_base = load_knowledge()
    relevant_sections = get_relevant_context(user_message, knowledge_base)
    full_context = "\n\n".join(relevant_sections)
    
    system_prompt = f"You are 'Aura AI', a premium AI Expert.\nContext:\n{full_context}"
    messages = [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_message}]
    
    if conv_id and user_id:
        from bson.objectid import ObjectId
        try:
            obj_id = ObjectId(conv_id)
            # Save User Message IMMEDIATELY to avoid data loss before AI call
            user_msg = {"role": "user", "content": user_message, "timestamp": datetime.datetime.now()}
            conversations_collection.update_one(
                {"_id": obj_id}, 
                {"$push": {"messages": user_msg}, "$set": {"updated_at": datetime.datetime.now()}}
            )
            users_collection.update_one({"user_id": user_id}, {"$inc": {"total_messages": 1}})
        except:
            # If ID is invalid (e.g. temporary frontend ID), we skip saving for now 
            # as it will be saved correctly once the real ID is synced.
            pass

    # Try Groq first as it's faster and more reliable
    bot_response, error = call_groq(messages)
    
    # Fallback to OpenRouter if Groq fails
    if error:
        print(f"Groq failed, falling back to OpenRouter: {error}")
        bot_response, error = call_openrouter(messages)
        
    if error: return jsonify({"error": error}), 503
    
    if conv_id and user_id:
        from bson.objectid import ObjectId
        try:
            obj_id = ObjectId(conv_id)
            # Save Bot Response independently after generation
            bot_msg = {"role": "bot", "content": bot_response, "timestamp": datetime.datetime.now()}
            conversations_collection.update_one(
                {"_id": obj_id}, 
                {"$push": {"messages": bot_msg}, "$set": {"updated_at": datetime.datetime.now()}}
            )
        except:
            pass
    
    return jsonify({"response": bot_response})

@app.route('/shared/<conv_id>')
def shared_chat(conv_id):
    from bson.objectid import ObjectId
    try:
        conv = conversations_collection.find_one({"_id": ObjectId(conv_id)})
        if not conv: return "Conversation not found", 404
        
        # Format messages for the template
        formatted_messages = []
        for msg in conv.get('messages', []):
            role = msg.get('role', msg.get('sender', 'user'))
            content = msg.get('content', msg.get('text', ''))
            timestamp = msg.get('timestamp')
            
            # Basic time formatting if timestamp exists
            time_str = ""
            if timestamp:
                if isinstance(timestamp, datetime.datetime):
                    time_str = timestamp.strftime("%I:%M %p")
                elif isinstance(timestamp, (int, float)):
                    time_str = datetime.datetime.fromtimestamp(timestamp/1000).strftime("%I:%M %p")
            
            formatted_messages.append({
                "role": 'user' if role == 'user' else 'bot',
                "content": content,
                "time": time_str
            })

        return render_template_string("""
            <!DOCTYPE html>
            <html lang="en" data-theme="dark">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>{{ conv.title }} | Shared via Aura AI</title>
                <!-- Reuse main app styles -->
                <link rel="stylesheet" href="/style.css">
                <!-- Font Awesome -->
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
                <!-- Google Fonts -->
                <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
                
                <style>
                    body { 
                        background-color: var(--bg-primary);
                        color: var(--text-primary);
                        margin: 0;
                        display: flex;
                        flex-direction: column;
                        min-height: 100vh;
                    }
                    .shared-header {
                        padding: var(--space-6);
                        border-bottom: 1px solid var(--border-subtle);
                        background: var(--bg-secondary);
                        position: sticky;
                        top: 0;
                        z-index: 100;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        backdrop-filter: blur(10px);
                    }
                    .shared-header h1 {
                        margin: 0;
                        font-size: var(--text-xl);
                        font-family: var(--font-display);
                        color: var(--text-primary);
                    }
                    .shared-container {
                        max-width: 850px;
                        margin: 0 auto;
                        padding: var(--space-8) var(--space-4);
                        width: 100%;
                        flex: 1;
                    }
                    .shared-footer {
                        padding: var(--space-10);
                        text-align: center;
                        border-top: 1px solid var(--border-subtle);
                        background: var(--bg-secondary);
                    }
                    .brand-logo {
                        font-family: var(--font-display);
                        color: var(--primary);
                        font-weight: 700;
                        font-size: 1.2rem;
                        text-decoration: none;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .cta-btn {
                        display: inline-block;
                        padding: 10px 25px;
                        background: var(--primary);
                        color: white;
                        text-decoration: none;
                        border-radius: var(--radius-full);
                        font-weight: 600;
                        margin-top: 20px;
                        transition: all 0.3s ease;
                    }
                    .cta-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 5px 15px var(--primary-alpha-40);
                    }
                    .message-meta {
                        display: flex;
                        gap: 8px;
                        font-size: 0.75rem;
                        color: var(--text-muted);
                        margin-top: 5px;
                    }
                    /* Simple tweak for shared view */
                    .message { opacity: 1; transform: none; }
                </style>
            </head>
            <body>
                <header class="shared-header">
                    <a href="/" class="brand-logo">
                        <i class="fas fa-robot"></i>
                        Aura AI
                    </a>
                    <h1>{{ conv.title }}</h1>
                    <div style="width: 100px;"></div> <!-- Spacer -->
                </header>

                <main class="shared-container">
                    <div class="messages-area" style="padding: 0;">
                        {% for msg in messages %}
                            <div class="message {{ msg.role }}">
                                <div class="message-avatar">
                                    <i class="fas {{ 'fa-user' if msg.role == 'user' else 'fa-robot' }}"></i>
                                </div>
                                <div class="message-content">
                                    <div class="message-bubble">{{ msg.content }}</div>
                                    <div class="message-meta">
                                        <span>{{ 'You' if msg.role == 'user' else 'Aura AI' }}</span>
                                        {% if msg.time %}<span>• {{ msg.time }}</span>{% endif %}
                                    </div>
                                </div>
                            </div>
                        {% endfor %}
                    </div>
                </main>

                <footer class="shared-footer">
                    <p>This conversation was generated and shared via Aura AI.</p>
                    <a href="/" class="cta-btn">Start Your Own Chat</a>
                </footer>
            </body>
            </html>
        """, conv=conv, messages=formatted_messages)
    except Exception as e: 
        print(f"Share error: {e}")
        return "Invalid ID or Error loading shared chat", 400

# Vercel entry point
app_instance = app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
