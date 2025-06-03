export const swaggerDocument = {
    openapi: "3.0.0",
    info: {
        title: "FindYourFood API",
        version: "1.0.0",
        description: "API zur Restaurantsuche über TomTom"
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
                        description: "Suchbegriff (z. B. 'Pizza')"
                    },
                    {
                        name: "city",
                        in: "query",
                        required: false,
                        schema: { type: "string" },
                        description: "Stadt (z. B. Wien)"
                    },
                    {
                        name: "category",
                        in: "query",
                        required: false,
                        schema: { type: "string" },
                        description: "Kategorie-ID laut TomTom (z. B. 7315025)"
                    },
                    {
                        name: "limit",
                        in: "query",
                        required: false,
                        schema: { type: "integer", default: 5 },
                        description: "Anzahl der Ergebnisse"
                    },
                    {
                        name: "openingHours",
                        in: "query",
                        required: false,
                        schema: { type: "string", enum: ["any", "nextSevenDays"] },
                        description: "Filter für Öffnungszeiten"
                    }
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
                                                type: "object"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Ungültige Anfrage" },
                    500: { description: "Serverfehler" }
                }
            }
        }
    }
};
