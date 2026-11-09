import math
from typing import Any


def simulate_round_and_probabilities(
    teams: list[dict[str, Any]],
    matches: list[dict[str, Any]],
    simulated_scores: dict[int, tuple[int, int]],
    division: str,
    total_rounds: int = 38,
) -> list[dict[str, Any]]:
    """
    Applies user-simulated round scores to current standings, re-sorts by CBF tiebreakers
    (Points -> Wins -> Goal Diff -> Goals For), and recalculates Monte Carlo probabilities.
    """
    team_map = {t["club"]["id"]: dict(t) for t in teams}
    orig_pos_map = {t["club"]["id"]: t["position"] for t in teams}
    orig_prob_g4 = {t["club"]["id"]: t["prob_g4"] for t in teams}
    orig_prob_z4 = {t["club"]["id"]: t["prob_z4"] for t in teams}

    for m in matches:
        m_id = m["id"]
        if m_id not in simulated_scores:
            continue
        h_score, a_score = simulated_scores[m_id]
        if h_score is None or a_score is None:
            continue

        h_id = m["home_club"]["id"]
        a_id = m["away_club"]["id"]
        if h_id not in team_map or a_id not in team_map:
            continue

        ht = team_map[h_id]
        at = team_map[a_id]

        ht["played"] += 1
        at["played"] += 1
        ht["goals_for"] += h_score
        ht["goals_against"] += a_score
        ht["goal_diff"] = ht["goals_for"] - ht["goals_against"]

        at["goals_for"] += a_score
        at["goals_against"] += h_score
        at["goal_diff"] = at["goals_for"] - at["goals_against"]

        if h_score > a_score:
            ht["wins"] += 1
            ht["points"] += 3
            at["losses"] += 1
        elif h_score < a_score:
            at["wins"] += 1
            at["points"] += 3
            ht["losses"] += 1
        else:
            ht["draws"] += 1
            at["draws"] += 1
            ht["points"] += 1
            at["points"] += 1

    updated_list = list(team_map.values())
    updated_list.sort(
        key=lambda x: (x["points"], x["wins"], x["goal_diff"], x["goals_for"]),
        reverse=True,
    )

    lead_pts = updated_list[0]["points"]
    g4_pts = updated_list[3]["points"]
    g6_pts = updated_list[5]["points"]
    z4_pts = updated_list[16]["points"]

    for new_pos, t in enumerate(updated_list, start=1):
        c_id = t["club"]["id"]
        pts = t["points"]
        t["prev_position"] = orig_pos_map[c_id]
        t["position"] = new_pos
        t["sim_position_delta"] = orig_pos_map[c_id] - new_pos

        prob_title = round(
            max(0.0, min(98.5, 78.0 * math.exp(-0.40 * max(0, lead_pts - pts)) if new_pos <= 6 else 0.0)),
            1,
        )
        prob_g4 = round(
            max(0.1, min(99.9, 100.0 / (1.0 + math.exp(-0.58 * (pts - g4_pts + 1.2))))),
            1,
        )
        prob_g6 = round(
            max(0.2, min(99.9, 100.0 / (1.0 + math.exp(-0.58 * (pts - g6_pts + 1.5))))),
            1,
        )
        prob_z4 = round(
            max(0.1, min(99.8, 100.0 / (1.0 + math.exp(0.60 * (pts - z4_pts - 0.8))))),
            1,
        )
        prob_sula = round(
            max(0.0, min(95.0, 100.0 - prob_g6 - prob_z4)) if 5 <= new_pos <= 15 else 10.0,
            1,
        )

        t["prob_title"] = prob_title
        t["prob_g4"] = prob_g4
        t["prob_g6"] = prob_g6
        t["prob_sula"] = prob_sula
        t["prob_z4"] = prob_z4
        t["sim_prob_g4_delta"] = round(prob_g4 - orig_prob_g4[c_id], 1)
        t["sim_prob_z4_delta"] = round(prob_z4 - orig_prob_z4[c_id], 1)

    return updated_list


