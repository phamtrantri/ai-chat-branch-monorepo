# AI Chat Branch Backend

A FastAPI-based backend service for an AI chat application with PostgreSQL database support.

## Features

- FastAPI web framework with async support
- PostgreSQL database with connection pooling
- OpenAI integration for AI responses
- Conversation and message management
- Streaming responses
- CORS middleware for frontend integration

## Prerequisites

- Python 3.12+
- PostgreSQL 15+
- OpenAI API key (optional, for AI features)

## Quick Start

> **Note**: This backend is designed to run as part of the full-stack application. For the complete Docker setup with frontend and database, see the [main README](../README.md) in the root directory.

### Local Development (Standalone)

1. **Navigate to the backend directory:**
   ```bash
   cd ai-chat-branch-be
   ```

2. **Create environment file:**
   ```bash
   # Create .env file with your configuration
   echo "OPENAI_API_KEY=your-api-key-here" > .env
   echo "DB_HOST=localhost" >> .env
   echo "DB_PORT=5432" >> .env
   echo "DB_NAME=mydb" >> .env
   echo "DB_USER=admin" >> .env
   echo "DB_PASSWORD=mypassword" >> .env
   ```

3. **Install dependencies:**
   ```bash
   pip install uv
   uv sync
   ```

4. **Set up PostgreSQL database locally and run migrations**

5. **Start the development server:**
   ```bash
   uv run uvicorn app.main:app --reload
   ```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| DB_HOST | localhost | Database host |
| DB_PORT | 5432 | Database port |
| DB_NAME | mydb | Database name |
| DB_USER | admin | Database user |
| DB_PASSWORD | mypassword | Database password |
| OPENAI_API_KEY | - | OpenAI API key for AI features |

## API Endpoints

- `GET /` - Health check and test endpoint
- `POST /conversations/v1/getAll` - Get all conversations
- `POST /conversations/v1/getDetails` - Get conversation details
- `POST /conversations/v1/create` - Create new conversation
- `POST /messages/v1/create` - Create new message with streaming response

## Database Schema

The application uses two main tables:
- `conversations` - Stores conversation metadata
- `messages` - Stores individual messages within conversations

Database schema is automatically initialized from `ddl/v1.sql` when the container starts.

## Development

## Production Deployment

> **Note**: For production deployment with Docker, see the [main README](../README.md) in the root directory.

### Production Considerations:
- Use external managed PostgreSQL (AWS RDS, Google Cloud SQL)
- Set up proper environment variable management
- Implement proper logging and monitoring
- Regular security updates and vulnerability scanning
- Use HTTPS and proper authentication

## Troubleshooting

### Common Issues

1. **Database connection failed:**
   - Verify PostgreSQL is running and accessible
   - Check environment variables are set correctly
   - Ensure database exists and user has proper permissions

2. **Import errors:**
   - Verify all dependencies are installed: `uv sync`
   - Check Python version compatibility (requires 3.12+)

3. **OpenAI API errors:**
   - Verify OPENAI_API_KEY is set correctly
   - Check API key has sufficient credits/permissions

4. **Port conflicts:**
   - Change port in uvicorn command if 8001 is already in use
   - Use `--port` flag: `uvicorn app.main:app --port 8001`

> **Note**: For Docker-related troubleshooting, see the [main README](../README.md) in the root directory.
