'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, ChevronRight, ArrowLeft, ExternalLink, Copy, Check, Loader2, Download, X, Zap } from 'lucide-react'
import { AmbientBackground } from '@/components/AmbientBackground'

// ── Data sources ─────────────────────────────────────────────
const GH_API = 'https://api.github.com/repos/Zie619/n8n-workflows/contents/workflows'
const GH_RAW = 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows'

// ── Types ────────────────────────────────────────────────────
interface GHItem {
  name: string
  path: string
  type: 'file' | 'dir'
  download_url: string | null
}

interface WorkflowEntry {
  name: string
  title: string
  description: string
  category: string
  path: string
  rawUrl: string
}

// ── Category metadata ────────────────────────────────────────
const CAT_META: Record<string, { icon: string; label: string; description: string; color: string }> = {
  Slack: { icon: '💬', label: 'Slack', description: 'Notifications, messages et alertes automatisés vers vos canaux Slack.', color: '#4A154B' },
  Telegram: { icon: '✈️', label: 'Telegram', description: 'Bots Telegram pour envoyer des messages, gérer des groupes et déclencher des actions.', color: '#2AABEE' },
  Webhook: { icon: '🔗', label: 'Webhooks', description: 'Réception et traitement de données en temps réel depuis des services externes.', color: '#3B82F6' },
  Code: { icon: '⌨️', label: 'Code', description: 'Transformations de données, scripts et logique métier codée sur mesure.', color: '#6366F1' },
  Http: { icon: '🌐', label: 'HTTP / API', description: 'Appels REST, intégration d\'API tierces et automatisation de requêtes HTTP.', color: '#0EA5E9' },
  Manual: { icon: '🤚', label: 'Manuel', description: 'Workflows déclenchés manuellement pour des actions ponctuelles ou de validation.', color: '#94A3B8' },
  Github: { icon: '🐙', label: 'GitHub', description: 'Automatisation CI/CD, gestion des issues, pull requests et déploiements.', color: '#E2E8F0' },
  Notion: { icon: '📝', label: 'Notion', description: 'Synchronisation de bases de données, création de pages et gestion de contenu Notion.', color: '#FAFAFA' },
  Gmail: { icon: '📧', label: 'Gmail', description: 'Lecture, envoi et filtrage d\'emails avec automatisation complète de la boîte mail.', color: '#EA4335' },
  Openai: { icon: '🤖', label: 'OpenAI', description: 'Génération de texte, classification, résumé et intégrations GPT avancées.', color: '#10A37F' },
  Discord: { icon: '🎮', label: 'Discord', description: 'Bots Discord, notifications de serveur et modération automatisée.', color: '#5865F2' },
  Google: { icon: '🔍', label: 'Google', description: 'Sheets, Drive, Calendar et toute la suite Google Workspace automatisée.', color: '#4285F4' },
  Airtable: { icon: '🗃️', label: 'Airtable', description: 'Synchronisation de bases Airtable, création d\'enregistrements et reporting.', color: '#FF6F2C' },
  Stripe: { icon: '💳', label: 'Stripe', description: 'Gestion des paiements, abonnements, factures et événements Stripe.', color: '#635BFF' },
  Shopify: { icon: '🛒', label: 'Shopify', description: 'Automatisation e-commerce : commandes, stocks, clients et notifications.', color: '#96BF48' },
  Hubspot: { icon: '🔶', label: 'HubSpot', description: 'CRM, gestion des contacts, deals, emails marketing et pipelines de vente.', color: '#FF7A59' },
  Salesforce: { icon: '☁️', label: 'Salesforce', description: 'Synchronisation CRM, création d\'opportunités et reporting Salesforce.', color: '#00A1E0' },
  Postgres: { icon: '🐘', label: 'PostgreSQL', description: 'Requêtes SQL, synchronisation de données et reporting sur bases PostgreSQL.', color: '#336791' },
  Mysql: { icon: '🐬', label: 'MySQL', description: 'Automatisation de bases MySQL, migrations et exports planifiés.', color: '#00758F' },
  Mongodb: { icon: '🍃', label: 'MongoDB', description: 'Opérations CRUD, agrégations et synchronisation de collections MongoDB.', color: '#47A248' },
  Redis: { icon: '🔴', label: 'Redis', description: 'Mise en cache, files de messages et état partagé via Redis.', color: '#DC382D' },
  Twilio: { icon: '📱', label: 'Twilio', description: 'SMS, appels vocaux et communications multicanal via Twilio.', color: '#F22F46' },
  Sendgrid: { icon: '📤', label: 'SendGrid', description: 'Envoi transactionnel d\'emails, gestion de listes et suivi de campagnes.', color: '#1A82E2' },
  Linear: { icon: '🎯', label: 'Linear', description: 'Gestion de projets, synchronisation d\'issues et alertes d\'équipe.', color: '#5E6AD2' },
  Jira: { icon: '🔵', label: 'Jira', description: 'Création de tickets, mise à jour de sprints et reporting Jira.', color: '#0052CC' },
  Trello: { icon: '📋', label: 'Trello', description: 'Déplacement de cartes, création de boards et automatisation Trello.', color: '#0052CC' },
  Dropbox: { icon: '📦', label: 'Dropbox', description: 'Gestion de fichiers, partage et synchronisation via Dropbox.', color: '#0061FF' },
  Zoom: { icon: '📹', label: 'Zoom', description: 'Création de réunions, gestion des participants et rappels automatiques.', color: '#2D8CFF' },
  Twitter: { icon: '🐦', label: 'Twitter / X', description: 'Publication automatisée, monitoring de mentions et analyse d\'engagement.', color: '#1DA1F2' },
  Linkedin: { icon: '💼', label: 'LinkedIn', description: 'Publication de contenu, génération de leads et veille professionnelle.', color: '#0A66C2' },
}

