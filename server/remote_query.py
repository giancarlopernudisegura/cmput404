from threading import local
from server.models import Author, Inbox, Post, Comment, Requests, Like, Remote_Node
import requests
import requests_cache
import os


author_cache = requests_cache.CachedSession('author_cache')


def convert_id_to_remote(id: str, url: str):#
    if "://" in id:
        return id
    return url + id

def find_remote_author(author_id: str):
    nodes = Remote_Node.query.all()
    for node in nodes:
        r = author_cache.get(f"{node.id}authors/{author_id}")
        if r.status_code == 200 and r.json()["type"] == "author":
            return node.id
    return None

def find_remote_post(author_id: str ,post_id: str):
    nodes = Remote_Node.query.all()
    for node in nodes:
        r = requests.get(f"{node.id}authors/{author_id}/posts/{post_id}")
        if r.status_code == 200 and r.json()["type"] == "post":
            return node.id
    return None

def find_remote_comment(author_id: str, post_id: str, comment_id: str):
    nodes = Remote_Node.query.all()
    for node in nodes:
        r = requests.get(f"{node.id}authors/{author_id}/posts/{post_id}/comments/{comment_id}")
        if r.status_code == 200 and r.json()["type"] == "comment":
            return node.id
    return None

def format_remote_post(author_id, post_id, node_id, return_dict):#format remote posts like ours
    comments = get_remote_comments(author_id, post_id)
    return_dict["comments"] = f"{node_id}authors/{author_id}/posts/{post_id}/comments"
    return_dict["commentsSrc"] = {
        "type": "comments",
        "id": return_dict["comments"],
        "page": 1,
        "size": len(comments),
        "post": f"{node_id}/authors/{author_id}/posts/{post_id}",
        "comments": comments,
    }
    return return_dict

def calculate_remote_page(objType, page, size):#calculate the remote page based on our page
    #objType should be the model Type
    # if page == 2:
    #     remote_page = page - len(objType.query.all()) // size
    #     print(f"remote_page: {remote_page}\nobjlen {len(objType.query.all())}")
    all_items = len(objType.query.all())
    return page - all_items // size #TODO FIX THIS STUFF!!

def fix_remote_url(node_items: list, node):#fix url bug in some remote nodes data
    for author in node_items:

        if  author["id"][:4] == "http":
            id = author["id"].split("/")[-1]
            author["id"] = id
        
        if "url" not in author.keys():
            id = author["id"].split("/")[-1]
            author["url"] = f"{node.id}authors/{id}"
        if author["url"] == None or author["url"][:4] != "http":
            id = author["id"].split("/")[-1]
            author["url"] = f"{node.id}authors/{id}"

        if "host" not in author.keys():
             author["host"] = node.id           
        if author["host"] == None or author["host"][:4] != "http":
            author["host"] = node.id
        if author["github"] == None or author["github"][:4] != "http":
            author["github"] = "http://www.github.com"


#endpoint interactions
    
global PREVIOUS_PAGE
global TOTAL_PAGE
TOTAL_PAGE = 0
PREVIOUS_PAGE = 0


def get_all_remote_authors(pagesize, page=1):
    global PREVIOUS_PAGE
    global TOTAL_PAGE
    # print("Previous page", PREVIOUS_PAGE)
    # print("Total page", TOTAL_PAGE)

    nodes = Remote_Node.query.all()
    items = []

    if len(nodes) == 0:
        return items

    r = requests.get(f"{nodes[0].id}authors?size={pagesize}&page={page}")
    if r.status_code == 200 and len(r.json()["items"]) != 0:
        nodes_items = r.json()["items"]
        fix_remote_url(nodes_items, nodes[0])
        items.extend(nodes_items)
    elif len(r.json().get("items", [])) == 0:
        if TOTAL_PAGE == 0:
            TOTAL_PAGE = PREVIOUS_PAGE
        if len(nodes) == 1:
            return items
        r = requests.get(f"{nodes[1].id}authors?size={pagesize}&page={page - TOTAL_PAGE}")
        if r.status_code == 200 and len(r.json()["items"]) != 0:
            nodes_items = r.json()["items"]
            fix_remote_url(nodes_items, nodes[1])
            items.extend(nodes_items)
    PREVIOUS_PAGE = page
    return items

