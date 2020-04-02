FROM node:alpine
COPY ./ ./
CMD [ "node", "./" ]