// ── Known workflow counts ────────────────────────────────────
const KNOWN_COUNTS: Record<string, number> = {
  Slack: 18, Telegram: 119, Webhook: 65, Code: 183,
  Http: 176, Manual: 391, Discord: 42, Github: 28,
  Notion: 35, Openai: 61, Google: 47, Airtable: 22,
}

// ── Helpers ──────────────────────────────────────────────────
function getFallbackEmoji(name: string): string {
  const map: Record<string, string> = {
    'activecampaign': '✉️', 'apify': '🕷️', 'baserow': '🗄️', 'bitwarden': '🛡️',
    'box': '📦', 'calendly': '📆', 'chatwoot': '💬', 'clearbit': '🔍',
    'clickup': '✅', 'clockify': '⏱️', 'coda': '📄', 'customerio': '📬',
    'discord': '🎮', 'documenso': '🖋️', 'dropbox': '📁', 'elasticsearch': '🔎',
    'eventbrite': '🎟️', 'facebook': '👍', 'figma': '🎨', 'freshdesk': '🎧',
    'github': '🐙', 'gitlab': '🦊', 'gmail': '📧', 'google': '🔍',
    'googlecloud': '☁️', 'googledrive': '📂', 'googlesheets': '📊', 'graphql': '🕸️',
    'hubspot': '🔶', 'hunter': '🎯', 'intercom': '💬', 'jira': '🔵',
    'kafka': '🚀', 'klaviyo': '✉️', 'linear': '🎯', 'linkedin': '💼',
    'mailchimp': '🐵', 'mailerlite': '💌', 'mailgun': '🔫', 'mastodon': '🐘',
    'mattermost': '💬', 'medium': '📝', 'microsoft': '🪟', 'microsoftteams': '🤝',
    'mixpanel': '📈', 'mongodb': '🍃', 'mysql': '🐬', 'n8n': '☁️',
    'nocodb': '🗃️', 'notion': '📝', 'openai': '🤖', 'phantombuster': '👻',
    'pipedrive': '📉', 'postgresql': '🐘', 'posthog': '🦔', 'rabbitmq': '🐇',
    'redis': '🔴', 'salesforce': '☁️', 'segment': '🧩', 'sendgrid': '📤',
    'sentry': '👁️', 'shopify': '🛒', 'slack': '💬', 'snowflake': '❄️',
    'spotify': '🎵', 'strapi': '🚀', 'stripe': '💳', 'supabase': '⚡',
    'telegram': '✈️', 'todoist': '📋', 'trello': '📋', 'twilio': '📱',
    'twitch': '🎮', 'twitter': '🐦', 'typeform': '📋', 'webflow': '🌐',
    'whatsapp': '💬', 'woocommerce': '🛍️', 'wordpress': '✍️', 'youtube': '▶️',
    'zendesk': '🎧', 'zoho': '🏢', 'zoom': '📹'
  }
  const low = name.toLowerCase().replace(/_/g, '').replace(/-/g, '')
  if (map[low]) return map[low]
  
  const fallbacks = ['🔗', '⚡', '⚙️', '🛠️', '🔄', '🔌', '📦', '📡', '💡', '🧩', '🚀', '🔮', '🌟', '💻']
  let hash = 0
  for (let i = 0; i < low.length; i++) hash = Math.imul(31, hash) + low.charCodeAt(i) | 0
  return fallbacks[Math.abs(hash) % fallbacks.length]
}

