FROM node:20-bookworm AS build

WORKDIR /usr/local/app

COPY ./ /usr/local/app/

RUN corepack enable && yarn && yarn build

FROM nginx:stable-bookworm

COPY --from=build /usr/local/app/dist/libmgr-app/browser /usr/share/nginx/html
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80