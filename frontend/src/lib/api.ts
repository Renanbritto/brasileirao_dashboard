export interface Club {
  id: number;
  slug: string;
  name: string;
  short_name: string;
  state_uf: string;
  region: string;
  city: string;
  stadium_name: string;
  turf_type: "Natural" | "Sintético";
  capacity: number;
  latitude: number;
  longitude: number;
  primary_color: string;
  secondary_color: string;
  yo_yo_index: number;
  promotions_to_a: number;
  relegations_to_b: number;
  immediate_returns: number;
  titles_serie_a: number;
  titles_serie_b: number;
  seasons_in_a: number;
  seasons_in_b: number;
}

export interface RoundProgressionPoint {
  round: number;
  position: number;
  points: number;
}

export interface RemainingScheduleItem {
  round: number;
  opponent_slug: string;
  opponent_name: string;
  opponent_short: string;
  opponent_position: number;
  venue: "C" | "F";
  difficulty: "PEDREIRA" | "EQUILIBRADO" | "ACESSIVEL";
  difficulty_score: number;
  is_six_pointer: boolean;
}

export interface SpatialTactics {
  attack: {
    left_pct: number;
    center_pct: number;
    right_pct: number;
    goals_left: number;
    goals_center: number;
    goals_right: number;
    inside_box_pct: number;
    outside_box_pct: number;
    six_yard_pct: number;
    header_goals: number;
    right_foot_goals: number;
    left_foot_goals: number;
    outside_box_goals: number;
    primary_channel: string;
  };
  defense: {
    left_conceded_pct: number;
    center_conceded_pct: number;
    right_conceded_pct: number;
    open_play_conceded: number;
    crosses_aerial_conceded: number;
    set_pieces_conceded: number;
    counter_attacks_conceded: number;
    vuln_zone: string;
    vuln_desc: string;
    danger_channel: string;
  };
}

export interface StandingTeam {
  id: number;
  club: Club;
  position: number;
  prev_position: number;
  position_delta: number;
  sim_position_delta?: number;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  aproveitamento: number;
  // Turno splits
  points_turn_1: number;
  played_turn_1: number;
  rank_turn_1: number;
  aprov_turn_1: number;
  points_turn_2: number;
  played_turn_2: number;
  rank_turn_2: number;
  aprov_turn_2: number;
  delta_turn_aprov: number;
  // Home / Away
  home_played: number;
  home_wins: number;
  home_draws: number;
  home_losses: number;
  home_points: number;
  home_gf: number;
  home_ga: number;
  aprov_home: number;
  away_played: number;
  away_wins: number;
  away_draws: number;
  away_losses: number;
  away_points: number;
  away_gf: number;
  away_ga: number;
  aprov_away: number;
  home_away_gap: number;
  // Context vs G6 / vs Z4
  points_vs_g6: number;
  played_vs_g6: number;
  aprov_vs_g6: number;
  points_vs_z4: number;
  played_vs_z4: number;
  aprov_vs_z4: number;
  robin_hood_index: number;
  // Tactical & Efficiency
  xg_for: number;
  xg_against: number;
  xg_per_game: number;
  xga_per_game: number;
  xg_overperformance: number;
  tactical_quadrant: string;
  shots_per_game: number;
  shots_per_goal: number;
  shots_conceded_per_goal: number;
  possession_avg: number;
  clean_sheets: number;
  clean_sheet_rate: number;
  comeback_points: number;
  points_dropped_leading: number;
  // Goal timing
  goals_0_15: number;
  goals_16_30: number;
  goals_31_45: number;
  goals_46_60: number;
  goals_61_75: number;
  goals_76_90: number;
  goals_85_plus: number;
  ga_0_15: number;
  ga_16_30: number;
  ga_31_45: number;
  ga_46_60: number;
  ga_61_75: number;
  ga_76_90: number;
  ga_85_plus: number;
  // Geography & Stadium
  travel_km: number;
  avg_attendance: number;
  occupation_rate: number;
  aprov_synthetic: number;
  aprov_natural: number;
  yellow_cards: number;
  red_cards: number;
  coach_changes: number;
  aprov_before_coach: number;
  aprov_after_coach: number;
  // Live Form & Probabilities
  form_last_5: string[];
  points_last_5: number;
  aprov_last_5: number;
  momentum_label: string;
  prob_title: number;
  prob_g4: number;
  prob_g6: number;
  prob_sula: number;
  prob_z4: number;
  prob_delta_main: number;
  sim_prob_g4_delta?: number;
  sim_prob_z4_delta?: number;
  sos_score: number;
  round_progression: RoundProgressionPoint[];
  remaining_schedule: RemainingScheduleItem[];
  time_slots: Record<string, number>;
  spatial_tactics?: SpatialTactics;
}

