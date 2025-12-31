-- =================================================================
-- FIX RESIDENT ROLES: Ensure all non-special accounts are residents.
-- This script corrects any users that were incorrectly assigned
-- roles like 'ROLE_ACCOUNTANT' instead of 'ROLE_RESIDENT'.
-- =================================================================

-- Update all users who are not the primary admin or accountant to be residents.
UPDATE users 
SET role = 'ROLE_RESIDENT' 
WHERE username NOT IN ('admin', 'ketoan');
