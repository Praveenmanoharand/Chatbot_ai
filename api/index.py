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
mongo_client = MongoClient(MONGO_URI)
db = mongo_client.get_database()
users_collection = db.users
conversations_collection = db.conversations
notifications_collection = db.notifications

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

@app.route('/api/status')
def status():
    return jsonify({
        "status": "online",
        "message": "Aura AI Backend is running!",
        "version": "2.4.1"
    })

# Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
KNOWLEDGE_FILE = os.path.join(os.path.dirname(__file__), "..", "AI Knowledge.txt")

FREE_MODELS = [
    "openrouter/free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-3-27b-it:free",
    "google/gemma-3-12b-it:free",
    "deepseek/deepseek-r1:free",
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
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    for model in FREE_MODELS:
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
            try:
                result = response.json()
                if 'choices' in result and result['choices']:
                    return result['choices'][0]['message']['content'], None
            except:
                continue
        
        if response.status_code in (429, 503, 502, 500):
            continue
        
        return None, f"API error {response.status_code}"

    return None, "All models are currently rate-limited."

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
    return jsonify({"conversation_id": str(result.inserted_id)})

@app.route('/api/conversations/<conv_id>', methods=['GET'])
def get_conversation_details(conv_id):
    from bson.objectid import ObjectId
    conv = conversations_collection.find_one({"_id": ObjectId(conv_id)})
    if not conv: return jsonify({"error": "Not found"}), 404
    conv['_id'] = str(conv['_id'])
    return jsonify(conv)

@app.route('/api/conversations/<conv_id>', methods=['PATCH'])
def update_conversation(conv_id):
    from bson.objectid import ObjectId
    data = request.json
    update_data = {k: v for k, v in data.items() if k in ['is_pinned', 'is_archived', 'title']}
    update_data['updated_at'] = datetime.datetime.now()
    conversations_collection.update_one({"_id": ObjectId(conv_id)}, {"$set": update_data})
    return jsonify({"success": True})

@app.route('/api/conversations/<conv_id>', methods=['DELETE'])
def delete_conversation(conv_id):
    from bson.objectid import ObjectId
    conversations_collection.delete_one({"_id": ObjectId(conv_id)})
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
    
    bot_response, error = call_openrouter(messages)
    if error: return jsonify({"error": error}), 503
    
    if conv_id and user_id:
        from bson.objectid import ObjectId
        new_msgs = [
            {"role": "user", "content": user_message, "timestamp": datetime.datetime.now()},
            {"role": "bot", "content": bot_response, "timestamp": datetime.datetime.now()}
        ]
        conversations_collection.update_one({"_id": ObjectId(conv_id)}, {"$push": {"messages": {"$each": new_msgs}}, "$set": {"updated_at": datetime.datetime.now()}})
        users_collection.update_one({"user_id": user_id}, {"$inc": {"total_messages": 1}})
    
    return jsonify({"response": bot_response})

@app.route('/shared/<conv_id>')
def shared_chat(conv_id):
    from bson.objectid import ObjectId
    try:
        conv = conversations_collection.find_one({"_id": ObjectId(conv_id)})
        if not conv: return "Conversation not found", 404
        return render_template_string("""
            <html>
                <head><title>{{ conv.title }} - Shared via Aura AI</title>
                <link rel="stylesheet" href="/style.css">
                <style>body { padding: 50px; max-width: 800px; margin: auto; }</style></head>
                <body data-theme="dark">
                    <h1>{{ conv.title }}</h1>
                    <div id="messagesArea">
                        {% for msg in conv.messages %}
                            <div class="message {{ msg.role }}">
                                <strong>{{ 'User' if msg.role == 'user' else 'Aura AI' }}:</strong>
                                <p>{{ msg.content }}</p>
                            </div>
                        {% endfor %}
                    </div>
                </body>
            </html>
        """, conv=conv)
    except: return "Invalid ID", 400

# Vercel entry point
app_instance = app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
