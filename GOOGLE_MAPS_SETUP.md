# Google Maps API Setup Instructions

## 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "ShopLyft Maps"
4. Click "Create"

## 2. Enable Required APIs

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for and enable these APIs:
   - **Maps JavaScript API**
     AIzaSyBkt9yZeqSBb7N_R6zUefQAxwOHr4UJd80
   - **Maps Embed API**
   - **Directions API**
   - **Geocoding API**

## 3. Create API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key
4. Click "Restrict Key" to secure it

## 4. Restrict API Key (Recommended)

1. In the API key settings, under "Application restrictions":

   - Select "HTTP referrers (web sites)"
   - Add your domain: `localhost:5173/*` (for development)
   - Add your production domain: `yourdomain.com/*`

2. Under "API restrictions":
   - Select "Restrict key"
   - Choose only the APIs you enabled above

## 5. Update Your Application

Replace the placeholder API key in `PlanLayout.tsx`:

```typescript
// Replace this line:
src={`https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOWWgU6x8Q8Q8Q&origin=...`}

// With your actual API key:
src={`https://www.google.com/maps/embed/v1/directions?key=YOUR_ACTUAL_API_KEY&origin=...`}
```

## 6. Environment Variables (Recommended)

For better security, use environment variables:

1. Create a `.env` file in your frontend directory:

```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

2. Update the iframe src to use the environment variable:

```typescript
src={`https://www.google.com/maps/embed/v1/directions?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&origin=...`}
```

## 7. Billing Setup

⚠️ **Important**: Google Maps APIs require billing to be enabled:

1. Go to "Billing" in Google Cloud Console
2. Link a billing account to your project
3. Google provides $200 free credit per month for Maps usage

## 8. Testing

1. Start your development server: `npm run dev`
2. Navigate to the route plan page
3. Verify the map loads correctly with your route

## 9. Production Deployment

1. Add your production domain to API key restrictions
2. Update environment variables in your hosting platform
3. Test the map functionality in production

## Troubleshooting

- **"API key is invalid"**: Check that the API key is correct and APIs are enabled
- **"This API project is not authorized"**: Ensure billing is enabled
- **"RefererNotAllowedMapError"**: Add your domain to the API key restrictions
- **Map not loading**: Check browser console for specific error messages

## Cost Considerations

- Maps Embed API: Free for most use cases
- Directions API: $5 per 1,000 requests
- Geocoding API: $5 per 1,000 requests
- Monitor usage in Google Cloud Console → APIs & Services → Quotas
