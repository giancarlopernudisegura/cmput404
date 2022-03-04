#!/usr/bin/env python3

import os
from dotenv import load_dotenv


load_dotenv()

bind = f'0.0.0.0:{os.environ["PORT"]}'
workers = 1
threads = 1
