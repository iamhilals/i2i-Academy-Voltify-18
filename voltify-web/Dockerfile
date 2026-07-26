FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Set the API URL to use relative path proxying via Nginx
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build the production React build (outputs to /app/build)
RUN npm run build

FROM nginx:alpine
# Copy the custom Nginx config for routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the compiled build static files
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
