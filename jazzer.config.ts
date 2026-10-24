import { defineConfig } from 'commit-jazzer';

export default defineConfig({
  availableCommitTypes: ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'],
  scopes: [
    'client',
    'server',
    'admin',
    'auth',
    'billing',
    'telegram',
    'vpn',
    'schemas',
    'logger',
    'scripts',
    'provision',
    'infra',
    'ci',
    'docs',
    'e2e',
    'deps'
  ]
});
