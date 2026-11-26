# StrategyLab AI

**Natural-Language Crypto Strategy Builder, Backtesting & Paper Trading Platform**

> Turn a trading idea into a structured strategy, evaluate it against historical market data, understand its risks, and test it with virtual funds.

**Project:** StrategyLab AI  
**Program:** SoSoValue WaveHack Buildathon  
**Status:** In development (MVP)  
**Target deployment:** Vercel (frontend), Railway (backend), Supabase (database/auth)

> **Disclaimer:** StrategyLab AI is a research and educational tool, not financial advice. Backtested or simulated results do not guarantee future performance. No real orders are placed by the MVP's paper-trading system.

## Overview

StrategyLab AI helps users design, validate, backtest, and simulate rules-based cryptocurrency trading strategies without needing to write code.

A user can describe a trading idea in plain English, such as:

> Buy BTC when its 10-day simple moving average crosses above its 30-day simple moving average. Close the position when the opposite crossover occurs.

The intended workflow is:

1. **Describe** a strategy in natural language.
2. **Parse** the description into a typed, editable strategy configuration using AI.
3. **Validate** the parameters, indicators, timeframes, and risk controls.
4. **Fetch** the available historical market data from SoSoValue.
5. **Backtest** the rules with a deterministic Python simulation engine.
6. **Analyze** returns, drawdowns, trades, and comparisons with buy-and-hold.
7. **Paper trade** the validated strategy with simulated capital and orders.

The AI proposes *rules and explanations*; the Python engine computes signals, transactions, and performance. The application does **not** execute arbitrary AI-generated Python code.

## Key MVP Features (Planned)

| Feature | Description |
| --- | --- |
| Natural-language strategy builder | Translate strategy prompts into editable, validated JSON rules |
| Technical indicators | SMA/EMA, RSI, and basic momentum strategies |
| Market data | SoSoValue-supported assets, pricing, and available historical candles |
| Backtesting engine | Reproducible signal generation, position simulation, fees, and slippage assumptions |
| Performance analytics | Equity curve, total return, drawdown, win rate, trade log, and buy-and-hold comparison |
| Risk assessment | Exposure limits, position sizing assumptions, and risk summaries |
| Paper trading | Virtual balance, simulated orders, positions, and strategy performance |
| Saved strategies | Authenticated user profiles and stored strategy configurations |
| Dashboard | Responsive charts and strategy management UI |

**MVP scope:** Prioritize daily-bar strategies and paper trading. Live execution through SoDEX is a **potential future integration**, dependent on access, permissions, and supported API workflows.

### Historical Data Limitations

Available history, candle intervals, rate limits, and endpoint access depend on the SoSoValue API account and current documentation. Do not assume that intraday candles or years of history are available. The UI should clearly show the actual dataset range and sample size for each backtest. A short sample is inadequate for strong statistical claims.

## Technology Stack

### Frontend (`frontend/`)

- **Next.js** (App Router), **React**, **TypeScript**
- **Tailwind CSS**, **shadcn/ui**, **Lucide React**
- **TradingView Lightweight Charts** for price and candlestick charts
- **Recharts** for equity curves and performance analytics
- **TanStack Query**, **Zustand**, **Axios**
- **React Hook Form**, **Zod**
- **Supabase Auth** for authentication
- **Vitest**, **Testing Library**, **Playwright** for testing

### Backend (`backend/`)

- **Python**, **FastAPI**, **Uvicorn**
- **OpenAI API** for natural-language strategy parsing into structured outputs
- **Pydantic** for schema validation
- **Pandas**, **NumPy**, **SciPy** for research and analytical computations
- **Custom deterministic backtester** for signal and order simulation
- **SQLAlchemy**, **Alembic**, **PostgreSQL** for persistence
- **Redis + RQ** for asynchronous backtest jobs (when needed)
- **HTTPX** for upstream API calls; **Pytest** for testing

### External Services

- **SoSoValue API:** market intelligence and supported historical market data
- **Supabase:** PostgreSQL and authentication
- **SoDEX API (future/optional):** market/execution integration if access is approved

## Repository Structure

```text
strategylab/
├── frontend/                     # Next.js app created directly in this folder
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── strategies/
│   │   │   │   ├── backtests/
│   │   │   │   ├── paper-trading/
│   │   │   │   └── analytics/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── charts/
│   │   │   └── strategies/
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   └── supabase/
│   │   ├── stores/
│   │   └── types/
│   ├── .env.local                 # Local only; never commit
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   ├── services/
│   │   │   ├── ai_parser.py
│   │   │   ├── sosovalue.py
│   │   │   ├── backtester.py
│   │   │   ├── indicators.py
│   │   │   ├── risk_metrics.py
│   │   │   └── paper_trader.py
│   │   ├── models/
│   │   └── workers/
│   ├── tests/
│   ├── .env                       # Local only; never commit
│   └── requirements.txt           # Generate after dependency setup
├── README.md
├── CHANGELOG.md                   # Buildathon wave progress updates
└── .gitignore
```

