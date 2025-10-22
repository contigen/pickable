# Pickable

AI-powered business forecasting platform that transforms CSV data into conversational insights using AWS Bedrock Agents and RAG architecture.

## Overview

Pickable allows small business owners to upload their business data (CSV) and ask questions in plain English like "Which products will run out next month?" The system uses AWS Bedrock Agents with retrieval-augmented generation (RAG) to provide accurate forecasts, visual analytics, and actionable recommendations.

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, Recharts
- **Authentication**: NextAuth 5 (credentials provider)
- **Database**: MySQL with vector support, Prisma ORM
- **AI/ML**: AWS Bedrock (Nova Premier, Nova Pro, Claude Haiku 4.5), AWS Titan Embeddings v2
- **Agent Framework**: AWS Bedrock Agents with custom action groups
- **Runtime**: Node.js with Turbopack

## Prerequisites

- Node.js 18+ or Bun
- MySQL 8.0+ with vector extension support
- AWS Account with Bedrock access
- IAM role with Bedrock Agent permissions

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd pickable
npm install
# or
bun install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database
DATABASE_URL="mysql://user:password@localhost:3306/pickable"

# AWS Credentials
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1

# Bedrock Agent (will be generated in step 4)
BEDROCK_AGENT_ROLE_ARN=arn:aws:iam::your-account:role/your-bedrock-agent-role
BEDROCK_AGENT_ID=your_agent_id
BEDROCK_AGENT_ALIAS_ID=your_agent_alias_id

# NextAuth
AUTH_SECRET=your_random_secret_string
# Generate with: openssl rand -base64 32
```

### 3. Set Up Database

```bash
# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

**Important**: MySQL vector support requires manual setup. Run this SQL after migrations:

```sql
ALTER TABLE BusinessEmbedding
ADD COLUMN vector VECTOR(1024);
```

### 4. Set Up AWS Bedrock Agent

```bash
npm run setup:agent
```

This script will:

- Create a Bedrock Agent with Nova Premier
- Configure action groups for data processing
- Generate agent ID and alias ID
- Output environment variables to add to `.env.local`

Copy the generated values and add them to your `.env.local` file.

### 5. Run Development Server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing Instructions

### Manual Testing Flow

#### 1. Test Onboarding

1. Navigate to `http://localhost:3000`
2. Click "Connect Your Data"
3. Enter email (e.g., `test@example.com`) and business name (e.g., `Test Business`)
4. Click "Continue"

#### 2. Test CSV Upload

1. After login, you'll be redirected to the onboarding flow
2. Click "Upload CSV" or drag and drop a CSV file
3. Sample CSV format:

```csv
Date,Product,Revenue,Units Sold,Stock Level
2024-01-01,Product A,1200,50,200
2024-01-01,Product B,800,30,150
2024-02-01,Product A,1500,60,180
2024-02-01,Product B,900,35,140
```

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

1. Locate the AI Query Bar at the top of the dashboard
2. Test these sample queries:

   **Inventory Queries**:

   ```
   Which products will run out of stock next month?
   Show me inventory levels for all products
   What's my current stock turnover rate?
   ```

   **Revenue Queries**:

   ```
   What's my revenue trend for the past 6 months?
   Which products are most profitable?
   Compare revenue between January and February
   ```

   **Forecast Queries**:

   ```
   Predict sales for next month
   What will my revenue be in 3 months?
   Show me seasonal patterns in customer acquisition
   ```

3. Each query should return:
   - Dynamically generated charts (via Recharts)
   - Contextual insights
   - Data-driven recommendations

#### 5. Test Voice Input

1. Click the microphone icon in the AI Query Bar
2. Allow microphone permissions
3. Speak a query (e.g., "Show me revenue breakdown")
4. Audio feedback plays at start/stop
5. Query is transcribed and processed

#### 6. Test Generative UI

1. Ask a complex query like: "Show me a comparison of product performance"
2. The system should:

   - Retrieve relevant data via vector search
   - Pass context to Bedrock Agent
   - Agent invokes action groups
   - Claude Haiku generates custom React/JSX code
   - UI renders dynamically with proper styling

3. If UI generation fails, the repair mechanism should:
   - Detect the error
   - Send error context back to agent
   - Regenerate corrected UI
   - Display the repaired component

### Testing Different Scenarios

#### Test Case 1: Empty Database

- Try querying without uploading CSV
- Should redirect to onboarding

#### Test Case 2: Multiple Datasets

- Upload different CSVs over time
- Verify only the latest dataset is used
- Check data isolation between users

#### Test Case 3: Invalid Data

- Upload malformed CSV
- Verify error handling and user feedback

#### Test Case 4: Authentication

- Log out and verify redirect to landing page
- Try accessing `/dashboard` without auth
- Verify middleware protection

### Performance Testing

1. **Large CSV Upload**: Upload file with 1000+ rows

   - Should process within 30-60 seconds
   - Verify embeddings are generated correctly

2. **Query Response Time**:

   - Vector search: < 500ms
   - Agent invocation: 2-5 seconds
   - UI generation: 3-7 seconds

3. **Concurrent Queries**:
   - Open multiple browser tabs
   - Submit queries simultaneously
   - Verify proper session isolation

### API Testing

Test the agent API endpoint directly:

```bash
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "action": "generateUI",
    "query": "Show revenue breakdown",
    "data": "Sample data here"
  }'
```

## Troubleshooting

### Agent Setup Issues

**Problem**: `BEDROCK_AGENT_ROLE_ARN not found`
**Solution**: Create IAM role with trust policy for Bedrock service

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "bedrock.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}

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
│ │ └── \*-chart.tsx # Chart components
│ ├── lib/
│ │ ├── bedrock.ts # Bedrock agent logic
│ │ ├── db-queries.ts # Database queries
│ │ └── prisma.ts # Prisma client
│ ├── actions.ts # Server actions
│ └── generative-ui-action.ts # UI generation
├── prisma/
│ └── schema.prisma # Database schema
└── scripts/
└── setup-bedrock-agent.ts # Agent setup script

````

## Key Features

- ✅ **RAG-Powered Search**: Vector similarity search with AWS Titan Embeddings
- ✅ **Multi-Model AI**: Nova Premier (reasoning), Nova Pro (forecasts), Claude Haiku (UI)
- ✅ **Generative UI**: Dynamic React component generation based on queries
- ✅ **Self-Healing**: Automatic UI repair mechanism
- ✅ **Voice Input**: Web Speech API integration with audio feedback
- ✅ **Business Intelligence**: Forecasts, insights, and recommendations
- ✅ **Data Isolation**: User-specific data access and session management

## Architecture

The system follows a RAG architecture:

1. CSV data is intelligently sliced into contextual chunks
2. Chunks are embedded using AWS Titan and stored as vectors
3. User queries are embedded and matched via cosine similarity
4. Retrieved context is passed to Bedrock Agent
5. Agent uses action groups to process and generate outputs
6. Structured data and dynamic UI are returned to the user

## Deployment

### Build for Production

```bash
npm run build
npm run start
````

### Environment Considerations

- Ensure MySQL supports vector operations in production
- Configure AWS credentials via IAM roles (not access keys)
- Set `NODE_ENV=production`
- Configure proper `AUTH_SECRET` for NextAuth

## Credits

Built for the AWS AI Agent Global Hackathon 2025.

## License

MIT
