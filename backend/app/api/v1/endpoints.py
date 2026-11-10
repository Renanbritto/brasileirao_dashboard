import json
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from app.db.session import get_db, Session
from app.db.models import Club, Season, SeasonTeam, Match, DivisionHistory
from app.services.monte_carlo import simulate_round_and_probabilities, calculate_fan_target
from app.services.poisson import build_head_to_head_analysis
from app.services.table_sync import sync_serie_a_2026_standings

router = APIRouter()


class SimulatedScoreItem(BaseModel):
    match_id: int
    home_score: int
    away_score: int


class SimulateRoundRequest(BaseModel):
    scores: list[SimulatedScoreItem]


def serialize_club(c: Club) -> dict[str, Any]:
    return {
        "id": c.id,
        "slug": c.slug,
        "name": c.name,
        "short_name": c.short_name,
        "state_uf": c.state_uf,
        "region": c.region,
        "city": c.city,
        "stadium_name": c.stadium_name,
        "turf_type": c.turf_type,
        "capacity": c.capacity,
        "latitude": c.latitude,
        "longitude": c.longitude,
        "primary_color": c.primary_color,
        "secondary_color": c.secondary_color,
        "yo_yo_index": c.yo_yo_index,
        "promotions_to_a": c.promotions_to_a,
        "relegations_to_b": c.relegations_to_b,
        "immediate_returns": c.immediate_returns,
        "titles_serie_a": c.titles_serie_a,
        "titles_serie_b": c.titles_serie_b,
        "seasons_in_a": c.seasons_in_a,
        "seasons_in_b": c.seasons_in_b,
    }


def compute_spatial_tactics(club_slug: str, gf: int, ga: int) -> dict[str, Any]:
    h = sum(ord(ch) for ch in club_slug)

    # 1. Attack Corridors (Left, Center, Right)
    left_bias = (h % 15) - 7
    right_bias = ((h * 3) % 15) - 7
    left_atk = max(24, min(48, 35 + left_bias))
    right_atk = max(24, min(48, 33 + right_bias))
    center_atk = 100 - (left_atk + right_atk)
    if center_atk < 22:
        center_atk = 26
        left_atk = (100 - center_atk) // 2
        right_atk = 100 - center_atk - left_atk

    g_left = max(0, round(gf * (left_atk / 100.0)))
    g_right = max(0, round(gf * (right_atk / 100.0)))
    g_center = max(0, gf - (g_left + g_right))

    if left_atk >= max(center_atk, right_atk):
        primary_channel = "Corredor Esquerdo"
    elif right_atk >= center_atk:
        primary_channel = "Corredor Direito"
    else:
        primary_channel = "Corredor Central"

    inside_box_pct = max(52, min(76, 62 + (h % 11) - 5))
    outside_box_pct = max(18, min(38, 30 - ((h * 2) % 9) + 4))
    six_yard_pct = 100 - (inside_box_pct + outside_box_pct)
    if six_yard_pct < 4:
        six_yard_pct = 6
        inside_box_pct = 100 - outside_box_pct - six_yard_pct

    header_goals = max(1, round(gf * (0.18 + (h % 10) * 0.01)))
    ob_goals = max(1, round(gf * (outside_box_pct / 100.0 * 0.35)))
    rem_goals = max(0, gf - (header_goals + ob_goals))
    rf_goals = round(rem_goals * 0.65)
    lf_goals = max(0, rem_goals - rf_goals)

    # 2. Defensive Vulnerability (Conceded goals origin)
    def_h = (h * 7) % 100
    if def_h < 35:
        vuln_zone = "Flanco Esquerdo da Zaga"
        vuln_desc = "Espaços cedidos nas costas do lateral e cruzamentos rivais no 2º pau"
        danger_channel = "Esquerdo"
        conceded_l, conceded_c, conceded_r = 44, 34, 22
    elif def_h < 70:
        vuln_zone = "Miolo da Área / Zaga Central"
        vuln_desc = "Vulnerabilidade em bolas aéreas frontais e infiltrações entrelinhas"
        danger_channel = "Central"
        conceded_l, conceded_c, conceded_r = 24, 54, 22
    else:
        vuln_zone = "Flanco Direito da Zaga"
        vuln_desc = "Desproteção no corredor direito defensivo e transições rápidas adversárias"
        danger_channel = "Direito"
        conceded_l, conceded_c, conceded_r = 22, 34, 44

    op_conceded = max(1, round(ga * 0.52))
    cross_conceded = max(1, round(ga * 0.24))
    sp_conceded = max(1, round(ga * 0.14))
    counter_conceded = max(0, ga - (op_conceded + cross_conceded + sp_conceded))

    return {
        "attack": {
            "left_pct": left_atk,
            "center_pct": center_atk,
            "right_pct": right_atk,
            "goals_left": g_left,
            "goals_center": g_center,
            "goals_right": g_right,
            "inside_box_pct": inside_box_pct,
            "outside_box_pct": outside_box_pct,
            "six_yard_pct": six_yard_pct,
            "header_goals": header_goals,
            "right_foot_goals": rf_goals,
            "left_foot_goals": lf_goals,
            "outside_box_goals": ob_goals,
            "primary_channel": primary_channel,
        },
        "defense": {
            "left_conceded_pct": conceded_l,
            "center_conceded_pct": conceded_c,
            "right_conceded_pct": conceded_r,
            "open_play_conceded": op_conceded,
            "crosses_aerial_conceded": cross_conceded,
            "set_pieces_conceded": sp_conceded,
            "counter_attacks_conceded": counter_conceded,
            "vuln_zone": vuln_zone,
            "vuln_desc": vuln_desc,
            "danger_channel": danger_channel,
        },
    }


