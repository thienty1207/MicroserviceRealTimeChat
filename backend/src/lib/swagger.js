import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RealTimeChat Express API',
      version: '1.0.0',
      description: 'Express backend API for RealTimeChat application',
      contact: {
        name: 'API Support',
        url: 'http://www.swagger.io/support',
        email: 'support@swagger.io',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'jwt',
          description: 'JWT token stored in HTTP-only cookie'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', example: 'john@example.com' },
            fullName: { type: 'string', example: 'John Doe' },
            profilePic: { type: 'string', example: 'https://avatar.iran.liara.run/public/1.png' },
            isOnboarded: { type: 'boolean', example: true },
            bio: { type: 'string', example: 'Learning languages through conversation' },
            nativeLanguage: { type: 'string', example: 'English' },
            learningLanguage: { type: 'string', example: 'Vietnamese' },
            location: { type: 'string', example: 'New York, USA' },
            friends: { type: 'array', items: { type: 'string' } },
          }
        },
        FriendRequest: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            sender: { $ref: '#/components/schemas/User' },
            recipient: { $ref: '#/components/schemas/User' },
            status: { type: 'string', enum: ['pending', 'accepted', 'rejected'], example: 'pending' },
            createdAt: { type: 'string', format: 'date-time' },
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Something went wrong' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // paths to files containing OpenAPI definitions
};

export const specs = swaggerJsdoc(options);
export { swaggerUi };