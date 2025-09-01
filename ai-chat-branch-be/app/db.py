import os
from contextlib import asynccontextmanager
from typing import Optional, Dict, Any
from psycopg_pool import ConnectionPool
from dotenv import load_dotenv

load_dotenv(override=True)


class Database:
    def __init__(self):
        self.pool: Optional[ConnectionPool] = None
        self._connection_string = self._build_connection_string()
    
    def _build_connection_string(self) -> str:
        """Build PostgreSQL connection string from environment variables."""
        return (
            f"postgresql://{os.getenv('DB_USER', 'admin')}:"
            f"{os.getenv('DB_PASSWORD', 'mypassword')}@"
            f"{os.getenv('DB_HOST', 'localhost')}:"
            f"{os.getenv('DB_PORT', '5432')}/"
            f"{os.getenv('DB_NAME', 'mydb')}"
        )
    
    async def connect(self) -> None:
        """Initialize connection pool."""
        try:
            self.pool = ConnectionPool(
                conninfo=self._connection_string,
                min_size=1,
                max_size=10,
                timeout=30
            )
            # Test connection
            with self.pool.connection() as conn:
                conn.execute("SELECT 1")
        except Exception as e:
            raise ConnectionError(f"Failed to connect to database: {e}")
    
    async def disconnect(self) -> None:
        """Close connection pool."""
        if self.pool:
            self.pool.close()
    
    @asynccontextmanager
    async def get_connection(self):
        """Get database connection from pool."""
        if not self.pool:
            raise RuntimeError("Database not connected. Call connect() first.")
        
        with self.pool.connection() as conn:
            yield conn
    
    async def execute(self, query: str, params: Optional[tuple] = None, fetch: bool = False):
        async with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, params)
                if fetch:
                    rows = cur.fetchall()
                    return [dict(zip([desc[0] for desc in cur.description], row)) for row in rows]
                return cur
    
    

    async def fetch_one(self, query: str, params: Optional[tuple] = None) -> Optional[Dict[str, Any]]:
        """Fetch a single row."""
        async with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, params)
                row = cur.fetchone()
                if row:
                    return dict(zip([desc[0] for desc in cur.description], row))
                return None
    
    async def fetch_all(self, query: str, params: Optional[tuple] = None) -> list[Dict[str, Any]]:
        """Fetch all rows."""
        async with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, params)
                rows = cur.fetchall()
                return [dict(zip([desc[0] for desc in cur.description], row)) for row in rows]
    
    async def execute_many(self, query: str, params_list: list[tuple]) -> None:
        """Execute a query with multiple parameter sets."""
        async with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.executemany(query, params_list)
    
    @asynccontextmanager
    async def transaction(self):
        """Get a transaction context manager."""
        if not self.pool:
            raise RuntimeError("Database not connected. Call connect() first.")
        
        with self.pool.connection() as conn:
            yield conn


# Global database instance
db = Database()
  