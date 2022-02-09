from server import db
from enums import ContentType, RequestStatus


#Models go here
class Author(db.Model):
    __tablename__ = 'author'
    id = db.Column(db.Integer, primary_key=True)
    displayName = db.Column(db.String())
    githubId = db.Column(db.String())
    profileImageId = db.Column(db.String())


    def __init__(self, githubId, profileImageId, displayName):
        self.githubId = githubId
        self.profileImageId = profileImageId
        self.displayName = displayName

    def __repr__(self):
        return f"<id {self.id}>"

class Post(db.Model):
    __tablename__ = 'post'
    id = db.Column(db.Integer, primary_key=True)
    author = db.Column(db.ForeignKey('author.id'))
    title = db.Column(db.String())
    category = db.Column(db.String())
    private = db.Column(db.Boolean())
    content = db.Column(db.String())
    contentType = db.Column(db.Enum(ContentType))
    timestamp = db.Column(db.DateTime())
    likes = db.Column(db.ForeignKey('author.id'))#NEEDS TO CHANGE TO LIST

    def __init__(self, author, title, category, private, content, contentType, timestamp):
        self.author = author
        self.title = title
        self.category = category
        self.private = private
        self.content = content
        self.contentType = contentType
        self.timestamp = timestamp

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

    def __init__(self, author, title, contentType, content, timestamp):
        self.author = author
        self.title = title
        self.contentType = contentType
        self.content = content
        self.timestamp = timestamp

    def __repr__(self):
        return f"<id {self.id}>"

class Requests(db.Model):
    __tablename__ = 'requests'
    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.Enum(RequestStatus))
    initiated = db.Column(db.ForeignKey('author.id'))
    to = db.Column(db.ForeignKey('author.id'))
    timestamp = db.Column(db.DateTime())#DO WE NEED THIS?

    def __init__(self):
        pass #SETUP DEFAULTS

    def __repr__(self):
        return f"<id {self.id}>"