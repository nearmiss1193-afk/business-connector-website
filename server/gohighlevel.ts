/**
 * CRM API Integration
 * 
 * This module handles submitting leads to the Business Conector CRM backend.
 * Credentials are automatically configured from environment variables.
 */

interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  brokerage?: string;
  yearsExperience?: string;
  currentLeadSource?: string;
  selectedPlan: string;
  message?: string;
}

export async function submitLeadToGoHighLevel(data: LeadData) {
  // TODO: Replace with actual GoHighLevel API key from environment
  const apiKey = process.env.GOHIGHLEVEL_API_KEY;
  const locationId = process.env.GOHIGHLEVEL_LOCATION_ID;

  if (!apiKey || !locationId) {
    console.warn("CRM API credentials not configured. Lead will be logged only.");
    console.log("Lead data:", JSON.stringify(data, null, 2));
    
    // Return mock success for now
    return {
      success: true,
      contactId: `mock-${Date.now()}`,
    };
  }

  try {
    // Create contact in CRM
    const response = await fetch(`https://rest.gohighlevel.com/v1/contacts/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        locationId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        customFields: {
          brokerage: data.brokerage || "",
          years_experience: data.yearsExperience || "",
          current_lead_source: data.currentLeadSource || "",
          selected_plan: data.selectedPlan,
          message: data.message || "",
        },
        tags: ["business-conector-lead", `plan-${data.selectedPlan}`],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`CRM API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      contactId: result.contact?.id || result.id,
    };
  } catch (error) {
    console.error("CRM submission error:", error);
    throw error;
  }
}
