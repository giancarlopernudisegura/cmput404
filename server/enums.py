from email.mime import application
import enum

#starter for db models. feel reorganize or remove once/if internal classses for these are implemented

class ContentType(enum.Enum):
    markdown = "text/markdown"
    plain = "text/plain"
    application = "application/base64"
    png = "image/png"
    jpeg = "image/jpeg"

class ImageContentType(enum.Enum):
    png = "image/png"
    jpeg = "image/jpeg"

class TextContentType(enum.Enum):
    markdown = "text/markdown"
    plain = "text/plain"
    application = "application/base64"

class RequestStatus(enum.Enum):
    friend = "friend"
    follower = "follower"