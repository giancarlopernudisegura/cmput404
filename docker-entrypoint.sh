#!/bin/sh

. $VIRTUAL_ENV/bin/activate

npm run build &&
gunicorn -c gunicorn.conf.py --chdir server server.run:app
