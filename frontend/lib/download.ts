// FILE: frontend/lib/download.ts

/**
 * Detect file type from response content
 */
export function detectFileType(content: string): 'json' | 'md' | 'txt' {
  const jsonMatch = content.match(/```json([\s\S]*?)```/);
  const mdMatch = content.match(/```markdown([\s\S]*?)```/);

  if (jsonMatch) return 'json';
  if (mdMatch) return 'md';
  return 'txt';
}

/**
 * Extract raw content from code block
 */
export function extractCodeBlock(content: string, type: 'json' | 'md' | 'txt'): string {
  if (type === 'txt') return content;
  
  const label = type === 'md' ? 'markdown' : type;
  const regex = new RegExp("```" + label + "([\\s\\S]*?)```");
  const match = content.match(regex);
  return match ? match[1].trim() : content;
}

/**
 * Trigger download
 */
export function triggerDownload(content: string, mode: 'workflow' | 'skill' | 'agent'): void {
  if (typeof window === 'undefined') return;

  const type = detectFileType(content);
  const raw = extractCodeBlock(content, type);

  const timestamp = Date.now();
  const filenames = {
    workflow: `orchestrai-workflow-${timestamp}.json`,
    skill:    `orchestrai-skill-${timestamp}.md`,
    agent:    `orchestrai-agent-${timestamp}.md`
  };

  const filename = filenames[mode] || `orchestrai-export-${timestamp}.${type}`;
  const blob = new Blob([raw], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
