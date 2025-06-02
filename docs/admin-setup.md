# Admin User Setup Guide

This document describes how to set up and manage admin users in the system.

## Initial Setup

1. Create a `.env.local` file in the root directory with the following variables:
   ```env
   ADMIN_EMAIL=your-admin-email@example.com
   ADMIN_PASSWORD=your-secure-password
   ```

2. Install required dependencies:
   ```bash
   npm install
   ```

3. Run the admin setup script:
   ```bash
   npm run setup-admin
   ```

The script will:
- Create a new admin user if it doesn't exist
- Set up proper role and permissions
- Create necessary Firestore documents
- Set custom claims for admin access

## Security Considerations

1. **Change Default Password**: After first login, immediately change the default password.
2. **Environment Variables**: Never commit `.env.local` to version control.
3. **Multiple Admins**: To add more admin users, modify the `ADMIN_USERS` array in `scripts/setup-admin.ts`.
4. **Role Management**: Admin roles are managed through Firebase Custom Claims and Firestore.

## Admin User Properties

Each admin user has the following properties:
- `email`: Admin user's email address
- `displayName`: Admin user's display name
- `role`: Set to 'admin'
- `isAdmin`: Boolean flag for admin status
- `createdAt`: Timestamp of user creation
- `updatedAt`: Timestamp of last update

## Troubleshooting

If you encounter issues during setup:

1. **User Already Exists**: The script will update the role of existing users.
2. **Permission Errors**: Ensure Firebase Admin SDK is properly configured.
3. **Database Errors**: Check Firestore rules and permissions.

## Adding New Admin Users

To add new admin users:

1. Edit `scripts/setup-admin.ts`
2. Add new user to `ADMIN_USERS` array:
   ```typescript
   const ADMIN_USERS: AdminUser[] = [
     // ... existing users ...
     {
       email: 'new-admin@example.com',
       password: 'secure-password',
       displayName: 'New Admin',
       role: 'admin'
     }
   ];
   ```
3. Run the setup script again:
   ```bash
   npm run setup-admin
   ```

## Security Best Practices

1. Use strong passwords
2. Enable 2FA for admin accounts
3. Regularly audit admin access
4. Keep admin user list minimal
5. Monitor login attempts
6. Regularly rotate admin credentials
7. Use environment variables for sensitive data 