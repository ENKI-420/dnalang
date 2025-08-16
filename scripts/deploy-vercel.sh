#!/bin/bash

# Vercel Deployment Script for Quantum Chat DNA Platform
# Version: 2.0.0-quantum-holographic

set -e

echo "🚀 Starting Vercel deployment for Quantum Chat DNA Platform..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Set environment variables for production
echo "⚙️ Setting up production environment variables..."
vercel env add SUPABASE_SUPABASE_URL production
vercel env add SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add DATABASE_URL production
vercel env add DNA_RUNTIME_MODE production
vercel env add QUANTUM_COHERENCE_ENABLED production
vercel env add CONSCIOUSNESS_TRACKING production
vercel env add CRON_SECRET production

# Deploy to production
echo "🌐 Deploying to Vercel production..."
vercel --prod

# Verify deployment health
echo "🔍 Verifying deployment health..."
sleep 10
DEPLOYMENT_URL=$(vercel ls --scope=team | grep quantum-chat | head -1 | awk '{print $2}')

if [ ! -z "$DEPLOYMENT_URL" ]; then
    echo "✅ Deployment successful!"
    echo "🌍 Production URL: https://$DEPLOYMENT_URL"
    echo "🏥 Health Check: https://$DEPLOYMENT_URL/api/health"
    
    # Test health endpoint
    curl -s "https://$DEPLOYMENT_URL/api/health" | jq '.'
else
    echo "❌ Deployment verification failed"
    exit 1
fi

echo "🎉 Quantum Chat DNA Platform successfully deployed to Vercel!"
