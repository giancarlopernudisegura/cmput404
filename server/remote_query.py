from server.models import Author, Inbox, Post, Comment, Requests, Like, Remote_Node
from server.utils.remote_constants import *
import requests

    
def get_all_remote_authors():#for downed remote https://website404.herokuapp.com/authors?size=10&page=1
    items = []   
    remote_node_1 = Remote_Node.query.filter_by(id=REMOTE_NODE1_HOST).first()
    r = requests.get(f"{remote_node_1.id}authors")
    items.extend(r.json()["items"])

    remote_node_2 = Remote_Node.query.filter_by(id=REMOTE_NODE2_HOST).first()
    r = requests.get(f"{remote_node_2.id}authors?size=30&page=1")#node2 enforces paging in all cases
    items.extend(r.json()["items"])
    return items

def get_remote_author(author_id: str):
    #Non functional remote endpoint?
    # remote_node_1 = Remote_Node.query.filter_by(id=REMOTE_NODE1_HOST).first()
    # r = requests.get(f"{remote_node_1.id}authors/{author_id}", auth=(remote_node_1.user, remote_node_1.password))
    # try:
        

    remote_node_2 = Remote_Node.query.filter_by(id=REMOTE_NODE2_HOST).first()
    r = requests.get(f"{remote_node_2.id}authors/{author_id}")
    try:
        r.json()["type"]
    except KeyError:
        return None#author not found on server
    if r.json()["type"] == "author":
        return r.json()

def get_remote_author_posts(author_id: str):
    items = []
    # remote_node_1 = Remote_Node.query.filter_by(id=REMOTE_NODE1_HOST).first()
    # r = requests.get(f"{remote_node_1.id}authors/{author_id}/posts/{post_id}", auth=(remote_node_1.user, remote_node_1.password))
    # items.extend(r.json()["items"])

    remote_node_2 = Remote_Node.query.filter_by(id=REMOTE_NODE2_HOST).first()
    r = requests.get(f"{remote_node_2.id}authors/{author_id}/posts?size=30&page=1")
    items.extend(r.json()["items"])
    return r.json()["items"]

def get_remote_post(author_id: str, post_id: str):
    remote_node_2 = Remote_Node.query.filter_by(id=REMOTE_NODE2_HOST).first()
    r = requests.get(f"{remote_node_2.id}authors/{author_id}/posts/{post_id}")
    return r.json()

