# Conceptual RBAC (Role-Based Access Control) Service

# 1. Define Roles (derived from User.profile_type)
# These roles are based on the `profile_type` in the User model.
ROLES = {
    "FREELANCE": "freelance",
    "ACCOUNTANT": "accountant",
    "SME": "sme",  # Small and Medium-sized Enterprise
    "LARGE_ENTERPRISE": "large_enterprise",
    "ADMIN": "admin" # It's often good to have a super-user role
}

# 2. Define Basic Permissions (Conceptual)
PERMISSIONS = {
    "CREATE_INVOICE": "create_invoice",
    "VIEW_OWN_INVOICES": "view_own_invoices",
    "VIEW_ALL_INVOICES": "view_all_invoices", # For accountants or managers within an enterprise
    "MANAGE_ALL_INVOICES": "manage_all_invoices", # e.g., edit, delete invoices of others
    "APPROVE_INVOICES": "approve_invoices", # For multi-step approval workflows
    "MANAGE_CLIENTS": "manage_clients",
    "VIEW_REPORTS": "view_reports",
    "VIEW_OWN_REPORTS": "view_own_reports",
    "MANAGE_TEAM_MEMBERS": "manage_team_members", # For SME/Large Enterprise roles to manage their users
    "MANAGE_ALL_USERS": "manage_all_users", # For Admin roles
    "VIEW_DASHBOARD_FREELANCE": "view_dashboard_freelance",
    "VIEW_DASHBOARD_ACCOUNTANT": "view_dashboard_accountant",
    "VIEW_DASHBOARD_SME": "view_dashboard_sme",
    "VIEW_DASHBOARD_LARGE_ENTERPRISE": "view_dashboard_large_enterprise",
    "ACCESS_SETTINGS": "access_settings", # General settings access
    "MANAGE_BILLING": "manage_billing" # Subscription, payment methods etc.
}

# 3. Map Roles to Permissions
# This dictionary defines which permissions are granted to each role.
# More granular permissions can be added later.
ROLE_PERMISSIONS = {
    ROLES["FREELANCE"]: [
        PERMISSIONS["CREATE_INVOICE"],
        PERMISSIONS["VIEW_OWN_INVOICES"],
        PERMISSIONS["MANAGE_CLIENTS"],
        PERMISSIONS["VIEW_DASHBOARD_FREELANCE"],
        PERMISSIONS["VIEW_OWN_REPORTS"],
        PERMISSIONS["ACCESS_SETTINGS"],
    ],
    ROLES["ACCOUNTANT"]: [
        PERMISSIONS["VIEW_ALL_INVOICES"],
        PERMISSIONS["MANAGE_ALL_INVOICES"],
        PERMISSIONS["APPROVE_INVOICES"],
        PERMISSIONS["MANAGE_CLIENTS"], # Accountants might manage clients on behalf of others
        PERMISSIONS["VIEW_REPORTS"],
        PERMISSIONS["VIEW_DASHBOARD_ACCOUNTANT"],
        PERMISSIONS["ACCESS_SETTINGS"],
        PERMISSIONS["MANAGE_ALL_USERS"], # Accountants might manage users for their clients
    ],
    ROLES["SME"]: [
        PERMISSIONS["CREATE_INVOICE"],
        PERMISSIONS["VIEW_OWN_INVOICES"], # Or view all invoices for their SME
        PERMISSIONS["VIEW_ALL_INVOICES"], # If they have sub-users or departments
        PERMISSIONS["APPROVE_INVOICES"],
        PERMISSIONS["MANAGE_CLIENTS"],
        PERMISSIONS["VIEW_REPORTS"],
        PERMISSIONS["MANAGE_TEAM_MEMBERS"],
        PERMISSIONS["VIEW_DASHBOARD_SME"],
        PERMISSIONS["ACCESS_SETTINGS"],
        PERMISSIONS["MANAGE_BILLING"],
    ],
    ROLES["LARGE_ENTERPRISE"]: [
        PERMISSIONS["CREATE_INVOICE"], # Potentially with more complex workflows
        PERMISSIONS["VIEW_ALL_INVOICES"],
        PERMISSIONS["APPROVE_INVOICES"], # Multi-level approvals might be needed
        PERMISSIONS["MANAGE_CLIENTS"],
        PERMISSIONS["VIEW_REPORTS"],
        PERMISSIONS["MANAGE_TEAM_MEMBERS"],
        PERMISSIONS["VIEW_DASHBOARD_LARGE_ENTERPRISE"],
        PERMISSIONS["ACCESS_SETTINGS"],
        PERMISSIONS["MANAGE_BILLING"],
    ],
    ROLES["ADMIN"]: [
        # Admin gets all permissions (or a superset)
        *PERMISSIONS.values() # Unpack all defined permissions
    ]
}

# 4. Conceptual RBAC Check Function
def check_permission(user_role, required_permission):
    """
    Checks if a user with a given role has the required permission.

    Args:
        user_role (str): The role of the user (e.g., "freelance", "admin").
                         Should match one of the keys in ROLES.
        required_permission (str): The permission to check for (e.g., "create_invoice").
                                   Should match one of the keys in PERMISSIONS.

    Returns:
        bool: True if the user has the permission, False otherwise.
    """
    if user_role not in ROLE_PERMISSIONS:
        print(f"Warning: Role '{user_role}' not recognized.")
        return False
    if required_permission not in PERMISSIONS.values():
        print(f"Warning: Permission '{required_permission}' not recognized.")
        return False

    allowed_permissions = ROLE_PERMISSIONS.get(user_role, [])
    return required_permission in allowed_permissions

# --- Example Usage (Conceptual) ---
# if __name__ == "__main__":
#     # Example: Get user from session/token, which includes their role
#     current_user_role_from_auth = ROLES["FREELANCE"]
#     current_user_role_accountant = ROLES["ACCOUNTANT"]
#     current_user_role_admin = ROLES["ADMIN"]

#     # Check if a freelance user can create an invoice
#     can_create = check_permission(current_user_role_from_auth, PERMISSIONS["CREATE_INVOICE"])
#     print(f"Freelancer can create_invoice: {can_create}") # Expected: True

#     # Check if a freelance user can manage all users
#     can_manage_users = check_permission(current_user_role_from_auth, PERMISSIONS["MANAGE_ALL_USERS"])
#     print(f"Freelancer can manage_all_users: {can_manage_users}") # Expected: False

#     # Check if an accountant can manage all invoices
#     accountant_can_manage_invoices = check_permission(current_user_role_accountant, PERMISSIONS["MANAGE_ALL_INVOICES"])
#     print(f"Accountant can manage_all_invoices: {accountant_can_manage_invoices}") # Expected: True

#     # Check if an admin can do anything (e.g., manage billing)
#     admin_can_manage_billing = check_permission(current_user_role_admin, PERMISSIONS["MANAGE_BILLING"])
#     print(f"Admin can manage_billing: {admin_can_manage_billing}") # Expected: True

#     # Check a non-existent permission for an admin
#     admin_can_do_non_existent = check_permission(current_user_role_admin, "do_something_random")
#     print(f"Admin can do_something_random: {admin_can_do_non_existent}") # Expected: False (with warning)

#     # Check a non-existent role
#     unknown_role_check = check_permission("random_user", PERMISSIONS["CREATE_INVOICE"])
#     print(f"Unknown role can create_invoice: {unknown_role_check}") # Expected: False (with warning)
