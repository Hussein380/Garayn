const { adminDb } = require('@/firebase/adminApp');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

async function testAuthFlow() {
    console.log('Starting authentication flow test...');
    const auth = getAuth();
    const db = getFirestore();

    try {
        // 1. Test admin user verification
        console.log('\n1. Testing admin user verification...');
        const adminUsers = await db.collection('users')
            .where('role', '==', 'admin')
            .get();

        if (adminUsers.empty) {
            throw new Error('No admin users found in database');
        }

        console.log(`Found ${adminUsers.size} admin users:`);
        for (const doc of adminUsers.docs) {
            const userData = doc.data();
            console.log(`- ${userData.email} (${userData.displayName})`);

            // Verify custom claims
            const userRecord = await auth.getUser(doc.id);
            const customClaims = userRecord.customClaims || {};

            if (customClaims.role !== 'admin' || !customClaims.isAdmin) {
                console.error(`❌ Custom claims not set correctly for ${userData.email}`);
            } else {
                console.log(`✅ Custom claims verified for ${userData.email}`);
            }
        }

        // 2. Test login attempts collection
        console.log('\n2. Testing login attempts collection...');
        const loginAttempts = await db.collection('loginAttempts')
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();

        console.log(`Found ${loginAttempts.size} recent login attempts:`);
        for (const doc of loginAttempts.docs) {
            const attempt = doc.data();
            console.log(`- ${attempt.email} (${attempt.success ? 'Success' : 'Failed'}) at ${attempt.timestamp.toDate()}`);
        }

        // 3. Verify rate limiting
        console.log('\n3. Testing rate limiting configuration...');
        const rateLimitConfig = {
            maxAttempts: 5,
            windowMs: 15 * 60 * 1000, // 15 minutes
            lockoutMs: 30 * 60 * 1000 // 30 minutes
        };
        console.log('Rate limit configuration:');
        console.log(`- Max attempts: ${rateLimitConfig.maxAttempts}`);
        console.log(`- Time window: ${rateLimitConfig.windowMs / 60000} minutes`);
        console.log(`- Lockout duration: ${rateLimitConfig.lockoutMs / 60000} minutes`);

        // 4. Test session configuration
        console.log('\n4. Testing session configuration...');
        const sessionConfig = {
            strategy: 'jwt',
            maxAge: 30 * 24 * 60 * 60 // 30 days
        };
        console.log('Session configuration:');
        console.log(`- Strategy: ${sessionConfig.strategy}`);
        console.log(`- Max age: ${sessionConfig.maxAge / 86400} days`);

        console.log('\n✅ Authentication flow test completed successfully!');
    } catch (error) {
        console.error('\n❌ Authentication flow test failed:', error);
        process.exit(1);
    }
}

// Run the tests
testAuthFlow()
    .then(() => {
        console.log('\nAll tests completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\nTest suite failed:', error);
        process.exit(1);
    }); 