# Email Configuration & Troubleshooting Guide

## Overview

The Eventful platform uses Nodemailer to send transactional emails including:
- Password reset links
- Ticket confirmations
- Event reminders
- Payment confirmations

## Configuration

### Environment Variables Required

```bash
EMAIL_HOST=smtp.gmail.com          # SMTP server (default: Gmail)
EMAIL_PORT=587                      # SMTP port (default: 587 for TLS, 465 for SSL)
EMAIL_USER=your-email@gmail.com     # Email address that sends emails
EMAIL_PASSWORD=your-app-password    # App-specific password (NOT your account password)
FRONTEND_URL=http://localhost:3000  # For password reset links
```

### Gmail Setup (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Google Account
   - Go to: https://myaccount.google.com/security
   - Find "2-Step Verification" and enable it

2. **Create App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (custom name)"
   - Generate app password (16-character string)
   - Copy and use as `EMAIL_PASSWORD` in .env

3. **.env Configuration**
   ```bash
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop  # Copy exactly (with spaces or not)
   ```

### Alternative SMTP Providers

**SendGrid:**
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxx
```

**Mailgun:**
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@mg.yourdomain.com
EMAIL_PASSWORD=your-mailgun-password
```

**Render (for API deployed on Render):**
- Use managed email add-on or configure external SMTP
- Ensure EMAIL_PASSWORD has NO extra whitespace

## Deployment Considerations

### Production Checklist

- [ ] Email credentials added as environment variables in deployment platform
- [ ] `FRONTEND_URL` points to production domain (for password reset links)
- [ ] Test password reset flow end-to-end in staging
- [ ] Monitor email delivery logs via `/api/auth/health`
- [ ] Set up email delivery alerts if provider supports

### Known Issues & Solutions

#### Issue 1: "Email sending failed" locally (takes too long)
**Symptoms:** Forgot password endpoint delays 10+ seconds

**Solution:** This is now non-blocking! The endpoint returns immediately, email sends in background.
- Check logs: `npm run dev` will show "Email sent" or errors in console
- Verify SMTP can connect: Use health check `/api/auth/health`

#### Issue 2: Emails don't send in production
**Symptoms:** Endpoint succeeds but user never receives email

**Solutions:**
1. Check environment variables are set (not empty strings)
   - SSH into Render dashboard or check deployment logs
   - Verify `EMAIL_USER` and `EMAIL_PASSWORD` are exactly correct

2. Verify SMTP credentials work
   - Use health check: `GET /api/auth/health` 
   - Check backend logs for SMTP error messages

3. Check email provider blocking
   - Gmail: Verify app password is correct (not account password)
   - Less secure apps must be enabled OR use app password
   - SendGrid/Mailgun: Check bounce/suppression lists

4. Verify FRONTEND_URL is correct
   - Password reset links won't work if `FRONTEND_URL` is wrong
   - Example: `https://eventful-frontend.onrender.com`

#### Issue 3: Gateway Timeout (SMTP hangs)
**Symptoms:** Request times out after 30 seconds

**Causes:** 
- SMTP server unreachable (firewall, wrong port)
- Network latency to email provider

**Solution (now implemented):**
- System tries primary SMTP (port 587) then fallback (port 465)
- Reduced timeouts: connection 10s, socket 15s
- Connection pooling for efficiency
- Check health endpoint for diagnostics: `/api/auth/health`

## Diagnostic Endpoints

### Health Check Endpoint
```bash
GET /api/auth/health
```

**Response (Healthy):**
```json
{
  "success": true,
  "status": "healthy",
  "emailConfig": {
    "emailUserSet": true,
    "emailPasswordSet": true,
    "emailHost": "smtp.gmail.com",
    "smtpPort": 587
  }
}
```

**Response (Misconfigured):**
```bash
HTTP 400
{
  "success": false,
  "status": "misconfigured",
  "configErrors": [
    "EMAIL_USER is not set",
    "EMAIL_PASSWORD is not set"
  ]
}
```

### Startup Validation
When the server starts, it logs email configuration status:
```
✓ Email service configuration validated
```
or
```
⚠️  Email service is not properly configured:
    - EMAIL_USER is not set
    - EMAIL_PASSWORD is not set
```

## Monitoring & Debugging

### Local Testing
1. Start server: `npm run dev`
2. Watch for email logs in console
3. Request password reset: `POST /api/auth/forgot-password`
4. Check console for:
   - "Email sent successfully" → Success
   - "Email send attempt 1/2 failed" → Primary SMTP failed, trying fallback
   - "Email sending failed after all SMTP attempts" → Both SMTP failed

### Production Logs
- Check deployment platform logs (Render, Vercel, etc.)
- Search for "Email" or "SMTP" in logs
- Use `/api/auth/health` to diagnose

### Email Service Methods (for debugging)
```typescript
// In backend code or via API:
import { EmailService } from './services/email.service';

// Check configuration
const config = EmailService.validateConfig();
console.log(config); // { valid: true/false, errors: [...] }

// Test SMTP connection
const canConnect = await EmailService.testConnection();
console.log(canConnect); // true/false
```

## Performance Optimization

### Connection Pooling (Implemented)
- Reuses SMTP connections across multiple emails
- Maximum 5 concurrent connections
- Reduces latency for bulk email operations

### Non-Blocking Email Send (Implemented)
- Password reset no longer waits for email to complete
- Endpoint returns immediately (200 OK)
- Email sends in background
- Automatic token rollback if send fails

### Timeout Tuning (Implemented)
- Connected timeout: 10 seconds
- Socket timeout: 15 seconds  
- Greeting timeout: 5 seconds
- Rate limited: 5 messages per 250ms

## Testing

### Manual Test (Password Reset Flow)
1. Call: `POST /api/auth/forgot-password`
   ```json
   { "email": "test@example.com" }
   ```
2. Response should be immediate (< 1 second)
3. Check logs for email sent status
4. Check user's inbox (may take 5-30 seconds to arrive)

### Automated Test
```bash
npm run test
# Tests include email service mocking and error cases
```

## Support

For email issues, check:
1. Environment variables are set correctly
2. `/api/auth/health` endpoint returns healthy status
3. SMTP credentials are valid (test with external SMTP client)
4. Email provider isn't blocking your domain
5. Check network connectivity to SMTP server

## References

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid SMTP Settings](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
- [Mailgun SMTP](https://documentation.mailgun.com/docs/mailgun/user-manual/sending-messages/smtp-api/)
