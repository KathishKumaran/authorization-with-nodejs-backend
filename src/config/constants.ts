import * as dotenv from 'dotenv';
dotenv.config();

export const MODEL = [
  'User',
  'UserGroup',
  'Group',
  'FormsAndFlow',
  'SubmittedForm',
  'AssignedTOSubmittedForm'
];

export const REALM = 'myrealm';

export const Q_MINIMUM_SIZE = 3;

export const RESET_PASSWORD_LINK_EXPIRES_IN = '1h';

export const NOTIFICATION_LIMIT = 5;

export const WORKFLOW_RESTART_TIMEOUT = 1000;

export const ROLES = {
  user: 'User',
  admin: 'Admin'
};

export const TOKEN_TYPE = {
  INVITE_USER: 'invite_user',
  RESET_PASSWORD: 'reset_password'
};

export const HTTP_CONTENT_TYPES = {
  json: 'application/json',
  urlencoded: 'application/x-www-form-urlencoded'
};
export const KEYCLOAK_APIS = {
  users: `${process.env.KC_BASE_URL}/admin/realms/${process.env.KC_REALM}/users`,
  login: `${process.env.KC_BASE_URL}/realms/${process.env.KC_REALM}/protocol/openid-connect/token`,
  logout: `${process.env.KC_BASE_URL}/realms/${process.env.KC_REALM}/protocol/openid-connect/logout`,
  validateToken: `${process.env.KC_BASE_URL}/realms/${process.env.KC_REALM}/protocol/openid-connect/userinfo`
};

export const STRATEGY = {
  reset_password: 'reset-password-auth',
  accept_invitation: 'accept-invitation-jwt'
};

export const WORKFLOW_APIS = {
  start: 'api/workflow',
  restart: 'restart'
};

export const TASK_APIS = {
  update: 'api/tasks'
};

export const FILE_TYPE = {
  PDF: 'pdf',
  XLS: 'xls',
  PNG: 'png',
  DOC: 'doc',
  DOCX: 'docx',
  XLSX: 'xlsx',
  EXCEL: 'excel',
  SPREAD_SHEETML: 'spreadsheetml'
};

export const ASSET_DIRECTORY_NAME = 'asset';
export const SSE_EVENTS = {
  task_updated: 'task_updated',
  notifications: 'notifications',
  task_completed: 'task_completed',
  task_reassigned: 'task_reassigned',
  notificationsUpdated: 'notifications_updated',
  workflow_notification: 'workflow_notification'
};

export const TASK_STATUS = {
  schedule: 'SCHEDULED',
  inprogress: 'IN_PROGRESS',
  complete: 'COMPLETED'
};

export const NOTIFICATION_CHANNEL = 'workflow-events';

export const SSE_LIVE_EVENTS = [
  'task_updated',
  'notifications',
  'task_completed',
  'notifications_updated'
];

export const PO_BULK_UPLOAD_HEADERS = [
  'Purchase order',
  'Item',
  'Organization code',
  'Name of Supplier',
  'Category',
  'Date',
  'Material',
  'Description',
  'Plant',
  'Storage location',
  'Order Quantity',
  'Order Unit'
];

export const WORKFLOW_STATUS = {
  completed: 'COMPLETED',
  running: 'RUNNING'
};

export const PURCHASE_ORDER_STATUS = {
  open: 'OPEN',
  inprogress: 'IN PROGRESS',
  closed: 'CLOSED'
};

export const WORKER_TYPE = {
  general: 'GENERAL',
  rework: 'REWORK'
};
