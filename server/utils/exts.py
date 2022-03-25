import os
from dotenv import load_dotenv
from urllib.request import urlopen
from urllib.error import HTTPError
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
    try:
        resp = urlopen(f"https://api.github.com/user/{githubId}")
    except HTTPError:
        return {
            "html_url": "http://github.com"
        }
    return json.loads(resp.read().decode("utf-8"))

@lru_cache(maxsize=64)
def get_github_by_id(gh_username: str):
    resp = urlopen(f'https://api.github.com/users/{gh_username}')
    return json.loads(resp.read().decode('utf-8'))