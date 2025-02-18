# Peggit: Reddit Configuration Management Platform

## 🚀 Project Overview

Peggit

## 🛠 Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- OpenAI API Key (optional, for AI features)
- Vercel Account (for deployment)

## 🔧 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/gilneto8/peggit.git
cd peggit
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# OpenAI API Key (Optional)
OPENAI_API_KEY=your_openai_api_key

# Postgres Database Connection (Required)
POSTGRES_URL=your_postgres_connection_string

# Authentication Secrets
ENCRYPTION_KEY=your_encryption_key
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deployment on Vercel

### Automatic Deployment

1. Fork the repository
2. Connect your GitHub account to Vercel
3. Import the project to Vercel
4. Set environment variables in Vercel project settings

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

## 🔑 Key Configuration Components

### AI Connector

The AI Connector provides a flexible, extensible interface for AI interactions:

```typescript
import { aiConnector } from '@/lib/ai';

// Basic JSON prompt
const response = await aiConnector.promptForJSON('Generate configuration insights');
```

#### Key Features

- Multiple provider support
- Consistent JSON response format
- Configurable AI parameters
- Built-in response validation

### Authentication Flow

Implemented using NextAuth with custom providers:

```typescript
// src/app/api/auth/route.ts
export const { GET, POST } = AuthRoutes({
  providers: [
    RedditProvider({ ... }),
    CredentialsProvider({ ... })
  ]
});
```

## 📦 Project Structure

```
peggit/
├── src/
│   ├── app/             # Next.js app router
│   ├── components/      # React components
│   ├── lib/             # Utility libraries
│   │   └── ai/          # AI interaction modules
│   ├── types/           # TypeScript type definitions
│   └── styles/          # Global styles
├── prisma/              # Database schema
└── tailwind.config.ts   # Tailwind CSS configuration
```

## 🧪 Testing

```bash
# Run tests
npm test
# or
yarn test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

[MIT License](LICENSE)

## 🛡️ Security

- Never commit sensitive information
- Use environment variables
- Regularly update dependencies

## 💡 Troubleshooting

- Ensure all environment variables are set
- Check Node.js and npm versions
- Verify database connection
- Clear browser cache if experiencing issues

## 🚨 Known Limitations

- Requires active OpenAI API subscription for AI features
- Limited to Reddit API constraints
- Performance may vary based on configuration complexity

## 📞 Support

For issues or questions, please [open an issue](https://github.com/yourusername/peggit/issues) on GitHub.
