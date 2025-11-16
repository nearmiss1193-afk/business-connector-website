/**
 * GoHighLevel CRM Integration
 * Handles dual-pipeline lead routing for Business Conector
 * 
 * AGENT LEADS → Business Conector - Lead to Customer pipeline
 * BUYER LEADS → Buyer Leads - Property to Sale pipeline
 */

import axios from 'axios';
import { ENV } from './_core/env';

// GoHighLevel API v2.0 endpoint (correct endpoint for Private Integration tokens)
const GHL_API_BASE = 'https://rest.gohighlevel.com/v1';

// Private Integration Token (from GoHighLevel Settings → Private Integrations)
// This is the Manus/Pipedream integration token that has full API access
const GHL_API_TOKEN = process.env.GOHIGHLEVEL_API_KEY || 'pit-b0a41b0b-24e5-4cee-8126-ee7b80b4c89e';

// Agent Client Pipeline (existing)
const AGENT_PIPELINE_ID = 'ypWCzagQK0pINOc2sTay';
const AGENT_STAGE_ID = 'e16b1961-ef07-4365-8102-48076a1ad639'; // New Lead

// Buyer Lead Pipeline (will be populated from environment or setup)
const BUYER_PIPELINE_ID = process.env.BUYER_PIPELINE_ID || '';
const BUYER_STAGE_ID = process.env.BUYER_STAGE_ID || '';

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

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source?: string;
  
  // Agent-specific fields
  brokerageName?: string;
  yearsExperience?: string;
  currentLeadSource?: string;
  monthlyLeadBudget?: string;
  interestedPackage?: string;
  selectedPlan?: string;
  message?: string;
  
  // Buyer-specific fields
  propertyAddress?: string;
  propertyPrice?: string;
  propertyId?: string;
  budget?: string;
  timeline?: string;
  preapproved?: string;
  propertyBeds?: string;
  propertyBaths?: string;
  propertySqft?: string;
  city?: string;
  
  // Mortgage-specific fields
  homePrice?: string;
  downPayment?: string;
  interestRate?: string;
  loanTerm?: string;
  monthlyPayment?: string;
}

interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tags: string[];
  customFields: Record<string, string>;
  source: string;
}

type LeadType = 'AGENT' | 'BUYER';

/**
 * Legacy function for backwards compatibility
 */
