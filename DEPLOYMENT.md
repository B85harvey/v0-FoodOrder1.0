# Deployment Guide - Vercel + Firebase

This guide covers deploying your Food Technology Inventory Management app to Vercel while using Firebase for backend services.

## Architecture Overview

- **Frontend**: Deployed on Vercel
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Cloud Functions**: Firebase Functions
- **File Storage**: Firebase Storage (if needed)

## Prerequisites

1. Vercel account
2. Firebase project
3. Firebase CLI installed: `npm install -g firebase-tools`
4. Vercel CLI installed: `npm install -g vercel`

## Step 1: Firebase Setup

1. **Login to Firebase**:
   \`\`\`bash
   firebase login
   \`\`\`

2. **Initialize Firebase in your project** (if not done already):
   \`\`\`bash
   firebase init
   \`\`\`
   Select:
   - Firestore
   - Functions
   - Storage (optional)

3. **Deploy Firebase services**:
   \`\`\`bash
   # Deploy Firestore rules
   firebase deploy --only firestore:rules
   
   # Deploy Cloud Functions
   firebase deploy --only functions
   \`\`\`

## Step 2: Vercel Deployment

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
2. **Go to [vercel.com](https://vercel.com)**
3. **Import your GitHub repository**
4. **Configure build settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. **Deploy**

### Option B: Deploy via CLI

1. **Install Vercel CLI**:
   \`\`\`bash
   npm install -g vercel
   \`\`\`

2. **Login to Vercel**:
   \`\`\`bash
   vercel login
   \`\`\`

3. **Deploy**:
   \`\`\`bash
   vercel --prod
   \`\`\`

## Step 3: Environment Variables

The following environment variables are already configured in your Vercel project:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

## Step 4: Firebase Security Rules

Make sure your Firestore security rules are deployed:

\`\`\`bash
firebase deploy --only firestore:rules
\`\`\`

## Step 5: Testing

1. **Test locally**:
   \`\`\`bash
   npm run dev
   \`\`\`

2. **Test production build**:
   \`\`\`bash
   npm run build
   npm run start
   \`\`\`

3. **Test deployed app**: Visit your Vercel URL

## Ongoing Maintenance

### Updating Firebase Functions
\`\`\`bash
firebase deploy --only functions
\`\`\`

### Updating Firestore Rules
\`\`\`bash
firebase deploy --only firestore:rules
\`\`\`

### Updating Frontend
Simply push to your GitHub repository - Vercel will auto-deploy.

## Monitoring

- **Vercel Analytics**: Available in Vercel dashboard
- **Firebase Console**: Monitor Firestore usage, function logs, etc.
- **Error Tracking**: Check Vercel function logs and Firebase function logs

## Troubleshooting

### Common Issues

1. **Environment Variables Not Working**:
   - Ensure all `NEXT_PUBLIC_` prefixed variables are set in Vercel
   - Redeploy after adding environment variables

2. **Firebase Connection Issues**:
   - Check Firebase project ID in environment variables
   - Verify Firestore rules allow your operations

3. **Build Failures**:
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in package.json

### Getting Help

- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Firebase Support: [firebase.google.com/support](https://firebase.google.com/support)
