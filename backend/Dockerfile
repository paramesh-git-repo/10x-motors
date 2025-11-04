FROM node:20-bookworm-slim

# System deps for Chrome + fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
  ca-certificates wget gnupg unzip \
  fonts-liberation fonts-noto-color-emoji \
  libasound2 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
  libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 \
  libgtk-3-0 libgbm1 libnss3 libpango-1.0-0 libpangocairo-1.0-0 \
  && rm -rf /var/lib/apt/lists/*

# Google Chrome stable
RUN wget -qO- https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-linux.gpg \
  && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-linux.gpg] http://dl.google.com/linux/chrome/deb/ stable main" \
     > /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update && apt-get install -y --no-install-recommends google-chrome-stable \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Note: Running as root in Docker for Chrome compatibility
# Docker containers are isolated, so security is maintained at the container level

# Puppeteer/WA env
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production \
    OPEN_WA_SESSION=crm-session

EXPOSE 5000 21465

CMD ["node", "server.js"]


