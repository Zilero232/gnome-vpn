import ipaddr from 'ipaddr.js';
import { isIP } from 'node:net';

const NOT_AN_IP = 0;

export const isIpAddress = (value: string): boolean => isIP(value) !== NOT_AN_IP;

export const canonicalIp = (ip: string): string | null => (isIpAddress(ip) ? ipaddr.process(ip).toString() : null);
