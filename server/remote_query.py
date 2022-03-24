from server.models import Author, Inbox, Post, Comment, Requests, Like, Remote_Node
import requests

    
def get_all_remote_authors():#for downed remote https://website404.herokuapp.com/authors?size=10&page=1
    nodes = Remote_Node.query.all()
    items = []   
    for node in nodes:
        r = requests.get(f"{node.id}authors?size=30&page=1")
        if r.status_code == 200: 
            items.extend(r.json()["items"])
    return items

def get_remote_author(author_id: str):
    nodes = Remote_Node.query.all()
    for node in nodes:
        r = requests.get(f"{node.id}authors/{author_id}")
        if r.status_code == 200 and r.json()["type"] == "author":
            return r.json() 
    return None#Author not found in any remotes

def get_remote_author_posts(author_id: str):
    items = []
    nodes = Remote_Node.query.all()
    for node in nodes:
        r = requests.get(f"{node.id}authors/{author_id}/posts?size=30&page=1")
        if r.status_code == 200 and r.json()["type"] == "author":
            items.extend(r.json()["items"])
    return items


#below untested

def get_remote_post(author_id: str, post_id: str):#tested for https://backend-404.herokuapp.com
    nodes = Remote_Node.query.all()
    for node in nodes:
        r = requests.get(f"{node.id}authors/{author_id}/posts/{post_id}")
        if r.status_code == 200 and r.json()["type"] == "post":
            return r.json() 
    return None#post not found


def get_remote_comments(author_id: str, post_id: str):#get all posts comments
    nodes = Remote_Node.query.all()
    for node in nodes:
        r = requests.get(f"{node.id}authors/{author_id}/posts/{post_id}/comments?size=30&page=1")
        if r.status_code == 200 and r.json()["type"] == "comments":
            return r.json()["items"]
    return []

def get_remote_comment(author_id: str, post_id: str, comment_id: str):#get single comment
    nodes = Remote_Node.query.all()
    for node in nodes:
        r = requests.get(f"{node.id}authors/{author_id}/posts/{post_id}/comments/{comment_id}")
        if r.status_code == 200 and r.json()["type"] == "comment":
            return r.json()
    return None

def get_remote_post_likes(author_id: str, post_id: str):    
    nodes = Remote_Node.query.all()
    for node in nodes:
        r = requests.get(f"{node.id}authors/{author_id}/posts/{post_id}/likes?size=30&page=1")
        if r.status_code == 200 and r.json()["type"] == "likes":
            return r.json()["items"]
    return []

def get_remote_comment_likes(author_id: str, post_id: str, comment_id: str):
    nodes = Remote_Node.query.all()
    for node in nodes:
        r = requests.get(f"{node.id}authors/{author_id}/posts/{post_id}/comments/{comment_id}/likes?size=30&page=1")
        if r.status_code == 200 and r.json()["type"] == "likes":
            return r.json()["items"]
    return []