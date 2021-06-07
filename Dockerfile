FROM node:alpine
COPY . /code
WORKDIR /code
RUN npm install
EXPOSE 3000
ENTRYPOINT ["npm","start"]
