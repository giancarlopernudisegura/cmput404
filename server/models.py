from server.exts import db
from server.enums import ContentType
import datetime


#Models go here
class Author(db.Model):
    __tablename__ = 'author'
    id = db.Column(db.Integer, primary_key=True)
    displayName = db.Column(db.String())
    githubId = db.Column(db.String())
    profileImageId = db.Column(db.String())
    isAdmin = db.Column(db.Boolean())
    isVerified = db.Column(db.Boolean())


    def __init__(self, githubId, profileImageId, displayName, isAdmin = False, isVerified = True):
        self.githubId = githubId
        self.profileImageId = profileImageId
        self.displayName = displayName
        self.isAdmin = isAdmin
        self.isVerified = isVerified#should set this from a JSON or db later


    def __repr__(self):
        return f"<id {self.id}>"


class Post(db.Model):#relates post types together
    __tablename__ = 'post'
    id = db.Column(db.Integer, primary_key=True)
    author = db.Column(db.ForeignKey('author.id'))
    timestamp = db.Column(db.DateTime())
    private = db.Column(db.Boolean())
    unlisted = db.Column(db.Boolean())
    title = db.Column(db.String())
    category = db.Column(db.String())
    content = db.Column(db.String())
    contentType = db.Column(db.Enum(ContentType))


    def __init__(self, author, title, category, content, contentType, private = False, unlisted = False):
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


    def __repr__(self):
        return f"<id {self.id}>"


class Commment(db.Model):
    __tablename__ = 'comment'
    id = db.Column(db.Integer, primary_key=True)
    author = db.Column(db.ForeignKey('author.id'))
    content = db.Column(db.String())
    contentType = db.Column(db.Enum(ContentType))
    timestamp = db.Column(db.DateTime())
    likes = db.Column(db.ForeignKey('author.id'))#NEEDS TO CHANGE TO LIST


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


class Requests(db.Model):#follow requests
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
    viewConsumer = db.Column(db.ForeignKey('author.id'))#the person who is allowed to view post


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


    def __init__(self, owner, post = None, like = None, follow = None):
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
