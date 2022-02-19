from flask_login import UserMixin
from server.exts import db
from server.enums import ContentType
import datetime
import os
from dotenv import load_dotenv
from urllib.request import urlopen
import json
from typing import Any, Dict


load_dotenv()

HOST = os.getenv("FLASK_HOST")


# Models go here
class Author(db.Model, UserMixin):
    __tablename__ = 'author'
    id = db.Column(db.Integer, primary_key=True)
    displayName = db.Column(db.String())
    githubId = db.Column(db.String())
    profileImageId = db.Column(db.String())
    isAdmin = db.Column(db.Boolean())
    isVerified = db.Column(db.Boolean())

    def __init__(self, githubId, profileImageId, displayName, isAdmin=False, isVerified=True):
        self.githubId = githubId
        self.profileImageId = profileImageId
        self.displayName = displayName
        self.isAdmin = isAdmin
        self.isVerified = isVerified  # should set this from a JSON or db later

    def __repr__(self):
        return f"<id {self.id}>"

    def json(self) -> Dict[str, str]:
        # get username from github id
        resp = urlopen(f'https://api.github.com/user/{self.githubId}')
        data = json.loads(resp.read().decode('utf-8'))
        return {
            'type': 'author',
            'id': self.id,
            'host': f'{HOST}/',
            'displayName': self.displayName,
            'url': f'{HOST}/authors/{self.id}',
            'github': data['html_url'],
            'profileImage': self.profileImageId
        }


class Post(db.Model):
    __tablename__ = 'post'
    id = db.Column(db.Integer, primary_key=True)
    author = db.Column(db.ForeignKey('author.id'))
    timestamp = db.Column(db.DateTime())
    private = db.Column(db.Boolean())  # only friends can see
    unlisted = db.Column(db.Boolean())  # doesn't show up on timelines
    title = db.Column(db.String())
    category = db.Column(db.String())
    content = db.Column(db.String())
    contentType = db.Column(db.Enum(ContentType))

    def __init__(self, author, title, category, content, contentType, private, unlisted=False):
        if author == None:
            raise Exception("Posts require an author")
        self.author = author
        self.timestamp = datetime.datetime.now()
        self.private = private
        self.unlisted = unlisted
        self.title = title
        self.category = category
        self.content = content
        if contentType == None:
            raise Exception("Posts require content type")
        self.contentType = contentType

    @property
    def likes(self):
        return Like.query.filter_by(post=self.id).all()

    @property
    def comments(self):
        return Commment.query.filter_by(post=self.id).all()

    def __repr__(self):
        return f"<id {self.id}>"

    def json(self) -> Dict[str, Any]:
        author = Author.query.filter_by(id=self.author).first()
        return {
            'type': 'post',
            'title': self.title,
            'id': self.id,
            # TODO: going to hardcode source and origin to be only our node for now, must be changed later
            'source': f'{HOST}/authors/{self.author}/posts/{self.id}',
            'origin': f'{HOST}/authors/{self.author}/posts/{self.id}',
            'description': self.content,
            'contentType': str(self.contentType),
            'author': author.json(),
            'categories': self.category.split(','),
            'count': len(self.comments),
            'comments': f'{HOST}/authors/{self.author}/posts/{self.id}/comments',
            'commentsSrc': None,
            'published': self.timestamp.isoformat(),
            'visibility': 'PUBLIC' if not self.private else 'FRIENDS',
            'unlisted': self.unlisted
        }


class Commment(db.Model):
    __tablename__ = 'comment'
    id = db.Column(db.Integer, primary_key=True)
    author = db.Column(db.ForeignKey('author.id'))
    post = db.Column(db.ForeignKey('post.id'))
    content = db.Column(db.String())
    contentType = db.Column(db.Enum(ContentType))
    timestamp = db.Column(db.DateTime())
    likes = db.Column(db.ForeignKey('author.id'))  # NEEDS TO CHANGE TO LIST

    def __init__(self, author, title, contentType, content):
        self.author = author
        self.title = title
        self.contentType = contentType
        self.content = content
        self.timestamp = datetime.datetime.now()

    @property
    def likes(self):
        return Like.query.filter_by(comment=self.id).all()

    def __repr__(self):
        return f"<id {self.id}>"

    def json(self) -> Dict[str, Any]:
        author = Author.query.filter_by(id=self.author).first()
        return {
            'type': 'comment',
            'author': author.json(),
            'comment': self.content,
            'contentType': str(self.contentType),
            'published': self.timestamp.isoformat(),
            'id': f'{HOST}/authors/{author.id}/posts/{self.post}/comments/{self.id}',
        }


class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    author = db.Column(db.ForeignKey('author.id'))
    post = db.Column(db.ForeignKey('post.id'))
    comment = db.Column(db.ForeignKey('comment.id'))
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

    def json(self) -> Dict[str, Any]:
        author = Author.query.filter_by(id=self.author).first()
        liked_object_type = 'post' if self.post else 'comment'
        if self.post:
            liked_object = f'{HOST}/authors/{author.id}/posts/{self.post}'
        else:
            comment = Commment.query.filter_by(id=self.comment).first()
            liked_object = f'{HOST}/authors/{author.id}/posts/{comment.post}/comments/{comment.id}'
        return {
            '@context': 'https://www.w3.org/ns/activitystreams',
            'summary': f'{author.displayName} Liked your {liked_object_type}',
            'type': 'Like',
            'author': author.json(),
            'id': liked_object,
        }


class Requests(db.Model):  # follow requests
    __tablename__ = 'requests'
    id = db.Column(db.Integer, primary_key=True)
    initiated = db.Column(db.ForeignKey('author.id'))
    to = db.Column(db.ForeignKey('author.id'))
    timestamp = db.Column(db.DateTime())

    def __init__(self, initiated, to):
        self.timestamp = datetime.datetime.now()
        self.initiated = initiated
        self.to = to

    def __repr__(self):
        return f"<id {self.id}>"


class ViewablePostRelation(db.Model):
    __tablename__ = 'viewablePostRelation'
    id = db.Column(db.Integer, primary_key=True)
    post = db.Column(db.ForeignKey('post.id'))
    # the person who is allowed to view post
    viewConsumer = db.Column(db.ForeignKey('author.id'))


def __init__(self, post, viewConsumer):
    self.post = post
    self.viewConsumer = viewConsumer

    def __repr__(self):
        return f"<id {self.id}>"


class Inbox(db.Model):
    __tablename__ = 'inbox'
    id = db.Column(db.Integer, primary_key=True)
    owner = db.Column(db.ForeignKey('author.id'))
    post = db.Column(db.ForeignKey('post.id'))
    like = db.Column(db.ForeignKey('like.id'))
    follow = db.Column(db.ForeignKey('requests.id'))

    def __init__(self, owner, post=None, like=None, follow=None):
        self.owner = owner
        argNoneCount = (like, post, follow).count(None)
        if argNoneCount < 2:
            raise Exception("Inbox can't relate multiple objects")
        elif argNoneCount == 3:
            raise Exception("Inbox must releate one object")
        self.post = post
        self.like = like
        self.follow = follow

    def __repr__(self):
        return f"<id {self.id}>"
