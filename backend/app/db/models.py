from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from app.db.session import Base


class Club(Base):
    __tablename__ = "clubs"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    short_name = Column(String(8), nullable=False)
    state_uf = Column(String(4), nullable=False)
    region = Column(String(24), nullable=False)
    city = Column(String(64), nullable=False)
    stadium_name = Column(String(100), nullable=False)
    turf_type = Column(String(24), default="Natural")  # Natural | Sintético
    capacity = Column(Integer, default=35000)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    primary_color = Column(String(16), nullable=False)
    secondary_color = Column(String(16), default="#ffffff")

    # Historical Pontos Corridos metrics (2003–Present)
    yo_yo_index = Column(Integer, default=0)  # Total promotions + relegations
    promotions_to_a = Column(Integer, default=0)
    relegations_to_b = Column(Integer, default=0)
    immediate_returns = Column(Integer, default=0)  # Bate e volta in 1 year
    titles_serie_a = Column(Integer, default=0)
    titles_serie_b = Column(Integer, default=0)
    seasons_in_a = Column(Integer, default=0)
    seasons_in_b = Column(Integer, default=0)

    season_teams = relationship("SeasonTeam", back_populates="club")


class Season(Base):
    __tablename__ = "seasons"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, index=True, nullable=False)
    division = Column(String(2), index=True, nullable=False)  # 'A' or 'B'
    is_current = Column(Boolean, default=False)
    current_round = Column(Integer, default=38)
    total_rounds = Column(Integer, default=38)
    magic_title_pts = Column(Integer, default=78)
    magic_g4_pts = Column(Integer, default=63)
    magic_g6_pts = Column(Integer, default=57)
    magic_sula_pts = Column(Integer, default=47)
    magic_escape_z4_pts = Column(Integer, default=45)

    teams = relationship("SeasonTeam", back_populates="season")
    matches = relationship("Match", back_populates="season")

    __table_args__ = (Index("ix_season_year_div", "year", "division", unique=True),)


