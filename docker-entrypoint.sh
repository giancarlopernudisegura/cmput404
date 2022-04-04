#!/bin/sh

. $VIRTUAL_ENV/bin/activate

cd server/
flask db upgrade
cd -

npm run build &
gunicorn -c gunicorn.conf.py --chdir server server.run:app $GUNICORN_OPTS
