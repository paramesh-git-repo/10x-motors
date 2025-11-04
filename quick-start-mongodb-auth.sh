#!/bin/bash
# Quick MongoDB Authentication Setup
# This script guides you through setting up secure MongoDB authentication

set -e

echo "🔐 CRM MongoDB Authentication Setup"
echo "===================================="
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB doesn't appear to be running."
    echo "Starting MongoDB..."
    brew services start mongodb-community 2>/dev/null || {
        echo "❌ Failed to start MongoDB. Please start it manually:"
        echo "   brew services start mongodb-community"
        exit 1
    }
    sleep 2
fi

echo "✅ MongoDB is running"
echo ""

# Get credentials from user
read -p "Enter MongoDB username [crmuser_admin]: " MONGO_USERNAME
MONGO_USERNAME=${MONGO_USERNAME:-crmuser_admin}

read -sp "Enter MongoDB password: " MONGO_PASSWORD
echo ""

read -p "Enter MongoDB database name [crm_prod]: " MONGO_DATABASE
MONGO_DATABASE=${MONGO_DATABASE:-crm_prod}

read -p "Enter MongoDB host [localhost:27017]: " MONGO_HOST
MONGO_HOST=${MONGO_HOST:-localhost:27017}

echo ""
echo "Creating MongoDB user..."

# Check if mongosh is available
if command -v mongosh &> /dev/null; then
    MONGO_CLI="mongosh"
elif command -v mongo &> /dev/null; then
    MONGO_CLI="mongo"
else
    echo "❌ MongoDB shell not found. Please install mongosh or mongo"
    exit 1
fi

# Create user
MONGO_URI="mongodb://$MONGO_HOST/admin"

eval "$MONGO_CLI \"$MONGO_URI\" --eval \"
  use $MONGO_DATABASE;
  var existingUser = db.getUsers().filter(u => u.user === '$MONGO_USERNAME')[0];
  if (existingUser) {
    print('⚠️  User already exists: $MONGO_USERNAME');
    print('🔄 Updating password...');
    db.changeUserPassword('$MONGO_USERNAME', '$MONGO_PASSWORD');
    print('✅ Password updated successfully');
  } else {
    print('➕ Creating new user: $MONGO_USERNAME');
    db.createUser({
      user: '$MONGO_USERNAME',
      pwd: '$MONGO_PASSWORD',
      roles: [{ role: 'readWrite', db: '$MONGO_DATABASE' }]
    });
    print('✅ User created successfully');
  }
\""

echo ""
echo "✅ MongoDB user configured!"

# Create .env file
echo ""
read -p "Create .env file? (y/n) [y]: " CREATE_ENV
CREATE_ENV=${CREATE_ENV:-y}

if [[ "$CREATE_ENV" =~ ^[Yy]$ ]]; then
    # Generate JWT secret
    JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(64))" 2>/dev/null || openssl rand -base64 48)
    
    # URL encode password for connection string
    ENCODED_PASSWORD=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$MONGO_PASSWORD'))" 2>/dev/null || echo "$MONGO_PASSWORD")
    
    cat > .env << EOF
# MongoDB Credentials
MONGODB_USERNAME=$MONGO_USERNAME
MONGODB_PASSWORD=$MONGO_PASSWORD
MONGODB_DATABASE=$MONGO_DATABASE
MONGODB_URI=mongodb://$MONGO_USERNAME:$ENCODED_PASSWORD@localhost:27017/$MONGO_DATABASE?authSource=$MONGO_DATABASE

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRE=7d

# Application Settings
NODE_ENV=production
PORT=5000
CORS_ORIGINS=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# WhatsApp Configuration (Optional)
OPEN_WA_ENABLE=false
OPEN_WA_SESSION=crm-session
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
EOF
    
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Keep your .env file secure and never commit it to git!"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📝 Summary:"
echo "  Username: $MONGO_USERNAME"
echo "  Database: $MONGO_DATABASE"
echo "  Host: $MONGO_HOST"
echo ""
echo "🚀 Next steps:"
echo "  1. Review your .env file"
echo "  2. Test connection: docker compose up"
echo "  3. Check logs: docker compose logs backend"
echo ""

