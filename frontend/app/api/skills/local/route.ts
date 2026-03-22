// FILE: frontend/app/api/skills/local/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, unauthorized } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/skills/local
 * 
 * Lit les compétences locales définies dans le dossier .claude/skills à la racine du projet.
 * Ces compétences sont spécifiques au projet OrchestrAI.
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Authentification
    const user = await getAuthUser(req);
    if (!user) {
      return unauthorized();
    }

    // 2. Localisation du dossier .claude/skills
    // Le dossier .claude se trouve à la racine du dépôt (niveau au-dessus de 'frontend')
    const rootDir = process.cwd(); // Ici, process.cwd() est probablement 'frontend'
    const absoluteRoot = path.resolve(rootDir, '..');
    const skillsPath = path.join(absoluteRoot, '.claude', 'skills');

    if (!fs.existsSync(skillsPath)) {
      return NextResponse.json({ data: [], error: null }, { status: 200 });
    }

    const categories = fs.readdirSync(skillsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const localSkills = [];

    for (const cat of categories) {
      const catPath = path.join(skillsPath, cat);
      const skillFile = path.join(catPath, 'SKILL.md');

      if (fs.existsSync(skillFile)) {
        const content = fs.readFileSync(skillFile, 'utf-8');
        
        // Extraction simplifiée du frontmatter pour le nom et la description
        const nameMatch = content.match(/name:\s*"?(.*?)"?\n/);
        const descMatch = content.match(/description:\s*"?(.*?)"?\n/);
        
        localSkills.push({
          id: `local-${cat}`,
          name: nameMatch ? nameMatch[1] : cat,
          description: descMatch ? descMatch[1] : 'Compétence locale partagée.',
          category: 'PROJET',
          author: 'Équipe Locale',
          version: '1.0.0',
          content: content,
          isLocal: true
        });
      }
    }

    return NextResponse.json({ data: localSkills, error: null }, { status: 200 });

  } catch (error) {
    console.error('[API /skills/local]', error);
    return NextResponse.json(
      { data: null, error: 'Erreur lors de la lecture des skills locaux', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
