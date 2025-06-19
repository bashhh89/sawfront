# SOW Generator - EasyPanel Configuration

## Application Details
- **Name**: SOW Generator
- **Type**: Static Web Application
- **Framework**: Vanilla HTML/CSS/JavaScript
- **Port**: 80

## EasyPanel Setup Instructions

### 1. Create New Service
1. Go to your EasyPanel dashboard
2. Click "Create Service"
3. Select "From GitHub Repository"
4. Enter repository URL: `https://github.com/bashhh89/sawfront`

### 2. Configure Build Settings
- **Build Command**: `echo "No build required - static files"`
- **Start Command**: `nginx -g "daemon off;"`
- **Port**: `80`
- **Health Check**: `/sow-generator-new.html`

### 3. Environment Variables (Optional)
```
NODE_ENV=production
```

### 4. Domain Configuration
- Set your custom domain in EasyPanel
- SSL will be automatically configured

### 5. Resource Requirements
- **CPU**: 0.1 cores
- **Memory**: 128MB
- **Storage**: 100MB

## File Structure
```
├── sow-generator-new.html     # Main application
├── Logo Dark-Green.png        # Company logo
├── Copy of Pattern 8.jpg      # Background pattern
├── SocialGarden.svg          # SVG logo
├── Dockerfile                # Container configuration
├── nginx.conf               # Nginx server configuration
├── docker-compose.yml       # Docker compose setup
└── README.md               # This file
```

## Features
- ✅ Advanced PDF Generation with jsPDF
- ✅ Excel/CSV Export
- ✅ AI-Powered SOW Generation
- ✅ Share SOW with Unique Links
- ✅ Integrated Chat Widget
- ✅ Professional Branding
- ✅ Mobile Responsive Design

## API Dependencies
- AnythingLLM API for AI chat functionality
- jsPDF for PDF generation
- Tailwind CSS for styling

## Production Notes
- All static files are served via nginx
- Gzip compression enabled
- Security headers configured
- Cache optimization for static assets
- SSL/TLS ready for HTTPS

## Support
For issues or questions, contact: Social Garden Team
