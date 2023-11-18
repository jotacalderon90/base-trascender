FROM node:16.13.1 as build-stage

CMD mkdir /srv/cf.mailing

COPY ["package.json","/srv/cf.mailing/"]

WORKDIR /srv/cf.mailing

RUN npm install --only=production

COPY [".", "/srv/cf.mailing/"]

EXPOSE 80

CMD [ "npm", "run", "start" ]
