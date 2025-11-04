#!/bin/bash
# MongoDB Authentication Setup Script
# Run this once to create the database user

set -e

MONGO_HOST="${MONGO_HOST:-localhost:27017}"
MONGO_ROOT_USER="${MONGO_ROOT_USER:-admin}"
MONGO_ROOT_PASSWORD="${MONGO_ROOT_PASSWORD:-}"
MONGO_DATABASE="${MONGO_DATABASE:-crm_prod}"
MONGO_USERNAME="${MONGO_USERNAME:-crmuser_admin}"
MONGO_PASSWORD="${MONGO_PASSWORD:-change_to_a_strong_password_12345}"

echo "🔐 MongoDB Authentication Setup"
echo "=================================="
echo "Host: $MONGO_HOST"
echo "Database: $MONGO_DATABASE"
echo "Username: $MONGO_USERNAME"
echo ""

# Build connection string
if [ -n "$MONGO_ROOT_PASSWORD" ]; then
  MONGO_URI="mongodb://$MONGO_ROOT_USER:$MONGO_ROOT_PASSWORD@$MONGO_HOST/admin"
else
  MONGO_URI="mongodb://$MONGO_HOST/admin"
fi

echo "Connecting to MongoDB..."

mongosh "$MONGO_URI" --eval "
  use $MONGO_DATABASE;
  
  // Check if user already exists
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
      roles: [
        { role: 'readWrite', db: '$MONGO_DATABASE' }
      ]
    });
    print('✅ User created successfully');
  }
  
  print('');
  print('📋 Summary:');
  print('  Database: $MONGO_DATABASE');
  print('  Username: $MONGO_USERNAME');
  print('  Password: $MONGO_PASSWORD');
  print('');
  print('🔗 Connection String:');
  print('  mongodb://$MONGO_USERNAME:$MONGO_PASSWORD@$MONGO_HOST/$MONGO_DATABASE?authSource=$MONGO_DATABASE');
"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Add to your .env file:"
echo "MONGODB_USERNAME=$MONGO_USERNAME"
echo "MONGODB_PASSWORD=$MONGO_PASSWORD"
echo "MONGODB_DATABASE=$MONGO_DATABASE"

