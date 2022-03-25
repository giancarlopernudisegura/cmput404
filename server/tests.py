from cgi import test
import pytest
import os
import sys
import json
import uuid
from flask.testing import FlaskClient
from server.test_constants import *

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from server.run import create_app


def login(client: FlaskClient, user_id: str):
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
    login(test_client, T_USER1_UUID)
    r = test_client.get("/login_test")
    assert r.status_code == 200


@pytest.mark.order(4)
def test_get_authors(test_client: FlaskClient):
    r = test_client.get("/authors")
    assert r.status_code == 200
    r = test_client.get(f"/authors/{T_USER1_UUID}")
    assert r.status_code == 200
    r = test_client.get("/authors/0")
    assert r.status_code == 404


@pytest.mark.order(5)
def test_posts(test_client: FlaskClient):
    r = test_client.get(f"/authors/{T_USER1_UUID}/posts", follow_redirects=True)
    assert r.status_code == 200
    r = test_client.get(f"/authors/{T_USER1_UUID}/posts/1", follow_redirects=True)
    assert r.status_code == 404
    login(test_client, T_USER1_UUID)
    r = test_client.post(
        f"/authors/{T_USER1_UUID}/posts/",
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
        f"/authors/{T_USER1_UUID}/posts/",
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
        f"/authors/{T_USER1_UUID}/posts/",
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
    post_id = r.json["id"]
    r = test_client.get(f"/authors/{T_USER1_UUID}/posts/{post_id}", follow_redirects=True)
    assert r.status_code == 200
    r = test_client.get("/authors/{T_USER1_UUID}/posts/2", follow_redirects=True)
    assert r.status_code == 404
    r = test_client.put(
        f"/authors/{T_USER1_UUID}/posts/{T_POST_NEW1_UUID}",
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
    r = test_client.get(f"/authors/{T_USER1_UUID}/posts/{T_POST_NEW1_UUID}", follow_redirects=True)
    assert r.status_code == 200
    r = test_client.delete(f"/authors/{T_USER1_UUID}/posts/{T_POST_NEW1_UUID}", follow_redirects=True)
    assert r.status_code == 204


@pytest.mark.order(6)
def test_comments(test_client: FlaskClient):
    #Need to get new first post ID
    r = test_client.get(f"/authors/{T_USER1_UUID}/posts")
    first_post_id = r.json["items"][0]["id"]
    r = test_client.get(f"/authors/{T_USER1_UUID}/posts/{first_post_id}/comments", follow_redirects=True)
    assert r.status_code == 200
    data = json.loads(r.data.decode("utf-8"))
    assert data["type"] == "comments"
    assert data["size"] == 0
    r = test_client.post(
        f"/authors/{T_USER1_UUID}/posts/{first_post_id}/comments",
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
    r = test_client.get( f"/authors/{T_USER1_UUID}/posts/{first_post_id}/comments", follow_redirects=True)
    data = json.loads(r.data.decode("utf-8"))
    assert data["type"] == "comments"
    assert data["size"] == 1


@pytest.mark.order(7)
def test_followers(test_client: FlaskClient):
    r = test_client.get(f"/authors/{T_USER2_UUID}/followers", follow_redirects=True)
    data = json.loads(r.data.decode("utf-8"))
    assert data["type"] == "followers"
    assert len(data["items"]) == 0
    r = test_client.put(f"/authors/{T_USER2_UUID}/followers/{T_USER1_UUID}", follow_redirects=True)
    assert r.status_code == 200
    r = test_client.put(f"/authors/{T_USER2_UUID}/followers/{T_USER3_UUID}", follow_redirects=True)
    assert r.status_code == 403
    r = test_client.get(f"/authors/{T_USER2_UUID}/followers", follow_redirects=True)
    data = json.loads(r.data.decode("utf-8"))
    assert data["type"] == "followers"
    assert len(data["items"]) == 1
    r = test_client.get(f"/authors/{T_USER2_UUID}/followers/{T_USER1_UUID}", follow_redirects=True)
    assert r.status_code == 200
    data = json.loads(r.data.decode("utf-8"))
    assert len(data["items"]) == 1
    r = test_client.delete(f"/authors/{T_USER2_UUID}/followers/{T_USER1_UUID}", follow_redirects=True)
    assert r.status_code == 204
    r = test_client.get(f"/authors/{T_USER2_UUID}/followers/{T_USER1_UUID}", follow_redirects=True)
    assert r.status_code == 200
    data = json.loads(r.data.decode("utf-8"))
    assert len(data["items"]) == 0


@pytest.mark.order(8)
def test_inbox(test_client: FlaskClient):
    r = test_client.get(f"/authors/{T_USER2_UUID}/inbox", follow_redirects=True)
    assert r.status_code == 401
    # user 1 will follow user 2
    test_client.put(f"/authors/{T_USER2_UUID}/followers/{T_USER1_UUID}", follow_redirects=True)
    logout(test_client)
    login(test_client, T_USER2_UUID)
    r = test_client.get(f"/authors/{T_USER2_UUID}/inbox", follow_redirects=True)
    assert r.status_code == 200
    data = json.loads(r.data.decode("utf-8"))
    assert data["type"] == "inbox"
    assert len(data["items"]) == 1
    assert data["items"][0]["type"] == "followers"
    r = test_client.delete(f"/authors/{T_USER2_UUID}/inbox", follow_redirects=True)
    r = test_client.get(f"/authors/{T_USER2_UUID}/inbox", follow_redirects=True)
    data = json.loads(r.data.decode("utf-8"))
    assert data["type"] == "inbox"
    assert len(data["items"]) == 0
