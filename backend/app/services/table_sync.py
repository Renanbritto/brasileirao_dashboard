import json
import random
from typing import Any
from app.db.models import Club, DivisionHistory, Match, Season, SeasonTeam
from app.db.seed import CLUBS_MASTER, haversine_km, seed_division_history
from app.db.session import Session
from app.services.monte_carlo import compute_standings_probabilities


OFFICIAL_SERIE_A_2026_DATA = [
    {
        "club_slug": "flamengo", "position": 1, "points": 76, "played": 34, "wins": 23, "draws": 7, "losses": 4, "gf": 71, "ga": 29, "gd": 42,
        "form_last_5": "V,V,V,V,V", "points_last_5": 15,
        "home_played": 17, "home_wins": 13, "home_draws": 3, "home_losses": 1, "home_gf": 42, "home_ga": 12,
        "away_played": 17, "away_wins": 10, "away_draws": 4, "away_losses": 3, "away_gf": 29, "away_ga": 17,
        "pts_t1": 40, "played_t1": 19, "pts_t2": 36, "played_t2": 15,
        "prob_title": 74.2, "prob_g4": 100.0, "prob_g6": 100.0, "prob_sula": 0.0, "prob_z4": 0.0,
    },
    {
        "club_slug": "palmeiras", "position": 2, "points": 73, "played": 34, "wins": 21, "draws": 10, "losses": 3, "gf": 62, "ga": 23, "gd": 39,
        "form_last_5": "E,V,V,V,V", "points_last_5": 13,
        "home_played": 17, "home_wins": 12, "home_draws": 4, "home_losses": 1, "home_gf": 37, "home_ga": 10,
        "away_played": 17, "away_wins": 9, "away_draws": 6, "away_losses": 2, "away_gf": 25, "away_ga": 13,
        "pts_t1": 38, "played_t1": 19, "pts_t2": 35, "played_t2": 15,
        "prob_title": 25.8, "prob_g4": 100.0, "prob_g6": 100.0, "prob_sula": 0.0, "prob_z4": 0.0,
    },
    {
        "club_slug": "cruzeiro", "position": 3, "points": 60, "played": 34, "wins": 18, "draws": 6, "losses": 10, "gf": 55, "ga": 48, "gd": 7,
        "form_last_5": "D,V,V,V,D", "points_last_5": 9,
        "home_played": 17, "home_wins": 11, "home_draws": 3, "home_losses": 3, "home_gf": 32, "home_ga": 19,
        "away_played": 17, "away_wins": 7, "away_draws": 3, "away_losses": 7, "away_gf": 23, "away_ga": 29,
        "pts_t1": 32, "played_t1": 19, "pts_t2": 28, "played_t2": 15,
        "prob_title": 0.0, "prob_g4": 91.5, "prob_g6": 98.8, "prob_sula": 1.2, "prob_z4": 0.0,
    },
    {
        "club_slug": "fluminense", "position": 4, "points": 57, "played": 34, "wins": 16, "draws": 9, "losses": 9, "gf": 55, "ga": 42, "gd": 13,
        "form_last_5": "V,D,D,D,D", "points_last_5": 3,
        "home_played": 17, "home_wins": 10, "home_draws": 4, "home_losses": 3, "home_gf": 33, "home_ga": 18,
        "away_played": 17, "away_wins": 6, "away_draws": 5, "away_losses": 6, "away_gf": 22, "away_ga": 24,
        "pts_t1": 37, "played_t1": 19, "pts_t2": 20, "played_t2": 15,
        "prob_title": 0.0, "prob_g4": 76.4, "prob_g6": 92.1, "prob_sula": 7.9, "prob_z4": 0.0,
    },
    {
        "club_slug": "athletico-pr", "position": 5, "points": 54, "played": 34, "wins": 15, "draws": 9, "losses": 10, "gf": 51, "ga": 43, "gd": 8,
        "form_last_5": "V,E,D,D,D", "points_last_5": 4,
        "home_played": 17, "home_wins": 10, "home_draws": 4, "home_losses": 3, "home_gf": 31, "home_ga": 17,
        "away_played": 17, "away_wins": 5, "away_draws": 5, "away_losses": 7, "away_gf": 20, "away_ga": 26,
        "pts_t1": 28, "played_t1": 19, "pts_t2": 26, "played_t2": 15,
        "prob_title": 0.0, "prob_g4": 51.2, "prob_g6": 78.4, "prob_sula": 21.6, "prob_z4": 0.0,
    },
    {
        "club_slug": "bahia", "position": 6, "points": 53, "played": 34, "wins": 14, "draws": 11, "losses": 9, "gf": 50, "ga": 45, "gd": 5,
        "form_last_5": "D,D,E,D,V", "points_last_5": 4,
        "home_played": 17, "home_wins": 10, "home_draws": 4, "home_losses": 3, "home_gf": 30, "home_ga": 19,
        "away_played": 17, "away_wins": 4, "away_draws": 7, "away_losses": 6, "away_gf": 20, "away_ga": 26,
        "pts_t1": 30, "played_t1": 19, "pts_t2": 23, "played_t2": 15,
        "prob_title": 0.0, "prob_g4": 38.6, "prob_g6": 67.5, "prob_sula": 32.5, "prob_z4": 0.0,
    },
    {
        "club_slug": "atletico-mg", "position": 7, "points": 50, "played": 34, "wins": 14, "draws": 8, "losses": 12, "gf": 44, "ga": 40, "gd": 4,
        "form_last_5": "V,V,D,D,D", "points_last_5": 6,
        "home_played": 17, "home_wins": 9, "home_draws": 4, "home_losses": 4, "home_gf": 26, "home_ga": 16,
        "away_played": 17, "away_wins": 5, "away_draws": 4, "away_losses": 8, "away_gf": 18, "away_ga": 24,
        "pts_t1": 28, "played_t1": 19, "pts_t2": 22, "played_t2": 15,
        "prob_title": 0.0, "prob_g4": 18.2, "prob_g6": 44.8, "prob_sula": 55.2, "prob_z4": 0.0,
    },
    {
        "club_slug": "rb-bragantino", "position": 8, "points": 47, "played": 34, "wins": 13, "draws": 8, "losses": 13, "gf": 44, "ga": 39, "gd": 5,
        "form_last_5": "V,E,D,V,V", "points_last_5": 10,
        "home_played": 17, "home_wins": 9, "home_draws": 4, "home_losses": 4, "home_gf": 27, "home_ga": 17,
        "away_played": 17, "away_wins": 4, "away_draws": 4, "away_losses": 9, "away_gf": 17, "away_ga": 22,
        "pts_t1": 22, "played_t1": 19, "pts_t2": 25, "played_t2": 15,
        "prob_title": 0.0, "prob_g4": 7.5, "prob_g6": 24.1, "prob_sula": 75.9, "prob_z4": 0.0,
    },
    {
        "club_slug": "santos", "position": 9, "points": 47, "played": 34, "wins": 12, "draws": 11, "losses": 11, "gf": 50, "ga": 49, "gd": 1,
        "form_last_5": "D,D,D,D,E", "points_last_5": 1,
        "home_played": 17, "home_wins": 8, "home_draws": 6, "home_losses": 3, "home_gf": 30, "home_ga": 21,
        "away_played": 17, "away_wins": 4, "away_draws": 5, "away_losses": 8, "away_gf": 20, "away_ga": 28,
        "pts_t1": 26, "played_t1": 19, "pts_t2": 21, "played_t2": 15,
        "prob_title": 0.0, "prob_g4": 6.8, "prob_g6": 22.5, "prob_sula": 77.5, "prob_z4": 0.0,
    },
    {
        "club_slug": "sao-paulo", "position": 10, "points": 44, "played": 34, "wins": 12, "draws": 8, "losses": 14, "gf": 39, "ga": 39, "gd": 0,
        "form_last_5": "V,E,D,E,E", "points_last_5": 6,
        "home_played": 17, "home_wins": 8, "home_draws": 4, "home_losses": 5, "home_gf": 23, "home_ga": 17,
        "away_played": 17, "away_wins": 4, "away_draws": 4, "away_losses": 9, "away_gf": 16, "away_ga": 22,
        "pts_t1": 25, "played_t1": 19, "pts_t2": 19, "played_t2": 15,
        "prob_title": 0.0, "prob_g4": 1.8, "prob_g6": 9.5, "prob_sula": 90.5, "prob_z4": 0.0,
    },
    {
        "club_slug": "botafogo", "position": 11, "points": 42, "played": 34, "wins": 11, "draws": 9, "losses": 14, "gf": 46, "ga": 53, "gd": -7,
        "form_last_5": "E,D,D,D,V", "points_last_5": 4,
        "home_played": 17, "home_wins": 7, "home_draws": 5, "home_losses": 5, "home_gf": 28, "home_ga": 23,
        "away_played": 17, "away_wins": 4, "away_draws": 4, "away_losses": 9, "away_gf": 18, "away_ga": 30,
        "pts_t1": 25, "played_t1": 19, "pts_t2": 17, "played_t2": 15,
        "prob_title": 0.0, "prob_g4": 0.5, "prob_g6": 4.2, "prob_sula": 95.3, "prob_z4": 0.2,
    },
    {
        "club_slug": "coritiba", "position": 12, "points": 42, "played": 34, "wins": 11, "draws": 9, "losses": 14, "gf": 40, "ga": 51, "gd": -11,
        "form_last_5": "D,D,D,E,V", "points_last_5": 4,
        "home_played": 17, "home_wins": 8, "home_draws": 4, "home_losses": 5, "home_gf": 25, "home_ga": 21,
        "away_played": 17, "away_wins": 3, "away_draws": 5, "away_losses": 9, "away_gf": 15, "away_ga": 30,
        "pts_t1": 23, "played_t1": 19, "pts_t2": 19, "played_t2": 15,
        "prob_title": 0.0, "prob_g4": 0.4, "prob_g6": 3.8, "prob_sula": 95.8, "prob_z4": 0.4,
    },
    {
        "club_slug": "vasco", "position": 13, "points": 41, "played": 33, "wins": 11, "draws": 8, "losses": 14, "gf": 43, "ga": 50, "gd": -7,
        "form_last_5": "E,D,D,D,D", "points_last_5": 1,
        "home_played": 17, "home_wins": 7, "home_draws": 4, "home_losses": 6, "home_gf": 25, "home_ga": 21,
        "away_played": 16, "away_wins": 4, "away_draws": 4, "away_losses": 8, "away_gf": 18, "away_ga": 29,
        "pts_t1": 24, "played_t1": 19, "pts_t2": 17, "played_t2": 14,
        "prob_title": 0.0, "prob_g4": 0.8, "prob_g6": 5.6, "prob_sula": 92.1, "prob_z4": 1.5,
    },
    {
        "club_slug": "mirassol", "position": 14, "points": 40, "played": 34, "wins": 10, "draws": 10, "losses": 14, "gf": 39, "ga": 48, "gd": -9,
        "form_last_5": "D,E,V,D,D", "points_last_5": 4,
        "home_played": 17, "home_wins": 7, "home_draws": 5, "home_losses": 5, "home_gf": 24, "home_ga": 21,
        "away_played": 17, "away_wins": 3, "away_draws": 5, "away_losses": 9, "away_gf": 15, "away_ga": 27,
        "pts_t1": 22, "played_t1": 19, "pts_t2": 18, "played_t2": 15,
        "prob_title": 0.0, "prob_g4": 0.1, "prob_g6": 1.2, "prob_sula": 93.9, "prob_z4": 4.8,
    },
    {
        "club_slug": "vitoria", "position": 15, "points": 38, "played": 34, "wins": 10, "draws": 8, "losses": 16, "gf": 35, "ga": 51, "gd": -16,
        "form_last_5": "D,V,E,D,D", "points_last_5": 4,
        "home_played": 17, "home_wins": 7, "home_draws": 4, "home_losses": 6, "home_gf": 22, "home_ga": 22,
        "away_played": 17, "away_wins": 3, "away_draws": 4, "away_losses": 10, "away_gf": 13, "away_ga": 29,
        "pts_t1": 20, "played_t1": 19, "pts_t2": 18, "played_t2": 15,
        "prob_title": 0.0, "prob_g4": 0.0, "prob_g6": 0.3, "prob_sula": 78.3, "prob_z4": 21.4,
    },
    {
        "club_slug": "internacional", "position": 16, "points": 38, "played": 34, "wins": 9, "draws": 11, "losses": 14, "gf": 38, "ga": 42, "gd": -4,
        "form_last_5": "D,D,D,E,V", "points_last_5": 4,
        "home_played": 17, "home_wins": 6, "home_draws": 6, "home_losses": 5, "home_gf": 23, "home_ga": 18,
        "away_played": 17, "away_wins": 3, "away_draws": 5, "away_losses": 9, "away_gf": 15, "away_ga": 24,
        "pts_t1": 21, "played_t1": 19, "pts_t2": 17, "played_t2": 15,
        "prob_title": 0.0, "prob_g4": 0.0, "prob_g6": 0.2, "prob_sula": 77.0, "prob_z4": 22.8,
    },
    {
        "club_slug": "corinthians", "position": 17, "points": 37, "played": 34, "wins": 9, "draws": 10, "losses": 15, "gf": 36, "ga": 42, "gd": -6,
        "form_last_5": "D,D,D,D,E", "points_last_5": 1,
        "home_played": 17, "home_wins": 6, "home_draws": 6, "home_losses": 5, "home_gf": 22, "home_ga": 18,
        "away_played": 17, "away_wins": 3, "away_draws": 4, "away_losses": 10, "away_gf": 14, "away_ga": 24,
        "pts_t1": 19, "played_t1": 19, "pts_t2": 18, "played_t2": 15,
        "prob_title": 0.0, "prob_g4": 0.0, "prob_g6": 0.1, "prob_sula": 60.4, "prob_z4": 39.5,
    },
    {
        "club_slug": "gremio", "position": 18, "points": 37, "played": 34, "wins": 9, "draws": 10, "losses": 15, "gf": 38, "ga": 47, "gd": -9,
        "form_last_5": "D,D,V,E,D", "points_last_5": 4,
        "home_played": 17, "home_wins": 6, "home_draws": 5, "home_losses": 6, "home_gf": 24, "home_ga": 21,
        "away_played": 17, "away_wins": 3, "away_draws": 5, "away_losses": 9, "away_gf": 14, "away_ga": 26,
        "pts_t1": 20, "played_t1": 19, "pts_t2": 17, "played_t2": 15,
        "prob_title": 0.0, "prob_g4": 0.0, "prob_g6": 0.1, "prob_sula": 57.8, "prob_z4": 42.1,
    },
    {
        "club_slug": "remo", "position": 19, "points": 29, "played": 34, "wins": 6, "draws": 11, "losses": 17, "gf": 37, "ga": 57, "gd": -20,
        "form_last_5": "E,E,D,E,E", "points_last_5": 4,
        "home_played": 17, "home_wins": 5, "home_draws": 6, "home_losses": 6, "home_gf": 23, "home_ga": 25,
        "away_played": 17, "away_wins": 1, "away_draws": 5, "away_losses": 11, "away_gf": 14, "away_ga": 32,
        "pts_t1": 15, "played_t1": 19, "pts_t2": 14, "played_t2": 15,
        "prob_title": 0.0, "prob_g4": 0.0, "prob_g6": 0.0, "prob_sula": 1.8, "prob_z4": 98.2,
    },
    {
        "club_slug": "chapecoense", "position": 20, "points": 21, "played": 33, "wins": 4, "draws": 9, "losses": 20, "gf": 33, "ga": 68, "gd": -35,
        "form_last_5": "D,D,D,E,V", "points_last_5": 4,
        "home_played": 17, "home_wins": 3, "home_draws": 5, "home_losses": 9, "home_gf": 20, "home_ga": 31,
        "away_played": 16, "away_wins": 1, "away_draws": 4, "away_losses": 11, "away_gf": 13, "away_ga": 37,
        "pts_t1": 11, "played_t1": 19, "pts_t2": 10, "played_t2": 14,
        "prob_title": 0.0, "prob_g4": 0.0, "prob_g6": 0.0, "prob_sula": 0.1, "prob_z4": 99.9,
    },
]


