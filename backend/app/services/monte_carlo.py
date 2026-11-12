import hashlib
import math
import random
from typing import Any


def _poisson_cdf_table(lam: float, max_goals: int = 7) -> list[float]:
    """Precompute cumulative Poisson probabilities for fast sampling."""
    lam = max(0.25, min(3.8, lam))
    cdf: list[float] = []
    cum = 0.0
    exp_neg = math.exp(-lam)
    fact = 1.0
    for k in range(max_goals):
        if k > 0:
            fact *= k
        prob = exp_neg * (lam ** k) / fact
        cum += prob
        cdf.append(cum)
    cdf.append(1.0)
    return cdf


def _sample_goals(rng: random.Random, cdf: list[float]) -> int:
    u = rng.random()
    for goals, threshold in enumerate(cdf):
        if u <= threshold:
            return goals
    return len(cdf) - 1


def _extract_future_pairs(
    team_list: list[dict[str, Any]],
    matches: list[dict[str, Any]] | None,
    simulated_scores: dict[int, tuple[int, int]] | None,
    total_rounds: int,
) -> tuple[dict[int, int], list[tuple[int, int]]]:
    """
    Build concrete remaining (home_id, away_id) fixtures across all clubs.
    Prioritizes unsimulated round matches first, then club remaining_schedule entries,
    then synthetic pairs for any postponed/missing games so every club plays to total_rounds.
    """
    slug_to_id = {t["club"]["slug"]: t["club"]["id"] for t in team_list}
    rem_counts = {t["club"]["id"]: max(0, total_rounds - int(t["played"])) for t in team_list}
    pairs: list[tuple[int, int]] = []
    seen_round_pairs: set[tuple[int, int, int]] = set()
    active_round: int | None = None

    if matches:
        for m in matches:
            active_round = m.get("round_number", active_round)
            m_id = m.get("id")
            if simulated_scores and m_id in simulated_scores:
                h_s, a_s = simulated_scores[m_id]
                if h_s is not None and a_s is not None:
                    continue
            h_id = m["home_club"]["id"]
            a_id = m["away_club"]["id"]
            if rem_counts.get(h_id, 0) > 0 and rem_counts.get(a_id, 0) > 0:
                pairs.append((h_id, a_id))
                rem_counts[h_id] -= 1
                rem_counts[a_id] -= 1
                if active_round is not None:
                    seen_round_pairs.add((int(active_round), h_id, a_id))

    for t in team_list:
        cid = t["club"]["id"]
        for item in t.get("remaining_schedule") or []:
            r_num = int(item.get("round", 0))
            if active_round is not None and r_num <= int(active_round):
                continue
            opp_slug = item.get("opponent_slug") or item.get("opp_slug")
            opp_id = slug_to_id.get(opp_slug)
            if not opp_id or opp_id == cid:
                continue
            is_home = item.get("venue") == "C"
            h_id, a_id = (cid, opp_id) if is_home else (opp_id, cid)
            key = (r_num, h_id, a_id)
            if key in seen_round_pairs:
                continue
            if rem_counts.get(h_id, 0) > 0 and rem_counts.get(a_id, 0) > 0:
                seen_round_pairs.add(key)
                pairs.append((h_id, a_id))
                rem_counts[h_id] -= 1
                rem_counts[a_id] -= 1

    # Handle postponed / unbalanced leftovers cleanly
    leftover_ids = [cid for cid, rem in rem_counts.items() for _ in range(rem)]
    for idx in range(0, len(leftover_ids) - 1, 2):
        h_id = leftover_ids[idx]
        a_id = leftover_ids[idx + 1]
        if h_id == a_id:
            # Find different opponent id
            alt = next((c["club"]["id"] for c in team_list if c["club"]["id"] != h_id), h_id)
            a_id = alt
        pairs.append((h_id, a_id))
        rem_counts[h_id] = max(0, rem_counts[h_id] - 1)
        rem_counts[a_id] = max(0, rem_counts[a_id] - 1)

    return rem_counts, pairs


