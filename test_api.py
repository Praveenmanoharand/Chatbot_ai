import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")
print(f"API Key: {api_key[:10]}...")

FREE_MODELS = [
    "openrouter/free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-3-27b-it:free",
    "qwen/qwen-2.5-72b-instruct:free",
]

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

for model in FREE_MODELS:
    print(f"\nTesting model: {model}")
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": "Hello, respond with 1 word."}]
    }
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            data=json.dumps(payload),
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json().get('choices', [{}])[0].get('message', {}).get('content')}")
            break
        else:
            print(f"Error: {response.text[:200]}")
    except Exception as e:
        print(f"Exception: {str(e)}")