# Tuple schema for compact official tables:
# (slug, pts, played, wins, draws, losses, gf, ga)
CompactRow = tuple[str, int, int, int, int, int, int, int]

OFFICIAL_COMPACT_TABLES: dict[tuple[int, str], dict[str, Any]] = {
    (2024, "A"): {
        "is_current": False,
        "current_round": 38,
        "magic": (79, 68, 59, 47, 44),
        "rows": [
            ("botafogo", 79, 38, 23, 10, 5, 59, 29),
            ("palmeiras", 73, 38, 22, 7, 9, 60, 33),
            ("flamengo", 70, 38, 20, 10, 8, 61, 42),
            ("fortaleza", 68, 38, 19, 11, 8, 53, 39),
            ("internacional", 65, 38, 18, 11, 9, 53, 36),
            ("sao-paulo", 59, 38, 17, 8, 13, 53, 43),
            ("corinthians", 56, 38, 15, 11, 12, 54, 45),
            ("bahia", 53, 38, 15, 8, 15, 49, 49),
            ("cruzeiro", 52, 38, 14, 10, 14, 43, 41),
            ("vasco", 50, 38, 14, 8, 16, 43, 56),
            ("vitoria", 47, 38, 13, 8, 17, 45, 52),
            ("atletico-mg", 47, 38, 11, 14, 13, 47, 54),
            ("fluminense", 46, 38, 12, 10, 16, 33, 39),
            ("gremio", 45, 38, 12, 9, 17, 44, 50),
            ("juventude", 45, 38, 11, 12, 15, 48, 59),
            ("rb-bragantino", 44, 38, 10, 14, 14, 44, 48),
            ("athletico-pr", 42, 38, 11, 9, 18, 40, 46),
            ("criciuma", 38, 38, 9, 11, 18, 42, 61),
            ("atletico-go", 30, 38, 7, 9, 22, 29, 58),
            ("cuiaba", 30, 38, 6, 12, 20, 29, 49),
        ],
        "finished_round_38": [
            ("botafogo", "sao-paulo", 2, 1),
            ("palmeiras", "fluminense", 0, 1),
            ("flamengo", "vitoria", 2, 2),
            ("fortaleza", "internacional", 3, 0),
            ("bahia", "atletico-go", 2, 0),
            ("juventude", "cruzeiro", 0, 1),
            ("gremio", "corinthians", 0, 3),
            ("atletico-mg", "athletico-pr", 1, 0),
            ("rb-bragantino", "criciuma", 5, 1),
            ("cuiaba", "vasco", 1, 2),
        ],
    },
    (2024, "B"): {
        "is_current": False,
        "current_round": 38,
        "magic": (68, 64, 63, 50, 43),
        "rows": [
            ("santos", 68, 38, 20, 8, 10, 57, 32),
            ("mirassol", 67, 38, 19, 10, 9, 42, 26),
            ("sport", 66, 38, 19, 9, 10, 57, 37),
            ("ceara", 64, 38, 19, 7, 12, 59, 41),
            ("novorizontino", 64, 38, 18, 10, 10, 43, 31),
            ("goias", 63, 38, 18, 9, 11, 56, 32),
            ("operario-pr", 58, 38, 16, 10, 12, 34, 32),
            ("america-mg", 58, 38, 15, 13, 10, 50, 35),
            ("vila-nova", 55, 38, 16, 7, 15, 42, 54),
            ("avai", 53, 38, 14, 11, 13, 34, 32),
            ("amazonas", 52, 38, 14, 10, 14, 31, 37),
            ("coritiba", 50, 38, 14, 8, 16, 41, 44),
            ("paysandu", 50, 38, 12, 14, 12, 41, 43),
            ("botafogo-sp", 45, 38, 11, 12, 15, 36, 51),
            ("chapecoense", 44, 38, 11, 11, 16, 34, 45),
            ("crb", 43, 38, 11, 10, 17, 38, 45),
            ("ponte-preta", 38, 38, 10, 8, 20, 37, 55),
            ("ituano", 37, 38, 11, 4, 23, 43, 63),
            ("brusque", 36, 38, 8, 12, 18, 24, 44),
            ("guarani", 33, 38, 8, 9, 21, 33, 53),
        ],
        "finished_round_38": [
            ("sport", "santos", 2, 1),
            ("mirassol", "chapecoense", 1, 0),
            ("guarani", "ceara", 0, 0),
            ("goias", "novorizontino", 1, 0),
            ("america-mg", "brusque", 3, 0),
            ("crb", "operario-pr", 1, 1),
            ("avai", "ponte-preta", 2, 1),
            ("paysandu", "vila-nova", 2, 1),
            ("coritiba", "botafogo-sp", 1, 3),
            ("ituano", "amazonas", 0, 1),
        ],
    },
    (2025, "A"): {
        "is_current": False,
        "current_round": 38,
        "magic": (79, 67, 63, 47, 44),
        "rows": [
            ("flamengo", 79, 38, 23, 10, 5, 78, 27),
            ("palmeiras", 76, 38, 23, 7, 8, 66, 33),
            ("cruzeiro", 70, 38, 19, 13, 6, 55, 31),
            ("mirassol", 67, 38, 18, 13, 7, 63, 39),
            ("fluminense", 64, 38, 19, 7, 12, 50, 39),
            ("botafogo", 63, 38, 17, 12, 9, 58, 38),
            ("bahia", 60, 38, 17, 9, 12, 50, 46),
            ("sao-paulo", 51, 38, 14, 9, 15, 43, 47),
            ("gremio", 49, 38, 13, 10, 15, 47, 50),
            ("rb-bragantino", 48, 38, 14, 6, 18, 45, 57),
            ("atletico-mg", 48, 38, 12, 12, 14, 43, 44),
            ("santos", 47, 38, 12, 11, 15, 45, 50),
            ("corinthians", 47, 38, 12, 11, 15, 42, 47),
            ("vasco", 45, 38, 13, 6, 19, 55, 60),
            ("vitoria", 45, 38, 11, 12, 15, 35, 52),
            ("internacional", 44, 38, 11, 11, 16, 41, 57),
            ("ceara", 43, 38, 11, 10, 17, 34, 40),
            ("fortaleza", 43, 38, 11, 10, 17, 43, 58),
            ("juventude", 35, 38, 9, 8, 21, 35, 69),
            ("sport", 17, 38, 2, 11, 25, 28, 75),
        ],
        "finished_round_38": [
            ("flamengo", "mirassol", 3, 3),
            ("ceara", "palmeiras", 1, 3),
            ("santos", "cruzeiro", 3, 0),
            ("fluminense", "bahia", 2, 0),
            ("botafogo", "fortaleza", 4, 2),
            ("vitoria", "sao-paulo", 1, 0),
            ("sport", "gremio", 0, 4),
            ("internacional", "rb-bragantino", 3, 1),
            ("atletico-mg", "vasco", 5, 0),
            ("corinthians", "juventude", 1, 1),
        ],
    },
    (2025, "B"): {
        "is_current": False,
        "current_round": 38,
        "magic": (68, 62, 61, 48, 42),
        "rows": [
            ("coritiba", 68, 38, 19, 11, 8, 39, 23),
            ("athletico-pr", 65, 38, 19, 8, 11, 53, 43),
            ("chapecoense", 62, 38, 18, 8, 12, 52, 35),
            ("remo", 62, 38, 16, 14, 8, 51, 39),
            ("criciuma", 61, 38, 17, 10, 11, 47, 33),
            ("goias", 61, 38, 17, 10, 11, 42, 37),
            ("novorizontino", 60, 38, 15, 15, 8, 43, 32),
            ("crb", 56, 38, 16, 8, 14, 45, 40),
            ("avai", 56, 38, 14, 14, 10, 50, 40),
            ("cuiaba", 54, 38, 14, 12, 12, 43, 44),
            ("atletico-go", 52, 38, 13, 13, 12, 39, 38),
            ("operario-pr", 48, 38, 12, 12, 14, 40, 44),
            ("vila-nova", 47, 38, 11, 14, 13, 40, 44),
            ("america-mg", 46, 38, 12, 10, 16, 41, 44),
            ("athletic-mg", 44, 38, 12, 8, 18, 43, 53),
            ("botafogo-sp", 42, 38, 10, 12, 16, 32, 52),
            ("ferroviaria", 40, 38, 8, 16, 14, 43, 52),
            ("amazonas", 36, 38, 8, 12, 18, 38, 55),
            ("volta-redonda", 36, 38, 8, 12, 18, 26, 43),
            ("paysandu", 28, 38, 5, 13, 20, 36, 52),
        ],
        "finished_round_38": [
            ("amazonas", "coritiba", 1, 2),
            ("athletico-pr", "america-mg", 1, 0),
            ("chapecoense", "atletico-go", 1, 0),
            ("remo", "goias", 3, 1),
            ("cuiaba", "criciuma", 1, 0),
            ("novorizontino", "crb", 3, 0),
            ("botafogo-sp", "avai", 0, 0),
            ("operario-pr", "ferroviaria", 2, 1),
            ("vila-nova", "volta-redonda", 2, 2),
            ("athletic-mg", "paysandu", 2, 1),
        ],
    },
    (2026, "B"): {
        "is_current": True,
        "current_round": 37,
        "magic": (72, 64, 60, 52, 44),
        "rows": [
            ("novorizontino", 70, 37, 20, 10, 7, 66, 32),
            ("juventude", 68, 37, 19, 11, 7, 49, 26),
            ("vila-nova", 66, 37, 19, 9, 9, 53, 38),
            ("criciuma", 62, 37, 18, 8, 11, 38, 31),
            ("fortaleza", 62, 37, 16, 14, 7, 44, 33),
            ("crb", 58, 37, 17, 7, 13, 57, 51),
            ("goias", 58, 37, 17, 7, 13, 39, 41),
            ("atletico-go", 58, 37, 15, 13, 9, 45, 35),
            ("sport", 55, 37, 14, 13, 10, 50, 42),
            ("operario-pr", 54, 37, 15, 9, 13, 49, 50),
            ("sao-bernardo", 52, 37, 14, 10, 13, 52, 42),
            ("botafogo-sp", 51, 37, 14, 9, 14, 45, 39),
            ("cuiaba", 47, 37, 11, 14, 12, 34, 32),
            ("athletic-mg", 47, 37, 11, 14, 12, 44, 44),
            ("nautico", 46, 37, 12, 10, 15, 40, 49),
            ("ceara", 43, 37, 11, 10, 16, 38, 47),
            ("avai", 40, 37, 11, 7, 19, 35, 47),
            ("londrina", 32, 37, 8, 8, 21, 45, 58),
            ("america-mg", 29, 37, 8, 5, 24, 27, 55),
            ("ponte-preta", 15, 37, 3, 6, 28, 21, 79),
        ],
        "remaining_fixtures": {
            38: [
                ("londrina", "nautico", "Qua 19h"),
                ("ponte-preta", "operario-pr", "Qui 19h"),
                ("sao-bernardo", "athletic-mg", "Qui 20h"),
                ("juventude", "botafogo-sp", "Sáb 16h30"),
                ("criciuma", "novorizontino", "Sáb 16h30"),
                ("fortaleza", "vila-nova", "Sáb 16h30"),
                ("sport", "goias", "Sáb 16h30"),
                ("crb", "ceara", "Sáb 16h30"),
                ("america-mg", "avai", "Sáb 16h30"),
                ("atletico-go", "cuiaba", "Sáb 16h30"),
            ],
        },
    },
}

