export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  LOAN_OFFICER = 'LOAN_OFFICER',
  RISK_ANALYST = 'RISK_ANALYST',
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
  FINANCE_MANAGER = 'FINANCE_MANAGER',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
}

export enum Permission {
  // User Management
  READ_USERS = 'read:users',
  CREATE_USERS = 'create:users',
  UPDATE_USERS = 'update:users',
  DELETE_USERS = 'delete:users',

  // Loan Management
  READ_LOANS = 'read:loans',
  CREATE_LOANS = 'create:loans',
  UPDATE_LOANS = 'update:loans',
  DELETE_LOANS = 'delete:loans',
  APPROVE_LOANS = 'approve:loans',
  REJECT_LOANS = 'reject:loans',

  // Payment Management
  READ_PAYMENTS = 'read:payments',
  CREATE_PAYMENTS = 'create:payments',
  UPDATE_PAYMENTS = 'update:payments',
  DELETE_PAYMENTS = 'delete:payments',
  PROCESS_PAYMENTS = 'process:payments',

  // Virtual Account Management
  READ_VIRTUAL_ACCOUNTS = 'read:virtual_accounts',
  UPDATE_VIRTUAL_ACCOUNTS = 'update:virtual_accounts',
  MANAGE_BALANCES = 'manage:balances',

  // Document Management
  READ_DOCUMENTS = 'read:documents',
  UPLOAD_DOCUMENTS = 'upload:documents',
  UPDATE_DOCUMENTS = 'update:documents',
  DELETE_DOCUMENTS = 'delete:documents',
  VERIFY_DOCUMENTS = 'verify:documents',

  // System Management
  READ_SYSTEM_CONFIG = 'read:system_config',
  UPDATE_SYSTEM_CONFIG = 'update:system_config',
  MANAGE_ADMINS = 'manage:admins',

  // Reports & Analytics
  READ_REPORTS = 'read:reports',
  EXPORT_REPORTS = 'export:reports',
  VIEW_ANALYTICS = 'view:analytics',

  // Notifications
  READ_NOTIFICATIONS = 'read:notifications',
  SEND_NOTIFICATIONS = 'send:notifications',
  MANAGE_NOTIFICATIONS = 'manage:notifications',
}

// Define base permissions for each role
const USER_PERMISSIONS = [
  Permission.READ_USERS, // Own profile
  Permission.UPDATE_USERS, // Own profile
  Permission.CREATE_LOANS, // Apply for loans
  Permission.READ_LOANS, // Own loans
  Permission.READ_PAYMENTS, // Own payments
  Permission.CREATE_PAYMENTS, // Make payments
  Permission.READ_VIRTUAL_ACCOUNTS, // Own account
  Permission.UPLOAD_DOCUMENTS, // Own documents
  Permission.READ_DOCUMENTS, // Own documents
  Permission.READ_NOTIFICATIONS, // Own notifications
];

const LOAN_OFFICER_PERMISSIONS = [
  ...USER_PERMISSIONS,
  Permission.READ_USERS, // All users
  Permission.APPROVE_LOANS,
  Permission.REJECT_LOANS,
  Permission.READ_DOCUMENTS, // All documents
  Permission.VERIFY_DOCUMENTS,
  Permission.READ_REPORTS,
  Permission.SEND_NOTIFICATIONS,
];

const RISK_ANALYST_PERMISSIONS = [
  ...LOAN_OFFICER_PERMISSIONS,
  Permission.READ_LOANS, // All loans
  Permission.UPDATE_LOANS, // Risk assessment
  Permission.VIEW_ANALYTICS,
  Permission.EXPORT_REPORTS,
];

const CUSTOMER_SERVICE_PERMISSIONS = [
  ...USER_PERMISSIONS,
  Permission.READ_USERS, // All users
  Permission.UPDATE_USERS, // Limited updates
  Permission.READ_LOANS, // All loans
  Permission.READ_PAYMENTS, // All payments
  Permission.READ_DOCUMENTS, // All documents
  Permission.SEND_NOTIFICATIONS,
  Permission.READ_REPORTS,
];

