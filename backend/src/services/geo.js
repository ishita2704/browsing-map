import geoip from 'geoip-lite';
//ip -> latitude, longitude, country, country_code, city
const COMPANY_HQ_FALLBACKS = {
  'google.com': { lat: 37.422, lng: -122.084, country: 'United States', countryCode: 'US', city: 'Mountain View' },
  'youtube.com': { lat: 37.422, lng: -122.084, country: 'United States', countryCode: 'US', city: 'Mountain View' },
  'facebook.com': { lat: 37.484, lng: -122.148, country: 'United States', countryCode: 'US', city: 'Menlo Park' },
  'meta.com': { lat: 37.484, lng: -122.148, country: 'United States', countryCode: 'US', city: 'Menlo Park' },
  'amazon.com': { lat: 47.606, lng: -122.332, country: 'United States', countryCode: 'US', city: 'Seattle' },
  'aws.amazon.com': { lat: 47.606, lng: -122.332, country: 'United States', countryCode: 'US', city: 'Seattle' },
  'microsoft.com': { lat: 47.643, lng: -122.130, country: 'United States', countryCode: 'US', city: 'Redmond' },
  'apple.com': { lat: 37.331, lng: -122.030, country: 'United States', countryCode: 'US', city: 'Cupertino' },
  'twitter.com': { lat: 37.776, lng: -122.417, country: 'United States', countryCode: 'US', city: 'San Francisco' },
  'x.com': { lat: 37.776, lng: -122.417, country: 'United States', countryCode: 'US', city: 'San Francisco' },
  'github.com': { lat: 37.776, lng: -122.417, country: 'United States', countryCode: 'US', city: 'San Francisco' },
  'netflix.com': { lat: 37.256, lng: -121.963, country: 'United States', countryCode: 'US', city: 'Los Gatos' },
  'linkedin.com': { lat: 37.328, lng: -121.894, country: 'United States', countryCode: 'US', city: 'Sunnyvale' },
  'reddit.com': { lat: 37.776, lng: -122.417, country: 'United States', countryCode: 'US', city: 'San Francisco' },
  'wikipedia.org': { lat: 37.789, lng: -122.394, country: 'United States', countryCode: 'US', city: 'San Francisco' },
  'cloudflare.com': { lat: 37.774, lng: -122.419, country: 'United States', countryCode: 'US', city: 'San Francisco' },
};
//issue
function getCompanyFallback(domain) {
  const normalized = domain.replace(/^www\./, ''); //remove www. from the domain

  if (COMPANY_HQ_FALLBACKS[normalized]) {
    return COMPANY_HQ_FALLBACKS[normalized]; //if the domain is a company= return the company's hq
  }

  const parts = normalized.split('.'); //split the domain into parts
  if (parts.length > 2) {
    const baseDomain = parts.slice(-2).join('.'); //get the base domain
    if (COMPANY_HQ_FALLBACKS[baseDomain]) {
      return COMPANY_HQ_FALLBACKS[baseDomain]; //if the base domain is a company= return the company's hq
    }
  }

  return null;
}

export function resolveGeoLocation({ domain, ip, dnsStatus }) {
  if (dnsStatus === 'localhost') {
    return {
      latitude: null,
      longitude: null,
      country: null,
      country_code: null,
      city: null,
      geo_status: 'localhost',
    };
  }

  if (dnsStatus === 'private_ip') {
    return {
      latitude: null,
      longitude: null,
      country: null,
      country_code: null,
      city: null,
      geo_status: 'private_ip',
    };
  }

  if (dnsStatus === 'dns_failed' || !ip) {
    const fallback = getCompanyFallback(domain);
    if (fallback) {
      return {
        latitude: fallback.lat,
        longitude: fallback.lng,
        country: fallback.country,
        country_code: fallback.countryCode,
        city: fallback.city,
        geo_status: 'company_fallback',
      };
    }

    return {
      latitude: null,
      longitude: null,
      country: null,
      country_code: null,
      city: null,
      geo_status: 'dns_failed',
    };
  }

  const lookup = geoip.lookup(ip); //lookup the ip in the geoip database
  console.log({
  domain,
  ip,
  lookup,
});

  if (lookup?.ll) { //if the ip is found in the geoip database= return the latitude, longitude, country, country_code, city
    return {
      latitude: lookup.ll[0],
      longitude: lookup.ll[1],
      country: lookup.country ? getCountryName(lookup.country) : null,
      country_code: lookup.country || null,
      city: lookup.city || null,
      geo_status: 'resolved',
    };
  }

  const fallback = getCompanyFallback(domain);
  if (fallback) {
    return {
      latitude: fallback.lat,
      longitude: fallback.lng,
      country: fallback.country,
      country_code: fallback.countryCode,
      city: fallback.city,
      geo_status: 'company_fallback',
    };
  }

  return {
    latitude: null,
    longitude: null,
    country: null,
    country_code: null,
    city: null,
    geo_status: 'lookup_failed',
  };
}

const COUNTRY_NAMES = {
  US: 'United States',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  CA: 'Canada',
  AU: 'Australia',
  IN: 'India',
  JP: 'Japan',
  CN: 'China',
  BR: 'Brazil',
  NL: 'Netherlands',
  IE: 'Ireland',
  SG: 'Singapore',
  SE: 'Sweden',
  CH: 'Switzerland',
};

function getCountryName(code) {
  return COUNTRY_NAMES[code] || code;
}