def compute_standings_probabilities(
    team_list: list[dict[str, Any]],
    matches: list[dict[str, Any]] | None = None,
    simulated_scores: dict[int, tuple[int, int]] | None = None,
    total_rounds: int = 38,
    n_trials: int = 2000,
) -> None:
    """
    Runs a deterministic Poisson Monte Carlo simulation across all remaining games
    and updates prob_title, prob_g4, prob_g6, prob_sula, and prob_z4 in place.
    For completed seasons (remaining games == 0), assigns exact 100.0% / 0.0% outcomes.
    """
    if not team_list:
        return

    team_list.sort(
        key=lambda x: (x["points"], x["wins"], x["goal_diff"], x["goals_for"]),
        reverse=True,
    )

    max_rem = max(max(0, total_rounds - int(t["played"])) for t in team_list)
    if max_rem == 0:
        for pos, t in enumerate(team_list, start=1):
            t["prob_title"] = 100.0 if pos == 1 else 0.0
            t["prob_g4"] = 100.0 if pos <= 4 else 0.0
            t["prob_g6"] = 100.0 if pos <= 6 else 0.0
            t["prob_sula"] = 100.0 if 7 <= pos <= 12 else 0.0
            t["prob_z4"] = 100.0 if pos >= 17 else 0.0
        return

    rem_left, pairs = _extract_future_pairs(team_list, matches, simulated_scores, total_rounds)

    # League baseline scoring environment
    total_gf = sum(max(0, int(t["goals_for"])) for t in team_list)
    total_played = max(1, sum(max(1, int(t["played"])) for t in team_list))
    league_avg_gpg = max(0.95, min(1.75, total_gf / total_played))

    atk_factor: dict[int, float] = {}
    def_factor: dict[int, float] = {}
    for t in team_list:
        cid = t["club"]["id"]
        gp = max(1, int(t["played"]))
        gf_pg = (0.7 * (t["goals_for"] / gp) + 0.3 * float(t.get("xg_for_per_game") or (t["goals_for"] / gp)))
        ga_pg = (0.7 * (t["goals_against"] / gp) + 0.3 * float(t.get("xg_against_per_game") or (t["goals_against"] / gp)))
        atk_factor[cid] = max(0.55, min(1.85, gf_pg / league_avg_gpg))
        def_factor[cid] = max(0.55, min(1.85, ga_pg / league_avg_gpg))

    # Precompute cumulative Poisson tables per fixture (Home advantage ~1.13x, Away ~0.87x)
    fixture_cdfs: list[tuple[int, int, list[float], list[float]]] = []
    for h_id, a_id in pairs:
        lam_h = league_avg_gpg * 1.13 * atk_factor.get(h_id, 1.0) * def_factor.get(a_id, 1.0)
        lam_a = league_avg_gpg * 0.87 * atk_factor.get(a_id, 1.0) * def_factor.get(h_id, 1.0)
        fixture_cdfs.append((h_id, a_id, _poisson_cdf_table(lam_h), _poisson_cdf_table(lam_a)))

    # Handle any odd single postponed match against league average
    solo_fixtures: list[tuple[int, list[float], list[float]]] = []
    for cid, rem in rem_left.items():
        if rem > 0:
            lam_f = league_avg_gpg * atk_factor.get(cid, 1.0)
            lam_a = league_avg_gpg * def_factor.get(cid, 1.0)
            for _ in range(rem):
                solo_fixtures.append((cid, _poisson_cdf_table(lam_f), _poisson_cdf_table(lam_a)))

    # Seed RNG deterministically from current state + scores so identical requests are stable
    state_sig = "|".join(f"{t['club']['id']}:{t['points']}:{t['played']}:{t['goal_diff']}" for t in team_list)
    seed_val = int(hashlib.md5(state_sig.encode("utf-8")).hexdigest()[:8], 16)
    rng = random.Random(seed_val)

    cids = [t["club"]["id"] for t in team_list]
    base_pts = {t["club"]["id"]: int(t["points"]) for t in team_list}
    base_wins = {t["club"]["id"]: int(t["wins"]) for t in team_list}
    base_gf = {t["club"]["id"]: int(t["goals_for"]) for t in team_list}
    base_gd = {t["club"]["id"]: int(t["goal_diff"]) for t in team_list}

    counts = {cid: [0, 0, 0, 0, 0] for cid in cids}  # title, g4, g6, sula, z4

    for _ in range(n_trials):
        pts = dict(base_pts)
        wins = dict(base_wins)
        gf = dict(base_gf)
        gd = dict(base_gd)

        for h_id, a_id, h_cdf, a_cdf in fixture_cdfs:
            hg = _sample_goals(rng, h_cdf)
            ag = _sample_goals(rng, a_cdf)
            gf[h_id] += hg
            gf[a_id] += ag
            diff = hg - ag
            gd[h_id] += diff
            gd[a_id] -= diff
            if hg > ag:
                pts[h_id] += 3
                wins[h_id] += 1
            elif hg < ag:
                pts[a_id] += 3
                wins[a_id] += 1
            else:
                pts[h_id] += 1
                pts[a_id] += 1

        for cid, f_cdf, a_cdf in solo_fixtures:
            hg = _sample_goals(rng, f_cdf)
            ag = _sample_goals(rng, a_cdf)
            gf[cid] += hg
            gd[cid] += hg - ag
            if hg > ag:
                pts[cid] += 3
                wins[cid] += 1
            elif hg == ag:
                pts[cid] += 1

        ranked = sorted(
            cids,
            key=lambda c: (pts[c], wins[c], gd[c], gf[c]),
            reverse=True,
        )
        for pos, cid in enumerate(ranked, start=1):
            c = counts[cid]
            if pos == 1:
                c[0] += 1
            if pos <= 4:
                c[1] += 1
            if pos <= 6:
                c[2] += 1
            if 7 <= pos <= 12:
                c[3] += 1
            if pos >= 17:
                c[4] += 1

    scale = 100.0 / n_trials
    for t in team_list:
        c = counts[t["club"]["id"]]
        t["prob_title"] = round(c[0] * scale, 1)
        t["prob_g4"] = round(c[1] * scale, 1)
        t["prob_g6"] = round(c[2] * scale, 1)
        t["prob_sula"] = round(c[3] * scale, 1)
        t["prob_z4"] = round(c[4] * scale, 1)


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
    compute_standings_probabilities(
        updated_list,
        matches=matches,
        simulated_scores=simulated_scores,
        total_rounds=total_rounds,
    )

    for new_pos, t in enumerate(updated_list, start=1):
        c_id = t["club"]["id"]
        t["prev_position"] = orig_pos_map[c_id]
        t["position"] = new_pos
        t["sim_position_delta"] = orig_pos_map[c_id] - new_pos
        t["sim_prob_g4_delta"] = round(t["prob_g4"] - orig_prob_g4[c_id], 1)
        t["sim_prob_z4_delta"] = round(t["prob_z4"] - orig_prob_z4[c_id], 1)

    return updated_list


