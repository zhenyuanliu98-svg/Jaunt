# Custom Domain & Email Setup Guide

## ✅ Checklist

Use this to track your progress:

- [ ] Domain added to Vercel
- [ ] DNS records configured in Cloudflare
- [ ] Domain verified in Vercel (shows green checkmark)
- [ ] SendGrid Inbound Parse configured
- [ ] SendGrid domain authenticated
- [ ] Environment variables updated in Vercel
- [ ] Google OAuth redirect URI updated
- [ ] App redeployed and tested

---

## 🌐 Part 1: Connect Domain (jauntapp.org)

### 1. Add Domain in Vercel

1. [Vercel Dashboard](https://vercel.com/dashboard) → Your Project
2. **Settings** → **Domains**
3. Add: `jauntapp.org`
4. Add: `www.jauntapp.org`

### 2. Configure DNS in Cloudflare

Go to [Cloudflare](https://dash.cloudflare.com) → **jauntapp.org** → **DNS**

**Add A Record (for root domain):**
```
Type: A
Name: @
IPv4 address: 76.76.21.21
Proxy status: DNS only (gray cloud ☁️)
TTL: Auto
```

**Add CNAME (for www):**
```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy status: DNS only (gray cloud ☁️)
TTL: Auto
```

⏱️ Wait 5-10 minutes for DNS propagation

### 3. Verify in Vercel

- Go back to Vercel → Domains
- Should show **"Valid Configuration"** ✅
- Both domains should have green checkmarks

---

## 📧 Part 2: Email Forwarding Setup

### 4. Configure SendGrid Inbound Parse

1. [SendGrid Dashboard](https://app.sendgrid.com)
2. **Settings** → **Inbound Parse**
3. **Add Host & URL**

**Settings:**
- Subdomain: `mail`
- Domain: `jauntapp.org`
- Destination URL: `https://jauntapp.org/api/email/inbound`
- Check Spam: ✅ Yes
- Send Raw: ❌ No
- POST Raw: ❌ No

4. Click **Add**

SendGrid will show you MX records → Copy them

### 5. Add MX Records in Cloudflare

Go to Cloudflare → **jauntapp.org** → **DNS**

**Add MX Record:**
```
Type: MX
Name: mail
Mail server: mx.sendgrid.net
Priority: 10
TTL: Auto
```

If SendGrid shows additional records, add them too:
```
Type: CNAME
Name: mail
Target: u[YOUR-ID].wl.sendgrid.net
Proxy: DNS only
TTL: Auto
```

### 6. Authenticate Domain in SendGrid

1. SendGrid → **Settings** → **Sender Authentication**
2. **Authenticate Your Domain**
3. Select DNS Provider: **Cloudflare**
4. Domain: `jauntapp.org`
5. SendGrid shows CNAME records → Add ALL to Cloudflare

**Example records to add in Cloudflare:**
```
Type: CNAME
Name: s1._domainkey
Target: s1.domainkey.u[YOUR-ID].wl.sendgrid.net
```

```
Type: CNAME
Name: s2._domainkey
Target: s2.domainkey.u[YOUR-ID].wl.sendgrid.net
```

6. Click **Verify** in SendGrid
7. Should show ✅ **Verified**

---

## 🔑 Part 3: API Keys & Environment Variables

### 7. Create SendGrid API Key

1. SendGrid → **Settings** → **API Keys**
2. **Create API Key**
3. Name: `Jaunt Production`
4. Permissions: **Full Access**
5. **Create & View**
6. **Copy the key** (you won't see it again!)

### 8. Update Environment Variables in Vercel

Go to Vercel → Your Project → **Settings** → **Environment Variables**

**Update these:**

```
NEXTAUTH_URL=https://jauntapp.org
```

**Add new:**

```
SENDGRID_API_KEY=SG.your-api-key-from-step-7
EMAIL_DOMAIN=jauntapp.org
```

**Ensure these are still set:**
```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXTAUTH_SECRET=your-secret
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Important:** Select **Production, Preview, and Development** for all variables

### 9. Redeploy

Vercel will auto-redeploy when you update environment variables. Or manually trigger:
- Go to **Deployments**
- Click ⋯ menu on latest deployment
- **Redeploy**

---

## 🔐 Part 4: Update OAuth

### 10. Update Google OAuth Redirect

1. [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. **Authorized redirect URIs** → **+ Add URI**

Add:
```
https://jauntapp.org/api/auth/callback/google
```

5. **Save**

---

## ✅ Part 5: Testing

### 11. Test Your Setup

**Test Domain:**
1. Visit `https://jauntapp.org`
2. Should load your app (not an error)
3. SSL certificate should be valid (🔒 in browser)

**Test Authentication:**
1. Click **Sign in with Google**
2. Complete Google OAuth
3. Should redirect back to `https://jauntapp.org/dashboard`
4. Check that you're logged in

**Test Email Forwarding:**
1. Log in to your app
2. Go to Dashboard
3. Copy your forwarding email (e.g., `abc12345@mail.jauntapp.org`)
4. Send a test email to that address
5. Check SendGrid → **Activity Feed** to see if email was received
6. Check your app → **Bookings** → **Pending** to see if booking appears

---

## 🐛 Troubleshooting

### Domain not working

**Check:**
- DNS records in Cloudflare (gray cloud, not orange)
- Wait 10-15 minutes for propagation
- Run: `dig jauntapp.org` to verify DNS

### SSL Certificate Error

- Vercel auto-provisions SSL
- Can take 1-2 minutes after domain verification
- If stuck: Remove domain from Vercel, wait 5 min, re-add

### Google Sign-In Fails

**Common issues:**
- Old redirect URI still in use
- `NEXTAUTH_URL` not updated to new domain
- Google OAuth consent screen needs new domain added

**Fix:**
1. Clear browser cookies
2. Verify redirect URI in Google Console
3. Check `NEXTAUTH_URL` in Vercel
4. Try incognito/private browsing

### Email Not Forwarding

**Debug steps:**
1. SendGrid → **Activity Feed** → Check if emails are received
2. Check MX records: `dig MX mail.jauntapp.org`
3. Verify Inbound Parse URL is correct
4. Check Vercel function logs for errors
5. Test with a simple email (just text, no attachments)

**Common issues:**
- MX records not propagated (wait 1 hour)
- Inbound Parse URL has typo
- SENDGRID_API_KEY not set in Vercel
- Email sent to wrong subdomain (must be `mail.jauntapp.org`)

### "Could not find table" Error

- Make sure you ran the SQL schema in Supabase
- Check Supabase → **Table Editor** for tables
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct

---

## 📊 Verification Checklist

Before announcing your app is live:

- [ ] `https://jauntapp.org` loads successfully
- [ ] SSL certificate is valid (🔒)
- [ ] Google sign-in works
- [ ] Can create a trip
- [ ] Can add a booking manually
- [ ] Email forwarding receives emails
- [ ] Parsed bookings appear in Pending
- [ ] No console errors in browser
- [ ] No errors in Vercel function logs

---

## 📝 Email Format for Users

Your users will forward emails to:
```
[their-unique-id]@mail.jauntapp.org
```

Example:
```
abc12345@mail.jauntapp.org
```

Each user gets a unique forwarding address shown on their dashboard.

---

## 🚀 Next Steps

Once everything is working:

1. Update any marketing materials with new domain
2. Set up domain forwarding if using multiple domains
3. Configure custom email templates in SendGrid
4. Set up monitoring/alerts for email parsing
5. Consider adding SPF/DKIM records for better deliverability

---

## 📚 Additional Resources

- [Vercel Custom Domains](https://vercel.com/docs/concepts/projects/domains)
- [Cloudflare DNS](https://developers.cloudflare.com/dns/)
- [SendGrid Inbound Parse](https://docs.sendgrid.com/for-developers/parsing-email/setting-up-the-inbound-parse-webhook)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)

---

Need help? Check Vercel logs and SendGrid Activity Feed for detailed error messages.
