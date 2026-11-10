import json
import math
import random
from app.db.session import Session
from app.db.models import Club, Season, SeasonTeam, Match, DivisionHistory


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle round-trip air distance in kilometers between two stadiums."""
    r = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    return 2.0 * r * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))


CLUBS_MASTER = [
    # --- SÉRIE A (20 CLUBS IN 2026 LIVE SEASON) ---
    {
        "slug": "palmeiras", "name": "Palmeiras", "short_name": "PAL", "state_uf": "SP", "region": "Sudeste",
        "city": "São Paulo", "stadium_name": "Allianz Parque", "turf_type": "Sintético", "capacity": 43713,
        "latitude": -23.5275, "longitude": -46.6784, "primary_color": "#006437", "secondary_color": "#ffffff",
        "yo_yo_index": 2, "promotions_to_a": 1, "relegations_to_b": 1, "immediate_returns": 1,
        "titles_serie_a": 4, "titles_serie_b": 2, "seasons_in_a": 22, "seasons_in_b": 2,
        "div_2026": "A", "base_strength": 88
    },
    {
        "slug": "flamengo", "name": "Flamengo", "short_name": "FLA", "state_uf": "RJ", "region": "Sudeste",
        "city": "Rio de Janeiro", "stadium_name": "Maracanã", "turf_type": "Natural", "capacity": 78838,
        "latitude": -22.9121, "longitude": -43.2302, "primary_color": "#C52613", "secondary_color": "#111111",
        "yo_yo_index": 0, "promotions_to_a": 0, "relegations_to_b": 0, "immediate_returns": 0,
        "titles_serie_a": 4, "titles_serie_b": 0, "seasons_in_a": 24, "seasons_in_b": 0,
        "div_2026": "A", "base_strength": 89
    },
    {
        "slug": "botafogo", "name": "Botafogo", "short_name": "BOT", "state_uf": "RJ", "region": "Sudeste",
        "city": "Rio de Janeiro", "stadium_name": "Nilton Santos", "turf_type": "Sintético", "capacity": 44661,
        "latitude": -22.8933, "longitude": -43.2923, "primary_color": "#18181b", "secondary_color": "#ffffff",
        "yo_yo_index": 4, "promotions_to_a": 2, "relegations_to_b": 2, "immediate_returns": 2,
        "titles_serie_a": 1, "titles_serie_b": 2, "seasons_in_a": 21, "seasons_in_b": 3,
        "div_2026": "A", "base_strength": 86
    },
    {
        "slug": "fortaleza", "name": "Fortaleza", "short_name": "FOR", "state_uf": "CE", "region": "Nordeste",
        "city": "Fortaleza", "stadium_name": "Arena Castelão", "turf_type": "Natural", "capacity": 63903,
        "latitude": -3.8073, "longitude": -38.5225, "primary_color": "#1d4ed8", "secondary_color": "#dc2626",
        "yo_yo_index": 5, "promotions_to_a": 3, "relegations_to_b": 2, "immediate_returns": 1,
        "titles_serie_a": 0, "titles_serie_b": 1, "seasons_in_a": 12, "seasons_in_b": 5,
        "div_2026": "B", "base_strength": 81
    },
    {
        "slug": "internacional", "name": "Internacional", "short_name": "INT", "state_uf": "RS", "region": "Sul",
        "city": "Porto Alegre", "stadium_name": "Beira-Rio", "turf_type": "Natural", "capacity": 50842,
        "latitude": -30.0656, "longitude": -51.2358, "primary_color": "#dc2626", "secondary_color": "#ffffff",
        "yo_yo_index": 2, "promotions_to_a": 1, "relegations_to_b": 1, "immediate_returns": 1,
        "titles_serie_a": 0, "titles_serie_b": 0, "seasons_in_a": 23, "seasons_in_b": 1,
        "div_2026": "A", "base_strength": 82
    },
    {
        "slug": "sao-paulo", "name": "São Paulo", "short_name": "SAO", "state_uf": "SP", "region": "Sudeste",
        "city": "São Paulo", "stadium_name": "MorumBIS", "turf_type": "Natural", "capacity": 66795,
        "latitude": -23.6001, "longitude": -46.7201, "primary_color": "#ef4444", "secondary_color": "#111111",
        "yo_yo_index": 0, "promotions_to_a": 0, "relegations_to_b": 0, "immediate_returns": 0,
        "titles_serie_a": 3, "titles_serie_b": 0, "seasons_in_a": 24, "seasons_in_b": 0,
        "div_2026": "A", "base_strength": 80
    },
    {
        "slug": "corinthians", "name": "Corinthians", "short_name": "COR", "state_uf": "SP", "region": "Sudeste",
        "city": "São Paulo", "stadium_name": "Neo Química Arena", "turf_type": "Natural", "capacity": 48905,
        "latitude": -23.5453, "longitude": -46.4742, "primary_color": "#27272a", "secondary_color": "#ffffff",
        "yo_yo_index": 2, "promotions_to_a": 1, "relegations_to_b": 1, "immediate_returns": 1,
        "titles_serie_a": 4, "titles_serie_b": 1, "seasons_in_a": 23, "seasons_in_b": 1,
        "div_2026": "A", "base_strength": 79
    },
    {
        "slug": "bahia", "name": "Bahia", "short_name": "BAH", "state_uf": "BA", "region": "Nordeste",
        "city": "Salvador", "stadium_name": "Arena Fonte Nova", "turf_type": "Natural", "capacity": 48902,
        "latitude": -12.9788, "longitude": -38.5044, "primary_color": "#2563eb", "secondary_color": "#ef4444",
        "yo_yo_index": 6, "promotions_to_a": 3, "relegations_to_b": 3, "immediate_returns": 2,
        "titles_serie_a": 0, "titles_serie_b": 0, "seasons_in_a": 15, "seasons_in_b": 7,
        "div_2026": "A", "base_strength": 78
    },
    {
        "slug": "cruzeiro", "name": "Cruzeiro", "short_name": "CRU", "state_uf": "MG", "region": "Sudeste",
        "city": "Belo Horizonte", "stadium_name": "Mineirão", "turf_type": "Natural", "capacity": 61927,
        "latitude": -19.8659, "longitude": -43.9711, "primary_color": "#1d4ed8", "secondary_color": "#ffffff",
        "yo_yo_index": 2, "promotions_to_a": 1, "relegations_to_b": 1, "immediate_returns": 0,
        "titles_serie_a": 3, "titles_serie_b": 1, "seasons_in_a": 21, "seasons_in_b": 3,
        "div_2026": "A", "base_strength": 78
    },
    {
        "slug": "atletico-mg", "name": "Atlético-MG", "short_name": "CAM", "state_uf": "MG", "region": "Sudeste",
        "city": "Belo Horizonte", "stadium_name": "Arena MRV", "turf_type": "Sintético", "capacity": 46000,
        "latitude": -19.9301, "longitude": -44.0148, "primary_color": "#18181b", "secondary_color": "#ffffff",
        "yo_yo_index": 2, "promotions_to_a": 1, "relegations_to_b": 1, "immediate_returns": 1,
        "titles_serie_a": 1, "titles_serie_b": 1, "seasons_in_a": 23, "seasons_in_b": 1,
        "div_2026": "A", "base_strength": 79
    },
    {
        "slug": "vasco", "name": "Vasco da Gama", "short_name": "VAS", "state_uf": "RJ", "region": "Sudeste",
        "city": "Rio de Janeiro", "stadium_name": "São Januário", "turf_type": "Natural", "capacity": 21880,
        "latitude": -22.8909, "longitude": -43.2281, "primary_color": "#27272a", "secondary_color": "#dc2626",
        "yo_yo_index": 8, "promotions_to_a": 4, "relegations_to_b": 4, "immediate_returns": 3,
        "titles_serie_a": 0, "titles_serie_b": 1, "seasons_in_a": 19, "seasons_in_b": 5,
        "div_2026": "A", "base_strength": 74
    },
    {
        "slug": "gremio", "name": "Grêmio", "short_name": "GRE", "state_uf": "RS", "region": "Sul",
        "city": "Porto Alegre", "stadium_name": "Arena do Grêmio", "turf_type": "Natural", "capacity": 55662,
        "latitude": -29.9740, "longitude": -51.1949, "primary_color": "#0284c7", "secondary_color": "#111111",
        "yo_yo_index": 4, "promotions_to_a": 2, "relegations_to_b": 2, "immediate_returns": 2,
        "titles_serie_a": 0, "titles_serie_b": 1, "seasons_in_a": 22, "seasons_in_b": 2,
        "div_2026": "A", "base_strength": 76
    },
    {
        "slug": "fluminense", "name": "Fluminense", "short_name": "FLU", "state_uf": "RJ", "region": "Sudeste",
        "city": "Rio de Janeiro", "stadium_name": "Maracanã", "turf_type": "Natural", "capacity": 78838,
        "latitude": -22.9121, "longitude": -43.2302, "primary_color": "#991b1b", "secondary_color": "#15803d",
        "yo_yo_index": 0, "promotions_to_a": 0, "relegations_to_b": 0, "immediate_returns": 0,
        "titles_serie_a": 2, "titles_serie_b": 0, "seasons_in_a": 24, "seasons_in_b": 0,
        "div_2026": "A", "base_strength": 75
    },
    {
        "slug": "santos", "name": "Santos", "short_name": "SAN", "state_uf": "SP", "region": "Sudeste",
        "city": "Santos", "stadium_name": "Vila Belmiro", "turf_type": "Natural", "capacity": 16068,
        "latitude": -23.9511, "longitude": -46.3389, "primary_color": "#18181b", "secondary_color": "#ffffff",
        "yo_yo_index": 2, "promotions_to_a": 1, "relegations_to_b": 1, "immediate_returns": 1,
        "titles_serie_a": 1, "titles_serie_b": 1, "seasons_in_a": 23, "seasons_in_b": 1,
        "div_2026": "A", "base_strength": 74
    },
    {
        "slug": "vitoria", "name": "Vitória", "short_name": "VIT", "state_uf": "BA", "region": "Nordeste",
        "city": "Salvador", "stadium_name": "Barradão", "turf_type": "Natural", "capacity": 30793,
        "latitude": -12.9192, "longitude": -38.4269, "primary_color": "#dc2626", "secondary_color": "#111111",
        "yo_yo_index": 9, "promotions_to_a": 5, "relegations_to_b": 4, "immediate_returns": 2,
        "titles_serie_a": 0, "titles_serie_b": 1, "seasons_in_a": 14, "seasons_in_b": 8,
        "div_2026": "A", "base_strength": 71
    },
    {
        "slug": "rb-bragantino", "name": "RB Bragantino", "short_name": "RBB", "state_uf": "SP", "region": "Sudeste",
        "city": "Bragança Paulista", "stadium_name": "Nabi Abi Chedid", "turf_type": "Natural", "capacity": 15010,
        "latitude": -22.9656, "longitude": -46.5369, "primary_color": "#e11d48", "secondary_color": "#ffffff",
        "yo_yo_index": 2, "promotions_to_a": 1, "relegations_to_b": 1, "immediate_returns": 0,
        "titles_serie_a": 0, "titles_serie_b": 1, "seasons_in_a": 7, "seasons_in_b": 11,
        "div_2026": "A", "base_strength": 72
    },
    {
        "slug": "sport", "name": "Sport Recife", "short_name": "SPO", "state_uf": "PE", "region": "Nordeste",
        "city": "Recife", "stadium_name": "Ilha do Retiro", "turf_type": "Natural", "capacity": 26418,
        "latitude": -8.0628, "longitude": -34.9029, "primary_color": "#dc2626", "secondary_color": "#facc15",
        "yo_yo_index": 9, "promotions_to_a": 5, "relegations_to_b": 4, "immediate_returns": 2,
        "titles_serie_a": 0, "titles_serie_b": 0, "seasons_in_a": 13, "seasons_in_b": 11,
        "div_2026": "B", "base_strength": 69
    },
    {
        "slug": "ceara", "name": "Ceará", "short_name": "CEA", "state_uf": "CE", "region": "Nordeste",
        "city": "Fortaleza", "stadium_name": "Arena Castelão", "turf_type": "Natural", "capacity": 63903,
        "latitude": -3.8073, "longitude": -38.5225, "primary_color": "#18181b", "secondary_color": "#ffffff",
        "yo_yo_index": 5, "promotions_to_a": 3, "relegations_to_b": 2, "immediate_returns": 0,
        "titles_serie_a": 0, "titles_serie_b": 0, "seasons_in_a": 9, "seasons_in_b": 15,
        "div_2026": "B", "base_strength": 68
    },
    {
        "slug": "juventude", "name": "Juventude", "short_name": "JUV", "state_uf": "RS", "region": "Sul",
        "city": "Caxias do Sul", "stadium_name": "Alfredo Jaconi", "turf_type": "Natural", "capacity": 19924,
        "latitude": -29.1628, "longitude": -51.1772, "primary_color": "#16a34a", "secondary_color": "#ffffff",
        "yo_yo_index": 6, "promotions_to_a": 3, "relegations_to_b": 3, "immediate_returns": 1,
        "titles_serie_a": 0, "titles_serie_b": 0, "seasons_in_a": 10, "seasons_in_b": 8,
        "div_2026": "B", "base_strength": 67
    },
    {
        "slug": "mirassol", "name": "Mirassol", "short_name": "MIR", "state_uf": "SP", "region": "Sudeste",
        "city": "Mirassol", "stadium_name": "Maião", "turf_type": "Natural", "capacity": 15000,
        "latitude": -20.8225, "longitude": -49.5078, "primary_color": "#eab308", "secondary_color": "#15803d",
        "yo_yo_index": 1, "promotions_to_a": 1, "relegations_to_b": 0, "immediate_returns": 0,
        "titles_serie_a": 0, "titles_serie_b": 0, "seasons_in_a": 2, "seasons_in_b": 2,
        "div_2026": "A", "base_strength": 66
    },

    # --- SÉRIE B (20 CLUBS IN 2026 LIVE SEASON) ---
    {
        "slug": "athletico-pr", "name": "Athletico-PR", "short_name": "CAP", "state_uf": "PR", "region": "Sul",
        "city": "Curitiba", "stadium_name": "Ligga Arena", "turf_type": "Sintético", "capacity": 42372,
        "latitude": -25.4483, "longitude": -49.2769, "primary_color": "#dc2626", "secondary_color": "#111111",
        "yo_yo_index": 3, "promotions_to_a": 1, "relegations_to_b": 2, "immediate_returns": 1,
        "titles_serie_a": 0, "titles_serie_b": 0, "seasons_in_a": 22, "seasons_in_b": 2,
        "div_2026": "A", "base_strength": 82
    },
    {
        "slug": "criciuma", "name": "Criciúma", "short_name": "CRI", "state_uf": "SC", "region": "Sul",
        "city": "Criciúma", "stadium_name": "Heriberto Hülse", "turf_type": "Natural", "capacity": 19225,
        "latitude": -28.6841, "longitude": -49.3676, "primary_color": "#eab308", "secondary_color": "#111111",
        "yo_yo_index": 7, "promotions_to_a": 3, "relegations_to_b": 4, "immediate_returns": 1,
        "titles_serie_a": 0, "titles_serie_b": 1, "seasons_in_a": 5, "seasons_in_b": 15,
        "div_2026": "B", "base_strength": 77
    },
    {
        "slug": "novorizontino", "name": "Novorizontino", "short_name": "NOV", "state_uf": "SP", "region": "Sudeste",
        "city": "Novo Horizonte", "stadium_name": "Jorjão", "turf_type": "Natural", "capacity": 12398,
        "latitude": -21.4649, "longitude": -49.2314, "primary_color": "#facc15", "secondary_color": "#111111",
        "yo_yo_index": 0, "promotions_to_a": 0, "relegations_to_b": 0, "immediate_returns": 0,
        "titles_serie_a": 0, "titles_serie_b": 0, "seasons_in_a": 0, "seasons_in_b": 5,
        "div_2026": "B", "base_strength": 76
    },
    {
        "slug": "goias", "name": "Goiás", "short_name": "GOI", "state_uf": "GO", "region": "Centro-Oeste",
        "city": "Goiânia", "stadium_name": "Serrinha", "turf_type": "Natural", "capacity": 14525,
        "latitude": -16.7099, "longitude": -49.2612, "primary_color": "#15803d", "secondary_color": "#ffffff",
        "yo_yo_index": 9, "promotions_to_a": 4, "relegations_to_b": 5, "immediate_returns": 2,
        "titles_serie_a": 0, "titles_serie_b": 1, "seasons_in_a": 15, "seasons_in_b": 9,
        "div_2026": "B", "base_strength": 76
    },
    {
        "slug": "atletico-go", "name": "Atlético-GO", "short_name": "ACG", "state_uf": "GO", "region": "Centro-Oeste",
        "city": "Goiânia", "stadium_name": "Castelo do Dragão", "turf_type": "Natural", "capacity": 12500,
        "latitude": -16.6708, "longitude": -49.2842, "primary_color": "#dc2626", "secondary_color": "#111111",
        "yo_yo_index": 9, "promotions_to_a": 4, "relegations_to_b": 5, "immediate_returns": 2,
        "titles_serie_a": 0, "titles_serie_b": 1, "seasons_in_a": 9, "seasons_in_b": 11,
        "div_2026": "B", "base_strength": 75
    },
    {
        "slug": "cuiaba", "name": "Cuiabá", "short_name": "CUI", "state_uf": "MT", "region": "Centro-Oeste",
        "city": "Cuiabá", "stadium_name": "Arena Pantanal", "turf_type": "Natural", "capacity": 42968,
        "latitude": -15.6039, "longitude": -56.1217, "primary_color": "#16a34a", "secondary_color": "#facc15",
        "yo_yo_index": 2, "promotions_to_a": 1, "relegations_to_b": 1, "immediate_returns": 0,
        "titles_serie_a": 0, "titles_serie_b": 0, "seasons_in_a": 4, "seasons_in_b": 4,
        "div_2026": "B", "base_strength": 74
    },
    {
        "slug": "coritiba", "name": "Coritiba", "short_name": "CFC", "state_uf": "PR", "region": "Sul",
        "city": "Curitiba", "stadium_name": "Couto Pereira", "turf_type": "Natural", "capacity": 40502,
        "latitude": -25.4211, "longitude": -49.2597, "primary_color": "#15803d", "secondary_color": "#ffffff",
        "yo_yo_index": 11, "promotions_to_a": 5, "relegations_to_b": 6, "immediate_returns": 3,
        "titles_serie_a": 0, "titles_serie_b": 2, "seasons_in_a": 15, "seasons_in_b": 9,
        "div_2026": "A", "base_strength": 74
    },
    {
        "slug": "america-mg", "name": "América-MG", "short_name": "AME", "state_uf": "MG", "region": "Sudeste",
        "city": "Belo Horizonte", "stadium_name": "Independência", "turf_type": "Natural", "capacity": 23018,
        "latitude": -19.9083, "longitude": -43.9178, "primary_color": "#16a34a", "secondary_color": "#111111",
        "yo_yo_index": 10, "promotions_to_a": 5, "relegations_to_b": 5, "immediate_returns": 3,
        "titles_serie_a": 0, "titles_serie_b": 1, "seasons_in_a": 7, "seasons_in_b": 13,
        "div_2026": "B", "base_strength": 73
    },
    {
        "slug": "operario-pr", "name": "Operário-PR", "short_name": "OPE", "state_uf": "PR", "region": "Sul",
        "city": "Ponta Grossa", "stadium_name": "Germano Krüger", "turf_type": "Natural", "capacity": 10632,
        "latitude": -25.1114, "longitude": -50.1558, "primary_color": "#27272a", "secondary_color": "#ffffff",
        "yo_yo_index": 0, "promotions_to_a": 0, "relegations_to_b": 0, "immediate_returns": 0,
        "titles_serie_a": 0, "titles_serie_b": 0, "seasons_in_a": 0, "seasons_in_b": 6,
        "div_2026": "B", "base_strength": 71
    },
    {
        "slug": "vila-nova", "name": "Vila Nova", "short_name": "VIL", "state_uf": "GO", "region": "Centro-Oeste",
        "city": "Goiânia", "stadium_name": "OBA", "turf_type": "Natural", "capacity": 11788,
        "latitude": -16.6631, "longitude": -49.2336, "primary_color": "#dc2626", "secondary_color": "#ffffff",
        "yo_yo_index": 0, "promotions_to_a": 0, "relegations_to_b": 0, "immediate_returns": 0,
        "titles_serie_a": 0, "titles_serie_b": 0, "seasons_in_a": 0, "seasons_in_b": 15,
        "div_2026": "B", "base_strength": 71
    },
    {
        "slug": "avai", "name": "Avaí", "short_name": "AVA", "state_uf": "SC", "region": "Sul",
        "city": "Florianópolis", "stadium_name": "Ressacada", "turf_type": "Natural", "capacity": 17800,
        "latitude": -27.6664, "longitude": -48.5317, "primary_color": "#0284c7", "secondary_color": "#ffffff",
        "yo_yo_index": 10, "promotions_to_a": 5, "relegations_to_b": 5, "immediate_returns": 2,
        "titles_serie_a": 0, "titles_serie_b": 0, "seasons_in_a": 7, "seasons_in_b": 17,
        "div_2026": "B", "base_strength": 70
    },
    {
        "slug": "amazonas", "name": "Amazonas FC", "short_name": "AMA", "state_uf": "AM", "region": "Norte",
        "city": "Manaus", "stadium_name": "Arena da Amazônia", "turf_type": "Natural", "capacity": 44000,
        "latitude": -3.0831, "longitude": -60.0281, "primary_color": "#eab308", "secondary_color": "#111111",
        "yo_yo_index": 0, "promotions_to_a": 0, "relegations_to_b": 0, "immediate_returns": 0,
        "titles_serie_a": 0, "titles_serie_b": 0, "seasons_in_a": 0, "seasons_in_b": 3,
        "div_2026": "B", "base_strength": 69
    },
    {
        "slug": "paysandu", "name": "Paysandu", "short_name": "PAY", "state_uf": "PA", "region": "Norte",
        "city": "Belém", "stadium_name": "Curuzu", "turf_type": "Natural", "capacity": 16200,
        "latitude": -1.4439, "longitude": -48.4631, "primary_color": "#38bdf8", "secondary_color": "#ffffff",
        "yo_yo_index": 1, "promotions_to_a": 0, "relegations_to_b": 1, "immediate_returns": 0,
        "titles_serie_a": 0, "titles_serie_b": 0, "seasons_in_a": 3, "seasons_in_b": 10,
        "div_2026": "B", "base_strength": 68
    },
    {
        "slug": "remo", "name": "Clube do Remo", "short_name": "REM", "state_uf": "PA", "region": "Norte",
        "city": "Belém", "stadium_name": "Baenão", "turf_type": "Natural", "capacity": 13792,
        "latitude": -1.4483, "longitude": -48.4614, "primary_color": "#1e3a8a", "secondary_color": "#ffffff",
        "yo_yo_index": 0, "promotions_to_a": 0, "relegations_to_b": 0, "immediate_returns": 0,
        "titles_serie_a": 0, "titles_serie_b": 0, "seasons_in_a": 0, "seasons_in_b": 5,
        "div_2026": "A", "base_strength": 67
    },
    {
        "slug": "crb", "name": "CRB", "short_name": "CRB", "state_uf": "AL", "region": "Nordeste",
        "city": "Maceió", "stadium_name": "Rei Pelé", "turf_type": "Natural", "capacity": 17126,
        "latitude": -9.6711, "longitude": -35.7594, "primary_color": "#dc2626", "secondary_color": "#ffffff",
        "yo_yo_index": 0, "promotions_to_a": 0, "relegations_to_b": 0, "immediate_returns": 0,
        "titles_serie_a": 0, "titles_serie_b": 0, "seasons_in_a": 0, "seasons_in_b": 18,
        "div_2026": "B", "base_strength": 67
    },
    {
        "slug": "chapecoense", "name": "Chapecoense", "short_name": "CHA", "state_uf": "SC", "region": "Sul",
        "city": "Chapecó", "stadium_name": "Arena Condá", "turf_type": "Sintético", "capacity": 20089,
        "latitude": -27.1039, "longitude": -52.6069, "primary_color": "#16a34a", "secondary_color": "#ffffff",
        "yo_yo_index": 4, "promotions_to_a": 2, "relegations_to_b": 2, "immediate_returns": 1,
        "titles_serie_a": 0, "titles_serie_b": 1, "seasons_in_a": 7, "seasons_in_b": 7,
        "div_2026": "A", "base_strength": 66
    },
    {
        "slug": "ponte-preta", "name": "Ponte Preta", "short_name": "PON", "state_uf": "SP", "region": "Sudeste",
        "city": "Campinas", "stadium_name": "Moisés Lucarelli", "turf_type": "Natural", "capacity": 17728,
        "latitude": -22.9125, "longitude": -47.0503, "primary_color": "#27272a", "secondary_color": "#ffffff",
        "yo_yo_index": 5, "promotions_to_a": 2, "relegations_to_b": 3, "immediate_returns": 1,
        "titles_serie_a": 0, "titles_serie_b": 0, "seasons_in_a": 9, "seasons_in_b": 14,
        "div_2026": "B", "base_strength": 65
    },
    {
        "slug": "botafogo-sp", "name": "Botafogo-SP", "short_name": "BSP", "state_uf": "SP", "region": "Sudeste",
        "city": "Ribeirão Preto", "stadium_name": "Santa Cruz", "turf_type": "Natural", "capacity": 29292,
        "latitude": -21.2033, "longitude": -47.7919, "primary_color": "#dc2626", "secondary_color": "#111111",
        "yo_yo_index": 0, "promotions_to_a": 0, "relegations_to_b": 0, "immediate_returns": 0,
        "titles_serie_a": 0, "titles_serie_b": 0, "seasons_in_a": 0, "seasons_in_b": 6,
        "div_2026": "B", "base_strength": 64
    },
    {
        "slug": "athletic-mg", "name": "Athletic Club", "short_name": "ATH", "state_uf": "MG", "region": "Sudeste",
        "city": "São João del-Rei", "stadium_name": "Arena Sicredi", "turf_type": "Natural", "capacity": 10000,
        "latitude": -21.1356, "longitude": -44.2611, "primary_color": "#18181b", "secondary_color": "#ffffff",
        "yo_yo_index": 0, "promotions_to_a": 0, "relegations_to_b": 0, "immediate_returns": 0,
        "titles_serie_a": 0, "titles_serie_b": 0, "seasons_in_a": 0, "seasons_in_b": 2,
        "div_2026": "B", "base_strength": 64
    },
    {
        "slug": "nautico", "name": "Náutico", "short_name": "NAU", "state_uf": "PE", "region": "Nordeste",
        "city": "Recife", "stadium_name": "Aflitos", "turf_type": "Natural", "capacity": 20856,
        "latitude": -8.0406, "longitude": -34.8992, "primary_color": "#ef4444", "secondary_color": "#ffffff",
        "yo_yo_index": 4, "promotions_to_a": 2, "relegations_to_b": 2, "immediate_returns": 0,
        "titles_serie_a": 0, "titles_serie_b": 0, "seasons_in_a": 5, "seasons_in_b": 12,
        "div_2026": "B", "base_strength": 63
    },
]


def compute_club_travel_km(club_data: dict, division_clubs: list[dict], rounds_played: int) -> float:
    """Calculate total round-trip air travel km across all away games in the division."""
    away_count = max(1, rounds_played // 2)
    others = [c for c in division_clubs if c["slug"] != club_data["slug"]]
    dists = [
        haversine_km(club_data["latitude"], club_data["longitude"], o["latitude"], o["longitude"])
        for o in others
    ]
    avg_round_trip = (sum(dists) / len(dists)) * 2.0
    return round(avg_round_trip * away_count, 0)


OFFICIAL_SERIE_A_2026 = [
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
        "form_last_5": "V,E,D,E,E", "points_last_5": 5,
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


def generate_season_teams_and_matches(
    db: Session,
    season: Season,
    division_clubs: list[dict],
    seed_offset: int,
):
    rng = random.Random(seed_offset)
    rounds = season.current_round
    is_live = season.is_current

    # Generate performance profiles for each club
    raw_teams = []
    for idx, c in enumerate(division_clubs):
        strength = c["base_strength"] + rng.uniform(-5.5, 5.5)
        # Create realistic narratives: some clubs surge in 2nd turn ("Rei do Returno"),
        # some start hot and fade ("Cavalo Paraguaio")
        turn1_mod = 0.0
        turn2_mod = 0.0
        if idx in (2, 11, 14):  # Strong 1st turn, drop in 2nd ("Cavalo Paraguaio")
            turn1_mod = 7.5
            turn2_mod = -6.5
        elif idx in (4, 6, 8):  # Slow start, explosive 2nd turn ("Rei do Returno")
            turn1_mod = -5.5
            turn2_mod = 8.0

        played_t1 = min(19, rounds)
        played_t2 = max(0, rounds - 19)

        win_prob_t1 = min(0.72, max(0.18, (strength + turn1_mod - 52.0) / 55.0))
        draw_prob_t1 = 0.27
        wins_t1 = int(round(played_t1 * win_prob_t1))
        draws_t1 = min(played_t1 - wins_t1, int(round(played_t1 * draw_prob_t1)))
        pts_t1 = wins_t1 * 3 + draws_t1

        win_prob_t2 = min(0.75, max(0.16, (strength + turn2_mod - 52.0) / 55.0))
        wins_t2 = int(round(played_t2 * win_prob_t2))
        draws_t2 = min(played_t2 - wins_t2, int(round(played_t2 * 0.26)))
        pts_t2 = wins_t2 * 3 + draws_t2

        wins = wins_t1 + wins_t2
        draws = draws_t1 + draws_t2
        losses = rounds - wins - draws
        points = wins * 3 + draws

        home_played = (rounds + 1) // 2 if idx % 2 == 0 else rounds // 2
        away_played = rounds - home_played
        # Strong home advantage in Brazil (especially Série B)
        home_share = 0.63 if season.division == "A" else 0.68
        home_wins = min(home_played, int(round(wins * home_share)))
        away_wins = wins - home_wins
        home_draws = min(home_played - home_wins, int(round(draws * 0.52)))
        away_draws = min(away_played - away_wins, draws - home_draws)
        home_losses = home_played - home_wins - home_draws
        away_losses = away_played - away_wins - away_draws

        gf = max(rounds // 2, int(round(wins * 1.85 + draws * 0.85 + losses * 0.45 + rng.randint(-3, 5))))
        ga = max(rounds // 3, int(round(losses * 1.65 + draws * 0.85 + wins * 0.42 + rng.randint(-3, 4))))
        home_gf = int(round(gf * 0.61))
        away_gf = gf - home_gf
        home_ga = int(round(ga * 0.39))
        away_ga = ga - home_ga

        xg_for = round(gf + rng.uniform(-5.2, 4.8), 1)
        xg_against = round(ga + rng.uniform(-4.5, 5.1), 1)
        shots_per_game = round(10.5 + (strength - 65) * 0.24 + rng.uniform(-1.2, 1.4), 1)
        shots_per_goal = round((shots_per_game * rounds) / max(1, gf), 1)
        shots_conceded_per_goal = round(((16.5 - (strength - 65) * 0.18) * rounds) / max(1, ga), 1)
        possession_avg = round(min(62.5, max(38.5, 48.0 + (strength - 73) * 0.55 + rng.uniform(-3.0, 3.0))), 1)
        clean_sheets = min(rounds, max(3, int(round(rounds * 0.34 - (ga / rounds) * 4.2 + rng.randint(2, 5)))))

        # Goal timing distribution (6 bands summing to gf and ga)
        weights_gf = [rng.uniform(0.11, 0.17), rng.uniform(0.13, 0.18), rng.uniform(0.15, 0.20),
                      rng.uniform(0.15, 0.20), rng.uniform(0.16, 0.21), rng.uniform(0.18, 0.26)]
        w_sum = sum(weights_gf)
        bands_gf = [int(round(gf * (w / w_sum))) for w in weights_gf]
        bands_gf[5] += gf - sum(bands_gf)
        goals_85_plus = max(1, int(round(bands_gf[5] * rng.uniform(0.42, 0.68))))

        weights_ga = [rng.uniform(0.11, 0.17), rng.uniform(0.13, 0.18), rng.uniform(0.15, 0.20),
                      rng.uniform(0.15, 0.20), rng.uniform(0.16, 0.21), rng.uniform(0.18, 0.26)]
        wa_sum = sum(weights_ga)
        bands_ga = [int(round(ga * (w / wa_sum))) for w in weights_ga]
        bands_ga[5] += ga - sum(bands_ga)
        ga_85_plus = max(1, int(round(bands_ga[5] * rng.uniform(0.40, 0.65))))

        # Form Last 5
        form_choices = []
        pts_5 = 0
        for _ in range(5):
            r_val = rng.random()
            if r_val < win_prob_t2:
                form_choices.append("V")
                pts_5 += 3
            elif r_val < win_prob_t2 + 0.26:
                form_choices.append("E")
                pts_5 += 1
            else:
                form_choices.append("D")

        travel_km = compute_club_travel_km(c, division_clubs, rounds)
        aprov_total = (points / (rounds * 3)) * 100.0
        is_synt = c["turf_type"] == "Sintético"
        aprov_synthetic = round(min(82.0, max(18.0, aprov_total + (11.5 if is_synt else rng.uniform(-12.0, 3.0)))), 1)
        aprov_natural = round(min(80.0, max(22.0, aprov_total + (-3.5 if is_synt else rng.uniform(-2.0, 5.5)))), 1)

        occ_rate = round(min(94.0, max(32.0, 48.0 + (strength - 68) * 1.6 + rng.uniform(-8, 10))), 1)
        avg_att = int(round(c["capacity"] * (occ_rate / 100.0)))

        # Time slots performance JSON
        time_slots = {
            "Dom 16h": round(min(85.0, max(20.0, aprov_total + rng.uniform(-6.0, 8.0))), 1),
            "Qua 21h30": round(min(85.0, max(20.0, aprov_total + rng.uniform(-8.0, 7.0))), 1),
            "Sáb 18h30": round(min(85.0, max(20.0, aprov_total + rng.uniform(-7.0, 7.0))), 1),
            "Dom 11h": round(min(85.0, max(15.0, aprov_total + rng.uniform(-11.0, 9.0))), 1),
            "Seg/Sex 20h": round(min(85.0, max(18.0, aprov_total + rng.uniform(-8.0, 8.0))), 1),
        }

        raw_teams.append({
            "club_slug": c["slug"],
            "club_meta": c,
            "points": points,
            "played": rounds,
            "wins": wins,
            "draws": draws,
            "losses": losses,
            "gf": gf,
            "ga": ga,
            "gd": gf - ga,
            "pts_t1": pts_t1,
            "played_t1": played_t1,
            "pts_t2": pts_t2,
            "played_t2": played_t2,
            "home_played": home_played,
            "home_wins": home_wins,
            "home_draws": home_draws,
            "home_losses": home_losses,
            "home_gf": home_gf,
            "home_ga": home_ga,
            "away_played": away_played,
            "away_wins": away_wins,
            "away_draws": away_draws,
            "away_losses": away_losses,
            "away_gf": away_gf,
            "away_ga": away_ga,
            "points_vs_g6": max(2, int(round(points * rng.uniform(0.18, 0.34)))),
            "played_vs_g6": min(12, max(6, rounds // 3)),
            "points_vs_z4": max(4, int(round(points * rng.uniform(0.22, 0.38)))),
            "played_vs_z4": min(8, max(5, rounds // 4)),
            "xg_for": xg_for,
            "xg_against": xg_against,
            "shots_per_game": shots_per_game,
            "shots_per_goal": shots_per_goal,
            "shots_conceded_per_goal": shots_conceded_per_goal,
            "possession_avg": possession_avg,
            "clean_sheets": clean_sheets,
            "comeback_points": rng.randint(3, 16),
            "points_dropped_leading": rng.randint(2, 15),
            "bands_gf": bands_gf,
            "goals_85_plus": goals_85_plus,
            "bands_ga": bands_ga,
            "ga_85_plus": ga_85_plus,
            "travel_km": travel_km,
            "avg_attendance": avg_att,
            "occupation_rate": occ_rate,
            "aprov_synthetic": aprov_synthetic,
            "aprov_natural": aprov_natural,
            "yellow_cards": rng.randint(62, 98),
            "red_cards": rng.randint(2, 9),
            "coach_changes": 0 if wins >= 15 else rng.choice([1, 1, 2]),
            "aprov_before_coach": round(max(22.0, aprov_total - rng.uniform(6.0, 14.0)), 1),
            "aprov_after_coach": round(min(74.0, aprov_total + rng.uniform(4.0, 12.0)), 1),
            "form_last_5": ",".join(form_choices),
            "points_last_5": pts_5,
            "time_slots": time_slots,
        })

    # Sort overall standings by Brasileirão tiebreakers: Points, Wins, GD, GF
    raw_teams.sort(key=lambda x: (x["points"], x["wins"], x["gd"], x["gf"]), reverse=True)
    for pos, item in enumerate(raw_teams, start=1):
        item["position"] = pos
        item["prev_position"] = max(1, min(20, pos + rng.choice([-2, -1, 0, 0, 1, 2])))

    # Rank 1st turn & 2nd turn separately
    t1_sorted = sorted(raw_teams, key=lambda x: (x["pts_t1"], x["gd"]), reverse=True)
    for r1, item in enumerate(t1_sorted, start=1):
        item["rank_turn_1"] = r1

    t2_sorted = sorted(raw_teams, key=lambda x: (x["pts_t2"], x["gd"]), reverse=True)
    for r2, item in enumerate(t2_sorted, start=1):
        item["rank_turn_2"] = r2

    # Generate round-by-round progression (1..rounds) for Bump Chart
    round_pts_matrix = {item["club_slug"]: [] for item in raw_teams}
    for item in raw_teams:
        pts_curr = 0
        target_t1 = item["pts_t1"]
        target_total = item["points"]
        for r in range(1, rounds + 1):
            if r <= 19:
                expected = (target_t1 / 19.0) * r
            else:
                expected = target_t1 + ((target_total - target_t1) / max(1, rounds - 19)) * (r - 19)
            step = max(0, min(3, int(round(expected - pts_curr + rng.uniform(-0.6, 0.6)))))
            if step == 2:
                step = 1
            if r == 19:
                pts_curr = target_t1
            elif r == rounds:
                pts_curr = target_total
            else:
                pts_curr += step
            round_pts_matrix[item["club_slug"]].append(pts_curr)

    round_rank_matrix = {item["club_slug"]: [] for item in raw_teams}
    for r_idx in range(rounds):
        order_r = sorted(
            raw_teams,
            key=lambda x: (round_pts_matrix[x["club_slug"]][r_idx], -x["rank_turn_1"] if r_idx < 19 else -x["position"]),
            reverse=True,
        )
        for rk, it in enumerate(order_r, start=1):
            round_rank_matrix[it["club_slug"]].append({
                "round": r_idx + 1,
                "position": rk,
                "points": round_pts_matrix[it["club_slug"]][r_idx],
            })

    # Compute Monte Carlo probabilities & Remaining Schedule (SOS) for the 6 remaining rounds if Live
    club_db_map = {c.slug: c for c in db.query(Club).all()}

    for item in raw_teams:
        pos = item["position"]
        pts = item["points"]
        lead_pts = raw_teams[0]["points"]
        g4_pts = raw_teams[3]["points"]
        g6_pts = raw_teams[5]["points"]
        z4_pts = raw_teams[16]["points"]

        if is_live:
            # Realistic Monte Carlo probabilities at Round 32/38
            prob_title = round(max(0.0, min(96.0, 75.0 * math.exp(-0.38 * max(0, lead_pts - pts)) if pos <= 6 else 0.0)), 1)
            prob_g4 = round(max(0.1, min(99.8, 100.0 / (1.0 + math.exp(-0.55 * (pts - g4_pts + 1.2))))), 1)
            prob_g6 = round(max(0.2, min(99.9, 100.0 / (1.0 + math.exp(-0.55 * (pts - g6_pts + 1.5))))), 1)
            prob_z4 = round(max(0.1, min(99.5, 100.0 / (1.0 + math.exp(0.58 * (pts - z4_pts - 0.8))))), 1)
            prob_sula = round(max(0.0, min(95.0, 100.0 - prob_g6 - prob_z4)) if 5 <= pos <= 15 else 12.0, 1)
            prob_delta = round((item["points_last_5"] - 7.5) * 1.4, 1)
        else:
            prob_title = 100.0 if pos == 1 else 0.0
            prob_g4 = 100.0 if pos <= 4 else 0.0
            prob_g6 = 100.0 if pos <= 6 else 0.0
            prob_sula = 100.0 if 7 <= pos <= 12 else 0.0
            prob_z4 = 100.0 if pos >= 17 else 0.0
            prob_delta = 0.0

        # Remaining 6 rounds schedule (R33 to R38)
        others = [t for t in raw_teams if t["club_slug"] != item["club_slug"]]
        rng.shuffle(others)
        rem_opps = others[:6]
        rem_schedule = []
        sos_accum = 0.0
        for r_off, opp in enumerate(rem_opps, start=1):
            is_home = (r_off % 2 == 1) if pos % 2 == 0 else (r_off % 2 == 0)
            opp_pos = opp["position"]
            diff_score = (21 - opp_pos) * 4.2 + (0 if is_home else 14.0)
            sos_accum += diff_score
            if diff_score >= 62:
                diff_label = "PEDREIRA"
            elif diff_score >= 38:
                diff_label = "EQUILIBRADO"
            else:
                diff_label = "ACESSIVEL"
            is_direct = abs(pos - opp_pos) <= 3 and (pos <= 6 or pos >= 15)
            rem_schedule.append({
                "round": rounds + r_off,
                "opponent_slug": opp["club_slug"],
                "opponent_name": opp["club_meta"]["name"],
                "opponent_short": opp["club_meta"]["short_name"],
                "opponent_position": opp_pos,
                "venue": "C" if is_home else "F",
                "difficulty": diff_label,
                "difficulty_score": round(diff_score, 1),
                "is_six_pointer": is_direct,
            })
        sos_score = round(min(98.0, max(18.0, sos_accum / 6.0)), 1)

        c_obj = club_db_map[item["club_slug"]]
        st = SeasonTeam(
            season_id=season.id,
            club_id=c_obj.id,
            position=pos,
            prev_position=item["prev_position"],
            points=pts,
            played=rounds,
            wins=item["wins"],
            draws=item["draws"],
            losses=item["losses"],
            goals_for=item["gf"],
            goals_against=item["ga"],
            goal_diff=item["gd"],
            points_turn_1=item["pts_t1"],
            played_turn_1=item["played_t1"],
            rank_turn_1=item["rank_turn_1"],
            points_turn_2=item["pts_t2"],
            played_turn_2=item["played_t2"],
            rank_turn_2=item["rank_turn_2"],
            home_played=item["home_played"],
            home_wins=item["home_wins"],
            home_draws=item["home_draws"],
            home_losses=item["home_losses"],
            home_gf=item["home_gf"],
            home_ga=item["home_ga"],
            away_played=item["away_played"],
            away_wins=item["away_wins"],
            away_draws=item["away_draws"],
            away_losses=item["away_losses"],
            away_gf=item["away_gf"],
            away_ga=item["away_ga"],
            points_vs_g6=item["points_vs_g6"],
            played_vs_g6=item["played_vs_g6"],
            points_vs_z4=item["points_vs_z4"],
            played_vs_z4=item["played_vs_z4"],
            xg_for=item["xg_for"],
            xg_against=item["xg_against"],
            shots_per_game=item["shots_per_game"],
            shots_per_goal=item["shots_per_goal"],
            shots_conceded_per_goal=item["shots_conceded_per_goal"],
            possession_avg=item["possession_avg"],
            clean_sheets=item["clean_sheets"],
            comeback_points=item["comeback_points"],
            points_dropped_leading=item["points_dropped_leading"],
            goals_0_15=item["bands_gf"][0],
            goals_16_30=item["bands_gf"][1],
            goals_31_45=item["bands_gf"][2],
            goals_46_60=item["bands_gf"][3],
            goals_61_75=item["bands_gf"][4],
            goals_76_90=item["bands_gf"][5],
            goals_85_plus=item["goals_85_plus"],
            ga_0_15=item["bands_ga"][0],
            ga_16_30=item["bands_ga"][1],
            ga_31_45=item["bands_ga"][2],
            ga_46_60=item["bands_ga"][3],
            ga_61_75=item["bands_ga"][4],
            ga_76_90=item["bands_ga"][5],
            ga_85_plus=item["ga_85_plus"],
            travel_km=item["travel_km"],
            avg_attendance=item["avg_attendance"],
            occupation_rate=item["occupation_rate"],
            aprov_synthetic=item["aprov_synthetic"],
            aprov_natural=item["aprov_natural"],
            yellow_cards=item["yellow_cards"],
            red_cards=item["red_cards"],
            coach_changes=item["coach_changes"],
            aprov_before_coach=item["aprov_before_coach"],
            aprov_after_coach=item["aprov_after_coach"],
            form_last_5=item["form_last_5"],
            points_last_5=item["points_last_5"],
            prob_title=prob_title,
            prob_g4=prob_g4,
            prob_g6=prob_g6,
            prob_sula=prob_sula,
            prob_z4=prob_z4,
            prob_delta_main=prob_delta,
            sos_score=sos_score,
            round_progression_json=json.dumps(round_rank_matrix[item["club_slug"]]),
            remaining_schedule_json=json.dumps(rem_schedule),
            time_slots_json=json.dumps(item["time_slots"]),
        )
        db.add(st)

    # Create 10 exciting fixtures for the Next/Current Round (Round 33 if live, Round 38 if completed)
    target_round = rounds + 1 if is_live else 38
    # Pair teams strategically so there are high-stakes "Jogos de 6 Pontos" for Title, G4/Acesso, and Z4!
    pairings = [
        (0, 1, True, "Duelo Direto pelo Título (6 Pontos)"),
        (2, 4, True, "Confronto Direto G4 / Libertadores" if season.division == "A" else "Batalha Direta pelo Acesso G4"),
        (3, 5, True, "Disputa Direta G4/G6" if season.division == "A" else "Confronto Direto G4"),
        (15, 16, True, "Final Contra o Z4 (Jogo de 6 Pontos)"),
        (14, 17, True, "Duelo Dramático Contra o Rebaixamento"),
        (6, 9, False, "Briga por Vaga Internacional" if season.division == "A" else "Perseguição ao G4"),
        (7, 10, False, "Confronto de Meio de Tabela"),
        (8, 11, False, "Duelo de Estabilidade"),
        (12, 18, False, "Pressão na Parte Baixa"),
        (13, 19, False, "Sobrevivência na Reta Final"),
    ]
    slots = ["Sáb 16h", "Sáb 18h30", "Sáb 21h", "Dom 11h", "Dom 16h", "Dom 16h", "Dom 18h30", "Dom 20h", "Qua 21h30", "Qui 20h"]

    for m_idx, (h_i, a_i, is_six, label) in enumerate(pairings):
        h_team = raw_teams[h_i]
        a_team = raw_teams[a_i]
        h_club = club_db_map[h_team["club_slug"]]
        a_club = club_db_map[a_team["club_slug"]]

        diff_pts = (h_team["points"] - a_team["points"]) + 4.5  # Home advantage
        p_home = round(min(72.0, max(20.0, 44.0 + diff_pts * 1.4)), 1)
        p_draw = round(min(34.0, max(21.0, 29.0 - abs(diff_pts) * 0.35)), 1)
        p_away = round(max(8.0, 100.0 - p_home - p_draw), 1)

        db.add(
            Match(
                season_id=season.id,
                round_number=target_round,
                home_club_id=h_club.id,
                away_club_id=a_club.id,
                home_score=None if is_live else rng.randint(0, 3),
                away_score=None if is_live else rng.randint(0, 2),
                status="SCHEDULED" if is_live else "FINISHED",
                kickoff_slot=slots[m_idx],
                stadium=h_club.stadium_name,
                is_six_pointer=is_six,
                six_pointer_label=label,
                pred_home_win=p_home,
                pred_draw=p_draw,
                pred_away_win=p_away,
            )
        )


def seed_division_history(db: Session):
    """Seed 2015–2026 division trajectory for key Yo-Yo and elite clubs to power the Ponte Série A <-> B."""
    club_db_map = {c.slug: c for c in db.query(Club).all()}
    years = list(range(2015, 2027))

    trajectories = {
        "coritiba":    [("A",15),("A",15),("A",17),("B",10),("B",3),("A",19),("B",3),("A",15),("A",19),("B",12),("B",7),("B",7)],
        "goias":       [("A",19),("B",13),("B",14),("B",4),("A",10),("A",18),("B",2),("A",13),("A",18),("B",6),("B",5),("B",4)],
        "america-mg":  [("B",4),("A",20),("B",1),("A",18),("B",5),("B",2),("A",8),("A",10),("A",20),("B",8),("B",6),("B",8)],
        "sport":       [("A",6),("A",14),("A",15),("A",17),("B",2),("A",15),("A",19),("B",7),("B",7),("B",3),("A",15),("A",17)],
        "vitoria":     [("B",3),("A",16),("A",16),("A",19),("B",12),("B",14),("B",18),("C",4),("B",1),("A",11),("A",13),("A",15)],
        "avai":        [("A",17),("B",2),("A",18),("B",3),("A",20),("B",9),("B",4),("A",19),("B",13),("B",10),("B",9),("B",11)],
        "atletico-go": [("B",14),("B",1),("A",20),("B",6),("B",4),("A",13),("A",9),("A",18),("B",4),("A",19),("B",5),("B",5)],
        "vasco":       [("A",18),("B",3),("A",7),("A",16),("A",12),("A",17),("B",10),("B",4),("A",15),("A",10),("A",11),("A",11)],
        "bahia":       [("B",9),("B",4),("A",12),("A",11),("A",11),("A",14),("A",18),("B",3),("A",16),("A",8),("A",7),("A",8)],
        "fortaleza":   [("C",5),("C",6),("C",2),("B",1),("A",9),("A",16),("A",4),("A",8),("A",10),("A",4),("A",5),("A",4)],
        "ceara":       [("B",15),("B",10),("B",3),("A",15),("A",16),("A",11),("A",11),("A",17),("B",11),("B",4),("A",16),("A",18)],
        "criciuma":    [("B",12),("B",8),("B",13),("B",14),("B",19),("C",16),("C",4),("B",8),("B",3),("A",17),("B",3),("B",2)],
        "juventude":   [("C",11),("C",4),("B",9),("B",19),("C",3),("B",3),("A",16),("A",20),("B",2),("A",15),("A",16),("A",19)],
        "cruzeiro":    [("A",8),("A",12),("A",5),("A",8),("A",17),("B",11),("B",14),("B",1),("A",14),("A",9),("A",8),("A",9)],
        "botafogo":    [("B",1),("A",5),("A",10),("A",9),("A",15),("A",20),("B",1),("A",11),("A",5),("A",1),("A",3),("A",3)],
        "palmeiras":   [("A",9),("A",1),("A",2),("A",1),("A",3),("A",7),("A",3),("A",1),("A",1),("A",2),("A",1),("A",1)],
        "flamengo":    [("A",12),("A",3),("A",6),("A",2),("A",1),("A",1),("A",2),("A",5),("A",4),("A",3),("A",2),("A",2)],
    }

    for slug, hist in trajectories.items():
        if slug not in club_db_map:
            continue
        c_id = club_db_map[slug].id
        for yr, (div, pos) in zip(years, hist):
            if div == "A" and pos == 1:
                outcome = "CAMPEAO"
            elif div == "A" and pos <= 4:
                outcome = "G4"
            elif div == "A" and pos >= 17:
                outcome = "REBAIXADO"
            elif div in ("B", "C") and pos <= 4:
                outcome = "ACESSO"
            elif div == "B" and pos >= 17:
                outcome = "REBAIXADO"
            else:
                outcome = "PERMANENCIA"

            pts = max(32, 84 - pos * 2)
            db.add(
                DivisionHistory(
                    club_id=c_id,
                    year=yr,
                    division=div,
                    final_position=pos,
                    points=pts,
                    outcome=outcome,
                )
            )


def ensure_seeded(db: Session):
    """Idempotent seed function called on startup."""
    if db.query(Club).count() > 0:
        return

    for c_data in CLUBS_MASTER:
        payload = {k: v for k, v in c_data.items() if k not in ("div_2026", "base_strength")}
        db.add(Club(**payload))
    db.commit()

    clubs_a = [c for c in CLUBS_MASTER if c["div_2026"] == "A"]
    clubs_b = [c for c in CLUBS_MASTER if c["div_2026"] == "B"]

    season_specs = [
        {"year": 2026, "division": "A", "is_current": True, "current_round": 34, "seed": 202601},
        {"year": 2026, "division": "B", "is_current": True, "current_round": 34, "seed": 202602},
        {"year": 2025, "division": "A", "is_current": False, "current_round": 38, "seed": 202501},
        {"year": 2025, "division": "B", "is_current": False, "current_round": 38, "seed": 202502},
        {"year": 2024, "division": "A", "is_current": False, "current_round": 38, "seed": 202401},
        {"year": 2024, "division": "B", "is_current": False, "current_round": 38, "seed": 202402},
    ]

    for spec in season_specs:
        div = spec["division"]
        season = Season(
            year=spec["year"],
            division=div,
            is_current=spec["is_current"],
            current_round=spec["current_round"],
            total_rounds=38,
            magic_title_pts=82 if (div == "A" and spec["year"] == 2026) else (77 if div == "A" else 72),
            magic_g4_pts=63 if div == "A" else 64,
            magic_g6_pts=58 if div == "A" else 60,
            magic_sula_pts=47 if div == "A" else 50,
            magic_escape_z4_pts=45 if div == "A" else 44,
        )
        db.add(season)
        db.commit()
        db.refresh(season)

        div_clubs = clubs_a if div == "A" else clubs_b
        generate_season_teams_and_matches(db, season, div_clubs, spec["seed"])
        db.commit()

    seed_division_history(db)
    db.commit()

    from app.services.table_sync import sync_serie_a_2026_standings
    sync_serie_a_2026_standings(db)
