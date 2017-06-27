FROM node:alpine

COPY . /code

WORKDIR /code

RUN rm -rf node_modules && npm install --unsafe-perm

ENTRYPOINT ["npm","start"]
