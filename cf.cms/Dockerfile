FROM node:16.13.1 as build-stage

CMD mkdir /srv/cf.cms

COPY ["package.json","/srv/cf.cms/"]

WORKDIR /srv/cf.cms

RUN npm install --only=production

COPY [".", "/srv/cf.cms/"]

EXPOSE 80

CMD [ "npm", "run", "start" ]
