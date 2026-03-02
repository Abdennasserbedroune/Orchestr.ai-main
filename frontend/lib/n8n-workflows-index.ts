// Static index of n8n workflows from github.com/Zie619/n8n-workflows
// All filenames verified against the actual repo contents via GitHub API.
// Raw URL pattern: https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/<Folder>/<filename>

export interface N8nWorkflow {
  id: string
  name: string
  agent_slug: string
  integrations: string[]
  raw_url: string
}

const BASE = 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows'

export const N8N_WORKFLOWS_INDEX: N8nWorkflow[] = [
  // ── quill (Content Writer) ────────────────────────────────────────────────
  {
    id: 'quill-001',
    name: 'OpenAI + Twitter: Generate & post social content',
    agent_slug: 'quill',
    integrations: ['OpenAI', 'Twitter'],
    raw_url: `${BASE}/Openai/0785_Openai_Twitter_Create.json`,
  },
  {
    id: 'quill-002',
    name: 'OpenAI + Google Sheets: Content calendar automation',
    agent_slug: 'quill',
    integrations: ['OpenAI', 'Google Sheets'],
    raw_url: `${BASE}/Openai/1177_Openai_GoogleSheets_Create_Triggered.json`,
  },
  {
    id: 'quill-003',
    name: 'OpenAI + Form: AI-powered content from form submissions',
    agent_slug: 'quill',
    integrations: ['OpenAI', 'Form'],
    raw_url: `${BASE}/Openai/0334_Openai_Form_Create_Triggered.json`,
  },
  {
    id: 'quill-004',
    name: 'OpenAI + Telegram: Automate content delivery',
    agent_slug: 'quill',
    integrations: ['OpenAI', 'Telegram'],
    raw_url: `${BASE}/Openai/0248_Openai_Telegram_Automate_Triggered.json`,
  },

  // ── nexus (Sales Strategist) ──────────────────────────────────────────────
  {
    id: 'nexus-001',
    name: 'HubSpot + Mailchimp: Sync contacts & create campaign',
    agent_slug: 'nexus',
    integrations: ['HubSpot', 'Mailchimp'],
    raw_url: `${BASE}/Hubspot/0243_HubSpot_Mailchimp_Create_Scheduled.json`,
  },
  {
    id: 'nexus-002',
    name: 'HubSpot + Clearbit: Enrich & update contact data',
    agent_slug: 'nexus',
    integrations: ['HubSpot', 'Clearbit'],
    raw_url: `${BASE}/Hubspot/0115_HubSpot_Clearbit_Update_Triggered.json`,
  },
  {
    id: 'nexus-003',
    name: 'HubSpot: Automate deal stage workflow',
    agent_slug: 'nexus',
    integrations: ['HubSpot'],
    raw_url: `${BASE}/Hubspot/1081_HubSpot_Automate_Triggered.json`,
  },
  {
    id: 'nexus-004',
    name: 'HubSpot + Cron: Scheduled CRM data update',
    agent_slug: 'nexus',
    integrations: ['HubSpot', 'Schedule'],
    raw_url: `${BASE}/Hubspot/0129_HubSpot_Cron_Update_Scheduled.json`,
  },

  // ── atlas (Ops Commander) ─────────────────────────────────────────────────
  {
    id: 'atlas-001',
    name: 'Slack + Stripe: Payment event alerts to channel',
    agent_slug: 'atlas',
    integrations: ['Slack', 'Stripe'],
    raw_url: `${BASE}/Slack/0008_Slack_Stripe_Create_Triggered.json`,
  },
  {
    id: 'atlas-002',
    name: 'Slack + HubSpot: CRM deal updates to Slack',
    agent_slug: 'atlas',
    integrations: ['Slack', 'HubSpot'],
    raw_url: `${BASE}/Slack/1172_Slack_HubSpot_Send_Triggered.json`,
  },
  {
    id: 'atlas-003',
    name: 'Slack + Typeform: Route form responses to channel',
    agent_slug: 'atlas',
    integrations: ['Slack', 'Typeform'],
    raw_url: `${BASE}/Slack/0124_Slack_Typeform_Create_Triggered.json`,
  },
  {
    id: 'atlas-004',
    name: 'Slack: Scheduled ops digest automation',
    agent_slug: 'atlas',
    integrations: ['Slack', 'Schedule'],
    raw_url: `${BASE}/Slack/0109_Slack_Cron_Automate_Scheduled.json`,
  },

  // ── scout (Market Researcher) ─────────────────────────────────────────────
  {
    id: 'scout-001',
    name: 'OpenAI + Webhook: AI-powered research pipeline',
    agent_slug: 'scout',
    integrations: ['OpenAI', 'Webhook'],
    raw_url: `${BASE}/Openai/0464_Openai_Form_Create_Webhook.json`,
  },
  {
    id: 'scout-002',
    name: 'OpenAI + Google Sheets: Automated research to spreadsheet',
    agent_slug: 'scout',
    integrations: ['OpenAI', 'Google Sheets'],
    raw_url: `${BASE}/Openai/1618_Openai_GoogleSheets_Create_Triggered.json`,
  },
  {
    id: 'scout-003',
    name: 'OpenAI + Form: Market survey analysis automation',
    agent_slug: 'scout',
    integrations: ['OpenAI', 'Form'],
    raw_url: `${BASE}/Openai/1256_Openai_Form_Automation_Triggered.json`,
  },

  // ── ledger (Finance Analyst) ──────────────────────────────────────────────
  {
    id: 'ledger-001',
    name: 'Slack + Stripe: Revenue event notifications',
    agent_slug: 'ledger',
    integrations: ['Slack', 'Stripe'],
    raw_url: `${BASE}/Slack/0008_Slack_Stripe_Create_Triggered.json`,
  },
  {
    id: 'ledger-002',
    name: 'HubSpot + Mailchimp: Financial reporting workflow',
    agent_slug: 'ledger',
    integrations: ['HubSpot', 'Mailchimp'],
    raw_url: `${BASE}/Hubspot/0244_HubSpot_Mailchimp_Create_Scheduled.json`,
  },
  {
    id: 'ledger-003',
    name: 'HubSpot + Cron: Automated financial data sync',
    agent_slug: 'ledger',
    integrations: ['HubSpot', 'Schedule'],
    raw_url: `${BASE}/Hubspot/0130_HubSpot_Cron_Automate_Scheduled.json`,
  },

  // ── pulse (HR Manager) ────────────────────────────────────────────────────
  {
    id: 'pulse-001',
    name: 'Slack + Typeform: Applicant intake to team channel',
    agent_slug: 'pulse',
    integrations: ['Slack', 'Typeform'],
    raw_url: `${BASE}/Slack/1191_Slack_Typeform_Automate_Triggered.json`,
  },
  {
    id: 'pulse-002',
    name: 'Slack + Hunter: Candidate sourcing workflow',
    agent_slug: 'pulse',
    integrations: ['Slack', 'Hunter'],
    raw_url: `${BASE}/Slack/0423_Slack_Hunter_Send_Webhook.json`,
  },
  {
    id: 'pulse-003',
    name: 'Slack + Email IMAP: HR inbox triage automation',
    agent_slug: 'pulse',
    integrations: ['Slack', 'Email IMAP'],
    raw_url: `${BASE}/Slack/1194_Slack_Emailreadimap_Create.json`,
  },

  // ── forge (Tech Architect) ────────────────────────────────────────────────
  {
    id: 'forge-001',
    name: 'Slack + GraphQL: API monitoring & alerting',
    agent_slug: 'forge',
    integrations: ['Slack', 'GraphQL'],
    raw_url: `${BASE}/Slack/1063_Slack_Graphql_Automation_Webhook.json`,
  },
  {
    id: 'forge-002',
    name: 'HubSpot + Splitout: Data pipeline with branching logic',
    agent_slug: 'forge',
    integrations: ['HubSpot', 'Splitout'],
    raw_url: `${BASE}/Hubspot/0920_HubSpot_Splitout_Create_Webhook.json`,
  },
  {
    id: 'forge-003',
    name: 'Slack: Manual-triggered ops automation workflow',
    agent_slug: 'forge',
    integrations: ['Slack'],
    raw_url: `${BASE}/Slack/0940_Slack_Manual_Automation_Scheduled.json`,
  },
  {
    id: 'forge-004',
    name: 'OpenAI + Telegram: AI assistant for tech queries',
    agent_slug: 'forge',
    integrations: ['OpenAI', 'Telegram'],
    raw_url: `${BASE}/Openai/1685_Openai_Telegram_Automate_Triggered.json`,
  },
]
