const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Auth API',
      version: '1.0.0',
      description: 'API for user registration, login, and JWT auth',
    },
    servers: [
      {
        url: 'https://devops-node-db.onrender.com',
        description: 'Render deployment',
      },
      {
        url: 'http://localhost:3000',
        description: 'Local development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./index.js', './routes/*.js'], // Make sure your Swagger annotations are in these files
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;

