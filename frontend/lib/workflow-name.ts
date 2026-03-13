/**
 * workflow-name.ts
 * Transforms raw Zie619 API names like "ActivecampaignExplorer" or
 * "0785_Openai_Twitter_Create" into clean, human-readable titles.
 *
 * Rules applied in order:
 *  1. Strip leading numeric prefix  ("0785_")
 *  2. Replace underscores/hyphens with spaces
 *  3. Strip trailing "Explorer" suffix  ← the #1 offender
 *  4. Try full-name match in BRAND_ALIASES
 *  5. Split PascalCase tokens, resolve each via alias or title-case
 *  6. Collapse whitespace
 */

// Single source of truth for brand display names.
// Key = lowercase, no spaces. Value = canonical display string.
const BRAND_ALIASES: Record<string, string> = {
  activecampaign:   'ActiveCampaign',
  acuityscheduling: 'Acuity Scheduling',
  affinity:         'Affinity CRM',
  aggregate:        'Aggregate',
  airtable:         'Airtable',
  airtoptool:       'AirTop Tool',
  amqp:             'AMQP',
  apitemplateio:    'APITemplate.io',
  asana:            'Asana',
  automate:         'Automate',
  automation:       'Automation',
  autopilot:        'Autopilot',
  awsrekognition:   'AWS Rekognition',
  awss3:            'AWS S3',
  awssns:           'AWS SNS',
  awstextract:      'AWS Textract',
  bannerbear:       'Bannerbear',
  baserow:          'Baserow',
  beeminder:        'Beeminder',
  bitbucket:        'Bitbucket',
  bitly:            'Bitly',
  bitwarden:        'Bitwarden',
  box:              'Box',
  calcslive:        'CalcsLive',
  calendly:         'Calendly',
  chargebee:        'Chargebee',
  clickup:          'ClickUp',
  clockify:         'Clockify',
  closecrm:         'Close CRM',
  confluence:       'Confluence',
  convertkit:       'ConvertKit',
  copper:           'Copper CRM',
  discord:          'Discord',
  dropbox:          'Dropbox',
  figma:            'Figma',
  freshdesk:        'Freshdesk',
  freshsales:       'Freshsales',
  github:           'GitHub',
  gitlab:           'GitLab',
  gmail:            'Gmail',
  googleanalytics:  'Google Analytics',
  googledocs:       'Google Docs',
  googledrive:      'Google Drive',
  googlesheets:     'Google Sheets',
  googletasks:      'Google Tasks',
  greenhouse:       'Greenhouse',
  hubspot:          'HubSpot',
  intercom:         'Intercom',
  jira:             'Jira',
  klaviyo:          'Klaviyo',
  lemlist:          'Lemlist',
  lever:            'Lever',
  linear:           'Linear',
  linkedin:         'LinkedIn',
  mailchimp:        'Mailchimp',
  mailerlite:       'MailerLite',
  mattermost:       'Mattermost',
  microsoftteams:   'Microsoft Teams',
  monday:           'Monday.com',
  notion:           'Notion',
  n8n:              'n8n',
  openai:           'OpenAI',
  outlook:          'Outlook',
  pagerduty:        'PagerDuty',
  pipedrive:        'Pipedrive',
  postmark:         'Postmark',
  quickbooks:       'QuickBooks',
  reddit:           'Reddit',
  salesforce:       'Salesforce',
  sendgrid:         'SendGrid',
  servicenow:       'ServiceNow',
  shopify:          'Shopify',
  slack:            'Slack',
  stripe:           'Stripe',
  supabase:         'Supabase',
  telegram:         'Telegram',
  todoist:          'Todoist',
  trello:           'Trello',
  twilio:           'Twilio',
  twitter:          'X (Twitter)',
  typeform:         'Typeform',
  vercel:           'Vercel',
  webflow:          'Webflow',
  whatsapp:         'WhatsApp',
  wordpress:        'WordPress',
  xero:             'Xero',
  youtube:          'YouTube',
  zapier:           'Zapier',
  zendesk:          'Zendesk',
  zoom:             'Zoom',
  // Common action verbs — keep properly cased
  create:   'Create',
  update:   'Update',
  sync:     'Sync',
  send:     'Send',
  read:     'Read',
  fetch:    'Fetch',
  post:     'Post',
  get:      'Get',
  delete:   'Delete',
  import:   'Import',
  export:   'Export',
  report:   'Report',
  monitor:  'Monitor',
  alert:    'Alert',
  notify:   'Notify',
  trigger:  'Trigger',
  scrape:   'Scrape',
  extract:  'Extract',
  parse:    'Parse',
  enrich:   'Enrich',
  qualify:  'Qualify',
  score:    'Score',
  process:  'Process',
  review:   'Review',
  approve:  'Approve',
  assign:   'Assign',
  generate: 'Generate',
  schedule: 'Schedule',
  track:    'Track',
  analyze:  'Analyze',
  collect:  'Collect',
  convert:  'Convert',
  manage:   'Manage',
  handle:   'Handle',
  route:    'Route',
  upload:   'Upload',
  download: 'Download',
}

