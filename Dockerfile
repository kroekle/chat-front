#base on blog post: https://medium.com/@tiangolo/react-in-docker-with-nginx-built-with-multi-stage-docker-builds-including-testing-8cc49d6ec305

# Stage 0, "build-stage"
FROM node:current-slim as build-stage

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY ./ /app/

RUN npm run-script build

# Stage 1, "package-stage"

FROM nginx:stable-alpine

COPY --from=build-stage /app/build/ /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf