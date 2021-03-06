from flask_login import UserMixin
from flask import current_app
from server.exts import db
from server.enums import ContentType
from server.utils.exts import get_github_info
import datetime, uuid
import os
from dotenv import load_dotenv
import json
from typing import Any, Dict, Union, Sequence


load_dotenv()

HOST = os.getenv("FLASK_HOST")


def generate_uuid():
    return str(uuid.uuid4())


class JSONSerializable(object):
    def json(self, local=True) -> Dict[str, str]:
        raise NotImplementedError()


class InboxItem(object):
    """
    Classes that inherit this class must implement the `push` method which pushes
    the item to the inbox of all subscribers.
    """

    @staticmethod
    def get_subscribers(author_id: str) -> Sequence[str]:
        subscribers = Requests.query.filter_by(to=author_id).all()
        return [s.initiated for s in subscribers]

    def push(self):
        raise NotImplementedError()


# Models go here
class Author(db.Model, UserMixin, JSONSerializable):
    __tablename__ = "author"
    id = db.Column(db.String(), primary_key=True, default=generate_uuid)
    displayName = db.Column(db.String())
    githubId = db.Column(db.String())
    profileImageId = db.Column(db.String())
    isAdmin = db.Column(db.Boolean())
    isVerified = db.Column(db.Boolean())

    def __init__(
        self,
        githubId: str,
        profileImageId: str,
        displayName: str,
        isAdmin: bool = False,
        isVerified: bool = True,
    ):
        self.githubId = githubId
        self.profileImageId = profileImageId
        self.displayName = displayName
        self.isAdmin = isAdmin
        self.isVerified = isVerified  # should set this from a JSON or db later

    def __repr__(self):
        return f"<id {self.id}>"

    def json(self, local=True) -> Dict[str, str]:
        # get username from github id
        data = get_github_info(self.githubId)
        id = self.id if local else f"{HOST}/authors/{self.id}"

        return {
            "type": "author",
            "id": id,
            "host": f"{HOST}/",
            "displayName": self.displayName,
            "url": f"{HOST}/authors/{self.id}",
            "github": data["html_url"],
            "profileImage": self.profileImageId,
            "isAdmin": self.isAdmin,
            "isVerified": self.isVerified,
        }


class Post(db.Model, JSONSerializable, InboxItem):
    __tablename__ = "post"
    id = db.Column(db.String(), primary_key=True, default=generate_uuid)
    source = db.Column(db.String())
    origin = db.Column(db.String())
    author = db.Column(db.ForeignKey("author.id"))
    timestamp = db.Column(db.DateTime())
    private = db.Column(db.Boolean())  # only friends can see
    unlisted = db.Column(db.Boolean())  # doesn't show up on timelines
    title = db.Column(db.String())
    category = db.Column(db.String())
    content = db.Column(db.String())
    contentType = db.Column(db.Enum(ContentType))

    def __init__(
        self,
        author: str,
        title: str,
        category: str,
        content: str,
        contentType,
        private: bool,
        source: str,
        origin: str,
        unlisted: bool = False,
        id: Union[str, None] = None,
    ):
        if author is None:
            raise Exception("Posts require an author")
        if id is not None:
            self.id = id
        self.author = author
        self.timestamp = datetime.datetime.now()
        self.private = private
        self.unlisted = unlisted
        self.title = title
        if self.category != None:
            self.category = category.split(",")
        self.content = content
        if contentType == None:
            raise Exception("Posts require content type")
        self.contentType = contentType
        self.source = source
        self.origin = origin

    @property
    def likes(self):
        return Like.query.filter_by(post=self.id).all()

    @property
    def comments(self):
        return Comment.query.filter_by(post=self.id).all()

    def __repr__(self):
        return f"<id {self.id}>"

    def json(self, local=True) -> Dict[str, Any]:
        author = Author.query.filter_by(id=self.author).first()
        page = 1
        per_page = 10
        first_comments = Comment.query.paginate(page=page, per_page=per_page).items
        id = self.id if local else f"{HOST}/authors/{self.author}/post/{self.id}"
        return {
            "type": "post",
            "title": self.title,
            "id": id,
            # TODO: going to hardcode source and origin to be only our node for now, must be changed later
            "source": self.source or f"{HOST}/authors/{self.author}/posts/{self.id}",
            "origin": self.origin or f"{HOST}/authors/{self.author}/posts/{self.id}",
            "description": self.content,
            "contentType": str(self.contentType),
            "author": author.json(local),
            "categories": str(self.category).split(","),
            "count": len(self.comments),
            "comments": f"{HOST}/authors/{self.author}/posts/{self.id}/comments",
            "commentsSrc": {
                "type": "comments",
                "id": f"{HOST}/authors/{self.author}/posts/{self.id}/comments",
                "page": page,
                "size": len(first_comments),
                "post": f"{HOST}/authors/{self.author}/posts/{self.id}",
                "comments": [comment.json(local) for comment in first_comments],
            },
            "published": self.timestamp.isoformat(),
            "visibility": "PUBLIC" if not self.private else "FRIENDS",
            "unlisted": self.unlisted,
        }

    def push(self):
        subscribers = InboxItem.get_subscribers(self.author)
        for subscriber in subscribers:
            inbox = Inbox(subscriber, json.dumps(self.json()))
            db.session.add(inbox)
        db.session.commit()


