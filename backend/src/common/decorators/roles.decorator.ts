import { SetMetadata } from '@nestjs/common';
import { UserRole, Permission } from '../constants/roles.constant';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// Convenience decorators for common role combinations
export const RequireAdmin = () => Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN);
export const RequireSuperAdmin = () => Roles(UserRole.SUPER_ADMIN);
export const RequireLoanOfficer = () =>
  Roles(
    UserRole.LOAN_OFFICER,
    UserRole.RISK_ANALYST,
    UserRole.FINANCE_MANAGER,
    UserRole.COMPLIANCE_OFFICER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  );
export const RequireFinanceManager = () =>
  Roles(
    UserRole.FINANCE_MANAGER,
    UserRole.COMPLIANCE_OFFICER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  );
export const RequireComplianceOfficer = () =>
  Roles(UserRole.COMPLIANCE_OFFICER, UserRole.ADMIN, UserRole.SUPER_ADMIN);

// Convenience decorators for common permission combinations
export const RequireUserManagement = () =>
  Permissions(Permission.READ_USERS, Permission.UPDATE_USERS);
export const RequireLoanManagement = () =>
  Permissions(Permission.READ_LOANS, Permission.UPDATE_LOANS);
export const RequireLoanApproval = () =>
  Permissions(Permission.APPROVE_LOANS, Permission.REJECT_LOANS);
export const RequirePaymentManagement = () =>
  Permissions(Permission.READ_PAYMENTS, Permission.PROCESS_PAYMENTS);
export const RequireDocumentVerification = () =>
  Permissions(Permission.READ_DOCUMENTS, Permission.VERIFY_DOCUMENTS);
export const RequireSystemManagement = () =>
  Permissions(Permission.READ_SYSTEM_CONFIG, Permission.UPDATE_SYSTEM_CONFIG);
export const RequireReportsAccess = () =>
  Permissions(Permission.READ_REPORTS, Permission.EXPORT_REPORTS);
