import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "bhairav")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not set in environment variables.")

client = MongoClient(
    MONGODB_URI,
    connect=False,
    connectTimeoutMS=10000,
    socketTimeoutMS=30000,
    serverSelectionTimeoutMS=10000,
    retryWrites=True,
)
db = client[MONGODB_DB_NAME]

def get_collection(collection_name: str):
    return db[collection_name]

import threading

def setup_indexes():
    try:
        db["cases"].create_index("deletedAt", expireAfterSeconds=1296000, background=True)
        db["cases"].create_index([
            ("caseNumber", "text"),
            ("title", "text"),
            ("city", "text"),
            ("crimeType", "text")
        ], background=True)
        print("MongoDB indexes verified/created.")
    except Exception as e:
        print(f"MongoDB index creation warning: {e}")

threading.Thread(target=setup_indexes, daemon=True).start()

def check_connection():
    try:
        client.admin.command("ping", serverSelectionTimeoutMS=10000)
        print("MongoDB connection successful.")
        return True, None
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print(f"MongoDB connection failed: {e}")
        return False, str(e)
