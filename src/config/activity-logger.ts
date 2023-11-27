import logger from './logger';

const type = 'ActivityLog';

function getUserLogFormat(user: any) {
  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role
  };
}

function activityMessageFormat(
  user: any,
  resourceName: string,
  action: string
): string {
  return `${user.first_name} ${user.last_name} ${action} ${resourceName} successfully`;
}

function log(user: any, resource: any, resourceName: string, action: string) {
  const activityMessage = activityMessageFormat(user, resourceName, action);
  logger.info(
    { type, currentUser: getUserLogFormat(user), [resourceName]: resource },
    activityMessage
  );
}

const activityLogger = {
  log
};

export default activityLogger;
