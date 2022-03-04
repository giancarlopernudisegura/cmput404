import pytest
import os
import sys
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from server.run import create_app


def login(client):
    r = client.post(
        "/login/unit_test",
        data=json.dumps({"author_id": 1}),
        content_type="application/json",
        follow_redirects=True,
    )
    assert r.status_code == 200


@pytest.fixture(scope="module")
def test_client():
    client = create_app("server.config.TestingConfig")

    testing_client = client.test_client()

    ctx = client.app_context()
    ctx.push()

    yield testing_client

    ctx.pop()


def test_index(test_client):
    r = test_client.get("/")
    assert r.status_code == 302


def test_hello_world(test_client):
    r = test_client.get("/api/hello_world")
    assert r.status_code == 404


def test_login(test_client):
    # test login page redirects
    r = test_client.get("/")
    assert r.status_code == 302
    r = test_client.get("/app")
    assert r.status_code == 302
    r = test_client.get("/app/login")
    assert r.status_code == 200
    r = test_client.get("/", follow_redirects=True)
    assert r.status_code == 200

    # test login
    r = test_client.get("/login_test")
    assert r.status_code == 401
    login(test_client)
    r = test_client.get("/login_test")
    assert r.status_code == 200
    r = test_client.get("/user_me")
    assert r.status_code == 200
    data = json.JSONDecoder().decode(r.data.decode("utf-8"))["data"]
    assert data["type"] == "author"
    assert data["author_id"] == 1
    assert data["displayName"] == "Giancarlo"


def test_get_authors(test_client):
    r = test_client.get("/authors")
    assert r.status_code == 200
    r = test_client.get("/authors/1")
    assert r.status_code == 200
    r = test_client.get("/authors/2")
    assert r.status_code == 404


def test_posts(test_client):
    r = test_client.get("/authors/1/posts", follow_redirects=True)
    assert r.status_code == 200
    r = test_client.get("/authors/1/posts/1", follow_redirects=True)
    assert r.status_code == 404
    login(test_client)
    r = test_client.post(
        "/authors/1/posts/",
        data=json.dumps(
            {
                "title": "test invalid",
                "content": "test invalid",
                "category": "test invalid",
                "contentType": "text/html",
                "visibility": "public",
            }
        ),
        content_type="application/json",
        follow_redirects=True,
    )
    assert r.status_code == 400
    r = test_client.post(
        "/authors/1/posts/",
        data=json.dumps(
            {
                "title": "test invalid",
                "content": "test invalid",
                "category": "test invalid",
                "contentType": "text/plain",
            }
        ),
        content_type="application/json",
        follow_redirects=True,
    )
    assert r.status_code == 400
    r = test_client.post(
        "/authors/1/posts/",
        data=json.dumps(
            {
                "title": "test title",
                "content": "test content",
                "category": "test category",
                "contentType": "text/markdown",
                "visibility": "public",
            }
        ),
        content_type="application/json",
        follow_redirects=True,
    )
    assert r.status_code == 200
    r = test_client.get("/authors/1/posts/1", follow_redirects=True)
    assert r.status_code == 200
    r = test_client.get("/authors/1/posts/2", follow_redirects=True)
    assert r.status_code == 404
    r = test_client.put(
        "/authors/1/posts/3",
        data=json.dumps(
            {
                "title": "test title 2",
                "content": "test content 2",
                "category": "test category",
                "contentType": "text/plain",
                "visibility": "public",
            }
        ),
        content_type="application/json",
        follow_redirects=True,
    )
    print(r.data)
    assert r.status_code == 201
    r = test_client.get("/authors/1/posts/3", follow_redirects=True)
    assert r.status_code == 200
    r = test_client.delete("/authors/1/posts/3", follow_redirects=True)
    assert r.status_code == 204