class Comment(db.Model, JSONSerializable, InboxItem):
    __tablename__ = "comment"
    id = db.Column(db.String(), primary_key=True, default=generate_uuid)
    author = db.Column(db.ForeignKey("author.id"))
    post = db.Column(db.String())
    content = db.Column(db.String())
    contentType = db.Column(db.Enum(ContentType))
    timestamp = db.Column(db.DateTime())
    likes = db.Column(db.ForeignKey("author.id"))  # NEEDS TO CHANGE TO LIST

    def __init__(self, author: str, post: str, contentType, content: str):
        self.author = author
        self.post = post
        self.contentType = contentType
        self.content = content
        self.timestamp = datetime.datetime.now()

    @property
    def likes(self):
        return Like.query.filter_by(comment=self.id).all()

    def __repr__(self):
        return f"<id {self.id}>"

    def json(self, local=True) -> Dict[str, Any]:
        author = Author.query.filter_by(id=self.author).first()
        id = self.id if local else f"{HOST}/authors/{self.author}/post/{self.post}/comments/{self.id}"
        return {
            "type": "comment",
            "author": author.json(local),
            "content": self.content,
            "contentType": str(self.contentType),
            "published": self.timestamp.isoformat(),
            "id": id,
        }


class Like(db.Model, JSONSerializable, InboxItem):
    id = db.Column(db.String(), primary_key=True, default=generate_uuid)
    author = db.Column(db.ForeignKey("author.id"))
    post = db.Column(db.String())
    comment = db.Column(db.String())
    timestamp = db.Column(db.DateTime())

    def __init__(self, author, post=None, comment=None):
        self.author = author
        if post and comment:
            raise Exception("Cannot like both a post and a comment")
        if not post and not comment:
            raise Exception("Cannot like nothing!")
        self.post = post
        self.comment = comment
        self.timestamp = datetime.datetime.now()

    def __repr__(self):
        return f"<id {self.id}>"

    def json(self, local=True) -> Dict[str, Any]:
        author = Author.query.filter_by(id=self.author).first()
        liked_object_type = "post" if self.post else "comment"
        if self.post:
            liked_object = f"{HOST}/authors/{author.id}/posts/{self.post}"
        else:
            comment = Comment.query.filter_by(id=self.comment).first()
            liked_object = (
                f"{HOST}/authors/{author.id}/posts/{comment.post}/comments/{comment.id}"
            )
        return {
            "@context": "https://www.w3.org/ns/activitystreams",
            "summary": f"{author.displayName} Liked your {liked_object_type}",
            "type": "Like",
            "author": author.json(local),
            "object": liked_object,
        }

    def push(self):
        DbObject = Post if self.post else Comment
        if self.comment:  # assume that the constructor is doing a good job
            recepient = DbObject.query.filter_by(id=self.comment).first().author
        elif self.post:
            recepient = DbObject.query.filter_by(id=self.post).first().author
        inbox = Inbox(recepient, json.dumps(self.json()))
        db.session.add(inbox)
        db.session.commit()

    def delete(self):  # remove all like refs from inbox before deleting
        db.session.delete(self)  # can we do this before the last commit without issues?
        db.session.commit()


class Requests(db.Model, JSONSerializable):  # follow requests
    __tablename__ = "requests"
    id = db.Column(db.String(), primary_key=True, default=generate_uuid)
    initiated = db.Column(db.ForeignKey("author.id"))  # follower
    to = db.Column(db.ForeignKey("author.id"))
    timestamp = db.Column(db.DateTime())

    def __init__(
        self,
        initiated: str,
        to: str,
    ):
        self.timestamp = datetime.datetime.now()
        self.initiated = initiated
        self.to = to
        if self.id == None:
            self.id = str(uuid.uuid4())  # odd bug fix

    def __repr__(self):
        return f"<id {self.id}>"

    def get_follower_json(self, local=True) -> Dict[str, Any]:
        follower = Author.query.filter_by(id=self.initiated).first()
        return follower.json(local)

    @staticmethod
    def are_friends(author_id1: str, author_id2: str) -> bool:
        r1 = Requests.query.filter_by(initiated=author_id1, to=author_id2).first()
        r2 = Requests.query.filter_by(initiated=author_id2, to=author_id1).first()
        return r1 and r2

    def json(self, local=True) -> Dict[str, Any]:
        return {
            "type": "followers",
            "items": [self.get_follower_json(local)],
        }


class ViewablePostRelation(db.Model):
    __tablename__ = "viewablePostRelation"
    id = db.Column(db.String(), primary_key=True, default=generate_uuid)
    post = db.Column(db.ForeignKey("post.id"))
    # the person who is allowed to view post
    viewConsumer = db.Column(db.ForeignKey("author.id"))


def __init__(self, post, viewConsumer):
    self.post = post
    self.viewConsumer = viewConsumer

    def __repr__(self):
        return f"<id {self.id}>"


class Inbox(db.Model, JSONSerializable):
    __tablename__ = "inbox"
    id = db.Column(db.String(), primary_key=True, default=generate_uuid)
    owner = db.Column(db.ForeignKey("author.id"))
    data = db.Column(db.String())

    def __init__(
        self,
        owner: str,
        data: str,

    ):
        self.owner = owner
        self.data = data

    def __repr__(self):
        
        return f"<id {self.id} {self.post} {self.like} {self.follow}>"

    def json(self, local=True) -> Dict[str, Any]:
        return json.loads(self.data)


class Remote_Node(db.Model, JSONSerializable):  # contains auth info for remote nodes
    __tablename__ = "remote_node"
    id = db.Column(db.String(), primary_key=True)  # host name
    user = db.Column(db.String())
    password = db.Column(db.String())

    def __init__(self, id, user, password):
        # Should create/write to db from outside our application
        self.id = id
        self.user = user
        self.password = password

    def json(self) -> Dict[str, Any]:
        return {
            "type": "remote",
            "id": self.id,
            "username": self.user,
            "password": self.password,
        }
