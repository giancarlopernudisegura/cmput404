# Tik Tak Toe
**A distributed social network**

[![CI](https://github.com/giancarlopernudisegura/cmput404/actions/workflows/heroku.yml/badge.svg)](https://github.com/giancarlopernudisegura/cmput404/actions/workflows/heroku.yml)
![min node version: 16](https://img.shields.io/badge/node--lts-%3E%3D16-brightgreen)
![min python version: 3.8](https://img.shields.io/badge/python-%3E%3D3.8-blue)

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
First create an empty database in `/server` named `app.db` with:
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
flask run
```

### Testing the server
```bash
cd server/
DATABASE_URL=sqlite:///test.db flask db upgrade
DATABASE_URL=sqlite:///test.db pytest tests.py
```

## References
### Firebase Authentication
- https://firebase.google.com/docs/reference/js/v8/firebase.auth.GithubAuthProvider
- https://firebase.google.com/docs/auth/web/github-auth

### Material UI Drawer Implementation
- MUI Official Documentation. (n.d.). React drawer component. MUI. Retrieved March 3, 2022, from https://mui.com/components/drawers/#responsive-drawer
- cclloyd. (2018, April 25). Both right and left aligned icons in appbar with material-ui next. Stack Overflow. Retrieved March 3, 2022, from https://stackoverflow.com/questions/50012686/both-right-and-left-aligned-icons-in-appbar-with-material-ui-next. Answered By sanky2020(2022, February 22).

### Tailwind NavBar Implementation
- Flowbite Documentation. (n.d.). Tailwind CSS Navbar. Flowbite. Retrieved March 3, 2022, from https://flowbite.com/docs/components/navbar/  
