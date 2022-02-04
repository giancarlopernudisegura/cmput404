# Tik Tak Toe
**A distributed social network**

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
