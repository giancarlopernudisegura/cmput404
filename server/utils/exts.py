import os
from dotenv import load_dotenv

load_dotenv()

HOST = os.getenv("FLASK_HOST")


def is_local_node(URI: str) -> bool:
    """
    Check if URI is local node
    """
    return URI.startswith(HOST)
