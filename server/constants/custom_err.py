class MissingFieldError(Exception):
    def __init__(self, valid_fields):
        self.message = "message"
        self.valid_fields = valid_fields
        super().__init__(self.message)
    
    def __str__(self):
        return f"{self.message}: necessary fields are {self.valid_fields.join(',')}"