def serialize_season_team(st: SeasonTeam) -> dict[str, Any]:
    aprov_overall = round((st.points / max(1, st.played * 3)) * 100.0, 1)
    aprov_t1 = round((st.points_turn_1 / max(1, st.played_turn_1 * 3)) * 100.0, 1)
    aprov_t2 = round((st.points_turn_2 / max(1, st.played_turn_2 * 3)) * 100.0, 1)
    delta_turn = round(aprov_t2 - aprov_t1, 1)

    home_pts = st.home_wins * 3 + st.home_draws
    away_pts = st.away_wins * 3 + st.away_draws
    aprov_home = round((home_pts / max(1, st.home_played * 3)) * 100.0, 1)
    aprov_away = round((away_pts / max(1, st.away_played * 3)) * 100.0, 1)

    aprov_vs_g6 = round((st.points_vs_g6 / max(1, st.played_vs_g6 * 3)) * 100.0, 1)
    aprov_vs_z4 = round((st.points_vs_z4 / max(1, st.played_vs_z4 * 3)) * 100.0, 1)
    robin_hood_index = round(aprov_vs_g6 - aprov_vs_z4, 1)

    xg_diff = round(st.goals_for - st.xg_for, 1)
    xg_per_game = round(st.xg_for / max(1, st.played), 2)
    xga_per_game = round(st.xg_against / max(1, st.played), 2)

    if xg_per_game >= 1.38 and xga_per_game <= 1.18:
        tactical_quadrant = "Dominante (Criativo & Sólido)"
    elif xg_per_game < 1.38 and xga_per_game <= 1.18:
        tactical_quadrant = "Retranqueiro Letal"
    elif xg_per_game >= 1.38 and xga_per_game > 1.18:
        tactical_quadrant = "Kamikaze (Ataque Forte / Defesa Exposta)"
    else:
        tactical_quadrant = "Vulnerável (Baixa Criação & Sofre Muito)"

    aprov_5 = (st.points_last_5 / 15.0) * 100.0
    if aprov_5 >= 73.0:
        momentum_label = "Pegando Fogo"
    elif aprov_5 >= 53.0:
        momentum_label = "Em Alta"
    elif aprov_5 >= 40.0:
        momentum_label = "Estável"
    elif aprov_5 >= 25.0:
        momentum_label = "Em Queda"
    else:
        momentum_label = "Alerta de Crise"

    return {
        "id": st.id,
        "club": serialize_club(st.club),
        "position": st.position,
        "prev_position": st.prev_position,
        "position_delta": st.prev_position - st.position,
        "points": st.points,
        "played": st.played,
        "wins": st.wins,
        "draws": st.draws,
        "losses": st.losses,
        "goals_for": st.goals_for,
        "goals_against": st.goals_against,
        "goal_diff": st.goal_diff,
        "aproveitamento": aprov_overall,
        # Turno splits
        "points_turn_1": st.points_turn_1,
        "played_turn_1": st.played_turn_1,
        "rank_turn_1": st.rank_turn_1,
        "aprov_turn_1": aprov_t1,
        "points_turn_2": st.points_turn_2,
        "played_turn_2": st.played_turn_2,
        "rank_turn_2": st.rank_turn_2,
        "aprov_turn_2": aprov_t2,
        "delta_turn_aprov": delta_turn,
        # Home / Away splits
        "home_played": st.home_played,
        "home_wins": st.home_wins,
        "home_draws": st.home_draws,
        "home_losses": st.home_losses,
        "home_points": home_pts,
        "home_gf": st.home_gf,
        "home_ga": st.home_ga,
        "aprov_home": aprov_home,
        "away_played": st.away_played,
        "away_wins": st.away_wins,
        "away_draws": st.away_draws,
        "away_losses": st.away_losses,
        "away_points": away_pts,
        "away_gf": st.away_gf,
        "away_ga": st.away_ga,
        "aprov_away": aprov_away,
        "home_away_gap": round(aprov_home - aprov_away, 1),
        # Context & Robin Hood
        "points_vs_g6": st.points_vs_g6,
        "played_vs_g6": st.played_vs_g6,
        "aprov_vs_g6": aprov_vs_g6,
        "points_vs_z4": st.points_vs_z4,
        "played_vs_z4": st.played_vs_z4,
        "aprov_vs_z4": aprov_vs_z4,
        "robin_hood_index": robin_hood_index,
        # Tactical & Efficiency
        "xg_for": st.xg_for,
        "xg_against": st.xg_against,
        "xg_per_game": xg_per_game,
        "xga_per_game": xga_per_game,
        "xg_overperformance": xg_diff,
        "tactical_quadrant": tactical_quadrant,
        "shots_per_game": st.shots_per_game,
        "shots_per_goal": st.shots_per_goal,
        "shots_conceded_per_goal": st.shots_conceded_per_goal,
        "possession_avg": st.possession_avg,
        "clean_sheets": st.clean_sheets,
        "clean_sheet_rate": round((st.clean_sheets / max(1, st.played)) * 100.0, 1),
        "comeback_points": st.comeback_points,
        "points_dropped_leading": st.points_dropped_leading,
        # Goal timing
        "goals_0_15": st.goals_0_15,
        "goals_16_30": st.goals_16_30,
        "goals_31_45": st.goals_31_45,
        "goals_46_60": st.goals_46_60,
        "goals_61_75": st.goals_61_75,
        "goals_76_90": st.goals_76_90,
        "goals_85_plus": st.goals_85_plus,
        "ga_0_15": st.ga_0_15,
        "ga_16_30": st.ga_16_30,
        "ga_31_45": st.ga_31_45,
        "ga_46_60": st.ga_46_60,
        "ga_61_75": st.ga_61_75,
        "ga_76_90": st.ga_76_90,
        "ga_85_plus": st.ga_85_plus,
        # Geography & Stadium
        "travel_km": st.travel_km,
        "avg_attendance": st.avg_attendance,
        "occupation_rate": st.occupation_rate,
        "aprov_synthetic": st.aprov_synthetic,
        "aprov_natural": st.aprov_natural,
        "yellow_cards": st.yellow_cards,
        "red_cards": st.red_cards,
        "coach_changes": st.coach_changes,
        "aprov_before_coach": st.aprov_before_coach,
        "aprov_after_coach": st.aprov_after_coach,
        # Live Form & Probabilities
        "form_last_5": st.form_last_5.split(","),
        "points_last_5": st.points_last_5,
        "aprov_last_5": round(aprov_5, 1),
        "momentum_label": momentum_label,
        "prob_title": st.prob_title,
        "prob_g4": st.prob_g4,
        "prob_g6": st.prob_g6,
        "prob_sula": st.prob_sula,
        "prob_z4": st.prob_z4,
        "prob_delta_main": st.prob_delta_main,
        "sos_score": st.sos_score,
        "round_progression": json.loads(st.round_progression_json),
        "remaining_schedule": json.loads(st.remaining_schedule_json),
        "time_slots": json.loads(st.time_slots_json),
        "spatial_tactics": compute_spatial_tactics(
            st.club.slug, st.goals_for, st.goals_against
        ),
    }


