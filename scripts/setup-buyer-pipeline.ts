/**
 * GoHighLevel Buyer Pipeline Setup Script
 * 
 * This script creates the "Buyer Leads - Property to Sale" pipeline
 * in your GoHighLevel account.
 * 
 * Run this once to set up the buyer pipeline, then update your
 * environment variables with the returned IDs.
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const GHL_API_KEY = process.env.GOHIGHLEVEL_API_KEY;
const GHL_LOCATION_ID = process.env.GOHIGHLEVEL_LOCATION_ID;
const GHL_API_BASE = 'https://services.leadconnectorhq.com';

interface PipelineStage {
  name: string;
  id: string;
  order: number;
}

interface PipelineResult {
  pipelineId: string;
  pipelineStageId: string;
  stages: PipelineStage[];
}

async function createBuyerPipeline(): Promise<PipelineResult> {
  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    throw new Error(
      'Missing GoHighLevel credentials. Please set GOHIGHLEVEL_API_KEY and GOHIGHLEVEL_LOCATION_ID environment variables.'
    );
  }

  console.log('🏗️  Creating Buyer Lead Pipeline in GoHighLevel...\n');

  const pipelineData = {
    locationId: GHL_LOCATION_ID,
    name: 'Buyer Leads - Property to Sale',
    stages: [
      { name: 'New Property Inquiry', order: 1 },
      { name: 'Qualified Buyer', order: 2 },
      { name: 'Assigned to Agent', order: 3 },
      { name: 'In Showing/Negotiation', order: 4 },
      { name: 'Under Contract', order: 5 },
      { name: 'Closed - Won', order: 6 },
      { name: 'Closed - Lost', order: 7 },
    ],
  };

  try {
    const response = await axios.post(
      `${GHL_API_BASE}/opportunities/pipelines`,
      pipelineData,
      {
        headers: {
          Authorization: `Bearer ${GHL_API_KEY}`,
          Version: '2021-07-28',
          'Content-Type': 'application/json',
        },
      }
    );

    const pipeline = response.data.pipeline;
    const firstStage = pipeline.stages[0];

    console.log('✅ Buyer Pipeline Created Successfully!\n');
    console.log('📋 SAVE THESE IDs:\n');
    console.log(`Pipeline Name: ${pipeline.name}`);
    console.log(`Pipeline ID: ${pipeline.id}`);
    console.log(`First Stage ID: ${firstStage.id}\n`);
    console.log('📊 Stages Created:\n');

    pipeline.stages.forEach((stage: any, index: number) => {
      console.log(`${index + 1}. ${stage.name}`);
      console.log(`   ID: ${stage.id}\n`);
    });

    // Save to file for reference
    const outputData = {
      pipeline: {
        name: pipeline.name,
        id: pipeline.id,
        locationId: GHL_LOCATION_ID,
      },
      stages: pipeline.stages.map((stage: any) => ({
        name: stage.name,
        id: stage.id,
        order: stage.order,
      })),
    };

    const outputPath = path.join(process.cwd(), 'buyer-pipeline-ids.json');
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

    console.log(`💾 IDs saved to: ${outputPath}\n`);
    console.log('=' .repeat(60));
    console.log('🎯 NEXT STEPS:');
    console.log('=' .repeat(60));
    console.log('\n1. Add these environment variables to your .env file:\n');
    console.log(`   BUYER_PIPELINE_ID="${pipeline.id}"`);
    console.log(`   BUYER_STAGE_ID="${firstStage.id}"\n`);
    console.log('2. Restart your development server');
    console.log('3. Test buyer lead submission\n');

    return {
      pipelineId: pipeline.id,
      pipelineStageId: firstStage.id,
      stages: pipeline.stages,
    };
  } catch (error: any) {
    console.error('❌ Error creating pipeline:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.log('\n⚠️  Authentication failed. Check your API key.');
    } else if (error.response?.status === 422) {
      console.log('\n⚠️  Pipeline might already exist. Check GoHighLevel dashboard.');
    }

    throw error;
  }
}

// Run the script
createBuyerPipeline()
  .then(() => {
    console.log('✅ Setup complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  });
