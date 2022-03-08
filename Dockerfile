FROM heroku/heroku:20

WORKDIR /app

RUN apt-get update -y \
	&& apt-get install -y python3-pip \
	&& apt-get install -y python3-venv

ENV VIRTUAL_ENV=/opt/venv

RUN python3 -m venv $VIRTUAL_ENV

ENV PATH="$PATH:$VIRTUAL_ENV/bin"

COPY server/requirements.txt .

RUN . $VIRTUAL_ENV/bin/activate \
	&& python3 -m pip install -r requirements.txt

RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -

RUN apt-get install -y nodejs

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 5000

CMD [ "sh", "docker-entrypoint.sh" ]
