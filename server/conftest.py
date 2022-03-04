from doctest import Example
import sqlite3

DB = "test.db"


def pytest_configure(config):
    conn = sqlite3.connect(DB)
    conn.execute(
        "INSERT INTO author (id, displayName, githubId, profileImageId, isAdmin, isVerified) VALUES (?, ?, ?, ?, ?, ?);",
        (
            1,
            "Giancarlo",
            "31188380",
            "https://avatars.githubusercontent.com/u/31188380?v=4",
            True,
            True,
        ),
    )
    conn.commit()
    conn.close()


def pytest_unconfigure(config):
    conn = sqlite3.connect(DB)
    conn.execute("DELETE FROM author;")
    conn.commit()
    conn.close()
