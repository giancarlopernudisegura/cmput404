from server.models import Author, Inbox, Post, Comment, Requests, Like, Remote_Node
import requests
import os

#utils

def convert_id_to_remote(id: str, url: str):#
    if "://" in id:
        return id
    return url + id

def find_remote_author(author_id: str):
    nodes = Remote_Node.query.all()
    for node in nodes:
        r = requests.get(f"{node.id}authors/{author_id}")
        if r.status_code == 200 and r.json()["type"] == "author":
            return node.id
    return None

#endpoint interactions
    
def get_all_remote_authors():
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
        if r.status_code == 200 and (r.json()["type"] == "likes" or r.json()["type"] == "liked"):
            return r.json()["items"]
    return []

def get_remote_comment_likes(author_id: str, post_id: str, comment_id: str):
    nodes = Remote_Node.query.all()
    for node in nodes:
        r = requests.get(f"{node.id}authors/{author_id}/posts/{post_id}/comments/{comment_id}/likes?size=30&page=1")
        if r.status_code == 200 and (r.json()["type"] == "likes" or r.json()["type"] == "liked"):
            return r.json()["items"]
    return []


def get_remote_author_liked(author_id: str):
    nodes = Remote_Node.query.all()
    for node in nodes:
        r = requests.get(f"{node.id}authors/{author_id}/liked?size=30&page=1")
        if r.status_code == 200 and r.json()["type"] == "liked":  
            return r.json()["items"]
    return []

def get_remote_followers(author_id: str):
    nodes = Remote_Node.query.all()
    for node in nodes:
        #node 1
        r = requests.get(f"{node.id}authors/{author_id}/following", auth=(node.username, node.password))
        if r.status_code == 200 and r.json()["type"] == "following":
            return r.json()["items"]
        #node 2
        r = requests.get(f"{node.id}authors/{author_id}/followers", auth=(node.username, node.password))
        if r.status_code == 200 and r.json()["type"] == "followers":
            pass#too much headache to integrate right now
    return []

def check_remote_is_following(author_id: str, follower_id: str):
    nodes = Remote_Node.query.all()
    for node in nodes:
        r = requests.get(f"{node.id}authors/{author_id}/followers/{follower_id}", auth=(node.username, node.password))
        if r.status_code == 200 and r.json()["type"] == "Follow": #remote node 1
            if r.json()["accepted"] == "true":
                return True
        if r.status_code == 200: #remote node 2
            pass
            #r.
            
    return False

#inbox wrappers

def post_remote_inbox(author_id: str, obj):#posts a given model to inbox
    nodes = Remote_Node.query.all()
    for node in nodes:
        r = requests.get(f"{node.id}authors/{author_id}")
        if r.status_code == 200 and r.json()["type"] == "author":
            obj_json = obj.json()
            r = requests.post(f"{node.id}authors/{author_id}/inbox", auth=(node.username, node.password), json=obj_json)
        

def put_remote_like_inbox(remote_author_id: str, like_author_id: str, comment_id = None, post_id = None):
    if comment_id and post_id:
        raise Exception("remote inbox put got mixed id types")
    if not comment_id and not post_id:
        raise Exception("posting to a remote inbox requires object ids")  
    remote_host = find_remote_author(remote_author_id)
    if remote_host == None:
        return#couldn't find post
    local_host = os.getenv("FLASK_HOST")
    if comment_id:
        remote_object_url = f"{remote_host}authors/{remote_author_id}/posts/{post_id}/comments/{comment_id}"
    else:
        remote_object_url = f"{remote_host}authors/{remote_author_id}/posts/{post_id}"
    inbox_like = {
        "type": "like",
        "summary": "",
        "author": f"{local_host}authors/{like_author_id}",
        "object": remote_object_url
    }
    r = requests.post(f"{remote_host}authors/{remote_author_id}/inbox", json=inbox_like)


    
    

# def get_remote_inbox(author_id: str):
#     nodes = Remote_Node.query.all()
#     for node in nodes:
#         r = requests.get(f"{node.id}authors/{author_id}/inbox", auth=(node.username, node.password))
#         if r.status_code == 200 and r.json()["type"] == "inbox":#node 1
#             return r.json()#type seems to match ours
#         elif r.status_code == 200 and r.json()["type"] == "inbox":#node 2
#             pass
#     return None
