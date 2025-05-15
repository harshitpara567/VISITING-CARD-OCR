// path: src/api/lead/content-types/lead/permissions.js

module.exports = {
    lead: {
      controllers: {
        'custom-lead': {
          actions: {
            findByUserId: { enabled: true, policy: [] },
            login: { enabled: true, policy: [] },
            analyzeCardAndSave: { enabled: true, policy: [] },
            markFavorite: { enabled: true, policy: [] },
            findMyCards: { enabled: true, policy: [] },
          },
        },
      },
    },
  };
  