class SeasonTeam(Base):
    __tablename__ = "season_teams"

    id = Column(Integer, primary_key=True, index=True)
    season_id = Column(Integer, ForeignKey("seasons.id"), index=True, nullable=False)
    club_id = Column(Integer, ForeignKey("clubs.id"), index=True, nullable=False)

    position = Column(Integer, nullable=False)
    prev_position = Column(Integer, nullable=False)
    points = Column(Integer, nullable=False)
    played = Column(Integer, nullable=False)
    wins = Column(Integer, nullable=False)
    draws = Column(Integer, nullable=False)
    losses = Column(Integer, nullable=False)
    goals_for = Column(Integer, nullable=False)
    goals_against = Column(Integer, nullable=False)
    goal_diff = Column(Integer, nullable=False)

    # Turno splits (1º Turno vs 2º Turno)
    points_turn_1 = Column(Integer, default=0)
    played_turn_1 = Column(Integer, default=19)
    rank_turn_1 = Column(Integer, default=10)
    points_turn_2 = Column(Integer, default=0)
    played_turn_2 = Column(Integer, default=19)
    rank_turn_2 = Column(Integer, default=10)

    # Home / Away splits
    home_played = Column(Integer, default=0)
    home_wins = Column(Integer, default=0)
    home_draws = Column(Integer, default=0)
    home_losses = Column(Integer, default=0)
    home_gf = Column(Integer, default=0)
    home_ga = Column(Integer, default=0)
    away_played = Column(Integer, default=0)
    away_wins = Column(Integer, default=0)
    away_draws = Column(Integer, default=0)
    away_losses = Column(Integer, default=0)
    away_gf = Column(Integer, default=0)
    away_ga = Column(Integer, default=0)

    # Context performance ("Robin Hood" vs G6 / vs Z4)
    points_vs_g6 = Column(Integer, default=0)
    played_vs_g6 = Column(Integer, default=0)
    points_vs_z4 = Column(Integer, default=0)
    played_vs_z4 = Column(Integer, default=0)

    # Tactical & Efficiency metrics
    xg_for = Column(Float, default=0.0)
    xg_against = Column(Float, default=0.0)
    shots_per_game = Column(Float, default=12.5)
    shots_per_goal = Column(Float, default=9.5)
    shots_conceded_per_goal = Column(Float, default=10.0)
    possession_avg = Column(Float, default=50.0)
    clean_sheets = Column(Integer, default=10)
    comeback_points = Column(Integer, default=6)
    points_dropped_leading = Column(Integer, default=8)

    # Goal timing distribution (Scored & Conceded)
    goals_0_15 = Column(Integer, default=0)
    goals_16_30 = Column(Integer, default=0)
    goals_31_45 = Column(Integer, default=0)
    goals_46_60 = Column(Integer, default=0)
    goals_61_75 = Column(Integer, default=0)
    goals_76_90 = Column(Integer, default=0)
    goals_85_plus = Column(Integer, default=0)  # "Rei dos Acréscimos"
    ga_0_15 = Column(Integer, default=0)
    ga_16_30 = Column(Integer, default=0)
    ga_31_45 = Column(Integer, default=0)
    ga_46_60 = Column(Integer, default=0)
    ga_61_75 = Column(Integer, default=0)
    ga_76_90 = Column(Integer, default=0)
    ga_85_plus = Column(Integer, default=0)

    # Geography, Stadium & Discipline
    travel_km = Column(Float, default=28000.0)
    avg_attendance = Column(Integer, default=25000)
    occupation_rate = Column(Float, default=65.0)
    aprov_synthetic = Column(Float, default=45.0)
    aprov_natural = Column(Float, default=50.0)
    yellow_cards = Column(Integer, default=75)
    red_cards = Column(Integer, default=4)
    coach_changes = Column(Integer, default=0)
    aprov_before_coach = Column(Float, default=40.0)
    aprov_after_coach = Column(Float, default=52.0)

    # Live Season Form & Monte Carlo Probabilities
    form_last_5 = Column(String(32), default="V,E,V,D,V")
    points_last_5 = Column(Integer, default=10)
    prob_title = Column(Float, default=0.0)
    prob_g4 = Column(Float, default=0.0)
    prob_g6 = Column(Float, default=0.0)
    prob_sula = Column(Float, default=0.0)
    prob_z4 = Column(Float, default=0.0)
    prob_delta_main = Column(Float, default=0.0)
    sos_score = Column(Float, default=50.0)  # Strength of Schedule (0-100)

    # Structured JSON payloads for round-by-round bump chart, remaining schedule, and kickoff slots
    round_progression_json = Column(Text, default="[]")
    remaining_schedule_json = Column(Text, default="[]")
    time_slots_json = Column(Text, default="{}")

    season = relationship("Season", back_populates="teams")
    club = relationship("Club", back_populates="season_teams")


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    season_id = Column(Integer, ForeignKey("seasons.id"), index=True, nullable=False)
    round_number = Column(Integer, index=True, nullable=False)
    home_club_id = Column(Integer, ForeignKey("clubs.id"), nullable=False)
    away_club_id = Column(Integer, ForeignKey("clubs.id"), nullable=False)
    home_score = Column(Integer, nullable=True)
    away_score = Column(Integer, nullable=True)
    status = Column(String(20), default="SCHEDULED")  # FINISHED | SCHEDULED
    kickoff_slot = Column(String(32), default="Dom 16h")
    stadium = Column(String(100), default="")
    is_six_pointer = Column(Boolean, default=False)
    six_pointer_label = Column(String(48), default="")
    pred_home_win = Column(Float, default=45.0)
    pred_draw = Column(Float, default=28.0)
    pred_away_win = Column(Float, default=27.0)

    season = relationship("Season", back_populates="matches")


class DivisionHistory(Base):
    __tablename__ = "division_history"

    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id"), index=True, nullable=False)
    year = Column(Integer, index=True, nullable=False)
    division = Column(String(2), nullable=False)  # A, B, C
    final_position = Column(Integer, nullable=False)
    points = Column(Integer, nullable=False)
    outcome = Column(String(32), nullable=False)  # CAMPEAO | G4 | PERMANENCIA | ACESSO | REBAIXADO

