let _addBreadcrumb = () => {};
let _captureException = () => {};
let _captureMessage = () => {};
let _showReportDialog = () => {};
let _lastEventId = () => {};

function setContextInScope(context) {
  window.Sentry.configureScope(scope => {
    if (context.user) {
      scope.setUser(context.user);
    }
    if (context.tags) {
      Object.keys(context.tags).forEach(key => {
        scope.setTag(key, context.tags[key]);
      });
    }
    if (context.extra) {
      Object.keys(context.extra).forEach(key => {
        scope.setExtra(key, context.extra[key]);
      });
    }

    if (context.fingerprint) {
      scope.setFingerprint(context.fingerprint);
    }
  });
}

if (window.Sentry) {
  window.Sentry.onLoad(function() {
    _addBreadcrumb = window.Sentry.addBreadcrumb;
    _captureMessage = (...args) => {
      window.Sentry.getDefaultHub().pushScope();
      if (args[1]) {
        setContextInScope(args[1]);
      }
      if (args[0]) {
        window.Sentry.captureMessage(args[0]);
      }
      window.Sentry.getDefaultHub().popScope();
    };
    _captureException = (...args) => {
      window.Sentry.getDefaultHub().pushScope();
      if (args[1]) {
        setContextInScope(args[1]);
      }
      if (args[0]) {
        window.Sentry.captureException(args[0]);
      }
      window.Sentry.getDefaultHub().popScope();
    };
    _showReportDialog = () => {
      window.Sentry.showReportDialog();
    };
    _lastEventId = () => {
      window.Sentry.lastEventId();
    };
  });
} else {
  _addBreadcrumb = window.Raven.captureBreadcrumb.bind(window.Raven);
  _captureException = window.Raven.captureException.bind(window.Raven);
  _captureMessage = window.Raven.captureMessage.bind(window.Raven);
  _showReportDialog = window.Raven.showReportDialog.bind(window.Raven);
  _lastEventId = window.Raven.lastEventId.bind(window.Raven);
}

export default {
  captureBreadcrumb: (...args) => {
    return _addBreadcrumb(...args);
  },
  addBreadcrumb: (...args) => {
    return _addBreadcrumb(...args);
  },
  captureMessage: (...args) => {
    return _captureMessage(...args);
  },
  captureException: (...args) => {
    return _captureException(...args);
  },
  showReportDialog: (...args) => {
    return _showReportDialog(...args);
  },
  lastEventId: (...args) => {
    return _lastEventId(...args);
  },
};