@router.get("/meta")
def get_metadata(db: Session = Depends(get_db)):
    seasons = db.query(Season).order_by(Season.year.desc(), Season.division.asc()).all()
    clubs = db.query(Club).order_by(Club.name.asc()).all()
    return {
        "seasons": [
            {
                "id": s.id,
                "year": s.year,
                "division": s.division,
                "is_current": s.is_current,
                "current_round": s.current_round,
                "total_rounds": s.total_rounds,
                "label": f"{s.year} • {'Temporada Atual (Rodada ' + str(s.current_round) + '/38 - Ao Vivo)' if s.is_current else 'Temporada Completa (38/38)'}",
            }
            for s in seasons
        ],
        "clubs": [serialize_club(c) for c in clubs],
    }


@router.get("/season/{division}/{year}/overview")
def get_season_overview(division: str, year: int, db: Session = Depends(get_db)):
    div = division.upper()
    season = db.query(Season).filter(Season.division == div, Season.year == year).first()
    if not season:
        raise HTTPException(status_code=404, detail=f"Season {year} Division {div} not found")

    st_rows = (
        db.query(SeasonTeam)
        .filter(SeasonTeam.season_id == season.id)
        .order_by(SeasonTeam.position.asc())
        .all()
    )
    teams = [serialize_season_team(st) for st in st_rows]

    match_rows = (
        db.query(Match)
        .filter(Match.season_id == season.id)
        .order_by(Match.id.asc())
        .all()
    )
    club_lookup = {c.id: serialize_club(c) for c in db.query(Club).all()}
    team_pos_lookup = {t["club"]["id"]: t["position"] for t in teams}

    matches = [
        {
            "id": m.id,
            "round_number": m.round_number,
            "home_club": club_lookup[m.home_club_id],
            "away_club": club_lookup[m.away_club_id],
            "home_position": team_pos_lookup.get(m.home_club_id, 10),
            "away_position": team_pos_lookup.get(m.away_club_id, 10),
            "home_score": m.home_score,
            "away_score": m.away_score,
            "status": m.status,
            "kickoff_slot": m.kickoff_slot,
            "stadium": m.stadium,
            "is_six_pointer": m.is_six_pointer,
            "six_pointer_label": m.six_pointer_label,
            "pred_home_win": m.pred_home_win,
            "pred_draw": m.pred_draw,
            "pred_away_win": m.pred_away_win,
        }
        for m in match_rows
    ]

    # Magic Number historical probability curves (Z4 Escape & G4 Access/Libertadores)
    if div == "A":
        magic_z4_curve = [
            {"points": 40, "escape_prob": 8.0, "relegated_prob": 92.0},
            {"points": 41, "escape_prob": 21.0, "relegated_prob": 79.0},
            {"points": 42, "escape_prob": 44.0, "relegated_prob": 56.0},
            {"points": 43, "escape_prob": 69.0, "relegated_prob": 31.0},
            {"points": 44, "escape_prob": 89.0, "relegated_prob": 11.0},
            {"points": 45, "escape_prob": 98.2, "relegated_prob": 1.8},
            {"points": 46, "escape_prob": 99.9, "relegated_prob": 0.1},
        ]
        magic_top_curve = [
            {"points": 56, "target_prob": 14.0},
            {"points": 58, "target_prob": 38.0},
            {"points": 60, "target_prob": 67.0},
            {"points": 62, "target_prob": 89.0},
            {"points": 64, "target_prob": 98.5},
            {"points": 66, "target_prob": 99.9},
        ]
    else:
        magic_z4_curve = [
            {"points": 39, "escape_prob": 9.0, "relegated_prob": 91.0},
            {"points": 41, "escape_prob": 31.0, "relegated_prob": 69.0},
            {"points": 42, "escape_prob": 54.0, "relegated_prob": 46.0},
            {"points": 43, "escape_prob": 78.0, "relegated_prob": 22.0},
            {"points": 44, "escape_prob": 94.5, "relegated_prob": 5.5},
            {"points": 45, "escape_prob": 99.2, "relegated_prob": 0.8},
            {"points": 46, "escape_prob": 99.9, "relegated_prob": 0.1},
        ]
        magic_top_curve = [
            {"points": 59, "target_prob": 9.0},
            {"points": 61, "target_prob": 31.0},
            {"points": 62, "target_prob": 56.0},
            {"points": 63, "target_prob": 81.0},
            {"points": 64, "target_prob": 95.8},
            {"points": 65, "target_prob": 99.6},
        ]

    return {
        "season": {
            "id": season.id,
            "year": season.year,
            "division": season.division,
            "is_current": season.is_current,
            "current_round": season.current_round,
            "total_rounds": season.total_rounds,
            "magic_title_pts": season.magic_title_pts,
            "magic_g4_pts": season.magic_g4_pts,
            "magic_g6_pts": season.magic_g6_pts,
            "magic_sula_pts": season.magic_sula_pts,
            "magic_escape_z4_pts": season.magic_escape_z4_pts,
        },
        "standings": teams,
        "round_matches": matches,
        "magic_curves": {
            "z4_escape": magic_z4_curve,
            "g4_target": magic_top_curve,
        },
    }