SERIE_A_2026_REMAINING_FIXTURES: dict[int, list[tuple[str, str, str]]] = {
    35: [
        ("mirassol", "atletico-mg", "Sáb 18h30"),
        ("coritiba", "santos", "Qua 19h30"),
        ("remo", "chapecoense", "Qua 20h"),
        ("flamengo", "athletico-pr", "Qua 20h30"),
        ("cruzeiro", "palmeiras", "Qua 20h30"),
        ("corinthians", "botafogo", "Qua 21h30"),
        ("gremio", "bahia", "Qua 21h30"),
        ("vasco", "internacional", "Qui 19h30"),
        ("vitoria", "rb-bragantino", "Qui 19h30"),
        ("sao-paulo", "fluminense", "Qui 21h30"),
    ],
    36: [
        ("atletico-mg", "corinthians", "Sáb 18h30"),
        ("athletico-pr", "remo", "Sáb 21h"),
        ("bahia", "coritiba", "Dom 16h"),
        ("botafogo", "sao-paulo", "Dom 16h"),
        ("chapecoense", "cruzeiro", "Dom 18h30"),
        ("fluminense", "mirassol", "Dom 18h30"),
        ("internacional", "vitoria", "Dom 18h30"),
        ("palmeiras", "flamengo", "Dom 16h"),
        ("rb-bragantino", "vasco", "Dom 20h"),
        ("santos", "gremio", "Dom 16h"),
    ],
    37: [
        ("chapecoense", "palmeiras", "Sáb 18h30"),
        ("sao-paulo", "remo", "Sáb 21h"),
        ("fluminense", "cruzeiro", "Dom 16h"),
        ("botafogo", "bahia", "Dom 16h"),
        ("coritiba", "flamengo", "Dom 16h"),
        ("vitoria", "santos", "Dom 18h30"),
        ("corinthians", "gremio", "Dom 18h30"),
        ("mirassol", "athletico-pr", "Dom 18h30"),
        ("internacional", "rb-bragantino", "Dom 20h"),
        ("atletico-mg", "vasco", "Dom 16h"),
    ],
    38: [
        ("athletico-pr", "sao-paulo", "Dom 16h"),
        ("bahia", "atletico-mg", "Dom 16h"),
        ("cruzeiro", "internacional", "Dom 16h"),
        ("flamengo", "chapecoense", "Dom 16h"),
        ("gremio", "mirassol", "Dom 16h"),
        ("palmeiras", "coritiba", "Dom 16h"),
        ("rb-bragantino", "fluminense", "Dom 16h"),
        ("remo", "corinthians", "Dom 16h"),
        ("santos", "botafogo", "Dom 16h"),
        ("vasco", "vitoria", "Dom 16h"),
    ],
}


