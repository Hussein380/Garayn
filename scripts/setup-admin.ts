import { adminAuth, adminDb } from '@/firebase/adminApp';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

interface AdminUser {
    email: string;
    password: string;
    displayName: string;
    role: 'admin';
}

// List of initial admin users to create
const ADMIN_USERS: AdminUser[] = [
    {
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: process.env.ADMIN_PASSWORD || 'changeme123', // This should be changed immediately after first login
        displayName: 'System Administrator',
        role: 'admin'
    }
];

async function setupAdminUsers() {
    console.log('Starting admin user setup...');
    const auth = getAuth();
    const db = getFirestore();

    for (const adminUser of ADMIN_USERS) {
        try {
            // Check if user already exists
            let userRecord;
            try {
                userRecord = await auth.getUserByEmail(adminUser.email);
                console.log(`User ${adminUser.email} already exists, updating role...`);
            } catch (error) {
                // User doesn't exist, create new user
                console.log(`Creating new admin user: ${adminUser.email}`);
                userRecord = await auth.createUser({
                    email: adminUser.email,
                    password: adminUser.password,
                    displayName: adminUser.displayName,
                    emailVerified: true
                });
                console.log(`Created user with UID: ${userRecord.uid}`);
            }

            // Set custom claims for admin role
            await auth.setCustomUserClaims(userRecord.uid, {
                role: adminUser.role,
                isAdmin: true
            });

            // Update or create user document in Firestore
            const userRef = db.collection('users').doc(userRecord.uid);
            await userRef.set({
                email: adminUser.email,
                displayName: adminUser.displayName,
                role: adminUser.role,
                isAdmin: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }, { merge: true });

            console.log(`Successfully set up admin user: ${adminUser.email}`);
        } catch (error) {
            console.error(`Error setting up admin user ${adminUser.email}:`, error);
            throw error;
        }
    }

    console.log('Admin user setup completed successfully!');
}

// Run the setup
setupAdminUsers()
    .then(() => {
        console.log('Admin setup script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Admin setup script failed:', error);
        process.exit(1);
    }); 