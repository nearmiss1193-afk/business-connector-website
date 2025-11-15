/**
 * Zillow API Client via RapidAPI
 * Fetches property listings with images for Central Florida
 */

const RAPIDAPI_HOST = "zillow-com1.p.rapidapi.com";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";

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
}

interface ZillowSearchResponse {
  props: Array<{
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
  }>;
  pagination?: {
    totalPages: number;
    currentPage: number;
  };
}

/**
 * Search for properties in a specific location
 */
export async function searchZillowProperties(
  location: string,
  page: number = 1
): Promise<ZillowProperty[]> {
  if (!RAPIDAPI_KEY) {
    console.warn("[Zillow API] RAPIDAPI_KEY not configured");
    return [];
  }

  try {
    const url = new URL("https://zillow-com1.p.rapidapi.com/propertyExtendedSearch");
    url.searchParams.append("location", location);
    url.searchParams.append("page", page.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-RapidAPI-Host": RAPIDAPI_HOST,
        "X-RapidAPI-Key": RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      console.error(`[Zillow API] Search failed: ${response.status} ${response.statusText}`);
      return [];
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
 */
export async function getZillowPropertyDetails(zpid: number): Promise<ZillowProperty | null> {
  if (!RAPIDAPI_KEY) {
    console.warn("[Zillow API] RAPIDAPI_KEY not configured");
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
      console.error(`[Zillow API] Property details failed: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as ZillowProperty;
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
    console.warn("[Zillow API] RAPIDAPI_KEY not configured");
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
      console.error(`[Zillow API] Images failed: ${response.status}`);
      return [];
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
    console.warn("[Zillow API] RAPIDAPI_KEY not configured");
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
      console.error(`[Zillow API] Coordinate search failed: ${response.status}`);
      return [];
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
    console.warn("[Zillow API] RAPIDAPI_KEY not configured");
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
      console.error(`[Zillow API] Polygon search failed: ${response.status}`);
      return [];
    }

    const data = (await response.json()) as ZillowSearchResponse;
    return data.props || [];
  } catch (error) {
    console.error("[Zillow API] Polygon search error:", error);
    return [];
  }
}
