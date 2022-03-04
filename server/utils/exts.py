import os
from dotenv import load_dotenv
from urllib.request import urlopen
from functools import lru_cache
import json

load_dotenv()

HOST = os.getenv("FLASK_HOST")


def is_local_node(URI: str) -> bool:
    """
    Check if URI is local node
    """
    return URI.startswith(HOST)


@lru_cache(maxsize=64)
def get_github_info(githubId: str):
    resp = urlopen(f"https://api.github.com/user/{githubId}")
    return json.loads(resp.read().decode("utf-8"))
