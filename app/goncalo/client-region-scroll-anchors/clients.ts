export const REGIONS = [
  { id: 'united-states', name: 'United States', short: 'US' },
  { id: 'canada', name: 'Canada', short: 'CA' },
  { id: 'europe', name: 'Europe', short: 'EU' },
] as const;

export type RegionId = (typeof REGIONS)[number]['id'];

export type Asset = string | { src: string };

export interface Client {
  id: string;
  name: string;
  region: RegionId;
}

export function assetSrc(asset: Asset) {
  return typeof asset === 'string' ? asset : asset.src;
}

function client(name: string, region: RegionId): Client {
  return {
    id: name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
    name,
    region,
  };
}

const UNITED_STATES = [
  'Aetna',
  'Amwell',
  'Boeing',
  'CareFirst',
  'Cigna',
  'Cisco',
  'Comcast',
  'Delta Air Lines',
  'FedEx',
  'GE Aerospace',
  'Health Catalyst',
  'Humana',
  'IBM',
  'Intel',
  'Johnson & Johnson',
  'Johnson Electric',
  'Kaiser Permanente',
  'Lockheed Martin',
  'Meta',
  'Microsoft',
  'Netflix',
  'Nike',
  'Oracle',
  'PepsiCo',
  'Pfizer',
  'Salesforce',
  'Target',
  'United Healthcare',
  'Verizon',
  'Walmart',
];

const CANADA = [
  'Air Canada',
  'Bell',
  'Canadian Tire',
  'Desjardins',
  'Enbridge',
  'Loblaw',
  'Magna',
  'Manulife',
  'RBC',
  'Rogers',
  'Scotiabank',
  'Shopify',
  'Sun Life',
  'TD',
  'Telus',
  'Thomson Reuters',
];

const EUROPE = [
  'Adidas',
  'Airbus',
  'ASML',
  'BMW',
  'BNP Paribas',
  'Deutsche Bank',
  'IKEA',
  'L’Oréal',
  'Nestlé',
  'Philips',
  'SAP',
  'Shell',
  'Siemens',
  'Spotify',
  'Unilever',
  'Vodafone',
  'Volvo',
  'Zurich',
];

export const CLIENTS: Client[] = [
  ...UNITED_STATES.map((name) => client(name, 'united-states')),
  ...CANADA.map((name) => client(name, 'canada')),
  ...EUROPE.map((name) => client(name, 'europe')),
];

export const CLIENTS_ALPHA = [...CLIENTS].sort((a, b) =>
  a.name.localeCompare(b.name),
);

export function regionName(id: RegionId) {
  return REGIONS.find((region) => region.id === id)?.name ?? id;
}

export function matchesQuery(name: string, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return name.toLowerCase().includes(needle);
}

export function clientsInRegion(region: RegionId, query = '') {
  return CLIENTS.filter(
    (item) => item.region === region && matchesQuery(item.name, query),
  );
}
