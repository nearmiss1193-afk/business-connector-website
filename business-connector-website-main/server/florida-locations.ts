/**
 * Comprehensive Central Florida location data for property sync
 * Includes major cities with multiple ZIP codes to maximize property coverage
 */

export interface LocationConfig {
  city: string;
  zipCodes: string[];
  region: string;
  priority: number; // 1 = highest priority
}

/**
 * Central Florida locations with comprehensive ZIP code coverage
 * This configuration should fetch 7,000+ properties across the region
 */
export const FLORIDA_LOCATIONS: LocationConfig[] = [
  // ========================================
  // TAMPA BAY AREA (Priority 1)
  // ========================================
  {
    city: 'Tampa',
    region: 'Tampa Bay',
    priority: 1,
    zipCodes: [
      '33602', '33603', '33604', '33605', '33606', '33607', '33609', '33610',
      '33611', '33612', '33613', '33614', '33615', '33616', '33617', '33618',
      '33619', '33620', '33621', '33624', '33625', '33626', '33629', '33634',
      '33635', '33637', '33647', '33810', '33811', '33812', '33813'
    ]
  },
  {
    city: 'St Petersburg',
    region: 'Tampa Bay',
    priority: 1,
    zipCodes: [
      '33701', '33702', '33703', '33704', '33705', '33706', '33707', '33708',
      '33709', '33710', '33711', '33712', '33713', '33714', '33715', '33716'
    ]
  },
  {
    city: 'Clearwater',
    region: 'Tampa Bay',
    priority: 1,
    zipCodes: [
      '33755', '33756', '33759', '33760', '33761', '33762', '33763', '33764',
      '33765', '33767'
    ]
  },
  {
    city: 'Brandon',
    region: 'Tampa Bay',
    priority: 2,
    zipCodes: ['33510', '33511', '33527']
  },
  {
    city: 'Riverview',
    region: 'Tampa Bay',
    priority: 2,
    zipCodes: ['33568', '33569', '33578', '33579']
  },
  {
    city: 'Wesley Chapel',
    region: 'Tampa Bay',
    priority: 2,
    zipCodes: ['33543', '33544', '33545']
  },
  {
    city: 'Lutz',
    region: 'Tampa Bay',
    priority: 2,
    zipCodes: ['33548', '33549', '33558', '33559']
  },
  {
    city: 'Plant City',
    region: 'Tampa Bay',
    priority: 3,
    zipCodes: ['33563', '33565', '33566', '33567']
  },

  // ========================================
  // LAKELAND / POLK COUNTY (Priority 1)
  // ========================================
  {
    city: 'Lakeland',
    region: 'Polk County',
    priority: 1,
    zipCodes: [
      '33801', '33803', '33805', '33809', '33810', '33811', '33813', '33815'
    ]
  },
  {
    city: 'Winter Haven',
    region: 'Polk County',
    priority: 1,
    zipCodes: ['33880', '33881', '33884']
  },
  {
    city: 'Auburndale',
    region: 'Polk County',
    priority: 2,
    zipCodes: ['33823']
  },
  {
    city: 'Haines City',
    region: 'Polk County',
    priority: 2,
    zipCodes: ['33844', '33845']
  },

  // ========================================
  // ORLANDO AREA (Priority 1)
  // ========================================
  {
    city: 'Orlando',
    region: 'Greater Orlando',
    priority: 1,
    zipCodes: [
      '32801', '32803', '32804', '32805', '32806', '32807', '32808', '32809',
      '32810', '32811', '32812', '32814', '32817', '32818', '32819', '32820',
      '32821', '32822', '32824', '32825', '32826', '32827', '32828', '32829',
      '32830', '32831', '32832', '32833', '32835', '32836', '32837', '32839'
    ]
  },
  {
    city: 'Kissimmee',
    region: 'Greater Orlando',
    priority: 1,
    zipCodes: ['34741', '34742', '34743', '34744', '34746', '34747', '34758']
  },
  {
    city: 'Winter Park',
    region: 'Greater Orlando',
    priority: 1,
    zipCodes: ['32789', '32792']
  },
  {
    city: 'Clermont',
    region: 'Greater Orlando',
    priority: 2,
    zipCodes: ['34711', '34714', '34715']
  },
  {
    city: 'Ocoee',
    region: 'Greater Orlando',
    priority: 2,
    zipCodes: ['34761']
  },
  {
    city: 'Apopka',
    region: 'Greater Orlando',
    priority: 2,
    zipCodes: ['32703', '32712']
  },
  {
    city: 'Altamonte Springs',
    region: 'Greater Orlando',
    priority: 2,
    zipCodes: ['32701', '32714', '32715']
  },

  // ========================================
  // DAYTONA BEACH AREA (Priority 2)
  // ========================================
  {
    city: 'Daytona Beach',
    region: 'Daytona Area',
    priority: 2,
    zipCodes: ['32114', '32117', '32118', '32119', '32120', '32124']
  },
  {
    city: 'Ormond Beach',
    region: 'Daytona Area',
    priority: 2,
    zipCodes: ['32174', '32176']
  },
  {
    city: 'Port Orange',
    region: 'Daytona Area',
    priority: 2,
    zipCodes: ['32127', '32128', '32129']
  },
  {
    city: 'Deltona',
    region: 'Daytona Area',
    priority: 2,
    zipCodes: ['32725', '32738']
  },

  // ========================================
  // ADDITIONAL CENTRAL FLORIDA CITIES
  // ========================================
  {
    city: 'Sarasota',
    region: 'Sarasota County',
    priority: 2,
    zipCodes: ['34231', '34232', '34233', '34234', '34235', '34236', '34237', '34238', '34239', '34240', '34241', '34242', '34243']
  },
  {
    city: 'Bradenton',
    region: 'Manatee County',
    priority: 2,
    zipCodes: ['34201', '34202', '34203', '34205', '34207', '34208', '34209', '34210', '34211', '34212']
  },
  {
    city: 'Fort Myers',
    region: 'Lee County',
    priority: 3,
    zipCodes: ['33901', '33905', '33907', '33908', '33912', '33913', '33916', '33917', '33919']
  },
  {
    city: 'Cape Coral',
    region: 'Lee County',
    priority: 3,
    zipCodes: ['33904', '33909', '33914', '33990', '33991', '33993']
  },
  {
    city: 'Naples',
    region: 'Collier County',
    priority: 3,
    zipCodes: ['34102', '34103', '34104', '34105', '34108', '34109', '34110', '34112', '34113', '34114', '34116', '34117', '34119', '34120']
  },
];

/**
 * Get all ZIP codes for a specific city
 */
export function getZipCodesForCity(cityName: string): string[] {
  const location = FLORIDA_LOCATIONS.find(
    loc => loc.city.toLowerCase() === cityName.toLowerCase()
  );
  return location?.zipCodes || [];
}

/**
 * Get all locations by priority level
 */
export function getLocationsByPriority(priority: number): LocationConfig[] {
  return FLORIDA_LOCATIONS.filter(loc => loc.priority === priority);
}

/**
 * Get total number of ZIP codes configured
 */
export function getTotalZipCodeCount(): number {
  return FLORIDA_LOCATIONS.reduce((total, loc) => total + loc.zipCodes.length, 0);
}

/**
 * Get all unique cities
 */
export function getAllCities(): string[] {
  return FLORIDA_LOCATIONS.map(loc => loc.city);
}
