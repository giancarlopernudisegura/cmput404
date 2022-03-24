from doctest import Example
from server.test_constants import *
import sqlite3

DB = "test.db"


def pytest_configure(config):
    conn = sqlite3.connect(DB)
    conn.execute(
        "INSERT INTO author VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?);",
        (
            # User 1
            T_USER1_UUID,
            "Giancarlo",
            "31188380",
            "https://avatars.githubusercontent.com/u/31188380?v=4",
            True,
            True,
            # User 2
            T_USER2_UUID,
            "Dan",
            "738053",
            "https://avatars.githubusercontent.com/u/738053?v=4",
            False,
            True,
            # User 3
            T_USER3_UUID,
            "Lidia",
            "42719299",
            "https://avatars.githubusercontent.com/u/42719299?v=4",
            False,
            True,
        ),
    )
    conn.commit()
    conn.close()


def pytest_unconfigure(config):
    conn = sqlite3.connect(DB)
    conn.execute("DELETE FROM author;")
    conn.execute("DELETE FROM post;")
    conn.execute("DELETE FROM comment;")
    conn.execute("DELETE FROM like;")
    conn.execute("DELETE FROM inbox;")
    conn.execute("DELETE FROM requests;")
    conn.execute("DELETE FROM viewablePostRelation;")
    conn.commit()
    conn.close()
    pass
