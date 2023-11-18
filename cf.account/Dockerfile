FROM node:16.13.1 as build-stage

CMD mkdir /srv/cf.account

COPY ["package.json","/srv/cf.account/"]

WORKDIR /srv/cf.account

RUN npm install --only=production

COPY [".", "/srv/cf.account/"]

EXPOSE 80

CMD [ "npm", "run", "start" ]
