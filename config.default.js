'use strict';

module.exports = {
  port: '8080',
  host: '0.0.0.0',

  // Secret is used by cookie-session and csurf.
  // Set it to something more secure.
  secret: 'your-secret-here',

  // Configuration for the gcloud-node and googleapis libraries
  gcloud: {
    // This is the id of the project you created in Google Cloud.
    // e.g. https://console.developers.google.com/project/<projectId>
    projectId: 'project-id-here',
    // Datastore Namespace
    namespace: ''
  },

  cralwer: {
    UA: ''
  }
};