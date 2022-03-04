from cgi import test
import pytest
import os
import sys
import json
from flask.testing import FlaskClient

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from server.run import create_app


def login(client: FlaskClient, user_id: int):
    r = client.post(
        "/login/unit_test",
        data=json.dumps({"author_id": user_id}),
        content_type="application/json",
        follow_redirects=True,
    )
    assert r.status_code == 200


def logout(client: FlaskClient):
    r = client.post("/logout", follow_redirects=True)
    assert r.status_code == 200


@pytest.fixture(scope="module")
def test_client():
    client = create_app("server.config.TestingConfig")

    testing_client = client.test_client()

    ctx = client.app_context()
    ctx.push()

    yield testing_client

    ctx.pop()


@pytest.mark.order(1)
def test_index(test_client: FlaskClient):
    r = test_client.get("/")
    assert r.status_code == 302


@pytest.mark.order(2)
def test_hello_world(test_client: FlaskClient):
    r = test_client.get("/api/hello_world")
    assert r.status_code == 404


@pytest.mark.order(3)
def test_login(test_client: FlaskClient):
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
    login(test_client, 1)
    r = test_client.get("/login_test")
    assert r.status_code == 200
    r = test_client.get("/user_me")
    assert r.status_code == 200
    data = json.loads(r.data.decode("utf-8"))["data"]
    assert data["type"] == "author"
    assert data["id"] == 1
    assert data["displayName"] == "Giancarlo"


@pytest.mark.order(4)
def test_get_authors(test_client: FlaskClient):
    r = test_client.get("/authors")
    assert r.status_code == 200
    r = test_client.get("/authors/1")
    assert r.status_code == 200
    r = test_client.get("/authors/0")
    assert r.status_code == 404


@pytest.mark.order(5)
def test_posts(test_client: FlaskClient):
    r = test_client.get("/authors/1/posts", follow_redirects=True)
    assert r.status_code == 200
    r = test_client.get("/authors/1/posts/1", follow_redirects=True)
    assert r.status_code == 404
    login(test_client, 1)
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
    assert r.status_code == 201
    r = test_client.get("/authors/1/posts/3", follow_redirects=True)
    assert r.status_code == 200
    r = test_client.delete("/authors/1/posts/3", follow_redirects=True)
    assert r.status_code == 204


@pytest.mark.order(6)
def test_comments(test_client: FlaskClient):
    r = test_client.get("/authors/1/posts/1/comments", follow_redirects=True)
    assert r.status_code == 200
    data = json.loads(r.data.decode("utf-8"))
    assert data["type"] == "comments"
    assert data["size"] == 0
    r = test_client.post(
        "/authors/1/posts/1/comments",
        data=json.dumps(
            {
                "title": "test title",
                "content": "test comment",
                "contentType": "text/markdown",
            }
        ),
        content_type="application/json",
        follow_redirects=True,
    )
    assert r.status_code == 200
    r = test_client.get("/authors/1/posts/1/comments", follow_redirects=True)
    data = json.loads(r.data.decode("utf-8"))
    assert data["type"] == "comments"
    assert data["size"] == 1


@pytest.mark.order(7)
def test_followers(test_client: FlaskClient):
    r = test_client.get("/authors/2/followers", follow_redirects=True)
    data = json.loads(r.data.decode("utf-8"))
    assert data["type"] == "followers"
    assert len(data["items"]) == 0
    r = test_client.put("/authors/2/followers/1", follow_redirects=True)
    assert r.status_code == 200
    r = test_client.put("/authors/2/followers/3", follow_redirects=True)
    assert r.status_code == 403
    r = test_client.get("/authors/2/followers", follow_redirects=True)
    data = json.loads(r.data.decode("utf-8"))
    assert data["type"] == "followers"
    assert len(data["items"]) == 1
    r = test_client.get("/authors/2/followers/1", follow_redirects=True)
    assert r.status_code == 200
    data = json.loads(r.data.decode("utf-8"))
    assert len(data["items"]) == 1
    r = test_client.delete("/authors/2/followers/1", follow_redirects=True)
    assert r.status_code == 204
    r = test_client.get("/authors/2/followers/1", follow_redirects=True)
    assert r.status_code == 200
    data = json.loads(r.data.decode("utf-8"))
    assert len(data["items"]) == 0


@pytest.mark.order(8)
def test_inbox(test_client: FlaskClient):
    r = test_client.get("/authors/2/inbox", follow_redirects=True)
    assert r.status_code == 401
    # user 1 will follow user 2
    test_client.put("/authors/2/followers/1", follow_redirects=True)
    logout(test_client)
    login(test_client, 2)
    r = test_client.get("/authors/2/inbox", follow_redirects=True)
    assert r.status_code == 200
    data = json.loads(r.data.decode("utf-8"))
    assert data["type"] == "inbox"
    assert len(data["items"]) == 1
    assert data["items"][0]["type"] == "followers"
    r = test_client.delete("/authors/2/inbox", follow_redirects=True)
    r = test_client.get("/authors/2/inbox", follow_redirects=True)
    data = json.loads(r.data.decode("utf-8"))
    assert data["type"] == "inbox"
    assert len(data["items"]) == 0
