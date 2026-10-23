import type { AdminDeviceParam, AdminExtendInput, AdminIdParam, AdminMessageInput, AdminNodeAvailability } from '@gnomevpn/schemas';

export type ExtendAdminUserInput = AdminExtendInput & AdminIdParam;

export type MessageAdminUserInput = AdminMessageInput & AdminIdParam;

export type RemoveAdminDeviceInput = AdminDeviceParam;

export type SetAdminNodeAvailabilityInput = AdminNodeAvailability & AdminIdParam;
