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

def setup_indexes():
    # TTL Index for Soft Deletes (15 days = 15 * 24 * 60 * 60 = 1296000 seconds)
    db["cases"].create_index("deletedAt", expireAfterSeconds=1296000)
    print("MongoDB indexes verified/created.")

# Setup indexes on load
setup_indexes()

def check_connection():
    try:
        client.admin.command('ping')
        print("MongoDB connection successful.")
        return True
    except ConnectionFailure as e:
        print(f"MongoDB connection failed: {e}")
        return False