export async function submitLeadToGoHighLevel(data: LeadData) {
  const locationId = ENV.gohighlevelLocationId;

  if (!GHL_API_TOKEN || !locationId) {
    console.warn("GoHighLevel credentials not configured. Lead will be logged only.");
    console.log("Lead data:", JSON.stringify(data, null, 2));
    
    return {
      success: true,
      contactId: `mock-${Date.now()}`,
    };
  }

  try {
    // Create contact in GoHighLevel using API v2.0
    const response = await axios.post(
      `${GHL_API_BASE}/contacts/`,
      {
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
      },
      {
        headers: {
          Authorization: `Bearer ${GHL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Add to agent pipeline
    await axios.post(
      `${GHL_API_BASE}/opportunities/`,
      {
        locationId,
        pipelineId: AGENT_PIPELINE_ID,
        pipelineStageId: AGENT_STAGE_ID,
        contactId: response.data.contact.id,
        name: 'Agent Client Lead',
        status: 'open',
        monetaryValue: data.selectedPlan === 'content' ? 891 : data.selectedPlan === 'nurture' ? 597 : 397,
      },
      {
        headers: {
          Authorization: `Bearer ${GHL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      success: true,
      contactId: response.data.contact.id,
    };
  } catch (error: any) {
    console.error("GoHighLevel submission error:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Determine if this is an agent lead or buyer lead
 */
function determineLeadType(formData: FormData): LeadType {
  // Check URL source
  if (formData.source) {
    // Property website domains = buyer leads
    if (
      formData.source.includes('lakelandhomes') ||
      formData.source.includes('tampahome') ||
      formData.source.includes('orlandohome') ||
      formData.source.includes('daytonahome') ||
      formData.source.includes('centralfloridashomes')
    ) {
      return 'BUYER';
    }
    
    // Main business site = agent leads
    if (formData.source.includes('businessconector.com')) {
      return 'AGENT';
    }
  }

  // Check for property-specific fields
  if (
    formData.propertyAddress ||
    formData.propertyPrice ||
    formData.propertyId ||
    formData.timeline ||
    formData.budget
  ) {
    return 'BUYER';
  }

  // Check for agent-specific fields
  if (
    formData.brokerageName ||
    formData.yearsExperience ||
    formData.currentLeadSource ||
    formData.monthlyLeadBudget ||
    formData.selectedPlan
  ) {
    return 'AGENT';
  }

  // Default to agent lead if unclear
  return 'AGENT';
}

/**
 * Create contact in GoHighLevel
 */
async function createContact(contactData: ContactData) {
  const locationId = ENV.gohighlevelLocationId;

  if (!GHL_API_TOKEN || !locationId) {
    throw new Error('GoHighLevel credentials not configured');
  }

  try {
    const response = await axios.post(
      `${GHL_API_BASE}/contacts/`,
      {
        locationId,
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        email: contactData.email,
        phone: contactData.phone,
        tags: contactData.tags,
        customFields: contactData.customFields,
        source: contactData.source,
      },
      {
        headers: {
          Authorization: `Bearer ${GHL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Contact created:', response.data.contact.id);
    return response.data.contact;
  } catch (error: any) {
    console.error('❌ GoHighLevel API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });
    
    // If contact exists, get their ID
    if (error.response?.status === 422) {
      console.log('⚠️  Contact already exists, searching...');

      const searchResponse = await axios.get(
        `${GHL_API_BASE}/contacts/search/duplicate`,
        {
          params: {
            locationId,
            email: contactData.email,
          },
          headers: {
            Authorization: `Bearer ${GHL_API_TOKEN}`,
          },
        }
      );

      return searchResponse.data.contact;
    }

    throw error;
  }
}

/**
 * Add contact to opportunity pipeline
 */
async function addToPipeline(
  contactId: string,
  pipelineId: string,
  stageId: string,
  monetaryValue: number,
  leadType: LeadType
) {
  const locationId = ENV.gohighlevelLocationId;

  const opportunityName = leadType === 'BUYER' ? 'Home Buyer Lead' : 'Agent Client Lead';

  const response = await axios.post(
    `${GHL_API_BASE}/opportunities/`,
    {
      locationId,
      pipelineId,
      pipelineStageId: stageId,
      contactId,
      name: opportunityName,
      status: 'open',
      monetaryValue,
    },
    {
      headers: {
        Authorization: `Bearer ${GHL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );

  console.log('✅ Added to pipeline:', pipelineId);
  return response.data;
}

/**
 * Handle AGENT lead submission
 */
async function handleAgentLead(formData: FormData) {
  console.log('👔 Processing AGENT LEAD...');

  const contactData: ContactData = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    tags: ['agent-prospect', 'website-lead', formData.source || 'website'],
    customFields: {
      brokerage: formData.brokerageName || '',
      years_experience: formData.yearsExperience || '',
      current_lead_source: formData.currentLeadSource || '',
      monthly_lead_budget: formData.monthlyLeadBudget || '',
      interested_in: formData.interestedPackage || formData.selectedPlan || 'Starter',
      message: formData.message || '',
    },
    source: formData.source || 'businessconector.com',
  };

  // Create contact
  const contact = await createContact(contactData);

  // Determine monetary value based on plan
  let monetaryValue = 397; // Default starter
  if (formData.selectedPlan === 'content' || formData.interestedPackage === 'Premium') {
    monetaryValue = 891;
  } else if (formData.selectedPlan === 'nurture' || formData.interestedPackage === 'Professional') {
    monetaryValue = 597;
  }

  // Add to AGENT pipeline
  await addToPipeline(contact.id, AGENT_PIPELINE_ID, AGENT_STAGE_ID, monetaryValue, 'AGENT');

  return {
    success: true,
    contactId: contact.id,
    leadType: 'AGENT',
    pipeline: 'Business Conector - Lead to Customer',
    message: 'Agent lead processed successfully',
  };
}

/**
 * Handle MORTGAGE lead submission
 */
async function handleMortgageLead(formData: FormData) {
  console.log('💰 Processing MORTGAGE LEAD...');

  const contactData: ContactData = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    tags: ['mortgage-lead', 'pre-approval-request', 'high-intent-buyer'],
    customFields: {
      home_price: formData.homePrice || '',
      down_payment: formData.downPayment || '',
      interest_rate: formData.interestRate || '',
      loan_term: formData.loanTerm || '',
      monthly_payment: formData.monthlyPayment || '',
      lead_source: 'Mortgage Calculator',
      website_url: formData.source || 'centralfloridahomes.com',
    },
    source: 'Mortgage Calculator - Property Website',
  };

  // Create contact
  const contact = await createContact(contactData);

  // If buyer pipeline is configured, add to it
  if (BUYER_PIPELINE_ID && BUYER_STAGE_ID) {
    await addToPipeline(
      contact.id,
      BUYER_PIPELINE_ID,
      BUYER_STAGE_ID,
      0,
      'BUYER'
    );
  }

  return {
    success: true,
    contactId: contact.id,
    leadType: 'MORTGAGE',
    pipeline: BUYER_PIPELINE_ID ? 'Buyer Leads - Property to Sale' : 'Contact Created',
    message: 'Mortgage lead processed successfully',
  };
}

/**
 * Handle BUYER lead submission
 */
async function handleBuyerLead(formData: FormData) {
  console.log('🏠 Processing BUYER LEAD...');

  if (!BUYER_PIPELINE_ID || !BUYER_STAGE_ID) {
    console.warn('⚠️  Buyer pipeline not configured yet. Creating contact without pipeline assignment.');
    
    // Still create the contact with buyer tags
    const contactData: ContactData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      tags: ['buyer-lead', 'property-interest', formData.city || 'florida'],
      customFields: {
        property_address: formData.propertyAddress || '',
        property_price: formData.propertyPrice || '',
        property_id: formData.propertyId || '',
        budget: formData.budget || '',
        timeline: formData.timeline || '',
        preapproved: formData.preapproved || '',
        property_beds: formData.propertyBeds || '',
        property_baths: formData.propertyBaths || '',
        property_sqft: formData.propertySqft || '',
        city: formData.city || '',
        website_url: formData.source || '',
      },
      source: formData.source || 'Property Website',
    };

    const contact = await createContact(contactData);

    return {
      success: true,
      contactId: contact.id,
      leadType: 'BUYER',
      pipeline: 'Contact Created (Pipeline Pending Setup)',
      message: 'Buyer lead contact created. Pipeline setup required.',
    };
  }

  const contactData: ContactData = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    tags: ['buyer-lead', 'property-interest', formData.city || 'florida'],
    customFields: {
      property_address: formData.propertyAddress || '',
      property_price: formData.propertyPrice || '',
      property_id: formData.propertyId || '',
      budget: formData.budget || '',
      timeline: formData.timeline || '',
      preapproved: formData.preapproved || '',
      property_beds: formData.propertyBeds || '',
      property_baths: formData.propertyBaths || '',
      property_sqft: formData.propertySqft || '',
      city: formData.city || '',
      website_url: formData.source || '',
    },
    source: formData.source || 'Property Website',
  };

  // Create contact
  const contact = await createContact(contactData);

  // Add to BUYER pipeline (no monetary value for leads)
  await addToPipeline(
    contact.id,
    BUYER_PIPELINE_ID,
    BUYER_STAGE_ID,
    0, // Buyers aren't opportunities for us, they're our product
    'BUYER'
  );

  return {
    success: true,
    contactId: contact.id,
    leadType: 'BUYER',
    pipeline: 'Buyer Leads - Property to Sale',
    message: 'Buyer lead processed successfully',
  };
}

/**
 * Send lead to Pipedream webhook for GoHighLevel integration
 */
async function sendToPipedreamWebhook(formData: FormData, leadType: LeadType) {
  const WEBHOOK_URL = 'https://eomhc.m.pipedream.net';
  const WEBHOOK_ID = 'pit-b0a41b0b-24e5-4cee-8126-ee7b80b4c89e';
  
  try {
    const payload = {
      webhook_id: WEBHOOK_ID,
      lead_type: leadType,
      timestamp: new Date().toISOString(),
      source: formData.source || 'website',
      contact: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || '',
      },
      // Agent-specific fields
      ...(formData.brokerageName && { brokerage: formData.brokerageName }),
      ...(formData.yearsExperience && { yearsExperience: formData.yearsExperience }),
      ...(formData.selectedPlan && { plan: formData.selectedPlan }),
      // Buyer-specific fields
      ...(formData.propertyAddress && { propertyAddress: formData.propertyAddress }),
      ...(formData.propertyPrice && { propertyPrice: formData.propertyPrice }),
      ...(formData.budget && { budget: formData.budget }),
      ...(formData.timeline && { timeline: formData.timeline }),
      // Mortgage-specific fields
      ...(formData.homePrice && { homePrice: formData.homePrice }),
      ...(formData.downPayment && { downPayment: formData.downPayment }),
      ...(formData.interestRate && { interestRate: formData.interestRate }),
      ...(formData.loanTerm && { loanTerm: formData.loanTerm }),
      ...(formData.monthlyPayment && { monthlyPayment: formData.monthlyPayment }),
    };
    
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    
    console.log('✅ Lead sent to Pipedream webhook:', response.status);
    return true;
  } catch (error: any) {
    console.error('⚠️  Failed to send to Pipedream webhook:', error.message);
    // Don't throw - webhook failure shouldn't block lead capture
    return false;
  }
}

/**
 * Main handler function for smart form routing
 */
export async function handleFormSubmission(formData: FormData) {
  try {
    // Determine lead type
    const leadType = determineLeadType(formData);
    console.log(`\n📋 Lead Type Detected: ${leadType}\n`);

    // Route to appropriate handler
    if (leadType === 'BUYER') {
      return await handleBuyerLead(formData);
    } else {
      return await handleAgentLead(formData);
    }
  } catch (error: any) {
    console.error('❌ Form submission error:', error);
    console.error('⚠️  GoHighLevel API failed, storing lead in database as fallback...');
    
    // Fallback: Save to database
    try {
      const { getDb } = await import('./db');
      const { leads } = await import('../drizzle/schema-revenue');
      const db = await getDb();
      
      if (!db) {
        throw new Error('Database not available');
      }
      
      const leadType = determineLeadType(formData);
      const source = formData.source || 'website';
      
      // Determine lead type for database
      let dbLeadType: 'buyer' | 'seller' | 'mortgage' = 'buyer';
      if (source.includes('mortgage') || formData.homePrice) {
        dbLeadType = 'mortgage';
      } else if (source.includes('seller') || source.includes('sell')) {
        dbLeadType = 'seller';
      }
      
      // Insert into database - build values object to avoid undefined fields
      const leadValues: any = {
        leadType: dbLeadType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        status: 'new',
        source: source,
        qualityScore: 'warm',
      };
      
      // Only add optional fields if they have values
      if (formData.phone) leadValues.phone = formData.phone;
      if (formData.city) leadValues.city = formData.city;
      if (formData.zipCode) leadValues.zipCode = formData.zipCode;
      if (formData.homePrice) leadValues.homePrice = parseFloat(formData.homePrice);
      if (formData.downPayment) leadValues.downPayment = parseFloat(formData.downPayment);
      if (formData.interestRate) leadValues.interestRate = parseFloat(formData.interestRate);
      if (formData.loanTerm) leadValues.loanTerm = parseInt(formData.loanTerm);
      if (formData.monthlyPayment) leadValues.monthlyPayment = parseFloat(formData.monthlyPayment);
      
      // Note: createdAt and updatedAt have database defaults, don't include them
      await db.insert(leads).values([leadValues]);
      
      console.log('✅ Lead saved to database as fallback');
      
      // Send to Pipedream webhook for GoHighLevel integration
      const webhookSent = await sendToPipedreamWebhook(formData, leadType);
      
      return {
        success: true,
        contactId: `LOCAL-${Date.now()}`,
        leadType,
        pipeline: webhookSent ? 'Pipedream → GoHighLevel' : 'Database (Webhook Pending)',
        message: webhookSent 
          ? 'Lead captured and sent to GoHighLevel via Pipedream webhook.'
          : 'Lead captured and stored locally. Will sync to GoHighLevel when webhook is available.',
        fallback: true,
        webhookSent
      };
    } catch (fallbackError: any) {
      console.error('❌ Fallback storage also failed:', fallbackError);
      throw new Error('Failed to submit form. Please try again later.');
    }
  }
}
