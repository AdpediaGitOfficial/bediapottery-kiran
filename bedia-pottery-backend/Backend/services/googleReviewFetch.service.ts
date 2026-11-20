import axios from 'axios';

export const fetchGoogleReviewsFromAPI = async () => {
  const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
    params: {
      place_id: process.env.GOOGLE_PLACE_ID,
      fields: 'reviews',
      key: process.env.GOOGLE_PLACES_API_KEY,
    },
  });

  return response.data?.result?.reviews || [];
};
