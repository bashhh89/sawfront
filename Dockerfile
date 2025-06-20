# Use nginx to serve static HTML files
FROM nginx:alpine

# Copy the HTML file and dependencies to nginx html directory
COPY ai-knowledge-base.html /usr/share/nginx/html/index.html
COPY kb.md /usr/share/nginx/html/kb.md
COPY *.svg /usr/share/nginx/html/
COPY *.png /usr/share/nginx/html/
COPY *.jpg /usr/share/nginx/html/

# Copy custom nginx configuration if exists
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
