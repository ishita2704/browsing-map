import dns from 'dns/promises'; 
import { URL } from 'url';
//url -> domain -> ip
const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^0\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
];

export function extractDomain(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    return parsed.hostname.toLowerCase(); //extract the domain from the url
  } catch {
    return null;
  }
}

export function isLocalhost(domain) { //check if the domain is a localhost= skip
  return (
    domain === 'localhost' ||
    domain.endsWith('.localhost') ||
    domain === '127.0.0.1' ||
    domain === '[::1]'
  );
}

export function isPrivateIp(ip) {
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(ip));
} //check if the ip is a private ip

export async function resolveDomainToIp(domain) {
  if (isLocalhost(domain)) {
    return { ip: null, status: 'localhost' };
  } //if the domain is a localhost= skip

  try {
    const addresses = await dns.resolve4(domain); //resolve the domain to an ip address
    const ip = addresses[0]; //get the first ip address

    if (!ip) { //if the ip is not found= skip
      return { ip: null, status: 'dns_failed' };
    }

    if (isPrivateIp(ip)) {
      return { ip, status: 'private_ip' }; //if the ip is a private ip= skip
    }

    return { ip, status: 'resolved' }; //if the ip is a public ip= resolve
  } catch (error) {
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {  //DNS lookup error codes
      return { ip: null, status: 'dns_failed' };  
    }
    throw error;
  }
}
