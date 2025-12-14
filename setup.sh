#!/bin/bash

echo "🛡️  VulnScany Setup Script"
echo "================================"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 1
    fi
fi

# Create .env.local from example
cp env.example .env.local

echo "✅ Created .env.local from template"
echo ""

# Prompt for GitHub OAuth credentials
echo "📝 GitHub OAuth Setup"
echo "---"
echo "Create a GitHub OAuth App at: https://github.com/settings/developers"
echo ""
read -p "GitHub Client ID: " github_client_id
read -p "GitHub Client Secret: " github_client_secret

# Generate NEXTAUTH_SECRET
echo ""
echo "🔐 Generating NEXTAUTH_SECRET..."
nextauth_secret=$(openssl rand -base64 32)

# Prompt for API keys
echo ""
echo "🤖 AI API Keys"
echo "---"
read -p "Ollama API Key(s) (comma-separated): " ollama_keys
read -p "Mistral API Key(s) (comma-separated): " mistral_keys

# Update .env.local
sed -i '' "s/your_github_client_id/$github_client_id/g" .env.local
sed -i '' "s/your_github_client_secret/$github_client_secret/g" .env.local
sed -i '' "s/your_nextauth_secret_generate_with_openssl/$nextauth_secret/g" .env.local
sed -i '' "s/ollama_key1,ollama_key2,ollama_key3/$ollama_keys/g" .env.local
sed -i '' "s/mistral_key1,mistral_key2/$mistral_keys/g" .env.local

# Add NEXT_PUBLIC_GITHUB_CLIENT_ID
echo "NEXT_PUBLIC_GITHUB_CLIENT_ID=$github_client_id" >> .env.local

echo ""
echo "✅ Configuration complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review .env.local to ensure all values are correct"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000"
echo ""
echo "🔒 Remember to update your GitHub OAuth App callback URL to:"
echo "   http://localhost:3000/api/auth/callback"
echo ""