> This is the **target structure**; create the folders and files progressively as features are implemented. The Next.js app lives directly in `strategylab/frontend`, **not** `strategylab/frontend/strategylab`.

## Prerequisites

- Node.js **20.9+** (a current LTS release is recommended; follow the installed Next.js version's requirements)
- npm
- Python **3.11+**
- Git
- Supabase project
- OpenAI API key
- SoSoValue API credentials/access for supported endpoints
- Optional: Redis for queued jobs

## Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL> strategylab
cd strategylab
```

Replace `<YOUR_REPOSITORY_URL>` with the actual repository URL, or open an existing `strategylab` checkout.

### 2. Create the frontend (first-time initialization only)

From the project root:

```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd frontend
```

**If `frontend/package.json` already exists, skip scaffolding** and instead run:

```bash
cd frontend
npm install
```

### 3. Install frontend packages

From `strategylab/frontend`:

```bash
npm install lightweight-charts recharts lucide-react
npm install openai zod
npm install @supabase/supabase-js @supabase/ssr
npm install zustand @tanstack/react-query axios
npm install react-hook-form @hookform/resolvers
npm install date-fns clsx tailwind-merge framer-motion
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @playwright/test
```

Initialize shadcn/ui:

```bash
npx shadcn@latest init
npx shadcn@latest add button card input textarea label select tabs dialog dropdown-menu table badge separator skeleton tooltip progress slider switch alert alert-dialog sheet sidebar scroll-area form checkbox sonner
```

> The CLI may prompt you to choose component styling or a component library. Follow its current interactive instructions. You do not need to reinstall packages already present in `package.json`.

### 4. Set up the Python backend

From the repository root:

```bash
mkdir backend
cd backend
python -m venv .venv
```

**Windows PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

**macOS/Linux:**

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
python -m pip install --upgrade pip
pip install fastapi "uvicorn[standard]" pydantic pydantic-settings python-dotenv openai httpx pandas numpy scipy sqlalchemy alembic "psycopg[binary]" redis rq pytest pytest-asyncio
```

Once confirmed, record the installed backend versions:

```bash
pip freeze > requirements.txt
```

If the backend folder already exists, do not overwrite it: activate its virtual environment and install from its existing `requirements.txt` instead.

### 5. Configure environment variables

Create `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_APP_NAME="StrategyLab AI"
NEXT_PUBLIC_API_URL="http://localhost:8000"
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=""
```

Create `backend/.env`:

```dotenv
OPENAI_API_KEY=""
SOSOVALUE_API_KEY=""
DATABASE_URL=""
REDIS_URL="redis://localhost:6379/0"
FRONTEND_ORIGIN="http://localhost:3000"
```

Set real values locally or in your hosting platform's secret settings. **Never commit secrets.** Only public configuration belongs in frontend variables prefixed with `NEXT_PUBLIC_`. Keep OpenAI and SoSoValue secret keys on the backend.

The precise SoSoValue headers, endpoints, permissions, and quotas must be implemented against the API documentation available to your account.

### 6. Run the frontend

From `strategylab/frontend`:

```bash
npm run dev
```

Open **http://localhost:3000**.

### 7. Run the backend

After implementing `backend/app/main.py`, from `strategylab/backend` with the virtual environment active:

```bash
uvicorn app.main:app --reload --port 8000
```

API docs: **http://localhost:8000/docs**  
Suggested health check: **http://localhost:8000/health** (once the route is implemented).

#### Minimal development API

To bring up the API before the remaining services exist, use:

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="StrategyLab AI API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "strategylab-api"}
```

## Planned API Endpoints

The following routes describe the intended API contract and may not yet exist:

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Service health check |
| `POST` | `/api/strategies/parse` | Parse natural language into validated strategy rules |
| `POST` | `/api/strategies` | Save a strategy |
| `GET` | `/api/strategies` | List a user's strategies |
| `POST` | `/api/backtests` | Create a backtest job |
| `GET` | `/api/backtests/{id}` | Retrieve backtest status and results |
| `GET` | `/api/markets/{asset}` | Get normalized permitted market data |
| `POST` | `/api/paper-trading/start` | Start a simulated strategy |
| `GET` | `/api/paper-trading/portfolio` | Retrieve virtual positions and P&L |

Responses, authentication, rate limiting, and request schemas will be versioned as endpoints are implemented.

## Backtesting Methodology

StrategyLab AI aims to produce **auditable, reproducible** simulations:

- Validate rule inputs against an explicit set of supported indicators and operators.
- Timestamp and record dataset source, date range, and interval.
- Calculate indicators using only information available at each historical point.
- Simulate signals without *look-ahead bias* (for example, generate a signal on a completed candle and execute on the next eligible candle).
- Model fees, slippage, position sizing, and insufficient balances.
- Explicitly track orders, fills, positions, and equity over time.
- Compare a strategy against a comparable buy-and-hold baseline.
- Report sample size and warn about weak or incomplete datasets.

**Illustrative metrics:** total return, maximum drawdown, win rate, profit factor, trade count, exposure, and Sharpe ratio (only when sample size and assumptions make it meaningful).

### Example Strategy Definition

```json
{
  "name": "BTC SMA Crossover",
  "asset": "BTC",
  "timeframe": "1d",
  "entry": {
    "type": "crossover",
    "left": { "indicator": "sma", "period": 10 },
    "right": { "indicator": "sma", "period": 30 }
  },
  "exit": {
    "type": "crossunder",
    "left": { "indicator": "sma", "period": 10 },
    "right": { "indicator": "sma", "period": 30 }
  },
  "initial_capital_usd": 10000,
  "fee_bps": 10,
  "slippage_bps": 5
}
```

This is a **proposed schema example**, not yet a guaranteed accepted API payload. All execution rules are validated and processed by the backend.

## Security Principles

- Never expose OpenAI, SoSoValue, or database credentials to browser JavaScript.
- Authorize access to every stored strategy and backtest.
- Validate all AI-generated rule objects before simulation.
- Do not run untrusted AI-generated code.
- Rate-limit expensive parsing and backtesting operations.
- Do not place real trades without explicit user authorization and supported exchange permissions.
- Store the assumptions underlying each result to make it reproducible.

## Testing

**Frontend (after test configuration is added):**

```bash
cd frontend
npx vitest run
npx playwright test
npm run build
```

**Backend:**

```bash
cd backend
pytest
```

Priority tests include moving-average correctness, crossovers, no-look-ahead execution, transaction-cost handling, empty/insufficient datasets, and deterministic repeated runs.

## Deployment Plan

| Component | Target host | Notes |
| --- | --- | --- |
| Frontend | Vercel | Set root directory to `frontend` |
| API | Railway | Deploy service from `backend` |
| Database/Auth | Supabase | Configure production policies and credentials |
| Optional Redis worker | Railway/managed Redis | Enable when background backtests are used |

Set the production API URL and approved CORS origins. Ensure scheduled or long-running backtests operate in a worker rather than relying on short-lived frontend requests.

## MVP Roadmap

- [ ] Scaffold Next.js app directly inside `frontend/`
- [ ] Configure shadcn/ui, dashboard layout, and navigation
- [ ] Set up FastAPI backend and health check
- [ ] Connect SoSoValue data adapter and validate accessible market data
- [ ] Build natural-language strategy parser with structured output
- [ ] Implement typed strategy validation and preset indicators
- [ ] Implement deterministic backtesting with fees/slippage
- [ ] Add equity curve, trade log, drawdown and benchmark comparisons
- [ ] Implement saved strategies and Supabase authentication
- [ ] Add paper-trading balance and virtual order ledger
- [ ] Test edge cases, auth, market-data failures and backtest accuracy
- [ ] Deploy a public demo and document the validated data limitations
- [ ] Prepare submission walkthrough, screenshots, and wave changelog

## SoSoValue WaveHack Submission

This project is designed for the **SoSoValue WaveHack** initiative and its theme of building an AI-powered, one-person on-chain financial business.

The project submission should include:

- Public GitHub repository
- Live application URL
- Setup and architecture documentation
- Demonstrable SoSoValue data integration
- Working end-to-end user workflow
- Team/project description
- Progress updates in `CHANGELOG.md`
- Optional short demo video

Consult the official program page for **current** deadlines, eligibility, API access, grant amounts, and judging rules. Awards are not guaranteed.

## Future Enhancements

- Multi-asset portfolio backtesting
- Walk-forward and out-of-sample evaluation
- Parameter robustness analysis and overfitting warnings
- Strategy alerts and scheduled scans
- Richer historical market coverage (subject to data permissions)
- SoDEX market data and user-approved trade previews
- Optional live execution, only after security review and approved API access

## Contributing

Contributions and feedback are welcome as the repository develops. For substantial changes, open an issue describing the proposed functionality and include tests for financial calculations where appropriate.

## License

**License not yet selected.** Until a license file is added, do not assume the repository grants permission to reuse or redistribute its code.

---

**StrategyLab AI** — *Build strategies with AI. Test them with data. Understand the risks before trading.*
