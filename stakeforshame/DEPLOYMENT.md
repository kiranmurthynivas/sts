# 🚀 Deployment Guide for Hackathon Submission

This guide will help you deploy the Stake-for-Shame application to Vercel for your hackathon submission.

## 📋 Prerequisites

1. **GitHub Account**: Make sure your code is pushed to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **MongoDB Atlas**: Free cloud database
4. **Environment Variables**: API keys and configuration

## 🎯 Quick Deployment Steps

### Step 1: Prepare Your Repository

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Verify Structure**:
   - Ensure `vercel.json` exists in root
   - Check `client/package.json` has build script
   - Confirm all dependencies are in `package.json`

### Step 2: Deploy to Vercel

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository

2. **Configure Project**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install && cd client && npm install`

3. **Environment Variables**:
   Add these in Vercel dashboard:

   ```env
   # Server Configuration
   NODE_ENV=production
   PORT=5000

   # MongoDB Configuration
   MONGODB_URI=your_mongodb_atlas_uri

   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-here

   # Session Secret
   SESSION_SECRET=your-session-secret-here

   # Comput3 AI Configuration (Optional)
   OPENAI_API_KEY=your_comput3_api_key
   OPENAI_API_URL=https://api.comput3.ai/v1
   SMALL_OPENAI_MODEL=llama3:70b

   # Blockchain Configuration (Optional)
   ETHEREUM_NETWORK=polygon
   POLYGON_RPC_URL=https://polygon-rpc.com
   PRIVATE_KEY=your-private-key-here

   # Smart Contract Addresses
   STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
   CHARITY_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6

   # Meme Coin Addresses
   SHIBA_TOKEN_ADDRESS=0x6f8a06447Ff6FcF75d803135a7de15CE88C1d4ec
   PEPE_TOKEN_ADDRESS=0x0000000000000000000000000000000000000000
   ```

### Step 3: Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**:
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Sign up for free tier
   - Create a new cluster

2. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `stakeforshame`

3. **Add to Vercel**:
   - Go to your Vercel project settings
   - Add `MONGODB_URI` with your connection string

### Step 4: Deploy

1. **Click Deploy** in Vercel
2. **Wait for Build** (usually 2-3 minutes)
3. **Get Your URL** (e.g., `https://your-project.vercel.app`)

## 🔧 Troubleshooting

### Common Issues

1. **Build Fails**:
   - Check if all dependencies are in `package.json`
   - Verify `client/package.json` exists
   - Check for syntax errors

2. **API Routes Not Working**:
   - Ensure `vercel.json` is configured correctly
   - Check environment variables are set
   - Verify MongoDB connection

3. **Frontend Not Loading**:
   - Check if `client/build` directory exists
   - Verify static file serving in `server.js`
   - Check CORS configuration

### Debug Commands

```bash
# Check build locally
npm run build

# Test server locally
npm start

# Check environment variables
echo $MONGODB_URI
```

## 📊 Post-Deployment Checklist

- [ ] Application loads without errors
- [ ] User registration/login works
- [ ] Habit creation and tracking functions
- [ ] Wallet connection works (if configured)
- [ ] AI assistant responds (if configured)
- [ ] All API endpoints return proper responses
- [ ] Mobile responsiveness works
- [ ] No console errors in browser

## 🎉 Hackathon Submission

### Your Submission Should Include:

1. **Live Demo URL**: Your Vercel deployment URL
2. **GitHub Repository**: Link to your code
3. **Demo Video**: 2-3 minute walkthrough
4. **Documentation**: README.md with setup instructions
5. **Features List**: Key functionality implemented

### Example Submission Format:

```
Project Name: Stake-for-Shame
Live Demo: https://stake-for-shame.vercel.app
GitHub: https://github.com/yourusername/stake-for-shame
Demo Video: [Link to your demo video]

Features:
- ✅ User authentication and registration
- ✅ Habit creation and tracking
- ✅ Crypto staking and punishment system
- ✅ AI-powered habit coaching
- ✅ Wallet integration (MetaMask)
- ✅ Real-time analytics and insights
- ✅ Mobile-responsive design
- ✅ Automated habit checking
- ✅ Meme coin rewards system

Tech Stack:
- Frontend: React 18, Tailwind CSS, Framer Motion
- Backend: Node.js, Express.js, MongoDB
- Blockchain: Web3.js, Ethers.js, Polygon
- AI: Comput3 API with LLaMA 3
- Deployment: Vercel, MongoDB Atlas
```

## 🚀 Advanced Configuration

### Custom Domain (Optional)

1. **Add Custom Domain** in Vercel dashboard
2. **Update CORS** in `server.js` with your domain
3. **Configure DNS** as instructed by Vercel

### Performance Optimization

1. **Enable Caching** in Vercel
2. **Optimize Images** and assets
3. **Enable Compression** (already configured)
4. **Monitor Performance** with Vercel Analytics

## 📞 Support

If you encounter issues:

1. **Check Vercel Logs**: Project dashboard → Functions → View logs
2. **Verify Environment Variables**: Settings → Environment Variables
3. **Test Locally**: Run `npm run dev` to test locally
4. **Check MongoDB**: Verify connection in Atlas dashboard

## 🎯 Final Notes

- **Test thoroughly** before submission
- **Record a demo video** showing key features
- **Prepare presentation** highlighting unique aspects
- **Document any limitations** or future improvements
- **Keep backup** of your deployment URL

Good luck with your hackathon submission! 🚀