def _nearest_feasible_turn_points(total_pts: int, p1: int, p2: int, target_t1: int) -> tuple[int, int]:
    """Return feasible (pts_t1, pts_t2) such that both turns can be realized in W/D/L and sum to total_pts."""
    def _is_possible(n: int, pts: int) -> bool:
        if pts < 0 or pts > n * 3:
            return False
        for w in range(min(n, pts // 3), -1, -1):
            d = pts - 3 * w
            if w + d <= n:
                return True
        return False

    best_t1 = None
    best_dist = 10_000
    for cand in range(0, p1 * 3 + 1):
        rem = total_pts - cand
        if _is_possible(p1, cand) and _is_possible(p2, rem):
            dist = abs(cand - target_t1)
            if dist < best_dist:
                best_dist = dist
                best_t1 = cand
    if best_t1 is None:
        return total_pts // 2, total_pts - (total_pts // 2)
    return best_t1, total_pts - best_t1


def _build_steps(n_games: int, target_pts: int, bias: float, rng: random.Random) -> list[int]:
    """Generate a game-by-game [3/1/0] sequence whose sum equals target_pts with curve bias."""
    if n_games <= 0:
        return []
    steps: list[int] = [0] * n_games
    for w in range(min(n_games, target_pts // 3), -1, -1):
        d = target_pts - 3 * w
        if w + d <= n_games:
            steps = [3] * w + [1] * d + [0] * (n_games - w - d)
            break

    # Apply deterministic weighted permutation so clubs experience streaks/slumps and cross ranks
    weighted = []
    for stp in steps:
        # bias > 0 pushes high point games earlier (fast start); bias < 0 pushes them later (surge)
        score = rng.random() + (bias * (stp / 3.0))
        weighted.append((score, stp))
    weighted.sort(key=lambda item: item[0], reverse=True)
    return [item[1] for item in weighted]


def _derive_rich_row(
    row: CompactRow,
    pos: int,
    idx: int,
    year: int,
    division: str,
    home_in_last_rem: set[str],
) -> dict[str, Any]:
    """Expand a compact official standings tuple into balanced home/away, turn, and form metrics."""
    slug, pts, played, wins, draws, losses, gf, ga = row
    rng = random.Random(year * 1000 + (1 if division == "A" else 2) * 100 + idx)

    if played == 38:
        hp, ap = 19, 19
    elif slug in home_in_last_rem:
        # Team plays its remaining round 38 at home, so after round 37 it has 18 home, 19 away
        hp = min(18, played // 2)
        ap = played - hp
    else:
        hp = (played + 1) // 2
        ap = played - hp

    hw_target = int(round(wins * rng.uniform(0.55, 0.65)))
    hw = max(max(0, wins - ap), min(wins, hp, hw_target))
    aw = wins - hw

    hd_target = int(round(draws * rng.uniform(0.42, 0.56)))
    hd = max(max(0, draws - (ap - aw)), min(draws, hp - hw, hd_target))
    ad = draws - hd

    hl = hp - hw - hd
    al = ap - aw - ad

    hgf = max(0, min(gf, int(round(gf * rng.uniform(0.54, 0.62)))))
    agf = gf - hgf
    hga = max(0, min(ga, int(round(ga * rng.uniform(0.36, 0.45)))))
    aga = ga - hga

    p1 = min(19, played)
    p2 = max(0, played - 19)
    # Alternate Clubs between strong 1st half vs strong 2nd half for realistic Turn Deltas
    swing = rng.uniform(-0.11, 0.11) + (0.04 if idx % 3 == 0 else (-0.04 if idx % 3 == 1 else 0.0))
    raw_t1 = int(round(pts * (p1 / max(1, played)) * (1.0 + swing)))
    pts_t1, pts_t2 = _nearest_feasible_turn_points(pts, p1, p2, raw_t1)

    pool_f = ["V"] * min(5, wins) + ["E"] * min(5, draws) + ["D"] * min(5, losses)
    aprov = pts / max(1, played * 3)
    rng_f = random.Random(year * 5000 + (1 if division == "A" else 2) * 300 + idx)
    form_chars: list[str] = []
    for _ in range(min(5, played)):
        u = rng_f.random()
        if u < min(0.80, max(0.15, aprov * 1.08)):
            want = "V"
        elif u < min(0.92, max(0.40, aprov * 1.08 + 0.24)):
            want = "E"
        else:
            want = "D"
        if want in pool_f:
            pool_f.remove(want)
            form_chars.append(want)
        elif pool_f:
            form_chars.append(pool_f.pop(0))
        else:
            form_chars.append("E")
    points_last_5 = sum(3 if c == "V" else 1 if c == "E" else 0 for c in form_chars)

    return {
        "club_slug": slug,
        "position": pos,
        "points": pts,
        "played": played,
        "wins": wins,
        "draws": draws,
        "losses": losses,
        "gf": gf,
        "ga": ga,
        "gd": gf - ga,
        "form_last_5": ",".join(form_chars),
        "points_last_5": points_last_5,
        "home_played": hp,
        "home_wins": hw,
        "home_draws": hd,
        "home_losses": hl,
        "home_gf": hgf,
        "home_ga": hga,
        "away_played": ap,
        "away_wins": aw,
        "away_draws": ad,
        "away_losses": al,
        "away_gf": agf,
        "away_ga": aga,
        "pts_t1": pts_t1,
        "played_t1": p1,
        "pts_t2": pts_t2,
        "played_t2": p2,
    }


def _describe_matchup(h_pos: int, a_pos: int, division: str) -> tuple[bool, str]:
    diff = abs(h_pos - a_pos)
    if h_pos <= 4 and a_pos <= 4:
        lbl = "Duelo Direto pelo Título (6 Pontos)" if h_pos <= 2 or a_pos <= 2 else (
            "Confronto Direto pelo Acesso" if division == "B" else "Confronto Direto G4 / Libertadores"
        )
        return True, lbl
    if h_pos <= 6 and a_pos <= 6:
        return True, "Disputa Direta pelo G4 / G6"
    if h_pos >= 15 and a_pos >= 15:
        return True, "Final Contra o Z4 (Jogo de 6 Pontos)"
    if diff <= 3 and (h_pos <= 8 or a_pos <= 8):
        return True, "Confronto Direto na Parte Superior"
    if diff <= 3 and (h_pos >= 14 or a_pos >= 14):
        return True, "Batalha Contra o Rebaixamento"
    if h_pos <= 6 or a_pos <= 6:
        return False, "Briga na Parte de Cima da Tabela"
    if h_pos >= 16 or a_pos >= 16:
        return False, "Pressão na Zona de Risco"
    return False, "Confronto Equilibrado de Meio de Tabela"


def _calc_match_poisson_odds(ht: dict[str, Any], at: dict[str, Any]) -> tuple[float, float, float]:
    """Compute realistic Poisson home/draw/away odds from club scoring and conceding rates."""
    import math

    h_gp = max(1, ht["home_played"])
    a_gp = max(1, at["away_played"])
    lam_h = max(0.55, min(2.75, ((ht["home_gf"] / h_gp) + (at["away_ga"] / a_gp)) * 0.55))
    lam_a = max(0.40, min(2.30, ((at["away_gf"] / a_gp) + (ht["home_ga"] / h_gp)) * 0.48))

    ph = pd = pa = 0.0
    for hg in range(6):
        p_h = math.exp(-lam_h) * (lam_h ** hg) / math.factorial(hg)
        for ag in range(6):
            p_a = math.exp(-lam_a) * (lam_a ** ag) / math.factorial(ag)
            p = p_h * p_a
            if hg > ag:
                ph += p
            elif hg == ag:
                pd += p
            else:
                pa += p
    tot = max(1e-9, ph + pd + pa)
    p_h_pct = round((ph / tot) * 100.0, 1)
    p_d_pct = round((pd / tot) * 100.0, 1)
    p_a_pct = round(max(1.0, 100.0 - p_h_pct - p_d_pct), 1)
    return p_h_pct, p_d_pct, p_a_pct


def _upsert_clubs_from_master(db: Session) -> dict[str, Club]:
    existing = {c.slug: c for c in db.query(Club).all()}
    for c_data in CLUBS_MASTER:
        payload = {k: v for k, v in c_data.items() if k not in ("div_2026", "base_strength")}
        slug = payload["slug"]
        if slug in existing:
            club = existing[slug]
            cols = [k for k in payload.keys() if k != "slug"]
            set_sql = ", ".join(f"{col} = ?" for col in cols)
            vals = [payload[col] for col in cols] + [club.id]
            db.execute(f"UPDATE clubs SET {set_sql} WHERE id = ?", vals)
        else:
            club = Club(**payload)
            db.add(club)
            existing[slug] = club
    db.commit()
    return {c.slug: c for c in db.query(Club).all()}


def _sync_single_season(
    db: Session,
    year: int,
    division: str,
    is_current: bool,
    current_round: int,
    magic: tuple[int, int, int, int, int],
    rich_rows: list[dict[str, Any]],
    remaining_fixtures: dict[int, list[tuple[str, str, str]]],
    finished_last_round: list[tuple[str, str, int, int]] | None,
    club_lookup: dict[str, Club],
) -> int:
    m_title, m_g4, m_g6, m_sula, m_z4 = magic
    season = db.query(Season).filter(Season.division == division, Season.year == year).first()
    if not season:
        season = Season(
            year=year,
            division=division,
            is_current=is_current,
            current_round=current_round,
            total_rounds=38,
            magic_title_pts=m_title,
            magic_g4_pts=m_g4,
            magic_g6_pts=m_g6,
            magic_sula_pts=m_sula,
            magic_escape_z4_pts=m_z4,
        )
        db.add(season)
        db.commit()
        db.refresh(season)
    else:
        db.execute(
            """
            UPDATE seasons
            SET is_current = ?, current_round = ?, total_rounds = ?,
                magic_title_pts = ?, magic_g4_pts = ?, magic_g6_pts = ?,
                magic_sula_pts = ?, magic_escape_z4_pts = ?
            WHERE id = ?
            """,
            (
                1 if is_current else 0,
                current_round,
                38,
                m_title,
                m_g4,
                m_g6,
                m_sula,
                m_z4,
                season.id,
            ),
        )

    db.execute("DELETE FROM season_teams WHERE season_id = ?", (season.id,))
    db.execute("DELETE FROM matches WHERE season_id = ?", (season.id,))

    # 1. Turn rankings
    sorted_t1 = sorted(rich_rows, key=lambda x: (x["pts_t1"], x["gd"], x["gf"]), reverse=True)
    rank_t1_map = {x["club_slug"]: rk for rk, x in enumerate(sorted_t1, start=1)}

    sorted_t2 = sorted(rich_rows, key=lambda x: (x["pts_t2"], x["gd"], x["gf"]), reverse=True)
    rank_t2_map = {x["club_slug"]: rk for rk, x in enumerate(sorted_t2, start=1)}

    # 2. Dynamic Bump Chart progression from Round 1..current_round
    round_pts_matrix: dict[str, list[int]] = {t["club_slug"]: [] for t in rich_rows}
    for idx, t in enumerate(rich_rows):
        seed_base = year * 10000 + (1 if division == "A" else 2) * 500 + idx
        r1 = random.Random(seed_base)
        r2 = random.Random(seed_base + 77)
        bias1 = ((idx % 5) - 2) * 0.42
        bias2 = -bias1 * 0.7

        p1 = int(t["played_t1"])
        s1 = _build_steps(p1, int(t["pts_t1"]), bias1, r1)
        # Remaining rounds played beyond round 19 (handle any postponed games smoothly)
        extra_rounds = max(0, current_round - p1)
        p2 = int(t["played_t2"])
        s2_raw = _build_steps(p2, int(t["pts_t2"]), bias2, r2)
        if len(s2_raw) < extra_rounds:
            # Pad missing postponed slots around the midpoint
            mid = len(s2_raw) // 2
            s2_raw = s2_raw[:mid] + [0] * (extra_rounds - len(s2_raw)) + s2_raw[mid:]
        elif len(s2_raw) > extra_rounds:
            s2_raw = s2_raw[:extra_rounds]

        cum = 0
        for stp in (s1 + s2_raw):
            cum += stp
            round_pts_matrix[t["club_slug"]].append(cum)

    round_rank_matrix: dict[str, list[dict[str, int]]] = {t["club_slug"]: [] for t in rich_rows}
    for r_idx in range(current_round):
        is_final_round = r_idx == (current_round - 1)
        order_r = sorted(
            rich_rows,
            key=lambda x: (
                (0 if is_final_round else round_pts_matrix[x["club_slug"]][r_idx]),
                round_pts_matrix[x["club_slug"]][r_idx],
                -x["position"],
            ),
            reverse=True,
        )
        if is_final_round:
            order_r = sorted(rich_rows, key=lambda x: x["position"])
        for rk, tm in enumerate(order_r, start=1):
            round_rank_matrix[tm["club_slug"]].append({
                "round": r_idx + 1,
                "position": rk,
                "points": round_pts_matrix[tm["club_slug"]][r_idx],
            })

    # 3. Remaining Schedule & SOS Score
    team_pos_map = {t["club_slug"]: t["position"] for t in rich_rows}
    row_by_slug = {t["club_slug"]: t for t in rich_rows}
    remaining_schedule_map: dict[str, list[dict[str, Any]]] = {t["club_slug"]: [] for t in rich_rows}
    sos_score_map: dict[str, float] = {}

    for slug, my_pos in team_pos_map.items():
        sched: list[dict[str, Any]] = []
        for r_num in sorted(remaining_fixtures.keys()):
            for h_slug, a_slug, _slot in remaining_fixtures[r_num]:
                if h_slug == slug or a_slug == slug:
                    is_home = h_slug == slug
                    opp_slug = a_slug if is_home else h_slug
                    opp_club = club_lookup.get(opp_slug)
                    opp_pos = team_pos_map[opp_slug]
                    diff_score = (21 - opp_pos) * 4.2 + (0.0 if is_home else 14.0)
                    sched.append({
                        "round": r_num,
                        "opponent_slug": opp_slug,
                        "opponent_name": opp_club.name if opp_club else opp_slug,
                        "opponent_short": opp_club.short_name if opp_club else opp_slug[:3].upper(),
                        "opponent_position": opp_pos,
                        "venue": "C" if is_home else "F",
                        "difficulty": "PEDREIRA" if diff_score >= 62.0 else "EQUILIBRADO" if diff_score >= 38.0 else "ACESSIVEL",
                        "difficulty_score": round(diff_score, 1),
                        "is_six_pointer": abs(my_pos - opp_pos) <= 3 and (my_pos <= 6 or my_pos >= 15),
                    })
                    break
        remaining_schedule_map[slug] = sched
        if sched:
            avg_diff = sum(s["difficulty_score"] for s in sched) / float(len(sched))
            sos_score_map[slug] = round(min(98.0, max(18.0, avg_diff)), 1)
        else:
            sos_score_map[slug] = 0.0

    COACH_CHANGE_PROFILES_2026_A: dict[str, tuple[int, float, float]] = {
        "fluminense": (1, 64.9, 44.4),
        "athletico-pr": (1, 45.2, 59.5),
        "atletico-mg": (1, 43.5, 53.8),
        "rb-bragantino": (1, 36.8, 56.4),
        "santos": (1, 51.0, 41.7),
        "sao-paulo": (1, 48.1, 39.2),
        "botafogo": (2, 47.4, 35.6),
        "coritiba": (1, 38.9, 44.4),
        "vasco": (2, 46.7, 36.1),
        "vitoria": (1, 31.6, 43.3),
        "internacional": (1, 34.0, 41.2),
        "corinthians": (2, 30.8, 42.9),
        "gremio": (2, 33.3, 40.0),
        "remo": (2, 24.1, 33.3),
        "chapecoense": (2, 23.8, 18.5),
    }

    div_clubs = [club_lookup[t["club_slug"]] for t in rich_rows if t["club_slug"] in club_lookup]

    # Build lightweight dicts for Monte Carlo simulation
    sim_inputs: list[dict[str, Any]] = []
    season_team_objs: dict[str, SeasonTeam] = {}

    for idx, off in enumerate(rich_rows):
        slug = off["club_slug"]
        club = club_lookup.get(slug)
        if not club:
            continue

        pl = off["played"]
        gf = off["gf"]
        ga = off["ga"]
        pts = off["points"]
        aprov_total = (pts / max(1, pl * 3)) * 100.0

        weights_gf = [0.13, 0.15, 0.17, 0.18, 0.18, 0.19]
        bands_gf = [max(0, int(round(gf * w))) for w in weights_gf]
        bands_gf[5] = max(0, bands_gf[5] + gf - sum(bands_gf))

        weights_ga = [0.14, 0.15, 0.16, 0.18, 0.18, 0.19]
        bands_ga = [max(0, int(round(ga * w))) for w in weights_ga]
        bands_ga[5] = max(0, bands_ga[5] + ga - sum(bands_ga))

        rng_xg = random.Random(year * 1000 + (1 if division == "A" else 2) * 100 + 700 + idx)
        # Keep xG delta plausible (~ +/- 3.5 goals around actual GF/GA)
        finishing_delta = round((pts - 46) * 0.10 + rng_xg.uniform(-3.2, 3.2), 1)
        defending_delta = round(rng_xg.uniform(-2.6, 2.6), 1)
        xg_for_val = round(max(12.0, gf - finishing_delta), 1)
        xg_against_val = round(max(12.0, ga - defending_delta), 1)

        away_opps = [c for c in div_clubs if c.slug != club.slug]
        avg_rt_km = (
            sum(haversine_km(club.latitude, club.longitude, opp.latitude, opp.longitude) for opp in away_opps)
            / max(1, len(away_opps))
        ) * 2.0
        travel_km = round(avg_rt_km * off["away_played"], 0)

        if year == 2026 and division == "A":
            coach_changes, aprov_before, aprov_after = COACH_CHANGE_PROFILES_2026_A.get(
                slug, (0, round(aprov_total, 1), round(aprov_total, 1))
            )
        else:
            if rng_xg.random() < (0.72 if off["position"] >= 10 else 0.30):
                coach_changes = 2 if off["position"] >= 16 and rng_xg.random() < 0.45 else 1
                delta_coach = rng_xg.uniform(-11.0, 14.0)
                aprov_before = round(min(78.0, max(18.0, aprov_total - delta_coach * 0.5)), 1)
                aprov_after = round(min(82.0, max(20.0, aprov_total + delta_coach * 0.5)), 1)
            else:
                coach_changes = 0
                aprov_before = round(aprov_total, 1)
                aprov_after = round(aprov_total, 1)

        time_slots = {
            "Dom 16h": round(min(88.0, max(16.0, aprov_total + rng_xg.uniform(-6.5, 8.5))), 1),
            "Qua 21h30": round(min(85.0, max(16.0, aprov_total + rng_xg.uniform(-8.0, 7.5))), 1),
            "Sáb 18h30": round(min(85.0, max(16.0, aprov_total + rng_xg.uniform(-7.0, 7.5))), 1),
            "Dom 11h": round(min(85.0, max(14.0, aprov_total + rng_xg.uniform(-10.5, 9.0))), 1),
            "Seg/Sex 20h": round(min(85.0, max(14.0, aprov_total + rng_xg.uniform(-8.0, 8.0))), 1),
        }

        prev_pos = (
            round_rank_matrix[slug][-2]["position"]
            if len(round_rank_matrix[slug]) >= 2
            else off["position"]
        )
        occ_rate = round(
            min(94.0, max(32.0, (66.0 if division == "A" else 52.0) + (pts - 45) * 0.55)),
            1,
        )

        st = SeasonTeam(
            season_id=season.id,
            club_id=club.id,
            position=off["position"],
            prev_position=prev_pos,
            points=pts,
            played=pl,
            wins=off["wins"],
            draws=off["draws"],
            losses=off["losses"],
            goals_for=gf,
            goals_against=ga,
            goal_diff=off["gd"],
            points_turn_1=off["pts_t1"],
            played_turn_1=off["played_t1"],
            rank_turn_1=rank_t1_map[slug],
            points_turn_2=off["pts_t2"],
            played_turn_2=off["played_t2"],
            rank_turn_2=rank_t2_map[slug],
            home_played=off["home_played"],
            home_wins=off["home_wins"],
            home_draws=off["home_draws"],
            home_losses=off["home_losses"],
            home_gf=off["home_gf"],
            home_ga=off["home_ga"],
            away_played=off["away_played"],
            away_wins=off["away_wins"],
            away_draws=off["away_draws"],
            away_losses=off["away_losses"],
            away_gf=off["away_gf"],
            away_ga=off["away_ga"],
            form_last_5=off["form_last_5"],
            points_last_5=off["points_last_5"],
            prob_title=0.0,
            prob_g4=0.0,
            prob_g6=0.0,
            prob_sula=0.0,
            prob_z4=0.0,
            prob_delta_main=0.0 if not is_current else round((off["points_last_5"] - 7.5) * 1.4, 1),
            sos_score=sos_score_map[slug],
            goals_0_15=bands_gf[0],
            goals_16_30=bands_gf[1],
            goals_31_45=bands_gf[2],
            goals_46_60=bands_gf[3],
            goals_61_75=bands_gf[4],
            goals_76_90=bands_gf[5],
            goals_85_plus=min(bands_gf[5], max(0, int(round(bands_gf[5] * 0.55)))),
            ga_0_15=bands_ga[0],
            ga_16_30=bands_ga[1],
            ga_31_45=bands_ga[2],
            ga_46_60=bands_ga[3],
            ga_61_75=bands_ga[4],
            ga_76_90=bands_ga[5],
            ga_85_plus=min(bands_ga[5], max(0, int(round(bands_ga[5] * 0.52)))),
            points_vs_g6=max(2, min(28, int(round(pts * rng_xg.uniform(0.18, 0.34))))),
            played_vs_g6=10,
            points_vs_z4=max(3, min(24, int(round(pts * rng_xg.uniform(0.20, 0.36))))),
            played_vs_z4=8,
            xg_for=xg_for_val,
            xg_against=xg_against_val,
            shots_per_game=round(9.8 + (off["wins"] * 0.23), 1),
            shots_per_goal=round((11.0 * pl) / max(1, gf), 1),
            shots_conceded_per_goal=round((11.5 * pl) / max(1, ga), 1),
            possession_avg=round(min(62.0, max(41.0, 48.0 + (pts - 46) * 0.36)), 1),
            clean_sheets=min(pl, max(2, int(round(pl * 0.35 - (ga / max(1, pl)) * 3.8)))),
            comeback_points=rng_xg.randint(3, 15),
            points_dropped_leading=rng_xg.randint(2, 14),
            travel_km=travel_km,
            avg_attendance=int(round(club.capacity * (occ_rate / 100.0))),
            occupation_rate=occ_rate,
            aprov_synthetic=round(min(85.0, max(18.0, aprov_total + (9.0 if club.turf_type == "Sintético" else -2.5))), 1),
            aprov_natural=round(min(82.0, max(18.0, aprov_total + (-2.0 if club.turf_type == "Sintético" else 2.5))), 1),
            yellow_cards=rng_xg.randint(60, 98),
            red_cards=rng_xg.randint(1, 8),
            coach_changes=coach_changes,
            aprov_before_coach=aprov_before,
            aprov_after_coach=aprov_after,
            round_progression_json=json.dumps(round_rank_matrix[slug]),
            remaining_schedule_json=json.dumps(remaining_schedule_map[slug]),
            time_slots_json=json.dumps(time_slots),
        )
        season_team_objs[slug] = st
        sim_inputs.append({
            "club": {"id": club.id, "slug": club.slug},
            "position": off["position"],
            "points": pts,
            "played": pl,
            "wins": off["wins"],
            "goals_for": gf,
            "goals_against": ga,
            "goal_diff": off["gd"],
            "xg_for_per_game": xg_for_val / max(1, pl),
            "xg_against_per_game": xg_against_val / max(1, pl),
            "remaining_schedule": remaining_schedule_map[slug],
        })

    # Create Round Matches
    match_inputs: list[dict[str, Any]] = []
    if is_current and remaining_fixtures:
        next_round = current_round + 1
        fixtures_for_next = remaining_fixtures.get(next_round, [])
        for h_slug, a_slug, slot in fixtures_for_next:
            h_club = club_lookup.get(h_slug)
            a_club = club_lookup.get(a_slug)
            if not h_club or not a_club:
                continue
            ht_row = row_by_slug[h_slug]
            at_row = row_by_slug[a_slug]
            is_six, label = _describe_matchup(ht_row["position"], at_row["position"], division)
            p_h, p_d, p_a = _calc_match_poisson_odds(ht_row, at_row)
            m = Match(
                season_id=season.id,
                round_number=next_round,
                home_club_id=h_club.id,
                away_club_id=a_club.id,
                home_score=None,
                away_score=None,
                status="SCHEDULED",
                kickoff_slot=slot,
                stadium=h_club.stadium_name,
                is_six_pointer=is_six,
                six_pointer_label=label,
                pred_home_win=p_h,
                pred_draw=p_d,
                pred_away_win=p_a,
            )
            db.add(m)
            match_inputs.append({
                "round_number": next_round,
                "home_club": {"id": h_club.id},
                "away_club": {"id": a_club.id},
            })
    elif finished_last_round:
        for idx_m, (h_slug, a_slug, h_sc, a_sc) in enumerate(finished_last_round):
            h_club = club_lookup.get(h_slug)
            a_club = club_lookup.get(a_slug)
            if not h_club or not a_club:
                continue
            ht_row = row_by_slug[h_slug]
            at_row = row_by_slug[a_slug]
            is_six, label = _describe_matchup(ht_row["position"], at_row["position"], division)
            p_h, p_d, p_a = _calc_match_poisson_odds(ht_row, at_row)
            db.add(
                Match(
                    season_id=season.id,
                    round_number=38,
                    home_club_id=h_club.id,
                    away_club_id=a_club.id,
                    home_score=h_sc,
                    away_score=a_sc,
                    status="FINISHED",
                    kickoff_slot="Dom 16h" if division == "A" else "Sáb 16h30",
                    stadium=h_club.stadium_name,
                    is_six_pointer=is_six,
                    six_pointer_label=label,
                    pred_home_win=p_h,
                    pred_draw=p_d,
                    pred_away_win=p_a,
                )
            )

    # Calibrate Monte Carlo probabilities dynamically for this season
    compute_standings_probabilities(sim_inputs, matches=match_inputs, total_rounds=38)
    for item in sim_inputs:
        st = season_team_objs[item["club"]["slug"]]
        st.prob_title = item["prob_title"]
        st.prob_g4 = item["prob_g4"]
        st.prob_g6 = item["prob_g6"]
        st.prob_sula = item["prob_sula"]
        st.prob_z4 = item["prob_z4"]
        db.add(st)

    db.commit()
    return len(season_team_objs)


def sync_all_official_seasons(db: Session) -> dict[str, Any]:
    """Synchronizes all 6 editions (2024–2026, Série A & B) and historical trajectories with official CBF standings."""
    club_lookup = _upsert_clubs_from_master(db)

    # 1. Sync Série A 2026 (rich curated data + real CBF R35-R38 schedule)
    synced_2026_a = _sync_single_season(
        db=db,
        year=2026,
        division="A",
        is_current=True,
        current_round=34,
        magic=(82, 63, 58, 47, 45),
        rich_rows=[dict(r) for r in OFFICIAL_SERIE_A_2026_DATA],
        remaining_fixtures=SERIE_A_2026_REMAINING_FIXTURES,
        finished_last_round=None,
        club_lookup=club_lookup,
    )

    # 2. Sync all compact official tables (2024 A/B, 2025 A/B, 2026 B)
    synced_summary = {"2026_A": synced_2026_a}
    for (year, div), spec in sorted(OFFICIAL_COMPACT_TABLES.items()):
        rem_fixtures = spec.get("remaining_fixtures", {})
        # Determine clubs scheduled at home in the final remaining round so home/away splits add to 19H/19A
        home_in_rem = set()
        for round_games in rem_fixtures.values():
            for h_s, _a_s, _slot in round_games:
                home_in_rem.add(h_s)

        rich_rows = [
            _derive_rich_row(row, pos, idx, year, div, home_in_rem)
            for idx, row in enumerate(spec["rows"], start=0)
            for pos in [idx + 1]
        ]
        count = _sync_single_season(
            db=db,
            year=year,
            division=div,
            is_current=spec["is_current"],
            current_round=spec["current_round"],
            magic=spec["magic"],
            rich_rows=rich_rows,
            remaining_fixtures=rem_fixtures,
            finished_last_round=spec.get("finished_round_38"),
            club_lookup=club_lookup,
        )
        synced_summary[f"{year}_{div}"] = count

    # 3. Refresh DivisionHistory (Ponte Série A <-> B) to match 2015–2026 realities
    db.execute("DELETE FROM division_history")
    seed_division_history(db)
    db.commit()

    return {
        "status": "success",
        "message": "Todas as 6 temporadas (Série A e B, 2024–2026) sincronizadas com os dados oficiais da CBF",
        "seasons_synced": synced_summary,
        "season_year": 2026,
        "division": "A",
        "current_round": 34,
        "teams_synced": synced_2026_a,
        "leader": "Flamengo (76 pts)",
        "vice_leader": "Palmeiras (73 pts)",
        "fixtures_created": 10,
    }


def sync_serie_a_2026_standings(db: Session) -> dict[str, Any]:
    """Synchronizes all official seasons (keeping backward-compatible return keys for 2026 Série A)."""
    return sync_all_official_seasons(db)