def calculate_fan_target(
    team: dict[str, Any],
    division: str,
    target_key: str,
    custom_points: int | None = None,
    total_rounds: int = 38,
) -> dict[str, Any]:
    """
    Calculadora do Torcedor ('A Conta do Chá'):
    Computes exact wins/draws/points needed in the remaining rounds to hit a target.
    """
    default_targets_a = {
        "TITULO": {"label": "Título Brasileiro", "points": 77},
        "G4": {"label": "Vaga Direta Libertadores (G4)", "points": 62},
        "G6": {"label": "Pré-Libertadores (G6)", "points": 57},
        "SULA": {"label": "Copa Sul-Americana (G12)", "points": 47},
        "Z4": {"label": "Fuga do Rebaixamento (Número Mágico)", "points": 45},
    }
    default_targets_b = {
        "TITULO": {"label": "Título da Série B", "points": 72},
        "G4": {"label": "Acesso à Série A (G4)", "points": 64},
        "G6": {"label": "Briga até a Última Rodada (Top 6)", "points": 60},
        "SULA": {"label": "Metade Superior da Tabela", "points": 50},
        "Z4": {"label": "Permanência na Série B", "points": 44},
    }
    catalog = default_targets_a if division == "A" else default_targets_b
    chosen = catalog.get(target_key.upper(), catalog["Z4"])
    target_pts = custom_points if custom_points is not None else chosen["points"]

    curr_pts = team["points"]
    played = team["played"]
    rem_games = max(0, total_rounds - played)
    rem_pts_pool = rem_games * 3
    pts_needed = max(0, target_pts - curr_pts)

    rem_schedule = team.get("remaining_schedule", [])
    rem_home = sum(1 for g in rem_schedule if g.get("venue") == "C")
    rem_away = sum(1 for g in rem_schedule if g.get("venue") == "F")

    curr_aprov = round((curr_pts / max(1, played * 3)) * 100.0, 1)
    form_aprov = round((team["points_last_5"] / 15.0) * 100.0, 1)
    req_aprov = round((pts_needed / max(1, rem_pts_pool)) * 100.0, 1) if rem_pts_pool > 0 else 0.0

    # Suggest clean Win + Draw combination
    wins_needed = min(rem_games, pts_needed // 3)
    rem_after_wins = pts_needed - (wins_needed * 3)
    draws_needed = 0
    if rem_after_wins == 1:
        draws_needed = 1
    elif rem_after_wins == 2:
        if wins_needed + 2 <= rem_games:
            draws_needed = 2
        elif wins_needed + 1 <= rem_games:
            wins_needed += 1
            draws_needed = 0

    if pts_needed == 0:
        verdict = "META JÁ ATINGIDA"
        verdict_color = "emerald"
        explanation = f"O {team['club']['name']} já alcançou {curr_pts} pts (meta: {target_pts} pts)."
    elif pts_needed > rem_pts_pool:
        verdict = "MATEMATICAMENTE IMPOSSÍVEL"
        verdict_color = "rose"
        explanation = f"Precisa de {pts_needed} pts, mas só restam {rem_pts_pool} pts em disputa ({rem_games} jogos)."
    elif req_aprov <= curr_aprov - 5.0:
        verdict = "MUITO FAVORÁVEL"
        verdict_color = "emerald"
        explanation = f"Exige {req_aprov}% de aproveitamento nos {rem_games} jogos finais, abaixo da média atual do clube ({curr_aprov}%)."
    elif req_aprov <= curr_aprov + 10.0:
        verdict = "DENTRO DO RITMO"
        verdict_color = "amber"
        explanation = f"Exige {req_aprov}% nos {rem_games} jogos restantes, compatível com o ritmo atual ({curr_aprov}%)."
    elif req_aprov <= 78.0:
        verdict = "EXIGE ARRANCADA FORTE"
        verdict_color = "orange"
        explanation = f"Exige campanha de líder ({req_aprov}% de aproveitamento) nas {rem_games} rodadas finais."
    else:
        verdict = "MILAGRE MATEMÁTICO"
        verdict_color = "rose"
        explanation = f"Quase margem zero de erro: precisa de {pts_needed} dos {rem_pts_pool} pontos possíveis ({req_aprov}%)."

    return {
        "club": team["club"],
        "target_key": target_key.upper(),
        "target_label": chosen["label"],
        "target_points": target_pts,
        "current_points": curr_pts,
        "points_needed": pts_needed,
        "remaining_games": rem_games,
        "remaining_home": rem_home,
        "remaining_away": rem_away,
        "remaining_points_pool": rem_pts_pool,
        "wins_needed": wins_needed,
        "draws_needed": draws_needed,
        "losses_allowed": max(0, rem_games - wins_needed - draws_needed),
        "current_aproveitamento": curr_aprov,
        "form_last_5_aproveitamento": form_aprov,
        "required_aproveitamento": req_aprov,
        "verdict": verdict,
        "verdict_color": verdict_color,
        "explanation": explanation,
    }

