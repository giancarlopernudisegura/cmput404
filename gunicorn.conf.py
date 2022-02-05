#!/usr/bin/env python3

import multiprocessing
import os
from dotenv import load_dotenv


load_dotenv()

bind = f'0.0.0.0:{os.environ["PORT"]}'
workers = multiprocessing.cpu_count() * 2 + 1
threads = multiprocessing.cpu_count()
