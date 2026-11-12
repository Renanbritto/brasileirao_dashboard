from dataclasses import dataclass, field, fields
from typing import Any


class ColumnField:
    def __init__(self, table_name: str, col_name: str, default_val: Any = None):
        self.table_name = table_name
        self.col_name = col_name
        self.default_val = default_val

    def __get__(self, instance: Any, owner: Any = None) -> Any:
        if instance is None:
            return self
        return instance.__dict__.get(self.col_name, self.default_val)

    def __set__(self, instance: Any, value: Any) -> None:
        instance.__dict__[self.col_name] = value

    def __eq__(self, other: Any):  # type: ignore[override]
        return ("=", self.col_name, other)

    def __gt__(self, other: Any):
        return (">", self.col_name, other)

    def asc(self):
        return (self.col_name, "ASC")

    def desc(self):
        return (self.col_name, "DESC")


def sql_model(cls):
    cls = dataclass(cls)
    tname = getattr(cls, "__tablename__", cls.__name__.lower())
    for f in fields(cls):
        if f.name not in ("club", "season", "teams", "matches"):
            setattr(cls, f.name, ColumnField(tname, f.name, f.default))
    return cls


@sql_model
class Club:
    __tablename__ = "clubs"

    id: int | None = None
    slug: str = ""
    name: str = ""
    short_name: str = ""
    state_uf: str = ""
    region: str = ""
    city: str = ""
    stadium_name: str = ""
    turf_type: str = "Natural"
    capacity: int = 35000
    latitude: float = 0.0
    longitude: float = 0.0
    primary_color: str = "#10b981"
    secondary_color: str = "#ffffff"
    yo_yo_index: int = 0
    promotions_to_a: int = 0
    relegations_to_b: int = 0
    immediate_returns: int = 0
    titles_serie_a: int = 0
    titles_serie_b: int = 0
    seasons_in_a: int = 0
    seasons_in_b: int = 0


@sql_model
class Season:
    __tablename__ = "seasons"

    id: int | None = None
    year: int = 2026
    division: str = "A"
    is_current: bool = False
    current_round: int = 38
    total_rounds: int = 38
    magic_title_pts: int = 77
    magic_g4_pts: int = 62
    magic_g6_pts: int = 57
    magic_sula_pts: int = 47
    magic_escape_z4_pts: int = 45


@sql_model
class SeasonTeam:
    __tablename__ = "season_teams"

    id: int | None = None
    season_id: int = 0
    club_id: int = 0
    position: int = 1
    prev_position: int = 1
    points: int = 0
    played: int = 0
    wins: int = 0
    draws: int = 0
    losses: int = 0
    goals_for: int = 0
    goals_against: int = 0
    goal_diff: int = 0

    points_turn_1: int = 0
    played_turn_1: int = 19
    rank_turn_1: int = 10
    points_turn_2: int = 0
    played_turn_2: int = 19
    rank_turn_2: int = 10

    home_played: int = 0
    home_wins: int = 0
    home_draws: int = 0
    home_losses: int = 0
    home_gf: int = 0
    home_ga: int = 0
    away_played: int = 0
    away_wins: int = 0
    away_draws: int = 0
    away_losses: int = 0
    away_gf: int = 0
    away_ga: int = 0

    points_vs_g6: int = 0
    played_vs_g6: int = 0
    points_vs_z4: int = 0
    played_vs_z4: int = 0

    xg_for: float = 0.0
    xg_against: float = 0.0
    shots_per_game: float = 12.5
    shots_per_goal: float = 9.5
    shots_conceded_per_goal: float = 10.0
    possession_avg: float = 50.0
    clean_sheets: int = 10
    comeback_points: int = 6
    points_dropped_leading: int = 8

    goals_0_15: int = 0
    goals_16_30: int = 0
    goals_31_45: int = 0
    goals_46_60: int = 0
    goals_61_75: int = 0
    goals_76_90: int = 0
    goals_85_plus: int = 0
    ga_0_15: int = 0
    ga_16_30: int = 0
    ga_31_45: int = 0
    ga_46_60: int = 0
    ga_61_75: int = 0
    ga_76_90: int = 0
    ga_85_plus: int = 0

    travel_km: float = 28000.0
    avg_attendance: int = 25000
    occupation_rate: float = 65.0
    aprov_synthetic: float = 45.0
    aprov_natural: float = 50.0
    yellow_cards: int = 75
    red_cards: int = 4
    coach_changes: int = 0
    aprov_before_coach: float = 40.0
    aprov_after_coach: float = 52.0

    form_last_5: str = "V,E,V,D,V"
    points_last_5: int = 10
    prob_title: float = 0.0
    prob_g4: float = 0.0
    prob_g6: float = 0.0
    prob_sula: float = 0.0
    prob_z4: float = 0.0
    prob_delta_main: float = 0.0
    sos_score: float = 50.0

    round_progression_json: str = "[]"
    remaining_schedule_json: str = "[]"
    time_slots_json: str = "{}"
    last_5_matches_json: str = "[]"

    club: Club | None = field(default=None, repr=False)


@sql_model
class Match:
    __tablename__ = "matches"

    id: int | None = None
    season_id: int = 0
    round_number: int = 33
    home_club_id: int = 0
    away_club_id: int = 0
    home_score: int | None = None
    away_score: int | None = None
    status: str = "SCHEDULED"
    kickoff_slot: str = "Dom 16h"
    stadium: str = ""
    is_six_pointer: bool = False
    six_pointer_label: str = ""
    pred_home_win: float = 45.0
    pred_draw: float = 28.0
    pred_away_win: float = 27.0


@sql_model
class DivisionHistory:
    __tablename__ = "division_history"

    id: int | None = None
    club_id: int = 0
    year: int = 2020
    division: str = "A"
    final_position: int = 10
    points: int = 50
    outcome: str = "PERMANENCIA"
