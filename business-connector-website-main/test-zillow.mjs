const RAPIDAPI_HOST = "zillow-com1.p.rapidapi.com";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

if (!RAPIDAPI_KEY) {
  console.error("❌ RAPIDAPI_KEY not set");
  process.exit(1);
}

console.log("🔍 Testing Zillow API...");
console.log(`API Key: ${RAPIDAPI_KEY.substring(0, 10)}...`);

async function testSearch() {
  try {
    const url = new URL("https://zillow-com1.p.rapidapi.com/propertyExtendedSearch");
    url.searchParams.append("location", "Tampa, FL");
    url.searchParams.append("page", "1");

    console.log(`\n📡 Fetching from: ${url.toString()}`);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-RapidAPI-Host": RAPIDAPI_HOST,
        "X-RapidAPI-Key": RAPIDAPI_KEY,
      },
    });

    console.log(`📊 Response Status: ${response.status}`);

    if (!response.ok) {
      const text = await response.text();
      console.error(`❌ Error: ${response.statusText}`);
      console.error(`Response: ${text.substring(0, 500)}`);
      return;
    }

    const data = await response.json();
    console.log(`✅ Success! Found ${data.props?.length || 0} properties`);

    if (data.props && data.props.length > 0) {
      const prop = data.props[0];
      console.log(`\n📍 Sample Property:`);
      console.log(`  Address: ${prop.address}`);
      console.log(`  City: ${prop.city}`);
      console.log(`  Price: $${prop.price}`);
      console.log(`  Beds: ${prop.beds}, Baths: ${prop.baths}`);
      console.log(`  ZPID: ${prop.zpid}`);
      console.log(`  Has Image: ${!!prop.imgSrc}`);

      // Test getting images for this property
      console.log(`\n🖼️  Fetching images for ZPID ${prop.zpid}...`);
      const imgUrl = new URL("https://zillow-com1.p.rapidapi.com/images");
      imgUrl.searchParams.append("zpid", prop.zpid.toString());

      const imgResponse = await fetch(imgUrl.toString(), {
        method: "GET",
        headers: {
          "X-RapidAPI-Host": RAPIDAPI_HOST,
          "X-RapidAPI-Key": RAPIDAPI_KEY,
        },
      });

      if (imgResponse.ok) {
        const imgData = await imgResponse.json();
        console.log(`✅ Got ${imgData.images?.length || 0} images`);
        if (imgData.images && imgData.images.length > 0) {
          console.log(`  First image: ${imgData.images[0].substring(0, 80)}...`);
        }
      } else {
        console.log(`⚠️  Could not fetch images: ${imgResponse.status}`);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testSearch();
