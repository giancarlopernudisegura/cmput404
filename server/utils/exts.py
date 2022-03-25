import os
from dotenv import load_dotenv
import requests_cache
from http import HTTPStatus
from functools import lru_cache
import json

load_dotenv()

HOST = os.getenv("FLASK_HOST")

cached_session = requests_cache.CachedSession('github_cache')


def is_local_node(URI: str) -> bool:
    """
    Check if URI is local node
    """
    return URI.startswith(HOST)


@lru_cache(maxsize=64)
def get_github_info(githubId: str):
    resp = cached_session.get(f"https://api.github.com/user/{githubId}")
    if resp.status_code == HTTPStatus.FORBIDDEN:
        return {
            "html_url": "http://github.com"
        }
    return resp.json()

@lru_cache(maxsize=64)
def get_github_by_id(gh_username: str):
    resp = cached_session.get(f'https://api.github.com/users/{gh_username}')
    return resp.json()
