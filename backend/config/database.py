import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "bhairav")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not set in environment variables.")

client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB_NAME]

def get_collection(collection_name: str):
    return db[collection_name]

def check_connection():
    try:
        client.admin.command('ping')
        print("MongoDB connection successful.")
        return True
    except ConnectionFailure as e:
        print(f"MongoDB connection failed: {e}")
        return False
