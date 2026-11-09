import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = "Brasileirão Série A & B — Intelligence API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Dual-Engine Database URL: PostgreSQL in production/Docker, SQLite fallback in local dev
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'brasileirao.db')}",
    )

    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
        ).split(",")
    ]


settings = Settings()

