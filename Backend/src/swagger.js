export const swaggerDocument = {
  openapi: "3.0.1",
  info: {
    title: "FindYourFood API",
    version: "1.0.0",
    description:
      "Vollständige API-Dokumentation für das FindYourFood System mit allen HTTP-Methoden",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Lokaler Entwicklungsserver",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          username: { type: "string", example: "testuser" },
          email: { type: "string", example: "test@example.com" },
        },
      },
      Preference: {
        type: "object",
        properties: {
          cuisine_type: { type: "string", example: "italian" },
        },
      },
      SearchResult: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: {
              type: "object",
              properties: {
                poi: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Restaurant Name" },
                    phone: { type: "string", example: "+43 1 123456" },
                    categories: { type: "array", items: { type: "string" } },
                  },
                },
                address: {
                  type: "object",
                  properties: {
                    freeformAddress: {
                      type: "string",
                      example: "Musterstraße 1, 1010 Wien",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/register": {
      post: {
        tags: ["Authentication"],
        summary: "Neuen Benutzer registrieren",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "email", "password"],
                properties: {
                  username: { type: "string", example: "testuser" },
                  email: {
                    type: "string",
                    format: "email",
                    example: "test@example.com",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    example: "sicheresPasswort123",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Benutzer erfolgreich erstellt",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Benutzer erstellt" },
                    token: { type: "string", example: "eyJhbGciOi..." },
                  },
                },
              },
            },
          },
          400: { description: "Fehlende oder ungültige Felder" },
          409: { description: "Benutzername bereits vergeben" },
          500: { description: "Interner Serverfehler" },
        },
      },
    },

    "/login": {
      post: {
        tags: ["Authentication"],
        summary: "Benutzer einloggen",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: { type: "string", example: "testuser" },
                  password: {
                    type: "string",
                    format: "password",
                    example: "sicheresPasswort123",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login erfolgreich",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Login erfolgreich" },
                    token: { type: "string", example: "eyJhbGciOi..." },
                  },
                },
              },
            },
          },
          401: {
            description: "Benutzer nicht gefunden oder falsches Passwort",
          },
          500: { description: "Interner Serverfehler" },
        },
      },
    },

    "/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Benutzer abmelden",
        security: [],
        responses: {
          200: {
            description: "Logout erfolgreich",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Logout erfolgreich" },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/me": {
      get: {
        tags: ["Authentication"],
        summary: "Login-Status prüfen",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Login-Status OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    loggedIn: { type: "boolean", example: true },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 1 },
                        name: { type: "string", example: "testuser" },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Kein Token übermittelt" },
          403: { description: "Token ungültig oder abgelaufen" },
        },
      },
    },

    "/api/users/me": {
      get: {
        tags: ["User Management"],
        summary: "Profil des aktuell eingeloggten Nutzers",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Erfolgreiche Rückgabe des Nutzerprofils",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized – Kein oder ungültiger Token" },
          404: { description: "User nicht gefunden" },
          500: { description: "Interner Serverfehler" },
        },
      },

      put: {
        tags: ["User Management"],
        summary: "Profil aktualisieren",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string", example: "neuerName" },
                  email: { type: "string", example: "neu@mail.com" },
                  password: {
                    type: "string",
                    example: "NeuesSicheresPasswort123",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Profil erfolgreich aktualisiert" },
          400: { description: "Fehlende oder ungültige Felder" },
          401: { description: "Unauthorized – Kein gültiger Token" },
          500: { description: "Interner Serverfehler" },
        },
      },

      delete: {
        tags: ["User Management"],
        summary: "Account des eingeloggten Nutzers löschen",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Account erfolgreich gelöscht",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Account gelöscht" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized – Kein oder ungültiger Token" },
          404: { description: "Benutzer nicht gefunden" },
          500: { description: "Fehler beim Löschen" },
        },
      },
    },

    "/search": {
      get: {
        tags: ["Restaurant Search"],
        summary: "TomTom POI-Suche für Restaurants",
        security: [],
        parameters: [
          {
            name: "query",
            in: "query",
            required: true,
            schema: { type: "string", example: "pizza" },
            description: "Suchbegriff für Restaurant oder Gericht",
          },
          {
            name: "city",
            in: "query",
            required: true,
            schema: { type: "string", example: "Wien" },
            description: "Stadt für die Suche",
          },
          {
            name: "category",
            in: "query",
            schema: { type: "string", example: "7315025" },
            description: "Kategorie-ID (optional)",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", example: 5 },
            description: "Anzahl der Ergebnisse",
          },
          {
            name: "openingHours",
            in: "query",
            schema: { type: "string", example: "any" },
            description: "Öffnungszeiten-Filter",
          },
        ],
        responses: {
          200: {
            description: "Erfolgreiche Suche",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SearchResult" },
              },
            },
          },
          500: { description: "TomTom API-Fehler oder fehlender API-Key" },
        },
      },
    },

    "/api/preferences": {
      get: {
        tags: ["Geschmacksprofil"],
        summary: "Präferenzen des Benutzers laden",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Präferenzen erfolgreich geladen",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    preferences: {
                      type: "array",
                      items: { type: "string", example: "italian" },
                      example: ["italian", "japanese", "mexican"],
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          500: { description: "Serverfehler" },
        },
      },

      post: {
        tags: ["Geschmacksprofil"],
        summary: "Neue Präferenz hinzufügen",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Preference" },
            },
          },
        },
        responses: {
          200: {
            description: "Präferenz erfolgreich hinzugefügt",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          500: { description: "Serverfehler" },
        },
      },

      put: {
        tags: ["Geschmacksprofil"],
        summary: "Alle Präferenzen aktualisieren",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  preferences: {
                    type: "array",
                    items: { type: "string" },
                    example: ["italian", "japanese", "mexican"],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Präferenzen erfolgreich gespeichert",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          500: { description: "Serverfehler" },
        },
      },

      delete: {
        tags: ["Geschmacksprofil"],
        summary: "Alle Präferenzen löschen",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Alle Präferenzen erfolgreich gelöscht",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          500: { description: "Serverfehler" },
        },
      },
    },

    "/api/preferences/{cuisine}": {
      delete: {
        tags: ["Geschmacksprofil"],
        summary: "Spezifische Präferenz entfernen",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "cuisine",
            in: "path",
            required: true,
            schema: { type: "string", example: "italian" },
            description: "Küchen-Typ zum Entfernen",
          },
        ],
        responses: {
          200: {
            description: "Präferenz erfolgreich entfernt",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          500: { description: "Serverfehler" },
        },
      },
    },

    "/api/preferences/export": {
      get: {
        tags: ["Geschmacksprofil"],
        summary: "Präferenzen als JSON-Datei exportieren",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Export erfolgreich",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { type: "string", example: "testuser" },
                    preferences: {
                      type: "array",
                      items: { type: "string" },
                      example: ["italian", "japanese"],
                    },
                    exportDate: {
                      type: "string",
                      format: "date-time",
                      example: "2025-01-01T12:00:00.000Z",
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          500: { description: "Serverfehler" },
        },
      },
    },
    "/api/recommendation": {
  get: {
    tags: ["Empfehlung"],
    summary: "Gibt eine Restaurant-Empfehlung basierend auf dem Geschmacksprofil zurück",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Empfehlung erfolgreich geladen",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean", example: true },
                cuisine: { type: "string", example: "chinese" },
                restaurant: {
                  type: "object",
                  properties: {
                    poi: {
                      type: "object",
                      properties: {
                        name: { type: "string", example: "Sichuan Wien" },
                        phone: { type: "string", example: "+43 1 6041742" },
                        categories: {
                          type: "array",
                          items: { type: "string" },
                          example: ["chinese", "restaurant"],
                        },
                      },
                    },
                    address: {
                      type: "object",
                      properties: {
                        freeformAddress: {
                          type: "string",
                          example: "Humboldtgasse 18, 1100 Wien",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized – Kein oder ungültiger Token" },
      404: { description: "Keine Präferenz gespeichert oder keine Empfehlung gefunden" },
      500: { description: "Serverfehler" },
    },
  },
},

  },
};