function getFallbackColor(name: string): string {
  const colors = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#06B6D4', '#EAB308']
  const low = name.toLowerCase().replace(/_/g, '').replace(/-/g, '')
  let hash = 0
  for (let i = 0; i < low.length; i++) hash = Math.imul(31, hash) + low.charCodeAt(i) | 0
  return colors[Math.abs(hash) % colors.length]
}

function formatAgentName(name: string): string {
  const map: Record<string, string> = {
    'activecampaign': 'Active campaign',
    'googlesheets': 'Google Sheets',
    'googledrive': 'Google Drive',
    'googlecloud': 'Google Cloud',
    'googlecalendar': 'Google Calendar',
    'googlecontacts': 'Google Contacts',
    'hubspotcrm': 'HubSpot',
    'mailchimp': 'Mailchimp',
    'mailerlite': 'MailerLite',
    'pipedrive': 'Pipedrive',
    'salesforce': 'Salesforce',
    'sendgrid': 'SendGrid',
    'whatsapp': 'WhatsApp',
    'woocommerce': 'WooCommerce',
    'wordpress': 'WordPress',
    'youtube': 'YouTube',
    'zendesk': 'Zendesk',
    'clickup': 'ClickUp',
    'customerio': 'Customer.io',
    'microsoftteams': 'Microsoft Teams',
    'microsoftsql': 'Microsoft SQL Server',
  }
  const low = name.toLowerCase().replace(/_/g, '').replace(/-/g, '')
  if (map[low]) return map[low]

  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function catMeta(name: string) {
  const key = Object.keys(CAT_META).find(k => name.toLowerCase().includes(k.toLowerCase()))
  if (key) return CAT_META[key]
  
  return { 
    icon: getFallbackEmoji(name), 
    label: formatAgentName(name), 
    description: 'Collection de workflows d\'automatisation n8n prêts à déployer pour ce service.', 
    color: getFallbackColor(name) 
  }
}

/**
 * Converts a raw n8n filename into a clean, readable French title.
 * Handles snake_case, numeric prefixes, camelCase abbreviations, and common acronyms.
 */
function formatTitle(filename: string): string {
  const ACRONYMS = new Set(['api', 'crm', 'csv', 'pdf', 'sql', 'url', 'ai', 'gpt', 'http', 'id', 'erp', 'sms'])
  const BRANDS: Record<string, string> = {
    openai: 'OpenAI', github: 'GitHub', gitlab: 'GitLab', hubspot: 'HubSpot',
    salesforce: 'Salesforce', postgresql: 'PostgreSQL', mongodb: 'MongoDB',
    sendgrid: 'SendGrid', clickup: 'ClickUp', jira: 'Jira', notion: 'Notion',
    slack: 'Slack', telegram: 'Telegram', discord: 'Discord', twilio: 'Twilio',
    stripe: 'Stripe', shopify: 'Shopify', linkedin: 'LinkedIn', twitter: 'Twitter',
    airtable: 'Airtable', trello: 'Trello', dropbox: 'Dropbox', zoom: 'Zoom',
    wordpress: 'WordPress', webflow: 'Webflow', typeform: 'Typeform', klaviyo: 'Klaviyo',
    asana: 'Asana', linear: 'Linear', intercom: 'Intercom', zendesk: 'Zendesk',
  }
  const VERBS: Record<string, string> = {
    sync: 'Synchroniser', send: 'Envoyer', create: 'Créer', update: 'Mettre à jour',
    delete: 'Supprimer', notify: 'Notifier', import: 'Importer', export: 'Exporter',
    monitor: 'Surveiller', backup: 'Sauvegarder', process: 'Traiter', generate: 'Générer',
    fetch: 'Récupérer', post: 'Publier', alert: 'Alerter', schedule: 'Planifier',
    trigger: 'Déclencher', track: 'Suivre', log: 'Enregistrer', convert: 'Convertir',
    parse: 'Analyser', validate: 'Valider', transform: 'Transformer', enrich: 'Enrichir',
    get: 'Obtenir', set: 'Définir', list: 'Lister', search: 'Rechercher',
  }
  const NOUNS: Record<string, string> = {
    message: 'message', messages: 'messages', notification: 'notification',
    alert: 'alerte', report: 'rapport', invoice: 'facture', payment: 'paiement',
    lead: 'prospect', contact: 'contact', ticket: 'ticket', issue: 'issue',
    email: 'e-mail', form: 'formulaire', data: 'données', file: 'fichier',
    record: 'enregistrement', task: 'tâche', event: 'événement', order: 'commande',
    customer: 'client', user: 'utilisateur', account: 'compte', project: 'projet',
    workflow: 'workflow', webhook: 'webhook', channel: 'canal', group: 'groupe',
    post: 'publication', content: 'contenu', image: 'image', video: 'vidéo',
    sheet: 'feuille', row: 'ligne', column: 'colonne', table: 'tableau',
    database: 'base de données', repository: 'dépôt', pipeline: 'pipeline',
    campaign: 'campagne', deal: 'opportunité', opportunity: 'opportunité',
  }

  const raw = filename.replace(/\.json$/, '').replace(/^\d+_/, '')
  const tokens = raw.split(/[_\-\s]+/).map(t => t.toLowerCase())

  const firstVerb = tokens[0]
  const rest = tokens.slice(1)

  const verbFr = VERBS[firstVerb]
  const restFr = rest.map(t => {
    if (BRANDS[t]) return BRANDS[t]
    if (ACRONYMS.has(t)) return t.toUpperCase()
    if (NOUNS[t]) return NOUNS[t]
    return t.charAt(0).toUpperCase() + t.slice(1)
  })

  if (verbFr) {
    return [verbFr, ...restFr].join(' ')
  }

  return tokens.map(t => {
    if (BRANDS[t]) return BRANDS[t]
    if (ACRONYMS.has(t)) return t.toUpperCase()
    return t.charAt(0).toUpperCase() + t.slice(1)
  }).join(' ')
}

function inferDescription(filename: string, catName: string): string {
  const f = filename.toLowerCase()
  const cat = catMeta(catName)

  const pairs: [string, string][] = [
    ['sync', `Synchronise automatiquement les données ${cat.label} entre vos outils, en temps réel ou selon un calendrier.`],
    ['notify', `Envoie des notifications ${cat.label} ciblées lors du déclenchement de conditions définies.`],
    ['alert', `Met en place un système d'alertes ${cat.label} basé sur des seuils ou règles configurables.`],
    ['report', `Génère et distribue des rapports ${cat.label} enrichis selon une planification régulière.`],
    ['backup', `Sauvegarde automatiquement les données ${cat.label} vers un stockage sécurisé et redondant.`],
    ['import', `Importe, nettoie et transforme des données externes vers ${cat.label}.`],
    ['export', `Exporte les données ${cat.label} dans le format souhaité vers votre destination cible.`],
    ['webhook', `Reçoit et traite les événements entrants ${cat.label} en temps réel via webhook.`],
    ['schedule', `Exécute une tâche ${cat.label} planifiée à des intervalles ou horaires précis.`],
    ['monitor', `Surveille en continu ${cat.label} et déclenche une action corrective en cas d'anomalie.`],
    ['create', `Crée automatiquement des ressources dans ${cat.label} à partir de données sources.`],
    ['update', `Met à jour et consolide les entrées ${cat.label} lors de changements détectés.`],
    ['delete', `Supprime conditionnellement des données obsolètes ou invalides dans ${cat.label}.`],
    ['message', `Gère l'envoi et la réception de messages via ${cat.label} selon des règles définies.`],
    ['email', `Automatise l'envoi d'e-mails transactionnels ou marketing via ${cat.label}.`],
    ['lead', `Capture, qualifie et route automatiquement les prospects depuis ${cat.label}.`],
    ['invoice', `Génère et envoie des factures structurées via ${cat.label}.`],
    ['payment', `Surveille et traite les transactions et événements de paiement ${cat.label}.`],
    ['form', `Traite les soumissions de formulaires et les route vers vos systèmes via ${cat.label}.`],
    ['crm', `Synchronise les contacts, deals et pipelines CRM depuis ${cat.label}.`],
    ['ai', `Utilise l'IA pour analyser des données et générer du contenu intelligent via ${cat.label}.`],
    ['gpt', `Exploite GPT pour traiter, résumer ou enrichir vos données ${cat.label}.`],
    ['openai', `Intègre OpenAI pour la compréhension de texte et la génération de contenu dans ${cat.label}.`],
    ['post', `Publie et programme du contenu vers ${cat.label} selon un calendrier éditorial.`],
    ['enrich', `Enrichit les données ${cat.label} avec des informations supplémentaires depuis des sources tierces.`],
    ['track', `Suit et enregistre les événements ${cat.label} pour une analyse approfondie.`],
    ['convert', `Convertit et transforme les données ${cat.label} vers le format nécessaire.`],
  ]

  for (const [key, desc] of pairs) {
    if (f.includes(key)) return desc
  }

  return `Automatise vos processus ${cat.label} grâce à ce workflow n8n optimisé pour la production.`
}

// ── Download helper ──────────────────────────────────────────
async function downloadJson(url: string, filename: string) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
    URL.revokeObjectURL(a.href)
  } catch { /* silently fail */ }
}

