// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DevOps Node API',
      version: '1.0.0',
      description: 'API documentation for your Node.js app',
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
  },
  apis: ['./routes/*.js', './app.js'], // adjust based on where your endpoints are
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
