import bcrypt from 'bcryptjs';

// This script seeds sample data for testing
// Run with: npx ts-node scripts/seed.ts

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.includes('your_mongodb')) {
  console.error('❌ Please set a valid MONGODB_URI in .env.local');
  process.exit(1);
}

async function seed() {
  try {
    const { default: connectDB } = await import('../lib/mongodb');
    const { default: User } = await import('../models/User');
    const { default: PullRequest } = await import('../models/PullRequest');
    const { default: Review } = await import('../models/Review');

    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await PullRequest.deleteMany({});
    await Review.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create sample users
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: await bcrypt.hash('password123', 12),
      role: 'admin',
    });

    const regularUser = await User.create({
      name: 'Test User',
      email: 'user@example.com',
      password: await bcrypt.hash('password123', 12),
      role: 'user',
    });

    console.log('✅ Created users:');
    console.log('   - admin@example.com / password123 (admin)');
    console.log('   - user@example.com / password123 (user)');

    // Create sample PRs
    const sampleDiff = `--- a/src/utils.js
+++ b/src/utils.js
@@ -1,10 +1,15 @@
 function calculateTotal(items) {
-  let total = 0
+  let total = 0;
   for (let i = 0; i < items.length; i++) {
-    total += items[i].price
+    total += items[i].price;
   }
-  return total
+  return total;
 }
 
-module.exports = { calculateTotal }
+function processPayment(amount) {
+  console.log('Processing $' + amount);
+  return true;
+}
+
+module.exports = { calculateTotal, processPayment };`;

    const pr1 = await PullRequest.create({
      userId: regularUser._id,
      title: 'Fix missing semicolons in utils.js',
      description: 'Added proper semicolons and a new payment function',
      repoName: 'my-awesome-app',
      prNumber: 42,
      diff: sampleDiff,
      language: 'javascript',
      status: 'pending',
    });

    const pr2 = await PullRequest.create({
      userId: regularUser._id,
      title: 'Add user authentication',
      description: 'Implement login and signup functionality',
      repoName: 'my-awesome-app',
      prNumber: 43,
      diff: sampleDiff,
      language: 'typescript',
      status: 'pending',
    });

    console.log('✅ Created 2 sample pull requests');

    // Create sample reviews with expert labels
    await Review.create({
      prId: pr1._id,
      agentActions: [
        { action: 'flag_line', lineNumber: 3, category: 'style', severity: 'low', comment: 'Missing semicolon' },
      ],
      expertLabels: [
        { action: 'flag_line', lineNumber: 3, category: 'style', severity: 'low', comment: 'Missing semicolon' },
      ],
      finalVerdict: 'request_changes',
      taskDifficulty: 'easy',
      agentScore: 0.95,
      rewardScore: 1.0,
    });

    console.log('✅ Created sample review with expert labels');
    console.log('\n🎉 Database seeded successfully!');
    console.log('\nYou can now:');
    console.log('   1. Login with admin@example.com / password123');
    console.log('   2. Visit http://localhost:3000');
    console.log('   3. Submit PRs and run AI reviews');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
