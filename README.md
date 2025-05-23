# Food Technology Inventory Management System

A web application for managing food technology class inventory, student recipe orders, and automated shopping list generation.

## Features

- User authentication (teachers and students)
- Recipe management
- Inventory tracking
- Student order submission
- Automated shopping list generation
- Class management
- Firebase Cloud Functions for automation

## Setup and Deployment

### Prerequisites

- Node.js (v14 or later)
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase account

### Local Development

1. Clone the repository
   \`\`\`
   git clone <repository-url>
   cd food-tech-inventory
   \`\`\`

2. Install dependencies
   \`\`\`
   npm install
   \`\`\`

3. Set up Firebase
   \`\`\`
   firebase login
   firebase init
   \`\`\`

4. Start the development server
   \`\`\`
   npm run dev
   \`\`\`

### Deployment

1. Build and export the Next.js app
   \`\`\`
   npm run export
   \`\`\`

2. Deploy to Firebase Hosting
   \`\`\`
   npm run deploy
   \`\`\`

3. Deploy Firebase Functions
   \`\`\`
   npm run deploy:functions
   \`\`\`

4. Deploy Firestore Rules
   \`\`\`
   npm run deploy:rules
   \`\`\`

5. Deploy everything
   \`\`\`
   npm run deploy:all
   \`\`\`

## Firebase Structure

### Firestore Collections

- **users**: User profiles with roles (teacher/student)
- **classes**: Class information
- **recipes**: Recipe details and ingredients
- **inventory**: Inventory items and stock levels
- **orders**: Student orders for recipes
- **shoppingLists**: Generated shopping lists
- **notifications**: User notifications

### Firebase Functions

- **generateWeeklyShoppingList**: Automatically generates shopping lists weekly
- **sendOrderReminders**: Sends reminders to students who haven't submitted orders
- **updateInventoryOnOrderCompletion**: Updates inventory when orders are completed
- **createUserProfileOnSignUp**: Creates a user profile when a new user signs up

## Security

The application uses Firebase Authentication and Firestore Security Rules to ensure data security:

- Teachers can manage all data
- Students can only access and modify their own data
- Inventory and recipes are read-only for students

## License

[MIT License](LICENSE)
