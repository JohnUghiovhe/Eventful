# Security Guidelines

This document outlines security best practices for developing, deploying, and using Eventful.

## Environment Variables

### Never Commit Secrets
- ✅ Always use environment variables for sensitive data
- ✅ Use `.env.example` as template (without actual values)
- ❌ Never commit `.env` files to version control
- ❌ Never hardcode API keys, passwords, or secrets

### Production Secrets
Ensure the following are strong and unique in production:
- `JWT_SECRET`: Min 32 characters, cryptographically random
- `PAYSTACK_SECRET_KEY`: Keep absolutely private
- `EMAIL_PASSWORD`: Use app-specific passwords, not account password
- `MONGODB_URI`: Use strong password, enable IP whitelisting
- `REDIS_URL`: Use authentication if exposed to network

## Authentication & Authorization

### Password Security
- Passwords are hashed with bcrypt (12 salt rounds)
- Never store plaintext passwords
- Enforce minimum 8 characters in frontend validation
- Consider rate limiting on login attempts

### JWT Tokens
- Tokens expire after 7 days (configurable)
- Refresh tokens should be implemented for long-lived sessions
- Always verify token signature before using
- Store tokens securely on frontend (httpOnly cookies recommended)

### Authorization
- Always verify user roles/permissions on backend
- Creator-only endpoints check `user.role === 'creator'`
- Don't rely solely on frontend authorization checks
- Validate ownership before allowing resource modifications

## Data Protection

### Sensitive Data
Never log or expose:
- Passwords or password hashes
- Payment card details (handled by Paystack)
- JWT tokens
- Personal identification numbers
- API keys or secrets

### CORS Configuration
- Whitelist specific frontend domains
- Never use `*` in production
- Update when deploying to new domain

Currently configured:
```javascript
CORS whitelist: process.env.FRONTEND_URL
```

## API Security

### Input Validation
- Validate all user inputs
- Sanitize before database operations
- Use TypeScript for type safety
- Check request body schemas

### Rate Limiting
Recommended rate limits:
- Authentication endpoints: 5 requests per 15 minutes
- General API: 100 requests per 15 minutes
- Adjust based on your needs

### Payment Security
- Always verify payment status on backend
- Use Paystack webhook for transaction verification
- Implement payment verification on ticket endpoints
- Never trust client-side payment status

## Database Security

### MongoDB
- Enable authentication
- Use strong passwords
- Enable IP whitelisting on MongoDB Atlas
- Regular backups
- Encrypt data in transit (HTTPS/TLS)
- Encrypt data at rest (MongoDB Enterprise/Atlas)

### Indexes
- Proper indexing on frequently queried fields
- Sparse indexes for optional fields
- TTL indexes for temporary data
- Unique indexes for critical fields

## Frontend Security

### XSS Prevention
- React automatically escapes JSX
- Be careful with `dangerouslySetInnerHTML`
- Sanitize any user-generated content

### CSRF Protection
- Use httpOnly cookies for tokens
- Implement CSRF tokens if needed
- Validate referer headers on sensitive operations

### Third-Party Dependencies
- Keep dependencies updated
- Review dependencies before adding
- Use `npm audit` to check for vulnerabilities
- Pin major versions in package.json

## Deployment Security

### HTTPS/TLS
- Always use HTTPS in production
- Use valid SSL certificates
- Redirect HTTP to HTTPS
- Set HSTS headers

### Environment Variables
- Use platform-managed secrets (Render, Heroku, etc.)
- Never pass secrets as command-line arguments
- Rotate secrets regularly
- Different secrets for different environments

### Database Backups
- Regular automated backups
- Test backup restoration
- Secure backup storage
- Encryption for backup files

### Logging & Monitoring
- Monitor for suspicious activities
- Log authentication attempts
- Alert on unusual patterns
- Rotate logs regularly

## Common Vulnerabilities

### SQL Injection
Not applicable (using MongoDB), but:
- Still validate all inputs
- Use Mongoose validation
- Never build queries with string concatenation

### Authentication Bypass
- Verify caller ownership before database operations
- Check user roles on protected endpoints
- Validate JWT tokens properly
- Implement proper session handling

### Denial of Service (DoS)
- Implement rate limiting
- Set request size limits
- Use connection pooling
- Monitor resource usage

### Information Disclosure
- Don't expose stack traces in production
- Return generic error messages to clients
- Log detailed errors server-side only
- Disable debug endpoints in production

## Incident Response

### If a Secret is Exposed
1. Immediately rotate the exposed secret
2. Regenerate keys/passwords
3. Review access logs
4. Remove from git history: `git filter-branch`
5. Notify affected users if necessary

### If a Vulnerability is Found
1. Document the vulnerability
2. Assess impact
3. Create a fix
4. Test thoroughly
5. Deploy to production
6. Update security documentation

## Regular Security Tasks

### Daily
- Monitor error logs
- Check system alerts

### Weekly
- Review access logs for anomalies
- Update dependencies if security patches available

### Monthly
- Run security audit (`npm audit`)
- Review authentication logs
- Backup database verification

### Quarterly
- Full security review
- Penetration testing (recommended)
- Update security policies

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/knowledge/vulnerability/introduction/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Security](https://react.dev/learn/security)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)

## Security Updates

Subscribe to security notifications:
- [Node.js Security Updates](https://nodejs.org/en/security/)
- [npm Security Advisories](https://www.npmjs.com/advisories)
- GitHub Dependabot alerts (enabled by default)

## Reporting Security Issues

If you discover a security vulnerability:
1. Do NOT create a public GitHub issue
2. Email project maintainers with:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

---

Last Updated: February 2026
