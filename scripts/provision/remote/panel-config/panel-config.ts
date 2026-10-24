import { arg, dockerExec, line } from '@gnomevpn/scripts/shell';
import pWaitFor from 'p-wait-for';

import type {
  ConfigurePanelInput,
  IssueTokenInput,
  KeepCoreRunningInput,
  PanelApiUrlInput,
  ProbeTokenInput,
  RunPanelCliInput,
  TokenVerdict,
  WaitForPanelListeningInput
} from './panel-config.types';

import { PANEL } from '../../../../apps/server/src/lib/xray';
import { log, PORTS } from '../../config';
import { CONTAINER_NAME } from '../xray-stack';
import { PANEL_BOOT, PANEL_CLI, SETTINGS_UPLOAD, TOKEN_PROBE } from './panel-config.constants';
import { assertPanelAccepted, readTokenProbe, settingsKeepingCore } from './panel-config.helpers';

const panelApiUrl = ({ panelPath, route }: PanelApiUrlInput) => `http://127.0.0.1:${PORTS.panel}/${panelPath}/panel/api/${route}`;

const bearer = (token: string) => `Authorization: Bearer ${token}\n`;

const waitForPanelListening = async ({ ssh, panelPath, timeoutMs }: WaitForPanelListeningInput): Promise<boolean> => {
  const probe = line([
    'curl -s -o /dev/null',
    `--max-time ${PANEL_BOOT.probeTimeoutSeconds}`,
    "-w '%{http_code}'",
    arg(`http://127.0.0.1:${PORTS.panel}/${panelPath}/`)
  ]);

  const isUp = async (): Promise<boolean> => (await ssh.exec(probe)).stdout.trim() === PANEL_BOOT.readyStatus;

  return pWaitFor(async () => (await isUp()) && pWaitFor.resolveWith(true), {
    timeout: { milliseconds: timeoutMs, fallback: () => false },
    interval: PANEL_BOOT.intervalMs
  });
};

const runPanelCli = async ({ ssh, args }: RunPanelCliInput): Promise<string> => {
  const result = await ssh.run(dockerExec({ container: CONTAINER_NAME, argv: [PANEL_CLI.binary, 'setting', ...args] }));
  const failure = PANEL_CLI.failure.exec(result.stdout);

  if (failure) {
    throw new Error(`the panel cli refused a setting: ${failure[0]}`);
  }

  return result.stdout;
};

const probeToken = async ({ ssh, panelPath, token }: ProbeTokenInput): Promise<TokenVerdict> => {
  const result = await ssh.run({
    command: line([
      'curl -sS -H @-',
      `--max-time ${TOKEN_PROBE.timeoutSeconds}`,
      '-w',
      arg(String.raw`\n%{http_code}`),
      arg(panelApiUrl({ panelPath, route: 'inbounds/list' }))
    ]),
    stdin: bearer(token)
  });

  return readTokenProbe(result.stdout);
};

const issueToken = async ({ ssh, panelPath, knownToken }: IssueTokenInput): Promise<string> => {
  if (knownToken) {
    if ((await probeToken({ ssh, panelPath, token: knownToken })) === 'accepted') {
      log.done('the panel still accepts the api token we hold, keeping it');

      return knownToken;
    }

    log.warn('the panel answered 401 to the api token we hold, issuing a new one');
  }

  const token = PANEL_CLI.token.exec(await runPanelCli({ ssh, args: ['-getApiToken'] }))?.[1];

  if (!token) {
    throw new Error('could not read an api token from the panel');
  }

  log.done('the panel answered with a new api token');

  return token;
};

const keepCoreRunning = async ({ ssh, panelPath, token }: KeepCoreRunningInput): Promise<void> => {
  const current = await ssh.run({
    command: line(['curl -sSf -X POST -H @-', arg(panelApiUrl({ panelPath, route: 'setting/all' }))]),
    stdin: bearer(token)
  });

  const body = settingsKeepingCore(current.stdout);

  if (body === null) {
    log.done('the core already keeps running when a client is disabled');

    return;
  }

  const dir = (await ssh.run('mktemp -d')).stdout.trim();
  const bodyPath = `${dir}/${SETTINGS_UPLOAD.fileName}`;

  try {
    await ssh.putFile({ content: body, remotePath: bodyPath });

    const saved = await ssh.run({
      command: line([
        'curl -sSf -X POST -H @-',
        "-H 'Content-Type: application/json'",
        `--data-binary @${arg(bodyPath)}`,
        arg(panelApiUrl({ panelPath, route: 'setting/update' }))
      ]),
      stdin: bearer(token)
    });

    assertPanelAccepted(saved.stdout);
  } finally {
    await ssh.exec(line(['rm', '-rf', arg(dir)]));
  }

  log.done('the core no longer restarts when a client is disabled');
};

export const configurePanel = async ({ ssh, password, panelPath, knownToken }: ConfigurePanelInput): Promise<string> => {
  log.step('configuring the panel credentials');

  await runPanelCli({ ssh, args: ['-username', PANEL.username, '-password', password] });

  const isInPlace = await waitForPanelListening({
    ssh,
    panelPath,
    timeoutMs: knownToken ? PANEL_BOOT.timeoutMs : PANEL_BOOT.intervalMs
  });

  if (isInPlace) {
    log.done('the panel already listens on its port and path, so it keeps running');
  } else {
    log.step('moving the panel to its port and path, restarting it');

    await runPanelCli({ ssh, args: ['-port', String(PORTS.panel), '-webBasePath', panelPath] });
    await ssh.run(line(['docker', 'restart', CONTAINER_NAME]));

    if (!(await waitForPanelListening({ ssh, panelPath, timeoutMs: PANEL_BOOT.timeoutMs }))) {
      throw new Error('the panel did not start listening after a restart');
    }

    log.done('the panel listens on its port and path');
  }

  const token = await issueToken({ ssh, panelPath, knownToken });

  await keepCoreRunning({ ssh, panelPath, token });

  return token;
};
