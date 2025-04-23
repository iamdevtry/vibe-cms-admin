/**
 * Permissions system for Vibe CMS
 * 
 * This module implements a role-based access control (RBAC) system with granular permissions.
 * Each permission follows the format: [resource]:[action]
 * For example: "users:read", "content:create", etc.
 * 
 * The system supports wildcard permissions like "users:*" (all actions on users)
 * and even "*:*" (superadmin permissions for everything).
 */

/**
 * Define all possible resources in the system
 */
export type Resource = 
  | 'users'
  | 'roles'
  | 'media'
  | 'content'
  | 'taxonomy'
  | 'settings'
  | '*'; // wildcard for all resources

/**
 * Define all possible actions on resources
 */
export type Action = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'publish'
  | 'unpublish'
  | 'manage'
  | '*'; // wildcard for all actions

/**
 * Permission string follows format [resource]:[action]
 */
export type Permission = `${Resource}:${Action}`;

/**
 * Predefined role permissions for common roles in the system
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // Admin has access to everything
  admin: ['*:*'],
  
  // Editor can do most content operations but not administrative tasks
  editor: [
    'content:*',
    'media:*',
    'taxonomy:*',
    'users:read',
  ],
  
  // Author can manage their own content but needs approval for publishing
  author: [
    'content:create',
    'content:read',
    'content:update',
    'media:create',
    'media:read',
    'media:update',
    'taxonomy:read',
  ],
  
  // Default user with minimal permissions
  user: [
    'content:read',
    'media:read',
    'taxonomy:read',
  ],
};

/**
 * Check if a permission string matches a required permission
 * Handles wildcard matching, e.g., "users:*" matches "users:read"
 */
const permissionMatches = (userPermission: string, requiredPermission: string): boolean => {
  // Split into resource and action parts
  const [userResource, userAction] = userPermission.split(':');
  const [requiredResource, requiredAction] = requiredPermission.split(':');
  
  // Wildcard permission "*:*" grants access to everything
  if (userResource === '*' && userAction === '*') {
    return true;
  }
  
  // Check if resource matches (either exact match or wildcard)
  const resourceMatches = userResource === '*' || userResource === requiredResource;
  
  // Check if action matches (either exact match or wildcard)
  const actionMatches = userAction === '*' || userAction === requiredAction;
  
  // Both resource and action must match
  return resourceMatches && actionMatches;
};

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (
  userPermissions: string[],
  requiredPermission: Permission
): boolean => {
  // Check each permission to see if it matches the required permission
  return userPermissions.some(permission => 
    permissionMatches(permission, requiredPermission)
  );
};

/**
 * Check if a user has all of the specified permissions
 */
export const hasAllPermissions = (
  userPermissions: string[],
  requiredPermissions: Permission[]
): boolean => {
  return requiredPermissions.every(permission => 
    hasPermission(userPermissions, permission)
  );
};

/**
 * Check if a user has any of the specified permissions
 */
export const hasAnyPermission = (
  userPermissions: string[],
  requiredPermissions: Permission[]
): boolean => {
  return requiredPermissions.some(permission => 
    hasPermission(userPermissions, permission)
  );
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role: string): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Calculate effective permissions for a user based on their role and additional permissions
 */
export const calculateEffectivePermissions = (
  role: string,
  additionalPermissions: Permission[] = []
): Permission[] => {
  const rolePermissions = getRolePermissions(role);
  
  // Combine role permissions with additional permissions
  const combinedPermissions = [...rolePermissions, ...additionalPermissions];
  
  // Remove duplicates
  return Array.from(new Set(combinedPermissions));
};