function splitCamelCase(str: string): string[] {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/\s+/)
    .filter(Boolean)
}

/**
 * Formats a raw API workflow name into a clean, human-readable title.
 *
 * Examples:
 *   "ActivecampaignExplorer"      -> "ActiveCampaign"
 *   "Awss3Explorer"               -> "AWS S3"
 *   "0785_Openai_Twitter_Create"  -> "OpenAI X (Twitter) Create"
 *   "Airtable22 workflows"        -> "Airtable"
 *   "BannerbearExplorer"          -> "Bannerbear"
 */
export function formatWorkflowName(raw: string): string {
  if (!raw || typeof raw !== 'string') return raw

  let name = raw.trim()

  // 1. Strip leading numeric prefix like "0785_" or "22 workflows" suffix
  name = name.replace(/^\d+[_\s-]+/, '')
  name = name.replace(/\s*\d+\s*workflows?\s*$/i, '').trim()

  // 2. Replace underscores and hyphens with spaces
  name = name.replace(/[_-]+/g, ' ')

  // 3. Strip trailing "Explorer" (case-insensitive) — the #1 cause
  name = name.replace(/\s*Explorer\s*$/i, '').trim()

  // 4. Try full-name match in alias map (handles single-token names perfectly)
  const lowerFull = name.toLowerCase().replace(/\s/g, '')
  if (BRAND_ALIASES[lowerFull]) return BRAND_ALIASES[lowerFull]

  // 5. Split into tokens, resolve each against alias map or title-case
  const tokens = name.split(/\s+/).flatMap(t => splitCamelCase(t))
  const resolved = tokens.map(token => {
    const key = token.toLowerCase()
    return BRAND_ALIASES[key] ?? (token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
  })

  // 6. Join and collapse extra whitespace
  return resolved.join(' ').replace(/\s{2,}/g, ' ').trim()
}

// Generic French stubs the Zie619 API injects as descriptions
const GENERIC_STUBS = [
  'collection de workflows',
  'prets a deployer',
  'prets a d',
  'automatisation n8n',
  'workflows d automatisation',
]

/**
 * Returns a clean English description.
 * If the API returned a generic French stub, replaces it with a
 * meaningful fallback derived from the workflow name.
 */
export function sanitizeWorkflowDescription(raw: string, name: string): string {
  if (!raw || raw.trim().length === 0) return ''

  const trimmed = raw.trim()
  const normalized = trimmed
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents for comparison

  const isGeneric = GENERIC_STUBS.some(stub => normalized.includes(stub))
  if (isGeneric) {
    const cleanName = formatWorkflowName(name)
    return `Automate your ${cleanName} workflows with this ready-to-deploy n8n template.`
  }

  return trimmed
}
