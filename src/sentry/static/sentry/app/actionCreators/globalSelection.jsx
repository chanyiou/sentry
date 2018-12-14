/*eslint no-use-before-define: ["error", { "functions": false }]*/
import {isEqual, isInteger} from 'lodash';

import {getParams} from 'app/views/organizationEvents/utils/getParams';
import {getUtcDateString} from 'app/utils/dates';
import GlobalSelectionActions from 'app/actions/globalSelectionActions';
import sdk from 'app/utils/sdk';

const isEqualWithEmptyArrays = (newQuery, current) => {
  // We will only get empty arrays from `newQuery`
  // Can't use isEqualWith because keys are unbalanced (guessing)
  return isEqual(
    Object.entries(newQuery)
      .filter(([, value]) => !Array.isArray(value) || !!value.length)
      .reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: value,
        }),
        {}
      ),
    current
  );
};

/**
 * Updates global project selection URL param if `router` is supplied
 * OTHERWISE fire action to update projects
 *
 * @param {Number[]} projects List of project ids
 * @param {Object} router Router object
 */
export function updateProjects(projects, router) {
  if (!isProjectsValid(projects)) {
    sdk.captureException(new Error('Invalid projects selected'), {
      extra: {projects},
    });
    return;
  }

  if (!router) {
    GlobalSelectionActions.updateProjects(projects);
  }
  updateParams({project: projects}, router);
}

function isProjectsValid(projects) {
  return Array.isArray(projects) && projects.every(project => isInteger(project));
}

/**
 * Updates global datetime selection URL param if `router` is supplied
 * OTHERWISE fire action to update projects
 *
 * @param {Object} datetime Object with start, end, range keys
 * @param {Object} router React router object
 */
export function updateDateTime(datetime, router) {
  if (!router) {
    GlobalSelectionActions.updateDateTime(datetime);
  }
  updateParams(datetime, router);
}

/**
 * Updates global environment selection URL param if `router` is supplied
 * OTHERWISE fire action to update projects
 *
 * @param {String[]} environments List of environments
 * @param {Object} router React router object
 */
export function updateEnvironments(environment, router) {
  if (!router) {
    GlobalSelectionActions.updateEnvironments(environment);
  }
  updateParams({environment}, router);
}

/**
 * Updates router/URL with new query params
 *
 * @param {Object} obj New query params
 * @param {Object} router React router object
 */
export function updateParams(obj, router) {
  // Allow another component to handle routing
  if (!router) {
    return;
  }

  const newQuery = getNewQueryParams(obj, router.location.query);

  // Only push new location if query params has changed because this will cause a heavy re-render
  if (isEqualWithEmptyArrays(newQuery, router.location.query)) {
    return;
  }

  router.push({
    pathname: router.location.pathname,
    query: newQuery,
  });
}

/**
 * Creates a new query parameter object given new params and old params
 * Preserves the old query params, except for `cursor`
 *
 * TODO(billy): Add option for other keys to reset
 *
 * @param {Object} obj New query params
 * @param {Object} oldQueryParams Old query params
 */
function getNewQueryParams(obj, oldQueryParams) {
  // Reset cursor when changing parameters
  // eslint-disable-next-line no-unused-vars
  const {cursor, statsPeriod, ...oldQuery} = oldQueryParams;

  const newQuery = getParams({
    ...oldQuery,
    period: !obj.start && !obj.end ? obj.period || statsPeriod : null,
    ...obj,
  });

  if (newQuery.start) {
    newQuery.start = getUtcDateString(newQuery.start);
  }

  if (newQuery.end) {
    newQuery.end = getUtcDateString(newQuery.end);
  }

  return newQuery;
}
