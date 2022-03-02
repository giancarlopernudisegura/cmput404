from server.exts import db
from models import Post, Author
import json 
import random
from random import randint

def make_authors_admin_verified():
    f = open('./utils/fake_data/team_data.json')
    data = json.load(f)
    for member in data['members']:
        author = Author(
            githubId=member['githubId'],
            profileImageId=member['profileImageId'],
            displayName=member['displayName'],
            isAdmin= randint(0,1),
            isVerified= randint(0,1)
        )
        db.session.add(author)


'''
https://www.pythonpool.com/generate-random-sentence-in-python/
'''
def generate_random_sentences(n):
    names=["We","I","They","He","She","Jack","Jim"]
    verbs=["was", "is", "are", "were"]
    nouns=["playing a game", "watching television", "talking", "dancing", "speaking"]
    i = 0
    sentences = []
    while i < n:
        sentences.append(names[randint(0,len(names)-1)]+" "+verbs[randint(0,len(verbs)-1)]+" "+nouns[randint(0,len(nouns))-1])
        i += 1
    
    return sentences

def generate_random_word():
    return ''.join(random.choice('abcdefghijklmnopqrstuvwxyz') for i in range(5))

def make_posts():
    author_ids = Author.query.all()
    for i in range(5):
        a = random.choice(author_ids)
        title = generate_random_sentences(1)
        category = generate_random_word()
        content = generate_random_sentences(randint(1,5)) 
        private = randint(0,1)
        unlisted = randint(0,1)
        content_type = 'plain'
        post = Post(
            authorId=a.id,
            title=title,
            category=category,
            content=content,
            private=private,
            unlisted=unlisted,
            contentType=content_type
        )
        db.session.add(post)


def add_and_commit():
    make_authors_admin_verified()
    make_posts()
    db.session.commit()

def clean_db():
    Author.query.delete()
    Post.query.delete()
