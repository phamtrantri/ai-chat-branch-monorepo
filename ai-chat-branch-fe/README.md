# AI Chat Branch Frontend

A Next.js frontend application for the AI chat system, built with HeroUI components and TypeScript.

## Features

- Next.js 15 with Pages Router
- HeroUI v2 component library
- TypeScript for type safety
- Tailwind CSS for styling
- Framer Motion for animations
- Dark/Light theme support
- Real-time chat interface
- Streaming message responses
- Conversation management

## Prerequisites

- Node.js 22+ 
- pnpm (recommended package manager)
- Backend API running (see [main README](../README.md) for full setup)

## Quick Start

> **Note**: This frontend is designed to run as part of the full-stack application. For the complete Docker setup with backend and database, see the [main README](../README.md) in the root directory.

### Local Development (Standalone)

1. **Navigate to the frontend directory:**
   ```bash
   cd ai-chat-branch-fe
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   # Create .env.local file
   echo "NEXT_PUBLIC_API_URL=http://localhost:8001" > .env.local
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

5. **Open your browser:**
   Navigate to http://localhost:3001

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| NEXT_PUBLIC_API_URL | http://localhost:8001 | Backend API URL |
| NODE_ENV | development/production | Node environment |
| PORT | 3001 | Application port |

## API Integration

The frontend communicates with the backend through these endpoints:
- `POST /conversations/v1/create` - Create new conversation
- `POST /conversations/v1/getAll` - Get all conversations
- `POST /conversations/v1/getDetails` - Get conversation details
- `POST /messages/v1/create` - Create new message with streaming

The API URL is configurable via the `NEXT_PUBLIC_API_URL` environment variable.

## Development

### Local Development (without Docker)

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   # Create .env.local file
   echo "NEXT_PUBLIC_API_URL=http://localhost:8001" > .env.local
   ```

3. **Run the development server:**
   ```bash
   pnpm dev
   ```

4. **Open your browser:**
   Navigate to http://localhost:3001

## Production Deployment

> **Note**: For production deployment with Docker, see the [main README](../README.md) in the root directory.

### Production Build (Standalone)

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Production Considerations:
- Use external load balancer (nginx, Traefik)
- Set up SSL certificates
- Configure CDN for static assets
- Implement proper monitoring and logging
- Regular security updates

## File Structure

```
ai-chat-branch-fe/
├── components/          # React components
│   ├── chat/           # Chat-specific components
│   └── ...
├── pages/              # Next.js pages
├── styles/             # Global styles
├── services/           # API service functions
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── config/             # Configuration files
├── layouts/            # Page layouts
├── public/             # Static assets
├── Dockerfile          # Docker image definitions
├── Dockerfile.dev      # Development Docker image
└── next.config.js      # Next.js configuration
```

## Technologies Used

- [Next.js 15](https://nextjs.org/docs/getting-started)
- [HeroUI v2](https://heroui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [Framer Motion](https://www.framer.com/motion)
- [React Markdown](https://github.com/remarkjs/react-markdown)
- [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)

## Troubleshooting

### Common Issues

1. **API connection failed:**
   - Verify `NEXT_PUBLIC_API_URL` is set correctly
   - Ensure backend is running and accessible
   - Check network connectivity

2. **Build failures:**
   - Check for TypeScript errors: `pnpm type-check`
   - Verify all dependencies are installed: `pnpm install`
   - Clear Next.js cache: `rm -rf .next`

3. **Port conflicts:**
   - Change port if 3001 is already in use: `pnpm dev -- --port 3001`
   - Update environment variables accordingly

4. **Hot reload not working:**
   - Restart the development server
   - Check file permissions
   - Verify you're in development mode

> **Note**: For Docker-related troubleshooting, see the [main README](../README.md) in the root directory.

## License

Licensed under the [MIT license](https://github.com/heroui-inc/next-pages-template/blob/main/LICENSE).