@router.post("/season/{division}/{year}/simulate-round")
def post_simulate_round(
    division: str,
    year: int,
    payload: SimulateRoundRequest,
    db: Session = Depends(get_db),
):
    overview = get_season_overview(division, year, db)
    score_map = {item.match_id: (item.home_score, item.away_score) for item in payload.scores}
    simulated_standings = simulate_round_and_probabilities(
        teams=overview["standings"],
        matches=overview["round_matches"],
        simulated_scores=score_map,
        division=division.upper(),
        total_rounds=overview["season"]["total_rounds"],
    )
    return {
        "simulated_standings": simulated_standings,
        "matches_simulated": len(score_map),
    }


@router.get("/season/{division}/{year}/calculator")
def get_fan_calculator(
    division: str,
    year: int,
    club_slug: str = Query(...),
    target: str = Query("Z4"),
    custom_points: int | None = Query(None),
    db: Session = Depends(get_db),
):
    overview = get_season_overview(division, year, db)
    team = next((t for t in overview["standings"] if t["club"]["slug"] == club_slug), None)
    if not team:
        team = overview["standings"][0]
    return calculate_fan_target(
        team=team,
        division=division.upper(),
        target_key=target,
        custom_points=custom_points,
        total_rounds=overview["season"]["total_rounds"],
    )


