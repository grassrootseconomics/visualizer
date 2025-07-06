# Vercel KV Cache Setup

This project has been updated to use Vercel KV for caching graph data instead of generating it on every build.

## Setup

### 1. Install Dependencies

```bash
npm install @vercel/kv
```

### 2. Set up Vercel KV

1. Go to your Vercel project dashboard
2. Navigate to the "Storage" tab
3. Create a new KV database
4. Copy the environment variables to your `.env.local` file:
   ```
   KV_REST_API_URL=your_kv_url
   KV_REST_API_TOKEN=your_kv_token
   ```

### 3. Environment Variables (Optional)

For additional security, you can set up a cron secret:

```
CRON_SECRET=your_secret_key
```

## How It Works

### 1. Automatic Updates

- The cron job runs every 6 hours (`0 */6 * * *`)
- It fetches fresh data from the databases
- Stores the processed graph data in Vercel KV

### 2. Data Serving

- The main page fetches data from `/api/graph-data`
- Data is served from KV cache (fast)
- Includes browser caching headers
- Automatic refresh every 5 minutes client-side

### 3. Manual Updates

- Visit `/api/update-cache` to manually trigger a cache update
- Useful for testing and initial setup

## API Routes

- `POST /api/cron` - Cron job endpoint (called automatically)
- `GET /api/graph-data` - Serves cached data to the frontend
- `GET /api/update-cache` - Manual cache update trigger

## Benefits

1. **Faster Loading**: No database queries during page load
2. **Reduced Database Load**: Queries run only every 6 hours
3. **Better UX**: Loading states and error handling
4. **Scalability**: Can handle more concurrent users
5. **Cost Efficiency**: Fewer database connections

## Monitoring

Check the Vercel function logs to monitor:

- Cron job execution
- Cache update success/failures
- Data freshness

## Troubleshooting

If you see "No data available":

1. Check that the databases are accessible
2. Manually trigger cache update via `/api/update-cache`
3. Check Vercel function logs for errors
4. Verify KV environment variables are set correctly