// ── Workflow schema inference ────────────────────────────────
interface SchemaNode { label: string; sub: string }

function inferSchema(filename: string, catName: string): SchemaNode[] {
  const f = filename.toLowerCase()
  const cat = catMeta(catName)

  // Node 1: Trigger source
  const triggerNode: SchemaNode =
    f.includes('webhook') ? { label: 'Webhook', sub: 'Requête entrante' } :
      f.includes('schedule') || f.includes('cron') ? { label: 'Planifié', sub: 'Cron / Intervalle' } :
          f.includes('manual') ? { label: 'Manuel', sub: 'Clic utilisateur' } :
            { label: 'Déclencheur', sub: 'Événement externe' }

  // Node 2: Processing
  const processNode: SchemaNode =
    f.includes('ai') || f.includes('gpt') ? { label: 'IA / GPT', sub: 'Analyse & génération' } :
      f.includes('filter') ? { label: 'Filtre', sub: 'Conditions & règles' } :
        f.includes('transform') ? { label: 'Transformation', sub: 'Mapping de données' } :
          f.includes('enrich') ? { label: 'Enrichissement', sub: 'Sources externes' } :
            f.includes('validate') ? { label: 'Validation', sub: 'Contrôle qualité' } :
              f.includes('parse') || f.includes('extract') ? { label: 'Extraction', sub: 'Parsing de données' } :
                f.includes('convert') ? { label: 'Conversion', sub: 'Format de sortie' } :
                  { label: 'Traitement', sub: `Logique ${cat.label}` }

  // Node 3: Output
  const outputNode: SchemaNode =
    f.includes('notify') || f.includes('alert') ? { label: 'Notification', sub: 'Alerte envoyée' } :
      f.includes('email') ? { label: 'E-mail', sub: 'Message envoyé' } :
        f.includes('report') ? { label: 'Rapport', sub: 'Généré & distribué' } :
          f.includes('backup') ? { label: 'Stockage', sub: 'Sauvegarde créée' } :
            f.includes('create') ? { label: 'Création', sub: 'Ressource créée' } :
              f.includes('update') ? { label: 'Mise à jour', sub: 'Données synchronisées' } :
                f.includes('post') ? { label: 'Publication', sub: 'Contenu publié' } :
                  f.includes('delete') ? { label: 'Suppression', sub: 'Données nettoyées' } :
                    f.includes('log') ? { label: 'Journal', sub: 'Déposé en base' } :
                      { label: cat.label, sub: 'Action exécutée' }

  return [triggerNode, processNode, outputNode]
}

