# Development Guide

## Quick Start

1. **Start local development**:
   \`\`\`bash
   npm run dev
   \`\`\`
   Open [http://localhost:3000](http://localhost:3000)

2. **Start with Firebase emulators** (optional):
   \`\`\`bash
   npm run firebase:emulators
   \`\`\`
   This runs local Firebase services for testing

## Development Workflows

### 🚀 Daily Development
\`\`\`bash
# Start development server
npm run dev

# Make changes in your editor
# Changes appear instantly at localhost:3000
\`\`\`

### 🔍 Testing Changes
\`\`\`bash
# Create feature branch
git checkout -b feature/my-new-feature

# Make changes and test locally
npm run dev

# Push for preview deployment
git add .
git commit -m "Add new feature"
git push origin feature/my-new-feature

# Vercel will provide a preview URL
\`\`\`

### 🚢 Deploying to Production
\`\`\`bash
# Merge to main (or use GitHub PR)
git checkout main
git merge feature/my-new-feature
git push origin main

# Automatic production deployment
\`\`\`

## Useful Commands

### Development
- \`npm run dev\` - Start development server
- \`npm run dev:turbo\` - Start with Turbopack (faster)
- \`npm run lint\` - Check code quality
- \`npm run type-check\` - Check TypeScript

### Firebase
- \`npm run firebase:emulators\` - Start local Firebase
- \`npm run firebase:deploy:functions\` - Deploy functions only
- \`npm run firebase:logs\` - View function logs

### Deployment
- \`npm run preview\` - Test production build locally
- \`npm run deploy:preview\` - Push current branch for preview
- \`npm run deploy:production\` - Deploy to production

## File Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── recipes/           # Recipe management
│   ├── inventory/         # Inventory management
│   └── login/             # Authentication
├── components/            # Reusable components
├── lib/                   # Utilities and Firebase config
├── contexts/              # React contexts
├── functions/             # Firebase Cloud Functions
└── public/                # Static assets
\`\`\`

## Environment Variables

Make sure these are set in your development environment:
- \`NEXT_PUBLIC_FIREBASE_API_KEY\`
- \`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN\`
- \`NEXT_PUBLIC_FIREBASE_PROJECT_ID\`
- \`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET\`
- \`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID\`
- \`NEXT_PUBLIC_FIREBASE_APP_ID\`
- \`NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID\`

## Common Development Tasks

### Adding a New Page
1. Create file in \`app/new-page/page.tsx\`
2. Add navigation link if needed
3. Test locally with \`npm run dev\`

### Modifying Database Schema
1. Update TypeScript interfaces in \`lib/firestore.ts\`
2. Update Firestore security rules if needed
3. Test with Firebase emulators

### Adding New Components
1. Create in \`components/\` directory
2. Export from component file
3. Import where needed

## Debugging

### Frontend Issues
- Check browser console for errors
- Use React DevTools
- Check Network tab for API calls

### Firebase Issues
- Check Firebase Console logs
- Use \`npm run firebase:logs\` for function logs
- Test with Firebase emulators locally

### Build Issues
- Run \`npm run build\` to check for build errors
- Run \`npm run type-check\` for TypeScript issues
- Check \`npm run lint\` for code quality issues
