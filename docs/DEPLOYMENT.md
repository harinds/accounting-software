# Deployment Guide

This guide covers deploying the accounting software to various platforms.

## Prerequisites

- Supabase account with a project created
- API keys for Monoova, Basiq, and LodgeIT
- Domain name (for production)

## Environment Setup

### 1. Supabase Configuration

1. Create a new Supabase project at https://supabase.com
2. Run the database migrations:
   ```bash
   # Using Supabase CLI
   supabase db push

   # Or manually via Supabase dashboard SQL editor
   # Copy and execute: database/migrations/001_initial_schema.sql
   ```

3. Get your Supabase credentials:
   - Project URL
   - Anon (public) key
   - Service role key

### 2. External Service Configuration

**Monoova:**
- Sign up at https://monoova.com
- Get API key from dashboard
- Configure webhook endpoint: `https://your-domain.com/api/webhooks/monoova`

**Basiq:**
- Sign up at https://basiq.io
- Get API key
- Configure consent redirect URLs

**LodgeIT:**
- Sign up at https://lodgeit.net.au
- Get API credentials
- Configure webhook endpoint: `https://your-domain.com/api/webhooks/lodgeit`

## Deployment Options

### Option 1: Docker Compose (Recommended for Self-Hosting)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourorg/accounting-software.git
   cd accounting-software
   ```

2. Create `.env` file in root:
   ```env
   # Copy from .env.example and fill in values
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_ANON_KEY=xxx
   SUPABASE_SERVICE_KEY=xxx
   MONOOVA_API_KEY=xxx
   BASIQ_API_KEY=xxx
   LODGEIT_API_KEY=xxx
   JWT_SECRET=xxx
   ```

3. Deploy:
   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```

4. Access the application:
   - Frontend: http://localhost
   - Backend: http://localhost:3001

### Option 2: Railway (Backend)

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and initialize:
   ```bash
   railway login
   cd backend
   railway init
   ```

3. Add environment variables:
   ```bash
   railway variables set SUPABASE_URL=xxx
   railway variables set SUPABASE_ANON_KEY=xxx
   # ... add all other variables
   ```

4. Deploy:
   ```bash
   railway up
   ```

### Option 3: Render (Backend)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
   - Environment: Add all environment variables

4. Deploy automatically on git push

### Option 4: Vercel (Frontend)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd frontend
   vercel
   ```

3. Add environment variables in Vercel dashboard:
   - `VITE_API_URL`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Option 5: AWS (Production)

#### Backend (ECS + Fargate)

1. Build and push Docker image:
   ```bash
   aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin xxx.dkr.ecr.ap-southeast-2.amazonaws.com
   docker build -t accounting-backend ./backend
   docker tag accounting-backend:latest xxx.dkr.ecr.ap-southeast-2.amazonaws.com/accounting-backend:latest
   docker push xxx.dkr.ecr.ap-southeast-2.amazonaws.com/accounting-backend:latest
   ```

2. Create ECS task definition:
   ```json
   {
     "family": "accounting-backend",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "containerDefinitions": [
       {
         "name": "backend",
         "image": "xxx.dkr.ecr.ap-southeast-2.amazonaws.com/accounting-backend:latest",
         "portMappings": [
           {
             "containerPort": 3001,
             "protocol": "tcp"
           }
         ],
         "environment": [
           // Add all environment variables
         ]
       }
     ]
   }
   ```

3. Create ECS service with Application Load Balancer

#### Frontend (S3 + CloudFront)

1. Build frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Upload to S3:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. Create CloudFront distribution pointing to S3 bucket

4. Configure custom domain with Route 53

## Post-Deployment

### 1. Database Seeding

Create default chart of accounts for test organization:
```bash
# Replace {{organization_id}} in database/seeds/chart_of_accounts.sql
# Then run:
psql $SUPABASE_URL -f database/seeds/chart_of_accounts.sql
```

### 2. SSL/TLS Certificates

For production, ensure HTTPS is enabled:
- Railway/Render: Automatic
- Vercel: Automatic
- AWS: Use ACM (AWS Certificate Manager)
- Self-hosted: Use Let's Encrypt with Certbot

### 3. Monitoring Setup

1. **Application Monitoring:**
   - Set up Sentry for error tracking
   - Configure Datadog/New Relic for APM

2. **Uptime Monitoring:**
   - UptimeRobot or Pingdom
   - Configure alerts

3. **Log Aggregation:**
   - LogTail, Papertrail, or CloudWatch Logs

### 4. Backup Strategy

1. **Database:**
   - Supabase: Automatic daily backups
   - Configure point-in-time recovery

2. **Application Data:**
   - Regular exports of transactions
   - Document storage backups

### 5. Security Checklist

- [ ] HTTPS enabled on all endpoints
- [ ] Environment variables secured
- [ ] API rate limiting configured
- [ ] CORS properly configured
- [ ] Webhook signature verification enabled
- [ ] Database RLS policies tested
- [ ] Regular security audits scheduled

## Scaling Considerations

### Horizontal Scaling

**Backend:**
- Add more ECS tasks or Railway instances
- Use Redis for session management
- Implement job queues for heavy operations

**Frontend:**
- Cached by CDN (CloudFront/Vercel Edge)
- No scaling needed

### Database Optimization

- Enable connection pooling
- Add read replicas for reporting
- Implement caching for frequent queries

## Troubleshooting

### Common Issues

1. **Database connection errors:**
   - Check Supabase service key
   - Verify IP allowlist in Supabase dashboard

2. **CORS errors:**
   - Update backend CORS configuration
   - Add frontend URL to allowed origins

3. **Webhook failures:**
   - Verify webhook signatures
   - Check endpoint accessibility
   - Review webhook logs

### Health Checks

Backend health endpoint: `GET /health`

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345.67
}
```

## Rollback Procedure

### Docker Compose
```bash
docker-compose down
git checkout previous-commit
./scripts/deploy.sh
```

### Railway/Render
Use the dashboard to redeploy previous version

### AWS
Update ECS service to use previous task definition revision

## Support

For deployment issues:
- GitHub Issues: https://github.com/yourorg/accounting-software/issues
- Documentation: https://docs.yourapp.com
- Email: support@yourapp.com
