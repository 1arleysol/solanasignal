# 🤖 SolanaSignal — DeFi Intelligence Agent

> Autonomous DeFi agent on Solana that fetches real-time market intelligence via **Ace Data Cloud**, pays for data autonomously via **x402 micropayments**, stores every decision on-chain using **OOBE Protocol**, and executes yield strategies via Jupiter & Kamino.

**🎥 [Watch Demo Video](https://youtu.be/kkW13cGp1Dw)** | **🌐 [Live Dashboard](https://defi-agent-eight.vercel.app)** | **📋 [Superteam Bounty](https://superteam.fun/earn/listing/autonomous-agent-bounty-oobe-ace-data-cloud)**

[![Powered by OOBE Protocol](https://img.shields.io/badge/Powered%20by-OOBE%20Protocol-7C3AED)](https://oobeprotocol.ai)
[![Ace Data Cloud](https://img.shields.io/badge/Data%20by-Ace%20Data%20Cloud-00D395)](https://acedata.cloud)
[![x402 Payments](https://img.shields.io/badge/Payments-x402%20USDC-F59E0B)](https://facilitator.acedata.cloud)
[![Solana](https://img.shields.io/badge/Chain-Solana-9945FF)](https://solana.com)
[![Live](https://img.shields.io/badge/Status-Live%20on%20Vercel-00C853)](https://defi-agent-eight.vercel.app)

---

## 🎯 What it does

SolanaSignal is a **fully autonomous DeFi agent** that runs without human intervention:

1. Every 5 minutes it **pays for its own data** via x402 micropayments (0.001 USDC on Solana)
2. Fetches **real-time market intelligence** from Ace Data Cloud (SERP + LLM)
3. Makes AI-driven trading decisions and **stores them on-chain** via OOBE Protocol
4. Executes swaps via Jupiter or yield strategies via Kamino when confidence > 75%
5. Broadcasts live signals to the dashboard via WebSocket

No cron jobs. No manual triggers. The agent self-funds, self-decides, self-executes.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DATA LAYER                           │
│  AceData SERP API  →  AceData LLM API  →  x402 Pay     │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   AGENT CORE (OOBE)                     │
│  Decision Engine  →  On-Chain Memory  →  Merkle Tree    │
│         PDAs + Memo v2 logs on Solana                   │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│               EXECUTION LAYER (Solana DeFi)             │
│     Jupiter Swaps    |    Kamino Yield Strategies       │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Agent Loop (every 5 minutes)

1. **💳 x402 Pay** — Agent autonomously pays 0.001 USDC to AceData facilitator via Solana
2. **🔍 SERP Fetch** — AceData SERP API fetches real-time news for each watched token
3. **🧠 LLM Analyze** — AceData LLM proxy (GPT-4o-mini) produces `{signal, confidence, reasoning}`
4. **⛓️ OOBE Store** — Decision hash added to on-chain Merkle tree, Memo v2 written to Solana
5. **⚡ Execute** — If confidence > 75%: swap via Jupiter (BUY/SELL) or yield via Kamino (HOLD)
6. **📡 Broadcast** — WebSocket pushes live signal to dashboard in real-time

## 🎯 Key Innovation: x402 Payment Loop

The agent **self-funds its intelligence**. Before each AceData query, it sends an on-chain USDC micropayment via the x402 protocol — the same protocol that both OOBE and AceData share. This creates a fully autonomous, self-paying agent:

```typescript
// Agent pays for its own data before fetching
const payment = await payForQuery('SERP', token)
// → Sends 0.001 USDC on Solana, logs tx hash on-chain

// Only after payment confirmed, fetch data
const news = await searchTokenNews(token)
const signal = await analyzeSignalWithLLM(token, news)

// Store decision with payment proof on-chain
await storeDecisionOnChain({ ...signal, paymentTxHash: payment.txHash })
```

## 📦 Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React + Tailwind CSS |
| Backend | Node.js + Fastify + WebSocket |
| Database | Supabase (PostgreSQL) |
| Blockchain | Solana (devnet/mainnet) |
| AI Data | Ace Data Cloud (SERP + LLM) |
| Agent Platform | OOBE Protocol SDK |
| DeFi | Jupiter Aggregator + Kamino Protocol |
| Payments | x402 Protocol (USDC on Solana) |
| Wallet | Phantom / Backpack |

## 🚀 Setup

### 1. Clone and install

```bash
git clone https://github.com/1arleysol/solanasignal
cd solanasignal
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in your API keys (see .env.example for details)
```

**Required keys:**
- `ACEDATA_API_KEY` — from [platform.acedata.cloud](https://platform.acedata.cloud)
- `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` — from your Supabase project
- `AGENT_WALLET_PRIVATE_KEY` — Solana wallet with SOL + USDC (devnet)

### 3. Set up Supabase database

Run `supabase/schema.sql` in your Supabase SQL editor.

### 4. Fund the agent wallet (devnet)

```bash
# Get devnet SOL
solana airdrop 2 <your-agent-wallet-address> --url devnet

# Get devnet USDC from spl-token faucet
```

### 5. Start development

```bash
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
```

### 6. Start the agent

Click **Start Agent** on the dashboard, or via API:

```bash
curl -X POST http://localhost:3001/api/agent/start
```

## 📊 Dashboard Pages

- **/** — Live dashboard: PnL, signals, x402 payments counter, agent terminal
- **/agent** — Agent config: watchlist, risk profile, OOBE personality on-chain
- **/history** — Full decision history with AI reasoning + Solana Explorer links
- **/onchain** — On-chain audit: OOBE PDA, Merkle tree, Memo v2 logs, x402 payments

## 🌐 On-Chain Proof

Every agent decision creates:
1. **Solana Memo v2 transaction** — `OOBE:DECISION:v1:token=SOL:signal=BUY:conf=82:merkle=...`
2. **Merkle tree leaf** — SHA-256 hash of decision added to running tree
3. **x402 payment tx** — 0.001 USDC transfer to AceData facilitator wallet
4. **Supabase record** — Full decision with proof stored for dashboard display

All transactions link to [Solana Explorer](https://solscan.io) for verification.

## 🏆 Bounty Context

Built for the **OOBE × Ace Data Cloud Autonomous Agent Bounty** on [Superteam Earn](https://superteam.fun/earn/listing/autonomous-agent-bounty-oobe-ace-data-cloud).

**Why this wins:**
- ✅ Uses OOBE Protocol for on-chain agent memory (PDAs + Merkle Trees)
- ✅ Uses Ace Data Cloud for real-time SERP + LLM analysis (3+ distinct services)
- ✅ Implements x402 micropayment loop — exact intersection of both protocols
- ✅ Fully autonomous: no human input required from trigger to execution
- ✅ Production-quality dashboard with real-time WebSocket updates
- ✅ Every decision verifiable on Solana Explorer
- ✅ Live demo running 24/7 on Vercel

---

Built with ❤️ on Solana | OOBE Protocol × Ace Data Cloud × x402
