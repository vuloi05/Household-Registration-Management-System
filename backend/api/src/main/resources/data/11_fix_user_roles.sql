-- =================================================================
-- FIX USER ROLES: Update ROLE_USER to ROLE_RESIDENT
-- This script fixes users that were created with ROLE_USER instead of ROLE_RESIDENT
-- =================================================================

-- Update all users with ROLE_USER to ROLE_RESIDENT
-- (except admin and accountant which should keep their roles)
UPDATE users 
SET role = 'ROLE_RESIDENT' 
WHERE role = 'ROLE_USER';

-- Verify the update
-- SELECT username, full_name, role FROM users WHERE role = 'ROLE_RESIDENT';

