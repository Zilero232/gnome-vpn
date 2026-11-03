import type { ClientPresence } from '@/modules/scheduler/jobs/reconcile-peers/reconcile-peers.job.types';

export type IsQuietClientInput = {
  email: string;
  presence: ClientPresence;
  now: Date;
};