def get_remote_author(author_id: str):
    nodes = Remote_Node.query.all()
    for node in nodes:
        r = author_cache.get(f"{node.id}authors/{author_id}")
        if r.status_code == 200 and r.json()["type"] == "author":
            node_items = [r.json()]
            fix_remote_url(node_items, node)
            return node_items[0]
    return None#Author not found in any remotes

def get_remote_author_posts(author_id: str, size :int, page=1):
    items = []
    nodes = Remote_Node.query.all()
    for node in nodes:
        r = requests.get(f"{node.id}authors/{author_id}/posts?size={size}&page={page}")
        if r.status_code == 200 and r.json()["type"] == "posts":
            remote_posts = []
            for post in r.json()["items"]:#format posts
                post_id = post["id"].split("/")[-1]
                # remote_posts.append(format_remote_post(author_id, post_id, node.id, r.json()))
                remote_posts.append(post)

            items.extend(remote_posts)
    items = items[:size]#do this better
    return items

def get_remote_post(author_id: str, post_id: str):#tested for https://backend-404.herokuapp.com
    nodes = Remote_Node.query.all()
    for node in nodes:
        r = requests.get(f"{node.id}authors/{author_id}/posts/{post_id}")
        if r.status_code == 200 and r.json()["type"] == "post":
            return format_remote_post(author_id, post_id, node.id, r.json())
    return None#post not found


def get_remote_comments(author_id: str, post_id: str, size=30, page=1):#get all posts comments
    nodes = Remote_Node.query.all()
    for node in nodes:
        r = requests.get(f"{node.id}authors/{author_id}/posts/{post_id}/comments?size={size}&page={page}")
        if r.status_code == 200 and r.json()["type"] == "comments":
            return r.json()["items"][:size]
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
        r = requests.get(f"{node.id}authors/{author_id}/followers", auth=(node.user, node.password))
        if r.status_code == 200 and len(r.json()) != 0:
            return r.json()["items"]
    return []

def check_remote_is_following(author_id: str, follower_id: str):#These enpoints are VERY different, should use followers and do a bit of querying ourselves
    nodes = Remote_Node.query.all()
    for node in nodes:
        r = requests.get(f"{node.id}authors/{author_id}/followers/{follower_id}", auth=(node.user, node.password))
        if r.status_code == 200 and r.json()["type"] == "Follow": #remote node 1
            if r.json()["accepted"] == "true":
                return True
        if r.status_code == 200: #remote node 2
            pass
            #r.
            
    return False

def submit_remote_follow_request(author_id: str, follower_id: str):
    remote_host = find_remote_author(author_id)
    node = Remote_Node.query.filter_by(id=remote_host).first()
    if not node:
        return False#this shouldn't ever trigger but have it just in case
    local_follower = Author.query.filter_by(id=follower_id).first()
    if not local_follower:
        return #bad local follower somehow?
    local_host = os.getenv("FLASK_HOST")
    remote_follow_node1 ={
        "type": "follow",
        "summary": f"{local_follower.displayName} wants to follow you.",
        "actor": f"{local_host}/authors/{follower_id}",
        "object": f"{node.id}/authors/{author_id}"
    }
    r = requests.post(f"{node.id}authors/{author_id}/inbox/", json=remote_follow_node1, auth=(node.user, node.password))
    print(r.status_code , r.text)
    return True
    

#inbox wrappers

def post_remote_inbox(author_id: str, obj):#posts a given model to inbox
    nodes = Remote_Node.query.all()
    for node in nodes:
        r = requests.get(f"{node.id}authors/{author_id}")
        if r.status_code == 200 and r.json()["type"] == "author":
            r = requests.post(f"{node.id}authors/{author_id}/inbox", auth=(node.user, node.password), json=obj)
        

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
#         r = requests.get(f"{node.id}authors/{author_id}/inbox", auth=(node.user, node.password))
#         if r.status_code == 200 and r.json()["type"] == "inbox":#node 1
#             return r.json()#type seems to match ours
#         elif r.status_code == 200 and r.json()["type"] == "inbox":#node 2
#             pass
#     return None
