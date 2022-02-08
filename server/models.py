from server import db


#Models go here
class Author(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    githubId = db.Column(db.String())
    profileImageId = db.Column(db.String())

    def __init__(self, githubId, profileImageId):
        self.githubId = githubId
        self.profileImageId = profileImageId
    def __repr__(self):
        return f"<id {self.id}>"
