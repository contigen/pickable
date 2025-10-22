# Pickable

AI-powered business forecasting platform that transforms CSV data into conversational insights using AWS Bedrock Agents and RAG architecture.

## Overview

Pickable allows small business owners to upload their business data (CSV) and ask questions in plain English like "Which products will run out next month?" The system uses AWS Bedrock Agents with retrieval-augmented generation (RAG) to provide accurate forecasts, visual analytics, and actionable recommendations.

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, Recharts
- **Authentication**: NextAuth v5 (credentials provider)
- **Database**: TiDB Vector storage & DB, Prisma ORM
- **AI**: AWS Bedrock (Nova Premier, Nova Pro, Claude Haiku 4.5), AWS Titan Embeddings v2
- **Agent Framework**: AWS Bedrock Agents with custom action groups, plus Vercel AI SDK for structured outputs

### Set Up Environment Variables

Create a `env` file in the root directory:

```bash

DATABASE_URL=From TiDB
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1

# Bedrock Agent Run npm run setup:agent
BEDROCK_AGENT_ROLE_ARN=arn:aws:iam::your-account:role/your-bedrock-agent-role
BEDROCK_AGENT_ID=your_agent_id
BEDROCK_AGENT_ALIAS_ID=your_agent_alias_id

# Run npx auth secret
AUTH_SECRET=your_random_secret_string
```

### Set Up Database

```bash
# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

**Important**: TiDB MySQL vector support requires manual setup. Run this SQL after migrations:

```sql
ALTER TABLE BusinessEmbedding
ADD COLUMN vector VECTOR(1024);
```

### 4. Set Up AWS Bedrock Agent

```bash
npm run setup:agent
```

This script will:

- Create a Bedrock Agent
- Generate agent ID and alias ID

### 5. Run Development Server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing Instructions

#### 1. Test Onboarding

1. Navigate to `http://localhost:3000`
2. Click "Connect Your Data"
3. Enter email (e.g., `test@example.com`) and business name (e.g., `Test Business`)
4. Click "Continue"

#### 2. Test CSV Upload

1. After login, you'll be redirected to the onboarding flow
2. Click "Upload CSV" or drag and drop a CSV file
3. Sample CSV data [Retail-store_data.csv](./retail-store_data.csv):

4. Wait for processing (data slicing → embedding generation → vector storage)
5. You should see confirmation and be redirected to the dashboard

#### 3. Test Dashboard & Forecasting

1. Dashboard automatically generates forecast based on your data
2. Verify the following sections load:
   - Forecast summary with confidence scores
   - Smart insights cards
   - Revenue breakdown chart
   - Seasonal patterns chart
   - Customer acquisition chart
   - Inventory turnover chart
   - Recommendations with priority levels

#### 4. Test AI Query Bar

#### 5. Test Voice Input

1. Click the microphone icon in the AI Query Bar
2. Allow microphone permissions
3. Speak a query (e.g., "Show me revenue breakdown")
4. Audio feedback plays at start/stop
5. Query is transcribed and processed

## Project Structure

```

pickable/
├── src/
│ ├── app/ # Next.js app directory
│ │ ├── dashboard/ # Dashboard page
│ │ ├── onboarding/ # Onboarding flow
│ │ └── api/ # API routes
│ ├── components/ # React components
│ │ ├── ui/ # UI primitives
│ ├── lib/
│ │ ├── bedrock.ts # Bedrock agent logic
│ │ ├── db-queries.ts # Database queries
│ │ └── prisma.ts # Prisma client
│ ├── actions.ts # Server actions
│ └── generative-ui-action.ts # UI generation action
├── prisma/
│ └── schema.prisma # Database schema
└── scripts/
└── setup-bedrock-agent.ts # Agent setup script

```
