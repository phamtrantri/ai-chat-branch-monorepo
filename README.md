# AI Chat Branch - Full Stack Application

A complete AI chat application with FastAPI backend, Next.js frontend, and PostgreSQL database, all containerized with Docker.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Features

### Backend (FastAPI)
- 🚀 FastAPI with async support
- 🐘 PostgreSQL database with connection pooling
- 🤖 OpenAI integration for AI responses
- 💬 Conversation and message management
- 📡 Real-time streaming responses
- 🔒 CORS middleware for frontend integration

### Frontend (Next.js)
- ⚛️ Next.js 15 with TypeScript
- 🎨 HeroUI component library
- 🎯 Tailwind CSS for styling
- 🌙 Dark/Light theme support
- 💬 Real-time chat interface
- 📱 Responsive design

### Infrastructure
- 🐳 Docker containerization
- 🔄 Hot reload for development
- 🏥 Health checks and monitoring
- 🔧 Environment-based configuration
- 📊 Production-ready setup

## Quick Start

### Prerequisites
- Docker and Docker Compose
- OpenAI API key (optional, for AI features)

### 1. Clone and Setup
```bash
git clone <your-repo>
cd ai-chat-branch
```

### 2. Environment Configuration (Optional)
```bash
# Create .env file in backend directory for OpenAI integration
echo "OPENAI_API_KEY=your-openai-api-key-here" > ai-chat-branch-be/.env
```

### 3. Start the Application

#### Production Mode
```bash
docker-compose up -d
```

#### Development Mode (with hot reload)
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432

## Services

### PostgreSQL Database
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Database**: mydb
- **User**: admin
- **Password**: mypassword
- **Auto-initialization**: DDL and DML scripts

### FastAPI Backend
- **Port**: 8000
- **Framework**: FastAPI with Python 3.12
- **Dependencies**: OpenAI, psycopg, uvicorn
- **Features**: Async operations, streaming responses

### Next.js Frontend
- **Port**: 3000
- **Framework**: Next.js 15 with TypeScript
- **UI Library**: HeroUI v2
- **Styling**: Tailwind CSS

## Environment Variables

### Backend
| Variable | Default | Description |
|----------|---------|-------------|
| DB_HOST | postgres | Database host |
| DB_PORT | 5432 | Database port |
| DB_NAME | mydb | Database name |
| DB_USER | admin | Database user |
| DB_PASSWORD | mypassword | Database password |
| OPENAI_API_KEY | - | OpenAI API key |

### Frontend
| Variable | Default | Description |
|----------|---------|-------------|
| NEXT_PUBLIC_API_URL | http://localhost:8000 | Public API URL (browser) |
| INTERNAL_API_URL | http://backend:8000 | Internal API URL (SSR) |
| NODE_ENV | production | Node environment |

## Docker Commands

### Start Services
```bash
# Production
docker-compose up -d

# Development with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Build without cache
docker-compose build --no-cache
```

### Stop Services
```bash
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Access Containers
```bash
# Backend shell
docker-compose exec backend bash

# Frontend shell
docker-compose exec frontend sh

# Database shell
docker-compose exec postgres psql -U admin -d mydb
```

## API Endpoints

### Conversations
- `POST /conversations/v1/getAll` - Get all conversations
- `POST /conversations/v1/getDetails` - Get conversation details
- `POST /conversations/v1/create` - Create new conversation

### Messages
- `POST /messages/v1/create` - Create new message with streaming response

### Health Check
- `GET /api/health` - Frontend health check

## Development

### Hot Reload Features
- ✅ **Backend**: Python code changes reload automatically
- ✅ **Frontend**: React/Next.js hot reload enabled
- ✅ **Database**: Schema changes require restart
- ✅ **Environment**: Changes require container restart

### Local Development (without Docker)

#### Backend
```bash
cd ai-chat-branch-be
pip install uv
uv sync
uv run uvicorn app.main:app --reload
```

#### Frontend
```bash
cd ai-chat-branch-fe
pnpm install
pnpm dev
```

## Production Deployment

### Environment Variables
```bash
# Set production environment variables
export OPENAI_API_KEY="your-actual-openai-key"
export NEXT_PUBLIC_API_URL="https://your-api-domain.com"
```

### Production Considerations
- Use external managed PostgreSQL (AWS RDS, Google Cloud SQL)
- Set up reverse proxy (nginx, Traefik) with SSL
- Implement proper logging and monitoring
- Use container orchestration (Kubernetes, Docker Swarm)
- Set up CI/CD pipelines
- Regular security updates

## Troubleshooting

### Common Issues

1. **Database connection failed**
   ```bash
   docker-compose logs postgres
   docker-compose exec postgres pg_isready -U admin
   ```

2. **Backend not starting**
   ```bash
   docker-compose logs backend
   # Check if OpenAI API key is set
   ```

3. **Frontend can't connect to backend**
   ```bash
   # Check if both services are in the same network
   docker-compose ps
   docker network ls
   ```

4. **Port conflicts**
   - Change ports in docker-compose.yml if already in use
   - Default ports: 3000 (frontend), 8000 (backend), 5432 (database)

### Complete Cleanup Process

If you encounter container name conflicts or need to reset everything:

```bash
# 1. Stop and remove all containers and volumes
docker-compose down -v

# 2. Remove any lingering containers (if they exist)
docker rm -f ai-chat-frontend ai-chat-backend ai-chat-postgres 2>/dev/null || true

# 3. Remove old networks from previous setups
docker network rm ai-chat-branch-be_ai-chat-network ai-chat-branch-fe_ai-chat-network 2>/dev/null || true

# 4. Remove old volumes (optional - this will delete database data)
docker volume rm ai-chat-branch-be_postgres_data 2>/dev/null || true

# 5. Clean up Docker system (optional - removes unused images/cache)
docker system prune -a

# 6. Rebuild and start fresh
docker-compose build --no-cache
docker-compose up -d
```

### Quick Reset (Most Common)
```bash
# For most issues, this is sufficient:
docker-compose down -v
docker-compose up --build
```

## File Structure

```
ai-chat-branch/
├── ai-chat-branch-be/          # FastAPI Backend
│   ├── app/                    # Application code
│   ├── ddl/                    # Database schema
│   ├── dml/                    # Database data
│   ├── Dockerfile              # Backend container
│   └── docker-compose*.yml     # Backend-specific configs
├── ai-chat-branch-fe/          # Next.js Frontend
│   ├── components/             # React components
│   ├── pages/                  # Next.js pages
│   ├── services/               # API services
│   ├── Dockerfile              # Frontend container
│   └── docker-compose*.yml     # Frontend-specific configs
├── docker-compose.yml          # Main production config
├── docker-compose.dev.yml      # Development overrides
└── README.md                   # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## License

This project is licensed under the MIT License.
