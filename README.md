# Tik Tak Toe
**A distributed social network**

[![CI](https://github.com/giancarlopernudisegura/cmput404/actions/workflows/heroku.yml/badge.svg)](https://github.com/giancarlopernudisegura/cmput404/actions/workflows/heroku.yml)
![min node version: 16](https://img.shields.io/badge/node--lts-%3E%3D16-brightgreen)
![min python version: 3.8](https://img.shields.io/badge/python-%3E%3D8.3-blue)

## Setting up development environment

### Installing dependencies

First, install the node dependencies
```bash
npm i
```

Second, install the python dependencies
```bash
cd server/
python3 -m venv venv
source venv/bin/activate
python3 -m pip install -r requirements.txt
```

Lastly, create a `.env` file. You can make a copy of the example file in the root directory.
```bash
cp .env.example .env
```

### Initialize local database
First create an empty database in `/server` named `app.db`
```bash
touch server/app.db
```
Use the same `DATABASE_URL` environment variable found in `.env.example`


### Starting the server

Recommended that you run the following commands on two different terminals so you can see that output for each command.
```bash
npm run dev
```
```bash
cd server/
source venv/bin/activate
python3 server.py
```
