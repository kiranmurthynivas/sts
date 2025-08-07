# 🚀 Quick Deploy for Hackathon Submission

## ⚡ 5-Minute Deployment Guide

### Step 1: Prepare Your Code
```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for hackathon deployment"
git push origin main
```

### Step 2: Deploy to Vercel
1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with GitHub
3. **Click "New Project"**
4. **Import your repository**
5. **Configure settings**:
   - Framework Preset: `Other`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `client/build`
   - Install Command: `npm install && cd client && npm install`

### Step 3: Set Environment Variables
In Vercel dashboard → Settings → Environment Variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stakeforshame
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-here
```

### Step 4: Deploy
1. **Click "Deploy"**
2. **Wait 2-3 minutes** for build
3. **Copy your URL** (e.g., `https://your-project.vercel.app`)

### Step 5: Test Your App
- ✅ Visit your URL
- ✅ Test registration/login
- ✅ Create a habit
- ✅ Test wallet connection
- ✅ Verify AI assistant

## 🎯 Hackathon Submission Template

```
Project Name: Stake-for-Shame
Live Demo: https://your-project.vercel.app
GitHub: https://github.com/yourusername/stake-for-shame
Demo Video: [Record 2-3 minute walkthrough]

Description:
A crypto-powered habit accountability application that uses blockchain technology 
and AI to help users build better habits through financial incentives and 
automated tracking.

Key Features:
- ✅ User authentication and registration
- ✅ Habit creation and tracking with crypto staking
- ✅ AI-powered habit coaching (Eliza)
- ✅ MetaMask wallet integration
- ✅ Real-time analytics and insights
- ✅ Mobile-responsive design
- ✅ Automated habit checking and punishments
- ✅ Meme coin rewards system

Tech Stack:
- Frontend: React 18, Tailwind CSS, Framer Motion
- Backend: Node.js, Express.js, MongoDB
- Blockchain: Web3.js, Ethers.js, Polygon
- AI: Comput3 API with LLaMA 3
- Deployment: Vercel, MongoDB Atlas

Unique Value Proposition:
Combines blockchain technology, AI, and gamification to create a unique 
habit-building experience where users stake crypto for accountability and 
receive AI-powered coaching.
```

## 🔧 Troubleshooting

### Build Fails?
- Check if all dependencies are in `package.json`
- Verify `client/package.json` exists
- Check for syntax errors in code

### API Not Working?
- Ensure environment variables are set in Vercel
- Check MongoDB connection string
- Verify CORS configuration

### Frontend Not Loading?
- Check if `client/build` directory exists
- Verify static file serving in `server.js`
- Check browser console for errors

## 📞 Quick Support

1. **Check Vercel Logs**: Project dashboard → Functions → View logs
2. **Test Locally**: Run `npm run dev` to test locally
3. **Verify Environment**: Check all environment variables are set
4. **Check MongoDB**: Verify connection in Atlas dashboard

## 🎉 You're Ready!

Your app should now be live and ready for hackathon submission! 

**Next Steps:**
1. Record a demo video
2. Test all features thoroughly
3. Prepare your presentation
4. Submit your hackathon entry

**Good luck! 🚀**
