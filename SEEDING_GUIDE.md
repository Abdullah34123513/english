# Database Seeding Guide

This guide explains how to seed the English Learning Platform database with demo users, including admin access.

## 🌱 Available Seed Scripts

### 1. Admin Only Seed
**Quick admin access for testing the admin panel**

```bash
npm run db:seed:admin
```

**Creates:**
- **Admin User**: `admin@englishplatform.com` / `admin123`
- Email verified: ✅ Yes (no email verification required)
- Role: ADMIN
- Access: Full admin dashboard access

### 2. Basic Seed
**Original seed script with demo users**

```bash
npm run db:seed
```

**Creates:**
- 3 Teachers with profiles and availability
- 3 Students with profiles
- 1 Admin user
- Sample bookings and availability
- **Note**: Users require email verification for login

### 3. Comprehensive Seed
**Complete dataset with all users verified**

```bash
npm run db:seed:comprehensive
```

**Creates:**
- 1 Admin user (verified)
- 3 Teachers with complete profiles, availability, and verified emails
- 3 Students with complete profiles and verified emails
- Sample bookings, reviews, and payments
- **All users have email verified = true** (no email verification required)

## 👥 Demo Accounts

### Admin Access
```
Email: admin@englishplatform.com
Password: admin123
Role: ADMIN
Email Verified: ✅ Yes
Dashboard: /dashboard/admin
```

### Teacher Accounts
```
Email: sarah.johnson@englishplatform.com
Password: demo123
Role: TEACHER
Rate: $30/hour
Specialties: Business English, Conversation
Availability: Mon-Fri, 9:00 AM - 6:00 PM
```

```
Email: emma.wilson@englishplatform.com
Password: demo123
Role: TEACHER
Rate: $35/hour
Specialties: IELTS Preparation, Academic English
Availability: Mon-Fri, 2:00 PM - 8:00 PM
```

```
Email: david.chen@englishplatform.com
Password: demo123
Role: TEACHER
Rate: $28/hour
Specialties: Pronunciation, Accent Reduction
Availability: Mon-Fri, 6:00 PM - 10:00 PM, Weekends 10:00 AM - 6:00 PM
```

### Student Accounts
```
Email: mike.chen@englishplatform.com
Password: demo123
Role: STUDENT
Level: Intermediate
Goals: Business English, Conversation
```

```
Email: lisa.wang@englishplatform.com
Password: demo123
Role: STUDENT
Level: Advanced
Goals: IELTS Preparation, Academic Writing
```

```
Email: carlos.rodriguez@englishplatform.com
Password: demo123
Role: STUDENT
Level: Beginner
Goals: Basic Conversation, Travel English
```

## 🔐 Login Issues Fixed

### Problem
Users couldn't login because the email verification system required email verification, but the seed users weren't verified.

### Solution
All seed scripts now create users with `emailVerified: true`, bypassing the email verification requirement for demo accounts.

### Admin Access
The admin user is created with:
- Email verified: ✅ Yes
- Role: ADMIN
- Full access to admin dashboard
- No email verification required

## 🚀 Quick Start

### For Admin Testing
1. Run admin seed: `npm run db:seed:admin`
2. Login with: `admin@englishplatform.com` / `admin123`
3. Access admin dashboard: `/dashboard/admin`

### For Full Demo
1. Run comprehensive seed: `npm run db:seed:comprehensive`
2. Use any demo account from the list above
3. All users can login without email verification

### For Original Demo
1. Run basic seed: `npm run db:seed`
2. Use demo accounts (note: email verification required)

## 📝 Database Reset

If you need to clear the database and start fresh:

```bash
# Reset database (deletes all data)
npm run db:reset

# Then seed with your preferred script
npm run db:seed:admin
# or
npm run db:seed:comprehensive
# or
npm run db:seed
```

## 🔧 Troubleshooting

### Admin Login Issues
If you can't login as admin:
1. Run `npm run db:seed:admin` to create a fresh admin user
2. Use credentials: `admin@englishplatform.com` / `admin123`
3. Ensure you're using the correct login page: `/auth/signin`

### Email Verification Errors
If users can't login due to email verification:
1. Use comprehensive seed: `npm run db:seed:comprehensive`
2. All users will have `emailVerified: true`
3. No email verification required for login

### Database Connection Issues
If seeding fails:
1. Ensure database is running
2. Check `DATABASE_URL` in `.env` file
3. Run `npm run db:push` to sync schema
4. Try seeding again

## 📊 Seed Script Comparison

| Script | Admin | Teachers | Students | Email Verified | Bookings | Reviews | Use Case |
|--------|-------|----------|-----------|----------------|----------|---------|----------|
| `db:seed:admin` | ✅ 1 | ❌ | ❌ | ✅ Yes | ❌ | ❌ | Quick admin access |
| `db:seed` | ✅ 1 | ✅ 3 | ✅ 3 | ❌ No | ✅ | ❌ | Original demo |
| `db:seed:comprehensive` | ✅ 1 | ✅ 3 | ✅ 3 | ✅ Yes | ✅ | ✅ | Full testing demo |

## 🌐 Access URLs

- **Login Page**: `/auth/signin`
- **Admin Dashboard**: `/dashboard/admin`
- **Teacher Dashboard**: `/dashboard/teacher`
- **Student Dashboard**: `/dashboard/student`
- **Environment Testing**: `/dashboard/admin` → Environment Test tab

## 📋 Next Steps

After seeding:

1. **Test Admin Access**
   - Login as admin
   - Explore admin dashboard
   - Test environment testing feature

2. **Test Teacher Features**
   - Login as a teacher
   - Check teacher dashboard
   - View availability and bookings

3. **Test Student Features**
   - Login as a student
   - Browse teachers
   - Book lessons

4. **Test Email System**
   - Register a new user
   - Check email verification flow
   - Test resend verification

---

**Note**: All seed scripts are designed for development and testing purposes. In production, you would want to use a more controlled approach for user creation and management.