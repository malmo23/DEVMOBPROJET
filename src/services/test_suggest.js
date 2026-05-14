
async function testSuggestion(query) {
  const suggestUrl = `https://world.openfoodfacts.org/cgi/suggest.pl?tagtype=brands&term=${encodeURIComponent(query)}`;
  console.log('Testing Suggestion URL:', suggestUrl);
  try {
    const response = await fetch(suggestUrl, {
      headers: {
        'User-Agent': 'FoodRisk-App - Android - Version 1.0'
      }
    });
    const data = await response.json();
    console.log('Suggestions:', data);
  } catch (e) {
    console.error('Error:', e);
  }
}

testSuggestion('prince');
testSuggestion('princee');
