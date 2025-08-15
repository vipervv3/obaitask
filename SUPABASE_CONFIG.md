# 🔧 Supabase Configuration for OBTASK AI

This guide covers the essential Supabase configuration needed for proper authentication and email handling in production.

## 🌐 Auth URL Configuration

### Step 1: Access Supabase Auth Settings
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/esgoiucahvofyonfsexn
2. Navigate to: **Settings → Auth → URL Configuration**

### Step 2: Update URL Settings
Configure these settings for production:

- **Site URL**: `https://obaitask.vercel.app`
- **Redirect URLs**: Add `https://obaitask.vercel.app/**`

This ensures email confirmation links redirect to your production domain instead of localhost.

## 📧 Email Template Customization

### Step 1: Access Email Templates
1. In Supabase Dashboard: **Settings → Auth → Email Templates**
2. Select: **"Confirm signup"** template

### Step 2: Update Subject Line
```
Welcome to OBTASK AI - Confirm Your Account 🚀
```

### Step 3: Custom Email Template
Replace the default template with this branded version:

```html
<h2>Welcome to OBTASK AI! 🎯</h2>

<p>Hi there!</p>

<p>Thanks for signing up for OBTASK AI - your intelligent project management companion. We're excited to help you transform the way you manage projects with AI-powered insights and voice recording capabilities.</p>

<p>To get started and access your dashboard, please confirm your email address by clicking the button below:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Confirm Your Account</a></p>

<p>Once confirmed, you'll be able to:</p>
<ul>
  <li>🎤 Record meetings up to 2 hours with AI transcription</li>
  <li>🤖 Automatically extract tasks from your recordings</li>
  <li>📊 Get intelligent project insights and recommendations</li>
  <li>👥 Collaborate with your team seamlessly</li>
</ul>

<p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>Welcome aboard!</p>
<p><strong>The OBTASK AI Team</strong></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
<p style="color: #6b7280; font-size: 12px;">If you didn't create an account with OBTASK AI, you can safely ignore this email.</p>
```

## 🔐 Security Settings

### Auth Rate Limiting
- **Enable rate limiting** to prevent spam signups
- **Set reasonable limits** for signup attempts

### Password Requirements
- **Minimum length**: 8 characters
- **Require special characters**: Recommended for security

## ✅ Verification Checklist

After configuration, verify:

- [ ] Site URL points to production domain
- [ ] Redirect URLs include production domain with wildcard
- [ ] Email template is customized with OBTASK AI branding
- [ ] Subject line is personalized
- [ ] Test signup with new email address
- [ ] Confirm email redirects to production site
- [ ] User can successfully sign in after confirmation

## 🚨 Common Issues

### Issue: Email links still go to localhost
**Solution**: Double-check Site URL in Supabase Auth settings

### Issue: Email confirmation fails
**Solution**: Ensure auth callback route is properly deployed

### Issue: Generic email template
**Solution**: Update email template in Supabase Auth settings

---

*For additional help, refer to the main README.md or check Supabase documentation.*