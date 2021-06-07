FROM node:16-alpine

WORKDIR /code

# Create a docker layer with only dependencies
COPY package.json package-lock.json /code/
RUN npm ci
COPY . /code

# Build the code
RUN SVELTEKIT_ADAPTER=node npm run build

# You can mount /data on the host to persist data
RUN mkdir /data
RUN chown daemon:daemon /data
ENV DATABASE_CONNECTION_STRING='sqlite:/data/sanipasse.db'

USER daemon

# Listen on the port specified by the PORT environment variable, or 3000 by default
EXPOSE 3000
CMD ["node", "build"]
