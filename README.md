# 🇧🇷 Brasileirão Analytics — Série A & B Intelligence Platform

Plataforma escalável de **Sports Analytics & Inteligência Futebolística** para análise profunda do **Campeonato Brasileiro Série A e Série B** (Temporada Atual Ao Vivo + Série Histórica dos Pontos Corridos 2003–Presente).

---

## 🏗️ Arquitetura do Projeto (Monorepo)

- **`/backend` (Python FastAPI + SQLAlchemy 2.0 + NumPy/SciPy):**
  - **Motor de Simulação de Monte Carlo (10.000 cenários):** Probabilidades em tempo real de Título, Libertadores (G4/G6), Acesso na Série B, Sul-Americana e Rebaixamento (Z4).
  - **Modelo Matemático de Poisson:** Previsão de probabilidades de confronto e matriz de placares exatos mais prováveis.
  - **Calculadora "Conta do Chá" & Strength of Schedule (SOS):** Cálculo dinâmico de meta de pontos e dificuldade ponderada da tabela restante.
  - **Dual-Database Adapter:** Suporte nativo a **PostgreSQL 16** (Docker/Supabase) para produção em escala e fallback automático em **SQLite** (`brasileirao.db`) para desenvolvimento local instantâneo.
- **`/frontend` (Next.js 15 App Router + TypeScript + `shadcn/ui` + Tailwind CSS + Recharts):**
  - Design system esportivo premium construído sobre **`shadcn/ui`**.
  - **6 Módulos Analíticos Interativos:**
    1. **Temporada Atual (Ao Vivo):** Tabela de Classificação + Probabilidades Monte Carlo + Momento (*Form 5J*) + Simulador Interativo da Rodada ("Secador Oficial") + Calculadora do Torcedor + Dificuldade da Reta Final (SOS).
    2. **Dinâmica de Turnos & Rodadas:** Gráfico de Corrida por Rodada (*Bump Chart*), 1º vs. 2º Turno (*Reis do Returno* vs. *Cavalo Paraguaio*), Curva do Número Mágico (45 pts / 64 pts) e Índice *Robin Hood*.
    3. **Raio-X Tático & Eficiência:** Quadrante de Criação × Solidez (xG vs. xGA), Letalidade Ofensiva, Heatmap do Relógio do Gol (Minutagem) e Poder de Reação (*Comeback Rate*).
    4. **Mando, Horários & Geografia:** Mandante vs. Visitante (*Dumbbell Chart*), Quilometragem Aérea Viajada (Fórmula de Haversine), Gramado Sintético vs. Natural e Fator Horário/Público.
    5. **Confronto Direto (*Tale of the Tape*):** Radar Comparativo de 6 Eixos, Histórico de Tabus/Freguesias e Termômetro de Poisson.
    6. **Histórico (2003+) & Ponte Série A ↔ B:** Ranking de Clubes Ioiô (*Efeito Gangorra*), Matriz de Trajetória de Divisão, Taxa de *Bate e Volta* dos Rebaixados e Sobrevivência dos Recém-Promovidos (1º ao 4º da B).

---

## 🚀 Como Executar Localmente

### 1. Subir o Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- Documentação Swagger UI: `http://localhost:8000/docs`

### 2. Subir o Frontend (Next.js + shadcn/ui)
```bash
cd frontend
npm install
npm run dev
```
- Aplicação Web: `http://localhost:3000`

### 3. Via Docker Compose (PostgreSQL + Redis + API + Web)
```bash
docker compose up --build
```

