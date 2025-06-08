export const swaggerDocument = {
  openapi: '3.0.1',
  info: {
    title: 'FindYourFood API',
    version: '1.0.0',
    description: 'API-Dokumentation für das FindYourFood System'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Lokaler Entwicklungsserver'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/register': {
      post: {
        tags: ['Auth'],
        summary: 'Neuen Benutzer registrieren',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                  username: { type: 'string', example: 'maxmustermann' },
                  email:    { type: 'string', format: 'email', example: 'max@mustermann.de' },
                  password: { type: 'string', format: 'password', example: 'sicheresPasswort123' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Benutzer erfolgreich erstellt' },
          '400': { description: 'Fehlende oder ungültige Felder' },
          '409': { description: 'Benutzername oder E-Mail bereits vergeben' },
          '500': { description: 'Interner Serverfehler' }
        }
      }
    },

    '/login': {
      post: {
        tags: ['Auth'],
        summary: 'Benutzer einloggen',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', example: 'maxmustermann' },
                  password: { type: 'string', format: 'password', example: 'sicheresPasswort123' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login erfolgreich',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Login erfolgreich' },
                    token:   { type: 'string', example: 'eyJhbGciOi...' }
                  }
                }
              }
            }
          },
          '401': { description: 'Benutzer nicht gefunden oder falsches Passwort' },
          '500': { description: 'Interner Serverfehler' }
        }
      }
    },

    '/me': {
      get: {
        tags: ['Auth'],
        summary: 'Login-Status prüfen',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Login-Status OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    loggedIn: { type: 'boolean', example: true },
                    user: {
                      type: 'object',
                      properties: {
                        id:   { type: 'integer', example: 1 },
                        name: { type: 'string',  example: 'maxmustermann' }
                      }
                    }
                  }
                }
              }
            }
          },
          '401': { description: 'Kein Token übermittelt' },
          '403': { description: 'Token ungültig oder abgelaufen' }
        }
      }
    },

    '/api/users/me': {
      get: {
        tags: ['User'],
        summary: 'Profil des aktuell eingeloggten Nutzers',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Erfolgreiche Rückgabe des Nutzerprofils',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      type: 'object',
                      properties: {
                        id:       { type: 'integer', example: 1 },
                        username: { type: 'string',  example: 'maxmustermann' },
                        email:    { type: 'string',  example: 'max@mustermann.de' }
                      }
                    }
                  }
                }
              }
            }
          },
          '401': { description: 'Unauthorized – Kein oder ungültiger Token' },
          '403': { description: 'Forbidden – Token ungültig oder abgelaufen' },
          '404': { description: 'User nicht gefunden' },
          '500': { description: 'Interner Serverfehler' }
        }
      },

      put: {
        tags: ['User'],
        summary: 'Profil aktualisieren (Benutzername, E-Mail, Passwort)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string', example: 'neuerName' },
                  email:    { type: 'string', example: 'neu@mail.com' },
                  password: { type: 'string', example: 'NeuesSicheresPasswort123' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Profil erfolgreich aktualisiert' },
          '400': { description: 'Fehlende oder ungültige Felder' },
          '401': { description: 'Unauthorized – Kein gültiger Token' },
          '403': { description: 'Forbidden – Token ungültig oder abgelaufen' },
          '500': { description: 'Interner Serverfehler' }
        }
      },

      delete: {
        tags: ['User'],
        summary: 'Account des eingeloggten Nutzers löschen',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Account erfolgreich gelöscht',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Account gelöscht' }
                  }
                }
              }
            }
          },
          '401': { description: 'Unauthorized – Kein oder ungültiger Token' },
          '404': { description: 'Benutzer nicht gefunden' },
          '500': { description: 'Fehler beim Löschen' }
        }
      }
    },

    '/search': {
      get: {
        tags: ['Suche'],
        summary: 'TomTom POI-Suche',
        parameters: [
          { name: 'query', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'city',  in: 'query', required: true, schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', example: 5 } },
          { name: 'openingHours', in: 'query', schema: { type: 'string', example: 'any' } }
        ],
        responses: {
          '200': {
            description: 'Erfolgreiche Suche',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  description: 'Suchergebnisse von TomTom'
                }
              }
            }
          },
          '500': { description: 'TomTom API-Fehler' }
        }
      }
    }
  }
};
