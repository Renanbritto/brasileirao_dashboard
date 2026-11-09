import os
import sqlite3
from dataclasses import fields
from typing import Any, Type, TypeVar
from app.core.config import settings
from app.db.models import Club, Season, SeasonTeam, Match, DivisionHistory

T = TypeVar("T")

MODEL_CLASSES = [Club, Season, SeasonTeam, Match, DivisionHistory]


def _resolve_sqlite_path() -> str:
    url = settings.DATABASE_URL
    if url.startswith("sqlite:///"):
        return url.replace("sqlite:///", "")
    return os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "brasileirao.db")


def _python_type_to_sql(py_type: Any) -> str:
    t_str = str(py_type)
    if "int" in t_str:
        return "INTEGER"
    if "float" in t_str:
        return "REAL"
    if "bool" in t_str:
        return "INTEGER"
    return "TEXT"


class _Metadata:
    def create_all(self, bind: Any = None):
        db_path = _resolve_sqlite_path()
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        for cls in MODEL_CLASSES:
            tname = cls.__tablename__
            col_defs = ["id INTEGER PRIMARY KEY AUTOINCREMENT"]
            for f in fields(cls):
                if f.name in ("id", "club", "season", "teams", "matches"):
                    continue
                sql_t = _python_type_to_sql(f.type)
                col_defs.append(f"{f.name} {sql_t}")
            ddl = f"CREATE TABLE IF NOT EXISTS {tname} ({', '.join(col_defs)})"
            cur.execute(ddl)
        conn.commit()
        conn.close()


class Base:
    metadata = _Metadata()


engine = _resolve_sqlite_path()


class QueryBuilder:
    def __init__(self, session: "Session", model_cls: Type[T]):
        self.session = session
        self.model_cls = model_cls
        self.filters: list[tuple[str, str, Any]] = []
        self.orders: list[tuple[str, str]] = []

    def filter(self, *conditions: Any) -> "QueryBuilder":
        for cond in conditions:
            if isinstance(cond, tuple) and len(cond) == 3:
                self.filters.append(cond)
        return self

    def order_by(self, *order_specs: Any) -> "QueryBuilder":
        for spec in order_specs:
            if isinstance(spec, tuple) and len(spec) == 2:
                self.orders.append(spec)
        return self

    def _build_sql(self) -> tuple[str, list[Any]]:
        tname = self.model_cls.__tablename__
        col_names = [f.name for f in fields(self.model_cls) if f.name not in ("club", "season", "teams", "matches")]
        sql = f"SELECT {', '.join(col_names)} FROM {tname}"
        params: list[Any] = []
        if self.filters:
            where_clauses = []
            for op, col, val in self.filters:
                where_clauses.append(f"{col} {op} ?")
                params.append(1 if val is True else (0 if val is False else val))
            sql += " WHERE " + " AND ".join(where_clauses)
        if self.orders:
            order_clauses = [f"{col} {direction}" for col, direction in self.orders]
            sql += " ORDER BY " + ", ".join(order_clauses)
        return sql, params

    def all(self) -> list[T]:
        sql, params = self._build_sql()
        cur = self.session.conn.cursor()
        cur.execute(sql, params)
        rows = cur.fetchall()
        col_names = [f.name for f in fields(self.model_cls) if f.name not in ("club", "season", "teams", "matches")]
        results: list[T] = []
        club_cache: dict[int, Club] = {}
        if self.model_cls is SeasonTeam:
            club_cache = {c.id: c for c in self.session.query(Club).all() if c.id is not None}

        for r in rows:
            kwargs = {}
            for c_name, val in zip(col_names, r):
                if c_name in ("is_current", "is_six_pointer"):
                    kwargs[c_name] = bool(val)
                else:
                    kwargs[c_name] = val
            inst = self.model_cls(**kwargs)
            if self.model_cls is SeasonTeam and getattr(inst, "club_id", None) in club_cache:
                inst.club = club_cache[inst.club_id]
            results.append(inst)
        return results

    def first(self) -> T | None:
        items = self.all()
        return items[0] if items else None

    def count(self) -> int:
        tname = self.model_cls.__tablename__
        cur = self.session.conn.cursor()
        cur.execute(f"SELECT COUNT(*) FROM {tname}")
        row = cur.fetchone()
        return int(row[0]) if row else 0


class Session:
    def __init__(self):
        self.db_path = _resolve_sqlite_path()
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self._pending: list[Any] = []

    def query(self, model_cls: Type[T]) -> QueryBuilder:
        return QueryBuilder(self, model_cls)

    def add(self, obj: Any):
        self._pending.append(obj)

    def commit(self):
        cur = self.conn.cursor()
        for obj in self._pending:
            cls = type(obj)
            tname = cls.__tablename__
            col_names = [
                f.name
                for f in fields(cls)
                if f.name not in ("id", "club", "season", "teams", "matches")
            ]
            vals = []
            for c in col_names:
                v = getattr(obj, c)
                if isinstance(v, bool):
                    v = 1 if v else 0
                vals.append(v)
            placeholders = ", ".join(["?"] * len(col_names))
            sql = f"INSERT INTO {tname} ({', '.join(col_names)}) VALUES ({placeholders})"
            cur.execute(sql, vals)
            obj.id = cur.lastrowid
        self._pending.clear()
        self.conn.commit()

    def refresh(self, obj: Any):
        pass

    def close(self):
        self.conn.close()


def SessionLocal() -> Session:
    return Session()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