export interface RoundMatch {
  id: number;
  round_number: number;
  home_club: Club;
  away_club: Club;
  home_position: number;
  away_position: number;
  home_score: number | null;
  away_score: number | null;
  status: "SCHEDULED" | "FINISHED";
  kickoff_slot: string;
  stadium: string;
  is_six_pointer: boolean;
  six_pointer_label: string;
  pred_home_win: number;
  pred_draw: number;
  pred_away_win: number;
}

export interface SeasonMeta {
  id: number;
  year: number;
  division: "A" | "B";
  is_current: boolean;
  current_round: number;
  total_rounds: number;
  magic_title_pts: number;
  magic_g4_pts: number;
  magic_g6_pts: number;
  magic_sula_pts: number;
  magic_escape_z4_pts: number;
}

export interface SeasonOverview {
  season: SeasonMeta;
  standings: StandingTeam[];
  round_matches: RoundMatch[];
  magic_curves: {
    z4_escape: { points: number; escape_prob: number; relegated_prob: number }[];
    g4_target: { points: number; target_prob: number }[];
  };
}

export interface FanCalculatorResult {
  club: Club;
  target_key: string;
  target_label: string;
  target_points: number;
  current_points: number;
  points_needed: number;
  remaining_games: number;
  remaining_home: number;
  remaining_away: number;
  remaining_points_pool: number;
  wins_needed: number;
  draws_needed: number;
  losses_allowed: number;
  current_aproveitamento: number;
  form_last_5_aproveitamento: number;
  required_aproveitamento: number;
  verdict: string;
  verdict_color: string;
  explanation: string;
}

export interface H2HAnalysis {
  home_team: StandingTeam;
  away_team: StandingTeam;
  poisson: {
    expected_home_goals: number;
    expected_away_goals: number;
    prob_home_win: number;
    prob_draw: number;
    prob_away_win: number;
    prob_btts: number;
    prob_over_25: number;
    top_scorelines: { score: string; home_goals: number; away_goals: number; probability: number }[];
    matrix: { score: string; home_goals: number; away_goals: number; probability: number }[];
    turf_advantage_note: string;
  };
  radar: { metric: string; home: number; away: number }[];
  history_h2h: {
    total_matches: number;
    home_club_wins: number;
    draws: number;
    away_club_wins: number;
    home_club_goals: number;
    away_club_goals: number;
    tabu_summary: string;
    biggest_rout: string;
  };
}

export interface HistoryBridgeData {
  yo_yo_ranking: Club[];
  never_relegated_or_stable: Club[];
  trajectories: {
    club: Club;
    history: { year: number; division: string; position: number; points: number; outcome: string }[];
  }[];
  promoted_survival_by_seed: {
    seed_label: string;
    promoted_position: number;
    survival_rate_a: number;
    immediate_relegation_rate: number;
    avg_points_in_a: number;
    avg_finish_in_a: number;
    notable_examples: string;
  }[];
  relegated_destiny: {
    category: string;
    percentage: number;
    count: number;
    color: string;
  }[];
  historical_cutoffs: {
    year: number;
    champion: string;
    champ_pts: number;
    g4_pts: number;
    z4_escape_pts: number;
    serie_b_champ: string;
    serie_b_access_pts: number;
  }[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchSeasonOverview(division: string, year: number): Promise<SeasonOverview> {
  const res = await fetch(`${API_BASE}/season/${division}/${year}/overview`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load season overview");
  return res.json();
}

export async function simulateRoundScores(
  division: string,
  year: number,
  scores: { match_id: number; home_score: number; away_score: number }[]
): Promise<{ simulated_standings: StandingTeam[]; matches_simulated: number }> {
  const res = await fetch(`${API_BASE}/season/${division}/${year}/simulate-round`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scores }),
  });
  if (!res.ok) throw new Error("Failed to simulate round");
  return res.json();
}

export async function fetchFanCalculator(
  division: string,
  year: number,
  clubSlug: string,
  target: string,
  customPoints?: number
): Promise<FanCalculatorResult> {
  const params = new URLSearchParams({ club_slug: clubSlug, target });
  if (customPoints !== undefined) params.set("custom_points", String(customPoints));
  const res = await fetch(`${API_BASE}/season/${division}/${year}/calculator?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch calculator");
  return res.json();
}

export async function fetchHeadToHead(
  division: string,
  year: number,
  homeSlug: string,
  awaySlug: string
): Promise<H2HAnalysis> {
  const params = new URLSearchParams({
    division,
    year: String(year),
    home_slug: homeSlug,
    away_slug: awaySlug,
  });
  const res = await fetch(`${API_BASE}/h2h?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch H2H");
  return res.json();
}

export async function fetchHistoryBridge(): Promise<HistoryBridgeData> {
  const res = await fetch(`${API_BASE}/history/bridge`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch History Bridge");
  return res.json();
}