def calculate_fan_target(
    team: dict[str, Any],
    division: str,
    target_key: str,
    custom_points: int | None = None,
    total_rounds: int = 38,
    magic_targets: dict[str, int] | None = None,
) -> dict[str, Any]:
    """
    Calculadora do Torcedor ('A Conta do Cha'):
    Computes exact wins/draws/points needed in the remaining rounds to hit a target,
    using the selected season's exact magic point cutoffs when available.
    """
    default_targets_a = {
        "TITULO": {"label": "Título Brasileiro", "points": 79},
        "G4": {"label": "Vaga Direta Libertadores (G4)", "points": 63},
        "G6": {"label": "Pré-Libertadores (G6)", "points": 58},
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
    catalog = {k: dict(v) for k, v in (default_targets_a if division == "A" else default_targets_b).items()}
    if magic_targets:
        for key, pts_val in magic_targets.items():
            if key in catalog and pts_val is not None:
                catalog[key]["points"] = int(pts_val)

    norm_key = target_key.upper()
    chosen = catalog.get(norm_key, catalog["Z4"])
    target_pts = custom_points if custom_points is not None else chosen["points"]

    curr_pts = int(team["points"])
    played = int(team["played"])
    rem_games = max(0, total_rounds - played)
    rem_pts_pool = rem_games * 3
    pts_needed = max(0, target_pts - curr_pts)

    rem_schedule = team.get("remaining_schedule", [])
    rem_home = sum(1 for g in rem_schedule if g.get("venue") == "C")
    rem_away = sum(1 for g in rem_schedule if g.get("venue") == "F")

    curr_aprov = round((curr_pts / max(1, played * 3)) * 100.0, 1)
    form_aprov = round((team["points_last_5"] / 15.0) * 100.0, 1)
    req_aprov = round((pts_needed / rem_pts_pool) * 100.0, 1) if rem_pts_pool > 0 else 0.0

    wins_needed = min(rem_games, pts_needed // 3)
    rem_after_wins = pts_needed - (wins_needed * 3)
    draws_needed = 0
    if rem_games > 0 and pts_needed <= rem_pts_pool:
        if rem_after_wins == 1:
            draws_needed = 1
        elif rem_after_wins == 2:
            if wins_needed + 2 <= rem_games:
                draws_needed = 2
            elif wins_needed + 1 <= rem_games:
                wins_needed += 1
                draws_needed = 0
    else:
        wins_needed = 0
        draws_needed = 0

    if rem_games == 0:
        if pts_needed == 0:
            verdict = "META ALCANÇADA"
            verdict_color = "emerald"
            explanation = (
                f"Temporada encerrada: {team['club']['name']} somou {curr_pts} pts (meta: {target_pts} pts)."
            )
        else:
            verdict = "META NÃO ALCANÇADA"
            verdict_color = "rose"
            explanation = (
                f"Temporada encerrada: {team['club']['name']} fechou com {curr_pts} pts e faltaram {pts_needed} pts para {target_pts} pts."
            )
    elif pts_needed == 0:
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
        "target_key": norm_key,
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
