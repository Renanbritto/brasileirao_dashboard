from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import Base, engine, SessionLocal
from app.db.seed import ensure_seeded
from app.services.table_sync import sync_serie_a_2026_standings
from app.api.v1.endpoints import router as api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        ensure_seeded(db)
        sync_serie_a_2026_standings(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API Analítica e Motor Matemático (Monte Carlo & Poisson) para Brasileirão Série A e Série B.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix=settings.API_V1_STR, tags=["Brasileirão Analytics"])


@app.get("/health")
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME, "version": settings.VERSION}

