FROM node:20-bookworm AS build

WORKDIR /usr/local/app

COPY package.json .
COPY .yarn .
COPY yarn.lock .
COPY .yarnrc.yml .
RUN corepack enable && yarn
COPY . .

ARG BASE_URL
ENV BASE_URL $BASE_URL
RUN yarn build

FROM nginx:1.26.1

COPY --from=build /usr/local/app/dist/browser /usr/share/nginx/html
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80