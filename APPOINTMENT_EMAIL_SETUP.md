# Appointment Booking Email Setup Guide

## Overview

The Appointment Booking Form now automatically sends confirmation emails to both the applicant and admin team when an appointment is successfully submitted.

## Features

- **Applicant Confirmation Email**: Professional HTML email with appointment details sent to the applicant
- **Admin Notification Email**: Alert sent to admin team with direct link to view appointment
- **Email Status Tracking**: Database fields track email delivery success/failure
- **Graceful Degradation**: Appointments are saved even if emails fail to send
- **User Feedback**: Success page shows whether confirmation email was sent

## Email Configuration

### Step 1: Sign Up for Resend

1. Go to [https://resend.com](https://resend.com) and create an account
2. Verify your email address
3. Add and verify your sending domain (e.g., nationalcollege.in)

### Step 2: Get Your API Key

1. Log in to your Resend dashboard
2. Navigate to **API Keys** section
3. Click **Create API Key**
4. Copy the generated API key (starts with `re_`)

### Step 3: Configure Supabase Edge Function Secrets

1. Open your Supabase project dashboard
2. Go to **Project Settings** → **Edge Functions** → **Secrets**
3. Add the following secrets:

```
RESEND_API_KEY=re_your_actual_api_key_here
ADMIN_NOTIFY_EMAILS=admissions@nationalcollege.in,support@nationalcollege.in
APP_BASE_URL=https://your-app-url.com
```

**Important Notes:**
- Replace `re_your_actual_api_key_here` with your actual Resend API key
- Replace email addresses with your actual admin emails (comma-separated for multiple)
- Replace `APP_BASE_URL` with your actual app URL

### Step 4: Verify Email Domain

In your Resend dashboard:
1. Go to **Domains**
2. Add your domain (e.g., nationalcollege.in)
3. Add the DNS records provided by Resend to your domain's DNS settings
4. Wait for verification (usually takes a few minutes to hours)

## Database Changes

The following fields have been added to the `appointments` table:

| Field | Type | Description |
|-------|------|-------------|
| `email_applicant_status` | text | Status of applicant email (pending/sent/failed) |
| `email_admin_status` | text | Status of admin email (pending/sent/failed) |
| `email_last_error` | text | Last error message if email failed |
| `email_sent_at` | timestamptz | Timestamp when emails were sent |

## Email Templates

### Applicant Email

**Subject**: `Appointment Request Received – [Date] [Time]`

**Content**:
- Greeting with applicant's name
- Confirmation of appointment receipt
- Full appointment details (program, date, time, contact info)
- Next steps information
- Contact details for urgent assistance
- Professional National College branding

### Admin Email

**Subject**: `New Appointment Booking — [Name] ([Date] [Time])`

**Content**:
- Alert about new appointment
- Full appointment details
- Direct link to view appointment in admin panel
- Applicant contact information

## How It Works

1. User fills out and submits the Appointment Booking Form
2. Form validates all required fields
3. Contact record is created/updated in database
4. Appointment record is saved to database
5. Edge Function `send-appointment-emails` is triggered automatically
6. Function sends email to applicant using Resend API
7. Function sends email to all admin addresses
8. Email status fields are updated in database
9. User sees success page with email delivery status

## Testing

### Test Without Email Configuration

If email provider is not configured:
- Appointments will still be saved successfully
- Email status fields will be set to 'failed'
- User will see message: "We could not send the confirmation email right now, but your appointment is confirmed in our system."

### Test With Email Configuration

1. Configure Resend API as described above
2. Submit a test appointment through the form
3. Check applicant's email inbox for confirmation
4. Check admin email inbox(es) for notification
5. Verify in database that `email_applicant_status` and `email_admin_status` are set to 'sent'

## Troubleshooting

### Emails Not Sending

**Check:**
1. Resend API key is correct in Supabase secrets
2. Sending domain is verified in Resend dashboard
3. Edge Function is deployed successfully
4. Check Supabase Edge Function logs for errors

### Applicant Email Sent But Admin Email Failed

**Check:**
1. `ADMIN_NOTIFY_EMAILS` secret is set correctly
2. Email addresses are comma-separated without spaces
3. Admin email domain is verified in Resend

### Emails Going to Spam

**Solutions:**
1. Verify your domain in Resend
2. Set up SPF, DKIM, and DMARC records
3. Use a professional "from" address
4. Avoid spam trigger words in email content

## Security Considerations

- API key is stored securely as Supabase Edge Function secret (never exposed to client)
- Edge Function validates JWT token before processing
- No sensitive data included in applicant emails
- Rate limiting should be implemented at form level to prevent abuse

## Resend Emails Function

The Edge Function (`send-appointment-emails`) can also be called to resend emails for existing appointments:

```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/send-appointment-emails`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    appointmentData: {
      appointmentId: 'uuid-here',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+919876543210',
      program: 'MBA',
      specialization: 'Finance',
      preferredDate: '2025-01-15',
      timeSlot: '14:00',
      appointmentType: 'PhD, One-on-One',
      city: 'Bangalore',
      state: 'Karnataka',
    },
    resendEmails: true
  }),
});
```

## Support

For issues with:
- **Resend**: Contact [Resend Support](https://resend.com/support)
- **Supabase**: Check [Supabase Docs](https://supabase.com/docs)
- **This Implementation**: Check Edge Function logs in Supabase dashboard
