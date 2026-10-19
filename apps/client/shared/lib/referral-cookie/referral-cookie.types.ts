import type { NextRequest, NextResponse } from 'next/server';

export type RememberReferralInput = {
  request: NextRequest;
  response: NextResponse;
};