// ── WorkflowCard component ───────────────────────────────────
function WorkflowCard({
  wf, catName, copied,
  onCopy, onDownload,
}: {
  wf: WorkflowEntry
  catName: string
  copied: string | null
  onCopy: (url: string, id: string) => void
  onDownload: (url: string, name: string) => void
}) {
  const cat = catMeta(catName)

  return (
    <div className="group relative flex flex-col rounded-[24px] border border-white/[0.08] bg-[rgba(10,10,12,0.85)] backdrop-blur-[30px] hover:border-white/[0.15] hover:bg-[rgba(20,20,24,0.85)] transition-all duration-300 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] hover:shadow-[0_24px_80px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)]">

      {/* Top accent glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${cat.color}80, transparent)`, boxShadow: `0 2px 14px ${cat.color}60` }} />

      <div className="flex flex-col gap-3 p-5 flex-1 relative z-10">

        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          {/* Category Icon */}
          <span className="text-[22px] leading-none opacity-80">{cat.icon}</span>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-[#fafafa] leading-snug">
          {wf.title}
        </h3>

        {/* Description */}
        <p className="text-[13px] text-[#a1a1aa] leading-relaxed line-clamp-2">
          {wf.description}
        </p>

        {/* Workflow schema — 3-node flow diagram */}
        <div className="flex items-center gap-0 mt-1">
          {inferSchema(wf.name, catName).map((node, idx) => (
            <div key={idx} className="flex items-center min-w-0">
              <div
                className="flex flex-col items-center px-2.5 py-1.5 rounded-[10px] border border-white/[0.06] bg-white/[0.02] min-w-0"
                style={{ flex: '1 1 0' }}
              >
                <span className="text-[11px] font-semibold text-[#e4e4e7] whitespace-nowrap truncate">
                  {node.label}
                </span>
                <span className="text-[9px] font-mono text-[#52525b] whitespace-nowrap truncate">
                  {node.sub}
                </span>
              </div>
              {idx < 2 && (
                <div className="flex items-center flex-shrink-0 px-0.5">
                  <div className="w-3 h-[1px] bg-white/10" />
                  <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] border-l-white/20" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Category tag */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#3f3f46]">
            {cat.label}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-white/[0.05]">
        <span className="text-[10px] font-mono text-[#3f3f46] truncate max-w-[140px]" title={wf.name}>
          {wf.name.replace('.json', '')}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onCopy(wf.rawUrl, wf.name)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#52525b] hover:text-white hover:bg-white/5 transition-all"
            title="Copier l'URL"
          >
            {copied === wf.name
              ? <Check size={13} className="text-emerald-400" />
              : <Copy size={13} />}
          </button>
          <button
            onClick={() => onDownload(wf.rawUrl, wf.name)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#52525b] hover:text-white hover:bg-white/5 transition-all"
            title="Télécharger le JSON"
          >
            <Download size={13} />
          </button>
          <a
            href={wf.rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#52525b] hover:text-white hover:bg-white/5 transition-all"
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  )
}

// ── CategoryCard component ───────────────────────────────────
function CategoryCard({ cat, count, onClick }: { cat: GHItem; count?: number; onClick: () => void }) {
  const m = catMeta(cat.name)
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col gap-3 p-5 rounded-[24px] border border-white/[0.08] bg-[rgba(10,10,12,0.85)] backdrop-blur-[30px] hover:border-white/[0.15] hover:bg-[rgba(20,20,24,0.85)] transition-all duration-300 text-left overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)]"
    >
      {/* Top subtle border glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(to right, transparent, ${m.color}80, transparent)`, boxShadow: `0 2px 14px ${m.color}60` }} />

      {/* Subtle color glow */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: m.color, filter: 'blur(32px)' }}
      />

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-[12px] flex items-center justify-center text-lg flex-shrink-0 border border-white/[0.06] relative z-10"
        style={{ background: `${m.color}16` }}
      >
        {m.icon}
      </div>

      {/* Name */}
      <div className="flex flex-col gap-0.5 relative z-10">
        <span className="text-[14px] font-semibold text-[#fafafa] leading-tight">
          {m.label}
        </span>
        <span className="text-[11px] font-mono text-[#52525b]">
          {count !== undefined ? `${count} workflows` : 'Explorer →'}
        </span>
      </div>

      {/* Description (visible on hover) */}
      <p className="text-[12px] text-[#a1a1aa] leading-relaxed line-clamp-2 relative z-10">
        {m.description}
      </p>

      {/* Chevron */}
      <ChevronRight
        size={14}
        className="absolute bottom-4 right-4 text-[#3f3f46] opacity-0 group-hover:opacity-100 group-hover:text-white transition-all duration-200"
      />
    </button>
  )
}

// ── Main page ────────────────────────────────────────────────
export default function AgentsPage() {
  const [categories, setCategories] = useState<GHItem[]>([])
  const [selectedCat, setSelectedCat] = useState<GHItem | null>(null)
  const [workflows, setWorkflows] = useState<WorkflowEntry[]>([])
  const [query, setQuery] = useState('')
  const [loadingCats, setLoadingCats] = useState(true)
  const [loadingWf, setLoadingWf] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [dlAll, setDlAll] = useState(false)

  // ── Fetch categories ───────────────────────────────────────
  const fetchCategories = useCallback(() => {
    setLoadingCats(true)
    setError(null)
    fetch(GH_API, { headers: { Accept: 'application/vnd.github.v3+json' } })
      .then(r => {
        if (r.status === 403) throw new Error('Limite de l\'API GitHub atteinte — réessayez dans 60 secondes.')
        if (!r.ok) throw new Error(`Erreur API GitHub ${r.status}`)
        return r.json() as Promise<GHItem[]>
      })
      .then(data => setCategories(data.filter(d => d.type === 'dir')))
      .catch(e => setError(String(e.message)))
      .finally(() => setLoadingCats(false))
  }, [])

  // ── Fetch workflows ────────────────────────────────────────
  const fetchWorkflows = useCallback((cat: GHItem) => {
    setLoadingWf(true)
    setError(null)
    setWorkflows([])
    fetch(`${GH_API}/${cat.name}`, { headers: { Accept: 'application/vnd.github.v3+json' } })
      .then(r => {
        if (r.status === 403) throw new Error('Limite de l\'API GitHub atteinte — réessayez dans 60 secondes.')
        if (!r.ok) throw new Error(`Erreur API GitHub ${r.status}`)
        return r.json() as Promise<GHItem[]>
      })
      .then(data => {
        setWorkflows(
          data
            .filter(d => d.type === 'file' && d.name.endsWith('.json'))
            .map(d => ({
              name: d.name,
              title: formatTitle(d.name),
              description: inferDescription(d.name, cat.name),
              category: cat.name,
              path: d.path,
              rawUrl: d.download_url ?? `${GH_RAW}/${cat.name}/${d.name}`,
            }))
        )
      })
      .catch(e => setError(String(e.message)))
      .finally(() => setLoadingWf(false))
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])
  useEffect(() => {
    if (selectedCat) fetchWorkflows(selectedCat)
    else setWorkflows([])
  }, [selectedCat, fetchWorkflows])

  // ── Derived state ──────────────────────────────────────────
  const filteredCats = useMemo(() =>
    categories.filter(c => !query || c.name.toLowerCase().includes(query.toLowerCase())),
    [categories, query]
  )

  const filteredWf = useMemo(() =>
    workflows.filter(w => {
      return !query || w.title.toLowerCase().includes(query.toLowerCase())
    }),
    [workflows, query]
  )

  // ── Actions ────────────────────────────────────────────────
  function goBack() {
    setSelectedCat(null)
    setWorkflows([])
    setQuery('')
    setError(null)
  }

  function copy(url: string, id: string) {
    navigator.clipboard.writeText(url).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    })
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  async function downloadAll() {
    if (dlAll || filteredWf.length === 0) return
    setDlAll(true)
    for (const wf of filteredWf.slice(0, 20)) {
      await downloadJson(wf.rawUrl, wf.name)
      await new Promise(r => setTimeout(r, 300))
    }
    setDlAll(false)
  }

  const isLoading = loadingCats || loadingWf

  return (
    <div className="relative h-full overflow-y-auto">
      <style>{`
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:6px}
        input::placeholder{color:#52525b !important}
      `}</style>
      
      <AmbientBackground accentColor="#A855F7" />

      <div className="relative z-10 p-6 md:p-10 max-w-[1400px] mx-auto flex flex-col gap-8">

        {/* ══ HEADER ══════════════════════════════════════════ */}
        <header className="animate-fade-in">
          {selectedCat ? (
            <div className="flex flex-col gap-4">
              <button
                onClick={goBack}
                className="inline-flex items-center gap-2 text-[13px] font-medium text-[#71717a] hover:text-white transition-colors w-fit"
              >
                <ArrowLeft size={15} />
                Retour aux catégories
              </button>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-3xl">{catMeta(selectedCat.name).icon}</span>
                    <h1 className="font-display text-3xl font-semibold text-[#fafafa] tracking-tight">
                      {catMeta(selectedCat.name).label}
                    </h1>
                    {workflows.length > 0 && (
                      <span className="text-[11px] font-mono text-[#52525b] border border-white/[0.08] rounded-full px-2.5 py-1">
                        {workflows.length} workflow{workflows.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] text-[#71717a] max-w-xl mt-1">
                    {catMeta(selectedCat.name).description}
                  </p>
                </div>

                {/* Download All button */}
                {!loadingWf && filteredWf.length > 0 && (
                  <button
                    onClick={downloadAll}
                    disabled={dlAll}
                    className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-[14px] border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.2] transition-all text-[13px] font-semibold text-[#e4e4e7] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    {dlAll
                      ? <Loader2 size={15} className="animate-spin" />
                      : <Download size={15} />}
                    {dlAll ? 'Téléchargement…' : `Tout télécharger (${Math.min(filteredWf.length, 20)})`}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h1 className="font-display text-3xl font-semibold text-[#fafafa] tracking-tight">Agents</h1>
                  {!loadingCats && (
                    <span className="text-[12px] font-medium font-mono text-[#a1a1aa] bg-white/[0.04] border border-white/[0.1] rounded-full px-3 py-1">
                      {categories.length} catégories · 2 061 workflows
                    </span>
                  )}
                </div>
                <p className="text-[15px] text-[#a1a1aa] max-w-xl">
                  Parcourez et déployez des workflows n8n prêts pour la production sur l&apos;ensemble de vos intégrations.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[12px] font-mono text-[#a1a1aa]">
                <Zap size={12} className="text-brand" />
                Propulsé par n8n
              </div>
            </div>
          )}
        </header>

        {/* ══ SEARCH + FILTERS ════════════════════════════════ */}
        <div className="flex flex-col gap-3 animate-slide-up">

          {/* Search bar */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717a] pointer-events-none z-10"
            />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={selectedCat
                ? `Rechercher dans ${catMeta(selectedCat.name).label}…`
                : 'Rechercher un agent actif, une catégorie…'}
              className="w-full h-12 pl-11 pr-10 bg-[rgba(10,10,12,0.85)] backdrop-blur-[30px] border border-white/[0.08] hover:border-white/[0.15] focus:border-white/[0.2] focus:bg-[rgba(20,20,24,0.85)] rounded-[24px] text-[15px] font-medium text-[#fafafa] outline-none placeholder:text-[#52525b] transition-all shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] focus:shadow-[0_24px_80px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(99,102,241,0.15)] relative z-0"
              aria-label="Rechercher"
            />
            {/* Top accent glow line for search bar */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[1px] opacity-30 pointer-events-none z-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)' }} />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white transition-colors z-10 bg-white/5 p-1 rounded-full"
                aria-label="Effacer"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* ══ RESULTS BAR ══════════════════════════════════════ */}
        {selectedCat && !loadingWf && workflows.length > 0 && (
          <div className="flex items-center gap-3 -mt-4">
            <span className="text-[11px] font-mono text-[#52525b] uppercase tracking-widest">
              {filteredWf.length.toLocaleString()} résultat{filteredWf.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* ══ ERROR ════════════════════════════════════════════ */}
        {error && !isLoading && (
          <div className="flex items-start gap-4 p-5 rounded-[20px] border border-red-500/20 bg-red-500/5 animate-fade-in">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-red-500/10 border border-red-500/20 flex-shrink-0">
              <span className="text-base">⚠️</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[14px] font-semibold text-[#fafafa]">Échec du chargement</p>
              <p className="text-[12px] font-mono text-[#71717a]">{error}</p>
              <button
                onClick={() => selectedCat ? fetchWorkflows(selectedCat) : fetchCategories()}
                className="text-[12px] font-semibold text-brand hover:text-brand-hover transition-colors w-fit mt-1"
              >
                Réessayer →
              </button>
            </div>
          </div>
        )}

        {/* ══ LOADING ══════════════════════════════════════════ */}
        {isLoading && !error && (
          <div className="flex flex-col items-center justify-center py-32 gap-5">
            <div className="w-12 h-12 rounded-2xl border border-white/[0.07] bg-[#0f0f0f] flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-brand" />
            </div>
            <p className="text-[12px] font-mono text-[#52525b] uppercase tracking-widest">
              {loadingCats ? 'Chargement des catégories…' : `Chargement des workflows ${selectedCat?.name}…`}
            </p>
          </div>
        )}

        {/* ══ CATEGORY GRID ════════════════════════════════════ */}
        {!selectedCat && !loadingCats && !error && (
          <>
            {filteredCats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
                <div className="w-12 h-12 rounded-2xl border border-white/[0.07] bg-[#0f0f0f] flex items-center justify-center">
                  <Search size={18} className="text-brand" />
                </div>
                <p className="text-[15px] font-semibold text-[#fafafa]">Aucune catégorie trouvée</p>
                <p className="text-[13px] text-[#71717a]">Essayez un autre terme de recherche.</p>
                <button onClick={() => setQuery('')} className="text-[13px] font-semibold text-brand hover:text-brand-hover transition-colors">
                  Tout afficher
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5 pb-12 animate-fade-in">
                {filteredCats.map(cat => (
                  <CategoryCard
                    key={cat.name}
                    cat={cat}
                    count={KNOWN_COUNTS[cat.name]}
                    onClick={() => { setSelectedCat(cat); setQuery('') }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ══ WORKFLOW GRID ════════════════════════════════════ */}
        {selectedCat && !loadingWf && !error && (
          <>
            {filteredWf.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
                <div className="w-12 h-12 rounded-2xl border border-white/[0.07] bg-[#0f0f0f] flex items-center justify-center">
                  <Search size={18} className="text-brand" />
                </div>
                <p className="text-[15px] font-semibold text-[#fafafa]">Aucun workflow ne correspond</p>
                <p className="text-[13px] text-[#71717a] max-w-[260px]">
                  Essayez un autre mot-clé ou réinitialisez les filtres.
                </p>
                <button
                  onClick={() => { setQuery('') }}
                  className="text-[13px] font-semibold text-brand hover:text-brand-hover transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12 animate-fade-in">
                {filteredWf.map(wf => (
                  <WorkflowCard
                    key={wf.name}
                    wf={wf}
                    catName={selectedCat.name}
                    copied={copied}
                    onCopy={copy}
                    onDownload={(url, name) => downloadJson(url, name)}
                  />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}
