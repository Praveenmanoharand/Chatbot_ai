import os
import requests
import json
from dotenv import load_dotenv

# Load from the project's .env file
load_dotenv('g:/Chatbot AI/.env')

groq_key = os.getenv("GROQ_API_KEY")

if not groq_key:
    print("FAILED: GROQ_API_KEY not found in .env")
    exit(1)

print(f"Key found: {groq_key[:10]}...")

models = ["llama-3.3-70b-versatile", "llama3-70b-8192", "llama3-8b-8192"]
headers = {
    "Authorization": f"Bearer {groq_key}",
    "Content-Type": "application/json"
}

for model in models:
    print(f"Testing model: {model}")
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": "Hello, answer in 1 word."}]
    }
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            data=json.dumps(payload),
            timeout=10
        )
        if response.status_code == 200:
            print(f"SUCCESS: {model} responded: {response.json()['choices'][0]['message']['content']}")
            break
        else:
            print(f"FAILED: {model} status code {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"EXCEPTION: {str(e)}")