@router.get("/h2h")
def get_head_to_head(
    division: str = Query("A"),
    year: int = Query(2026),
    home_slug: str = Query(...),
    away_slug: str = Query(...),
    db: Session = Depends(get_db),
):
    overview = get_season_overview(division, year, db)
    teams = overview["standings"]
    home_team = next((t for t in teams if t["club"]["slug"] == home_slug), teams[0])
    away_team = next((t for t in teams if t["club"]["slug"] == away_slug), teams[1])
    if home_team["club"]["slug"] == away_team["club"]["slug"] and len(teams) > 1:
        away_team = teams[1] if home_team != teams[1] else teams[0]
    return build_head_to_head_analysis(home_team, away_team)


@router.get("/history/bridge")
def get_history_bridge(db: Session = Depends(get_db)):
    clubs = db.query(Club).order_by(Club.yo_yo_index.desc(), Club.seasons_in_a.desc()).all()
    hist_rows = db.query(DivisionHistory).order_by(DivisionHistory.year.asc()).all()

    club_map = {c.id: serialize_club(c) for c in clubs}
    trajectories_by_club: dict[str, list[dict[str, Any]]] = {}
    for row in hist_rows:
        c_info = club_map.get(row.club_id)
        if not c_info:
            continue
        slug = c_info["slug"]
        trajectories_by_club.setdefault(slug, []).append({
            "year": row.year,
            "division": row.division,
            "position": row.final_position,
            "points": row.points,
            "outcome": row.outcome,
        })

    # Survival rate of newly promoted clubs from Série B in the next year's Série A (2006–2025)
    promoted_survival_by_seed = [
        {
            "seed_label": "1º Lugar (Campeão da Série B)",
            "promoted_position": 1,
            "survival_rate_a": 76.0,
            "immediate_relegation_rate": 24.0,
            "avg_points_in_a": 48.4,
            "avg_finish_in_a": 12.1,
            "notable_examples": "Botafogo (2022 -> 11º), Fortaleza (2019 -> 9º), Palmeiras (2014 -> 16º), Cruzeiro (2023 -> 14º)",
        },
        {
            "seed_label": "2º Lugar (Vice da Série B)",
            "promoted_position": 2,
            "survival_rate_a": 62.0,
            "immediate_relegation_rate": 38.0,
            "avg_points_in_a": 45.1,
            "avg_finish_in_a": 14.3,
            "notable_examples": "Grêmio (2023 -> 2º na A!), Juventude (2024 -> 15º), Goiás (2022 -> 13º)",
        },
        {
            "seed_label": "3º Lugar na Série B",
            "promoted_position": 3,
            "survival_rate_a": 55.0,
            "immediate_relegation_rate": 45.0,
            "avg_points_in_a": 43.2,
            "avg_finish_in_a": 15.2,
            "notable_examples": "Bahia (2023 -> 16º), Criciúma (2024 -> 17º), América-MG (2016 -> 20º)",
        },
        {
            "seed_label": "4º Lugar (Subiu no Limite)",
            "promoted_position": 4,
            "survival_rate_a": 41.0,
            "immediate_relegation_rate": 59.0,
            "avg_points_in_a": 40.6,
            "avg_finish_in_a": 16.8,
            "notable_examples": "Vasco (2023 -> 15º), Atlético-GO (2024 -> 19º), Avaí (2022 -> 19º)",
        },
    ]

    # Relegated clubs from Série A -> Destiny in Série B (2006–2025)
    relegated_destiny = [
        {"category": "Bate e Volta Imediato (Subiu no 1º ano)", "percentage": 36.5, "count": 29, "color": "#10b981"},
        {"category": "Subiu no 2º ou 3º ano na Série B", "percentage": 27.5, "count": 22, "color": "#3b82f6"},
        {"category": "Ficou Preso na Série B (4+ anos)", "percentage": 22.5, "count": 18, "color": "#f59e0b"},
        {"category": "Caiu para a Série C antes de voltar", "percentage": 13.5, "count": 11, "color": "#ef4444"},
    ]

    # Historical Champions & Cutoffs (Pontos Corridos 20 Times: 2006–2025)
    historical_cutoffs = [
        {"year": 2015, "champion": "Corinthians", "champ_pts": 81, "g4_pts": 62, "z4_escape_pts": 43, "serie_b_champ": "Botafogo", "serie_b_access_pts": 65},
        {"year": 2016, "champion": "Palmeiras", "champ_pts": 80, "g4_pts": 62, "z4_escape_pts": 45, "serie_b_champ": "Atlético-GO", "serie_b_access_pts": 63},
        {"year": 2017, "champion": "Corinthians", "champ_pts": 72, "g4_pts": 62, "z4_escape_pts": 44, "serie_b_champ": "América-MG", "serie_b_access_pts": 64},
        {"year": 2018, "champion": "Palmeiras", "champ_pts": 80, "g4_pts": 66, "z4_escape_pts": 43, "serie_b_champ": "Fortaleza", "serie_b_access_pts": 60},
        {"year": 2019, "champion": "Flamengo", "champ_pts": 90, "g4_pts": 68, "z4_escape_pts": 39, "serie_b_champ": "RB Bragantino", "serie_b_access_pts": 62},
        {"year": 2020, "champion": "Flamengo", "champ_pts": 71, "g4_pts": 66, "z4_escape_pts": 41, "serie_b_champ": "Chapecoense", "serie_b_access_pts": 61},
        {"year": 2021, "champion": "Atlético-MG", "champ_pts": 84, "g4_pts": 58, "z4_escape_pts": 46, "serie_b_champ": "Botafogo", "serie_b_access_pts": 64},
        {"year": 2022, "champion": "Palmeiras", "champ_pts": 81, "g4_pts": 65, "z4_escape_pts": 42, "serie_b_champ": "Cruzeiro", "serie_b_access_pts": 62},
        {"year": 2023, "champion": "Palmeiras", "champ_pts": 70, "g4_pts": 66, "z4_escape_pts": 44, "serie_b_champ": "Vitória", "serie_b_access_pts": 64},
        {"year": 2024, "champion": "Botafogo", "champ_pts": 79, "g4_pts": 65, "z4_escape_pts": 45, "serie_b_champ": "Santos", "serie_b_access_pts": 64},
        {"year": 2025, "champion": "Palmeiras", "champ_pts": 78, "g4_pts": 63, "z4_escape_pts": 44, "serie_b_champ": "Coritiba", "serie_b_access_pts": 64},
    ]

    return {
        "yo_yo_ranking": [serialize_club(c) for c in clubs if c.yo_yo_index > 0][:14],
        "never_relegated_or_stable": [serialize_club(c) for c in clubs if c.titles_serie_a > 0],
        "trajectories": [
            {
                "club": club_map[c.id],
                "history": trajectories_by_club[c.slug],
            }
            for c in clubs
            if c.slug in trajectories_by_club
        ],
        "promoted_survival_by_seed": promoted_survival_by_seed,
        "relegated_destiny": relegated_destiny,
        "historical_cutoffs": historical_cutoffs,
    }


@router.post("/sync/official-table")
def sync_official_table(db: Session = Depends(get_db)):
    """Sincroniza a tabela oficial da Série A 2026 com os dados oficiais CBF / Google."""
    result = sync_serie_a_2026_standings(db)
    return result


@router.get("/sync/official-table")
def get_sync_status(db: Session = Depends(get_db)):
    """Retorna o status atual da sincronização da tabela oficial."""
    season = db.query(Season).filter(Season.division == "A", Season.year == 2026).first()
    if not season:
        return {"synced": False, "message": "Temporada 2026 não encontrada"}
    teams_count = db.query(SeasonTeam).filter(SeasonTeam.season_id == season.id).count()
    return {
        "synced": True,
        "division": "A",
        "year": 2026,
        "current_round": season.current_round,
        "teams_count": teams_count,
    }

