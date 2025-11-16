/**
 * Zillow API Client via RapidAPI
 * Enhanced with Grok's improvements for better lead generation
 * Fetches property listings with images for Central Florida
 */

const RAPIDAPI_HOST = "zillow-com1.p.rapidapi.com";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Validate API key at module load
if (!RAPIDAPI_KEY) {
  console.warn("[Zillow API] RAPIDAPI_KEY not configured - API calls will fail");
}

interface ZillowProperty {
  zpid: number;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  propertyType: string;
  latitude: number;
  longitude: number;
  imgSrc?: string;
  detailUrl?: string;
  daysOnZillow?: number;
  isSold?: boolean;
  images?: string[]; // Added for full image support
}

interface ZillowSearchResponse {
  props: ZillowProperty[];
  pagination?: {
    totalPages: number;
    currentPage: number;
  };
}

interface ZillowSearchOptions {
  status_type?: "ForSale" | "ForRent" | "RecentlySold";
  home_type?: "Houses" | "Townhomes" | "Condos" | "MultiFamily" | "Land" | "Mobile";
  minPrice?: number;
  maxPrice?: number;
  bedsMin?: number;
  bathsMin?: number;
}

/**
 * Search for properties in a specific location
 * Enhanced with optional filters for better lead targeting
 */
