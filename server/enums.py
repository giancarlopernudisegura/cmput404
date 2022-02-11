from email.mime import application
import enum

#starter for db models. feel reorganize or remove once/if internal classses for these are implemented


class ImageContentType(enum.Enum):
    png = "image/png;base64"
    jpeg = "image/jpeg;base64"

class TextContentType(enum.Enum):
    markdown = "text/markdown"
    plain = "text/plain"
    #application = "application/base64"

class ContentType(enum.Enum):
    markdown = TextContentType.markdown
    plain = TextContentType.plain
    #application = "application/base64"
    png = ImageContentType.png
    jpeg = ImageContentType.jpeg