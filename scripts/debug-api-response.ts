import { searchRealtyInUS } from '../server/realty-in-us-api';

async function debugAPIResponse() {
  console.log('🔍 Debugging Realty in US API Response Structure\n');

  try {
    const properties = await searchRealtyInUS({
      postal_code: '33602',
      limit: 1,
      offset: 0,
    });

    if (properties.length > 0) {
      const property = properties[0];
      
      console.log('Full Property Object:');
      console.log(JSON.stringify(property, null, 2));
      
      console.log('\n\n=== Key Fields ===');
      console.log('property_id:', property.property_id);
      console.log('list_price:', property.list_price);
      console.log('photo_count:', property.photo_count);
      console.log('\nphotos array:', property.photos);
      console.log('\nprimary_photo:', property.primary_photo);
      console.log('\nvirtual_tours:', property.virtual_tours);
      
      // Test mapping
      const { mapRealtyInUSPropertyToDb } = await import('../server/realty-in-us-api');
      const mapped = mapRealtyInUSPropertyToDb({
        ...property,
        _location: { city: 'Tampa', zip: '33602' },
      });
      
      console.log('\n\n=== Mapped Property ===');
      console.log('MLS ID:', mapped.mlsId);
      console.log('Address:', mapped.address);
      console.log('Images:', mapped.images);
      console.log('Image count:', mapped.images.length);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

debugAPIResponse();