export async function searchZillowProperties(
  location: string,
  page: number = 1,
  options: ZillowSearchOptions = {}
): Promise<ZillowProperty[]> {
  if (!RAPIDAPI_KEY) {
    console.error("[Zillow API] RAPIDAPI_KEY is required");
    return [];
  }

  try {
    const url = new URL("https://zillow-com1.p.rapidapi.com/propertyExtendedSearch");
    url.searchParams.append("location", location);
    url.searchParams.append("page", page.toString());

    // Add optional filters
    if (options.status_type) url.searchParams.append("status_type", options.status_type);
    if (options.home_type) url.searchParams.append("home_type", options.home_type);
    if (options.minPrice) url.searchParams.append("minPrice", options.minPrice.toString());
    if (options.maxPrice) url.searchParams.append("maxPrice", options.maxPrice.toString());
    if (options.bedsMin) url.searchParams.append("bedsMin", options.bedsMin.toString());
    if (options.bathsMin) url.searchParams.append("bathsMin", options.bathsMin.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-RapidAPI-Host": RAPIDAPI_HOST,
        "X-RapidAPI-Key": RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`[Zillow API] Search failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as ZillowSearchResponse;
    return data.props || [];
  } catch (error) {
    console.error("[Zillow API] Search error:", error);
    return [];
  }
}

/**
 * Get detailed property information including images
 * Enhanced to auto-fetch images for complete property data
 */
export async function getZillowPropertyDetails(zpid: number): Promise<ZillowProperty | null> {
  if (!RAPIDAPI_KEY) {
    console.error("[Zillow API] RAPIDAPI_KEY is required");
    return null;
  }

  try {
    const url = new URL("https://zillow-com1.p.rapidapi.com/property");
    url.searchParams.append("zpid", zpid.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-RapidAPI-Host": RAPIDAPI_HOST,
        "X-RapidAPI-Key": RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`[Zillow API] Property details failed: ${response.status}`);
    }

    const data = (await response.json()) as ZillowProperty;

    // Auto-fetch images for complete property data
    data.images = await getZillowPropertyImages(zpid);

    return data;
  } catch (error) {
    console.error("[Zillow API] Property details error:", error);
    return null;
  }
}

/**
 * Get property images
 */
export async function getZillowPropertyImages(zpid: number): Promise<string[]> {
  if (!RAPIDAPI_KEY) {
    console.error("[Zillow API] RAPIDAPI_KEY is required");
    return [];
  }

  try {
    const url = new URL("https://zillow-com1.p.rapidapi.com/images");
    url.searchParams.append("zpid", zpid.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-RapidAPI-Host": RAPIDAPI_HOST,
        "X-RapidAPI-Key": RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`[Zillow API] Images failed: ${response.status}`);
    }

    const data = (await response.json()) as { images?: string[] };
    return data.images || [];
  } catch (error) {
    console.error("[Zillow API] Images error:", error);
    return [];
  }
}

/**
 * Search properties by coordinates and radius
 */
export async function searchZillowByCoordinates(
  latitude: number,
  longitude: number,
  radius: number = 5,
  page: number = 1
): Promise<ZillowProperty[]> {
  if (!RAPIDAPI_KEY) {
    console.error("[Zillow API] RAPIDAPI_KEY is required");
    return [];
  }

  try {
    const url = new URL("https://zillow-com1.p.rapidapi.com/propertyByCoordinates");
    url.searchParams.append("latitude", latitude.toString());
    url.searchParams.append("longitude", longitude.toString());
    url.searchParams.append("radius", radius.toString());
    url.searchParams.append("page", page.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-RapidAPI-Host": RAPIDAPI_HOST,
        "X-RapidAPI-Key": RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`[Zillow API] Coordinate search failed: ${response.status}`);
    }

    const data = (await response.json()) as ZillowSearchResponse;
    return data.props || [];
  } catch (error) {
    console.error("[Zillow API] Coordinate search error:", error);
    return [];
  }
}

/**
 * Search by polygon (custom drawn area)
 */
export async function searchZillowByPolygon(
  polygon: Array<{ latitude: number; longitude: number }>,
  page: number = 1
): Promise<ZillowProperty[]> {
  if (!RAPIDAPI_KEY) {
    console.error("[Zillow API] RAPIDAPI_KEY is required");
    return [];
  }

  try {
    const url = new URL("https://zillow-com1.p.rapidapi.com/propertyByPolygon");
    url.searchParams.append("polygon", JSON.stringify(polygon));
    url.searchParams.append("page", page.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-RapidAPI-Host": RAPIDAPI_HOST,
        "X-RapidAPI-Key": RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`[Zillow API] Polygon search failed: ${response.status}`);
    }

    const data = (await response.json()) as ZillowSearchResponse;
    return data.props || [];
  } catch (error) {
    console.error("[Zillow API] Polygon search error:", error);
    return [];
  }
}

/**
 * Export fetched properties to JSON for GHL upload/import
 */
export function exportPropertiesToJSON(properties: ZillowProperty[]): string {
  return JSON.stringify(properties, null, 2);
}

/**
 * Export fetched properties to CSV for GHL bulk import
 * Maps Zillow fields to GHL custom field names
 */
export function exportPropertiesToCSV(properties: ZillowProperty[]): string {
  if (properties.length === 0) {
    return "";
  }

  // CSV header with GHL-compatible field names
  const headers = [
    "property_address",
    "property_city",
    "property_state",
    "property_zip",
    "property_price",
    "property_beds",
    "property_baths",
    "property_sqft",
    "property_type",
    "property_latitude",
    "property_longitude",
    "property_url",
    "days_on_zillow",
    "is_sold",
    "zpid",
  ];

  // Convert properties to CSV rows
  const rows = properties.map((prop) => [
    `"${prop.address.replace(/"/g, '""')}"`, // Escape quotes in address
    `"${prop.city}"`,
    `"${prop.state}"`,
    `"${prop.zipcode}"`,
    prop.price.toString(),
    prop.beds.toString(),
    prop.baths.toString(),
    prop.sqft.toString(),
    `"${prop.propertyType}"`,
    prop.latitude.toString(),
    prop.longitude.toString(),
    `"${prop.detailUrl || ""}"`,
    (prop.daysOnZillow || 0).toString(),
    (prop.isSold ? "true" : "false"),
    prop.zpid.toString(),
  ]);

  // Combine header and rows
  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  return csvContent;
}

/**
 * Rate limiting helper to respect RapidAPI quotas
 * Implements simple queue-based rate limiting
 */
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private requestsPerMinute: number;
  private lastResetTime: number = Date.now();

  constructor(requestsPerMinute: number = 60) {
    this.requestsPerMinute = requestsPerMinute;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceReset = now - this.lastResetTime;

      // Reset counter every minute
      if (timeSinceReset > 60000) {
        this.lastResetTime = now;
      }

      const fn = this.queue.shift();
      if (fn) {
        await fn();
      }

      // Rate limit: delay between requests
      const delayMs = (60000 / this.requestsPerMinute) * 1.1; // 10% buffer
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    this.isProcessing = false;
  }
}

// Export rate limiter instance
export const zillowRateLimiter = new RateLimiter(60); // 60 requests per minute default
