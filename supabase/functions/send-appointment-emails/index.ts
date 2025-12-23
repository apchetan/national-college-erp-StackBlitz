import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AppointmentEmailData {
  appointmentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  program: string;
  specialization: string;
  preferredDate: string;
  timeSlot: string;
  appointmentType: string;
  city: string;
  state: string;
}

function formatTime(time: string): string {
  const [hour] = time.split(':');
  const hourNum = parseInt(hour);
  const ampm = hourNum >= 12 ? 'PM' : 'AM';
  const displayHour = hourNum > 12 ? hourNum - 12 : (hourNum === 0 ? 12 : hourNum);
  return `${displayHour}:00 ${ampm}`;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  } catch {
    return dateString;
  }
}

function generateApplicantEmail(data: AppointmentEmailData): string {
  const endTime = formatTime((parseInt(data.timeSlot.split(':')[0]) + 1).toString() + ':00');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">National College</h1>
              <p style="margin: 10px 0 0 0; color: #bfdbfe; font-size: 14px;">Excellence in Education Since 1998</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1e3a8a; font-size: 24px;">Appointment Request Received</h2>
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Dear ${data.firstName},
              </p>
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Thank you for booking an appointment with National College. We have successfully received your appointment request.
              </p>
              
              <div style="background-color: #f0f9ff; border-left: 4px solid #1e40af; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 15px 0; color: #1e3a8a; font-size: 18px;">Appointment Details</h3>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding: 8px 0;"><strong>Program:</strong></td>
                    <td style="color: #374151; font-size: 14px; padding: 8px 0;">${data.program} - ${data.specialization}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding: 8px 0;"><strong>Appointment Type:</strong></td>
                    <td style="color: #374151; font-size: 14px; padding: 8px 0;">${data.appointmentType}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding: 8px 0;"><strong>Date:</strong></td>
                    <td style="color: #374151; font-size: 14px; padding: 8px 0;">${formatDate(data.preferredDate)}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding: 8px 0;"><strong>Time:</strong></td>
                    <td style="color: #374151; font-size: 14px; padding: 8px 0;">${formatTime(data.timeSlot)} - ${endTime}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding: 8px 0;"><strong>Name:</strong></td>
                    <td style="color: #374151; font-size: 14px; padding: 8px 0;">${data.firstName} ${data.lastName}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding: 8px 0;"><strong>Mobile:</strong></td>
                    <td style="color: #374151; font-size: 14px; padding: 8px 0;">${data.phone}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding: 8px 0;"><strong>Email:</strong></td>
                    <td style="color: #374151; font-size: 14px; padding: 8px 0;">${data.email}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding: 8px 0;"><strong>Location:</strong></td>
                    <td style="color: #374151; font-size: 14px; padding: 8px 0;">${data.city}, ${data.state}</td>
                  </tr>
                </table>
              </div>
              
              <p style="margin: 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                <strong>What's Next?</strong><br>
                Our admission team will contact you shortly to confirm your appointment and provide further details about the program.
              </p>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>Need Immediate Assistance?</strong><br>
                  WhatsApp/Call: <a href="tel:+918068507627" style="color: #1e40af; text-decoration: none;">+91 80685 07627</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                <strong>National College</strong><br>
                <a href="https://www.nationalcollege.in" style="color: #1e40af; text-decoration: none;">www.nationalcollege.in</a> | 
                <a href="tel:08068507627" style="color: #1e40af; text-decoration: none;">080 68507627</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Established 1998 - Excellence in Education
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function generateAdminEmail(data: AppointmentEmailData, baseUrl: string): string {
  const endTime = formatTime((parseInt(data.timeSlot.split(':')[0]) + 1).toString() + ':00');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">🔔 New Appointment Booking</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #dc2626; font-size: 22px;">New Appointment Request Received</h2>
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                A new appointment has been booked through the online form.
              </p>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 15px 0; color: #dc2626; font-size: 18px;">Appointment Details</h3>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding: 8px 0;"><strong>Name:</strong></td>
                    <td style="color: #374151; font-size: 14px; padding: 8px 0;">${data.firstName} ${data.lastName}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding: 8px 0;"><strong>Email:</strong></td>
                    <td style="color: #374151; font-size: 14px; padding: 8px 0;"><a href="mailto:${data.email}" style="color: #1e40af; text-decoration: none;">${data.email}</a></td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding: 8px 0;"><strong>Mobile:</strong></td>
                    <td style="color: #374151; font-size: 14px; padding: 8px 0;"><a href="tel:${data.phone}" style="color: #1e40af; text-decoration: none;">${data.phone}</a></td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding: 8px 0;"><strong>Program:</strong></td>
                    <td style="color: #374151; font-size: 14px; padding: 8px 0;">${data.program} - ${data.specialization}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding: 8px 0;"><strong>Appointment Type:</strong></td>
                    <td style="color: #374151; font-size: 14px; padding: 8px 0;">${data.appointmentType}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding: 8px 0;"><strong>Date:</strong></td>
                    <td style="color: #374151; font-size: 14px; padding: 8px 0;">${formatDate(data.preferredDate)}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding: 8px 0;"><strong>Time Slot:</strong></td>
                    <td style="color: #374151; font-size: 14px; padding: 8px 0;">${formatTime(data.timeSlot)} - ${endTime}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding: 8px 0;"><strong>Location:</strong></td>
                    <td style="color: #374151; font-size: 14px; padding: 8px 0;">${data.city}, ${data.state}</td>
                  </tr>
                </table>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}?appointmentId=${data.appointmentId}" style="display: inline-block; background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">View in Admin Panel</a>
              </div>
              
              <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Please contact the applicant to confirm the appointment and provide further details.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                This is an automated notification from the National College ERP-CRM System
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

async function sendEmailWithResend(to: string, subject: string, html: string, apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'National College <admissions@nationalcollege.in>',
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return { success: false, error: `Resend API error: ${response.status} - ${errorData}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { appointmentData, resendEmails = false } = await req.json();

    if (!appointmentData || !appointmentData.appointmentId) {
      return new Response(
        JSON.stringify({ error: 'Missing appointment data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const adminEmails = Deno.env.get('ADMIN_NOTIFY_EMAILS') || 'admissions@nationalcollege.in';
    const baseUrl = Deno.env.get('APP_BASE_URL') || 'https://your-app-url.com';

    if (!resendApiKey) {
      await createClient(supabaseUrl, supabaseServiceKey)
        .from('appointments')
        .update({
          email_applicant_status: 'failed',
          email_admin_status: 'failed',
          email_last_error: 'Email provider not configured',
        })
        .eq('id', appointmentData.appointmentId);

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email provider not configured',
          message: 'Appointment saved but emails not sent' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const applicantEmailHtml = generateApplicantEmail(appointmentData);
    const adminEmailHtml = generateAdminEmail(appointmentData, baseUrl);

    const applicantSubject = `Appointment Request Received – ${formatDate(appointmentData.preferredDate)} ${formatTime(appointmentData.timeSlot)}`;
    const adminSubject = `New Appointment Booking — ${appointmentData.firstName} ${appointmentData.lastName} (${formatDate(appointmentData.preferredDate)} ${formatTime(appointmentData.timeSlot)})`;

    const applicantResult = await sendEmailWithResend(
      appointmentData.email,
      applicantSubject,
      applicantEmailHtml,
      resendApiKey
    );

    const adminEmailList = adminEmails.split(',').map(e => e.trim());
    const adminResults = await Promise.all(
      adminEmailList.map(email => 
        sendEmailWithResend(email, adminSubject, adminEmailHtml, resendApiKey)
      )
    );

    const allAdminsSent = adminResults.every(r => r.success);
    const adminErrors = adminResults.filter(r => !r.success).map(r => r.error).join('; ');

    const updateData: any = {
      email_applicant_status: applicantResult.success ? 'sent' : 'failed',
      email_admin_status: allAdminsSent ? 'sent' : 'failed',
    };

    if (applicantResult.success && allAdminsSent) {
      updateData.email_sent_at = new Date().toISOString();
      updateData.email_last_error = null;
    } else {
      const errors: string[] = [];
      if (!applicantResult.success) errors.push(`Applicant: ${applicantResult.error}`);
      if (!allAdminsSent) errors.push(`Admin: ${adminErrors}`);
      updateData.email_last_error = errors.join(' | ');
    }

    await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentData.appointmentId);

    return new Response(
      JSON.stringify({
        success: applicantResult.success || allAdminsSent,
        applicantEmailSent: applicantResult.success,
        adminEmailSent: allAdminsSent,
        errors: updateData.email_last_error,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending appointment emails:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});