export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "FindYourFood API",
    version: "1.0.0",
    description:
      "API zur Restaurantsuche über TomTom und Geschmacksprofil-Management",
  },
  paths: {
    "/search": {
      get: {
        summary: "Sucht nach Restaurants und POIs",
        parameters: [
          {
            name: "query",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Suchbegriff (z. B. 'Pizza')",
          },
          {
            name: "city",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Stadt (z. B. Wien)",
          },
          {
            name: "category",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Kategorie-ID laut TomTom (z. B. 7315025)",
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", default: 5 },
            description: "Anzahl der Ergebnisse",
          },
          {
            name: "openingHours",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["any", "nextSevenDays"] },
            description: "Filter für Öffnungszeiten",
          },
        ],
        responses: {
          200: {
            description: "Erfolgreiche Antwort mit POIs",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    results: {
                      type: "array",
                      items: {
                        type: "object",
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: "Ungültige Anfrage" },
          500: { description: "Serverfehler" },
        },
      },
    },
    "/session-check": {
      get: {
        summary: "Prüft den aktuellen Session-Status",
        description: "Gibt zurück ob User eingeloggt ist und User-Daten",
        responses: {
          200: {
            description: "Session-Status erfolgreich abgerufen",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    loggedIn: {
                      type: "boolean",
                      description: "Ob User eingeloggt ist",
                    },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "integer" },
                        name: { type: "string" },
                        username: { type: "string" },
                        email: { type: "string" },
                      },
                      nullable: true,
                    },
                    success: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/preferences": {
      get: {
        summary: "Lädt alle Präferenzen des angemeldeten Users",
        description: "Gibt alle Küchen-Präferenzen des Users zurück",
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: "Präferenzen erfolgreich geladen",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    preferences: {
                      type: "array",
                      items: {
                        type: "string",
                        enum: [
                          "italian",
                          "japanese",
                          "chinese",
                          "indian",
                          "mexican",
                          "thai",
                          "french",
                          "greek",
                          "korean",
                          "vietnamese",
                          "turkish",
                          "spanish",
                          "american",
                          "vegetarian",
                          "vegan",
                          "seafood",
                          "barbecue",
                          "fastfood",
                          "dessert",
                          "cafe",
                        ],
                      },
                    },
                    count: { type: "integer" },
                    user_id: { type: "integer" },
                  },
                },
              },
            },
          },
          401: {
            description: "Nicht autorisiert - Login erforderlich",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          500: {
            description: "Serverfehler",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Fügt eine neue Küchen-Präferenz hinzu",
        description: "Erstellt eine neue Präferenz für den angemeldeten User",
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  cuisine_type: {
                    type: "string",
                    enum: [
                      "italian",
                      "japanese",
                      "chinese",
                      "indian",
                      "mexican",
                      "thai",
                      "french",
                      "greek",
                      "korean",
                      "vietnamese",
                      "turkish",
                      "spanish",
                      "american",
                      "vegetarian",
                      "vegan",
                      "seafood",
                      "barbecue",
                      "fastfood",
                      "dessert",
                      "cafe",
                    ],
                    description: "Küchen-Typ der hinzugefügt werden soll",
                  },
                },
                required: ["cuisine_type"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Präferenz erfolgreich hinzugefügt",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    preference_id: { type: "integer" },
                    cuisine_type: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description:
              "Ungültige Anfrage - Fehlende oder ungültige cuisine_type",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    error: { type: "string" },
                    valid_cuisines: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                },
              },
            },
          },
          409: {
            description: "Konflikt - Präferenz bereits vorhanden",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
      put: {
        summary: "Ersetzt alle Präferenzen des Users",
        description: "Löscht alle bestehenden Präferenzen und setzt neue",
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  preferences: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: [
                        "italian",
                        "japanese",
                        "chinese",
                        "indian",
                        "mexican",
                        "thai",
                        "french",
                        "greek",
                        "korean",
                        "vietnamese",
                        "turkish",
                        "spanish",
                        "american",
                        "vegetarian",
                        "vegan",
                        "seafood",
                        "barbecue",
                        "fastfood",
                        "dessert",
                        "cafe",
                      ],
                    },
                    description: "Array aller gewünschten Küchen-Präferenzen",
                  },
                },
                required: ["preferences"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Präferenzen erfolgreich aktualisiert",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    preferences: {
                      type: "array",
                      items: { type: "string" },
                    },
                    count: { type: "integer" },
                  },
                },
              },
            },
          },
          400: {
            description: "Ungültige Anfrage - Fehlerhaftes preferences Array",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    error: { type: "string" },
                    invalid_cuisines: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
      delete: {
        summary: "Löscht alle Präferenzen des Users",
        description: "Entfernt alle Küchen-Präferenzen des angemeldeten Users",
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: "Alle Präferenzen erfolgreich gelöscht",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    deleted_count: { type: "integer" },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/preferences/{cuisine}": {
      delete: {
        summary: "Löscht eine spezifische Küchen-Präferenz",
        description:
          "Entfernt eine bestimmte Küchen-Präferenz des angemeldeten Users",
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            name: "cuisine",
            in: "path",
            required: true,
            schema: {
              type: "string",
              enum: [
                "italian",
                "japanese",
                "chinese",
                "indian",
                "mexican",
                "thai",
                "french",
                "greek",
                "korean",
                "vietnamese",
                "turkish",
                "spanish",
                "american",
                "vegetarian",
                "vegan",
                "seafood",
                "barbecue",
                "fastfood",
                "dessert",
                "cafe",
              ],
            },
            description: "Küchen-Typ der gelöscht werden soll",
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
                    success: { type: "boolean" },
                    message: { type: "string" },
                    deleted_cuisine: { type: "string" },
                    changes: { type: "integer" },
                  },
                },
              },
            },
          },
          400: {
            description: "Ungültige Anfrage - Fehlender cuisine Parameter",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          404: {
            description: "Präferenz nicht gefunden",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/preferences/export": {
      get: {
        summary: "Exportiert Präferenzen als JSON-Datei",
        description:
          "Erstellt eine JSON-Datei mit allen User-Präferenzen zum Download",
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: "Export-Datei erfolgreich erstellt",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { type: "string" },
                    preferences: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                        },
                      },
                    },
                    exportDate: { type: "string", format: "date-time" },
                    totalPreferences: { type: "integer" },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      sessionAuth: {
        type: "apiKey",
        in: "cookie",
        name: "connect.sid",
        description: "Session-basierte Authentifizierung über Express-Session",
      },
    },
    responses: {
      Unauthorized: {
        description: "Nicht autorisiert - Login erforderlich",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                error: { type: "string" },
              },
            },
          },
        },
      },
      ServerError: {
        description: "Interner Serverfehler",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                error: { type: "string" },
              },
            },
          },
        },
      },
    },
    schemas: {
      CuisineType: {
        type: "string",
        enum: [
          "italian",
          "japanese",
          "chinese",
          "indian",
          "mexican",
          "thai",
          "french",
          "greek",
          "korean",
          "vietnamese",
          "turkish",
          "spanish",
          "american",
          "vegetarian",
          "vegan",
          "seafood",
          "barbecue",
          "fastfood",
          "dessert",
          "cafe",
        ],
        description: "Verfügbare Küchen-Typen",
      },
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          error: { type: "string" },
        },
      },
      UserPreference: {
        type: "object",
        properties: {
          id: { type: "integer" },
          user_id: { type: "integer" },
          cuisine_type: { $ref: "#/components/schemas/CuisineType" },
          created_at: { type: "string", format: "date-time" },
        },
      },
    },
  },
};
