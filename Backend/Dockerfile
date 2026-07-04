FROM node:18-alpine

WORKDIR /app

# Install dependencies (tsx is used to run the TypeScript app at runtime).
COPY package*.json ./
RUN npm install

COPY . .

# The app stores uploaded images here; it is also a mounted volume in compose.
RUN mkdir -p uploads

EXPOSE 4000

CMD ["npm", "start"]
