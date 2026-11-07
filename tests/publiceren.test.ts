import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

// Deze workflow draait niet op een pull request, dus een fout zou pas na het samenvoegen opvallen.
const workflow = parse(readFileSync('.github/workflows/publiceren.yml', 'utf8'));

describe('workflow om de site te publiceren', () => {
  it('start bij een push naar de hoofdbranch en met de hand', () => {
    expect(workflow.on.push.branches).toEqual(['main']);
    expect(workflow.on).toHaveProperty('workflow_dispatch');
  });

  it('bouwt de site en zet de map dist klaar', () => {
    const stappen = workflow.jobs.bouwen.steps;
    expect(stappen.map((stap: { run?: string }) => stap.run)).toContain('npm run build');
    const klaarzetten = stappen.find((stap: { uses?: string }) =>
      stap.uses?.startsWith('actions/upload-pages-artifact@'),
    );
    expect(klaarzetten.with.path).toBe('dist');
  });

  it('publiceert na het bouwen, met de rechten die GitHub Pages vraagt', () => {
    const publiceren = workflow.jobs.publiceren;
    expect(publiceren.needs).toBe('bouwen');
    expect(publiceren.permissions).toEqual({ pages: 'write', 'id-token': 'write' });
    expect(publiceren.environment.name).toBe('github-pages');
    expect(publiceren.steps[0].uses).toMatch(/^actions\/deploy-pages@/);
  });
});