const FINANCE_MANAGER_PERMISSIONS = [
  ...RISK_ANALYST_PERMISSIONS,
  Permission.MANAGE_BALANCES,
  Permission.PROCESS_PAYMENTS,
  Permission.UPDATE_VIRTUAL_ACCOUNTS,
  Permission.READ_SYSTEM_CONFIG,
  Permission.UPDATE_SYSTEM_CONFIG,
];

const COMPLIANCE_OFFICER_PERMISSIONS = [
  ...FINANCE_MANAGER_PERMISSIONS,
  Permission.DELETE_USERS, // Account termination
  Permission.DELETE_LOANS, // Compliance removal
  Permission.MANAGE_NOTIFICATIONS,
];

const ADMIN_PERMISSIONS = [
  ...COMPLIANCE_OFFICER_PERMISSIONS,
  Permission.MANAGE_ADMINS,
  Permission.DELETE_PAYMENTS,
  Permission.DELETE_DOCUMENTS,
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.USER]: USER_PERMISSIONS,
  [UserRole.LOAN_OFFICER]: LOAN_OFFICER_PERMISSIONS,
  [UserRole.RISK_ANALYST]: RISK_ANALYST_PERMISSIONS,
  [UserRole.CUSTOMER_SERVICE]: CUSTOMER_SERVICE_PERMISSIONS,
  [UserRole.FINANCE_MANAGER]: FINANCE_MANAGER_PERMISSIONS,
  [UserRole.COMPLIANCE_OFFICER]: COMPLIANCE_OFFICER_PERMISSIONS,
  [UserRole.ADMIN]: ADMIN_PERMISSIONS,
  [UserRole.SUPER_ADMIN]: Object.values(Permission), // All permissions
};

export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  [UserRole.USER]: [],
  [UserRole.LOAN_OFFICER]: [UserRole.USER],
  [UserRole.RISK_ANALYST]: [UserRole.LOAN_OFFICER, UserRole.USER],
  [UserRole.CUSTOMER_SERVICE]: [UserRole.USER],
  [UserRole.FINANCE_MANAGER]: [
    UserRole.RISK_ANALYST,
    UserRole.LOAN_OFFICER,
    UserRole.USER,
  ],
  [UserRole.COMPLIANCE_OFFICER]: [
    UserRole.FINANCE_MANAGER,
    UserRole.RISK_ANALYST,
    UserRole.LOAN_OFFICER,
    UserRole.USER,
  ],
  [UserRole.ADMIN]: [
    UserRole.COMPLIANCE_OFFICER,
    UserRole.FINANCE_MANAGER,
    UserRole.RISK_ANALYST,
    UserRole.LOAN_OFFICER,
    UserRole.CUSTOMER_SERVICE,
    UserRole.USER,
  ],
  [UserRole.SUPER_ADMIN]: [
    UserRole.ADMIN,
    UserRole.COMPLIANCE_OFFICER,
    UserRole.FINANCE_MANAGER,
    UserRole.RISK_ANALYST,
    UserRole.LOAN_OFFICER,
    UserRole.CUSTOMER_SERVICE,
    UserRole.USER,
  ],
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.USER]:
    'Regular user with basic loan application and account management capabilities',
  [UserRole.LOAN_OFFICER]: 'Can approve/reject loans and verify user documents',
  [UserRole.RISK_ANALYST]: 'Analyzes loan risks and provides recommendations',
  [UserRole.CUSTOMER_SERVICE]:
    'Provides customer support and handles user inquiries',
  [UserRole.FINANCE_MANAGER]:
    'Manages financial operations and system configurations',
  [UserRole.COMPLIANCE_OFFICER]:
    'Ensures regulatory compliance and handles sensitive operations',
  [UserRole.ADMIN]:
    'Full system administration with user and content management',
  [UserRole.SUPER_ADMIN]: 'Complete system control with all permissions',
};
