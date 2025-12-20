# Security Recommendations

This document outlines security settings that require manual configuration in your Supabase project dashboard.

## Required Manual Configurations

### 1. Auth Database Connection Strategy

**Current Status:** Fixed connection limit (10 connections)

**Recommendation:** Switch to percentage-based connection allocation

**Why:** The Auth server is currently configured to use a maximum of 10 connections. If you increase your database instance size, the Auth server won't benefit from the additional capacity unless you manually adjust this number. A percentage-based strategy automatically scales with your instance size.

**How to Configure:**
1. Go to your Supabase Dashboard
2. Navigate to **Settings** > **Database**
3. Find the **Auth Database Connection** settings
4. Change from fixed number to percentage-based allocation
5. Recommended: Set to 10-15% of total connections

---

### 2. Leaked Password Protection

**Current Status:** Disabled

**Recommendation:** Enable leaked password protection

**Why:** Supabase Auth can prevent users from using compromised passwords by checking against the HaveIBeenPwned.org database. This significantly enhances security by blocking passwords that have been exposed in data breaches.

**How to Configure:**
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Policies**
3. Find **Password Protection** settings
4. Enable **Check for leaked passwords**
5. Optionally configure custom error messages for users

---

## Security Fixes Applied

The following security issues have been automatically resolved through database migrations:

### ✅ Unused Indexes Removed
- Dropped 12 unused indexes to improve write performance and reduce storage overhead
- Indexes can be recreated if future queries require them

### ✅ Multiple Permissive Policies Consolidated
- Consolidated multiple RLS policies into single policies per action
- Maintains the same access control logic using OR conditions
- Affects `profiles` and `user_permissions` tables

### ✅ Function Search Path Fixed
- Fixed `has_permission()` and `set_created_by()` functions
- Set immutable search_path to prevent injection attacks
- Functions now use schema-qualified names for security

---

## Best Practices

1. **Regular Security Audits:** Review RLS policies and permissions quarterly
2. **Monitor Auth Logs:** Check for suspicious authentication attempts
3. **Update Dependencies:** Keep Supabase client libraries up to date
4. **Use Strong Passwords:** Enforce minimum password requirements
5. **Enable MFA:** Consider multi-factor authentication for sensitive operations
