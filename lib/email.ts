import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jshreemurugan@gmail.com',
    pass: 'oxklnhohhikcqaej',
  },
});

export async function sendReportEmail(
  to: string,
  userName: string,
  fileName: string,
  aiSummary: string,
  abnormalCount: number,
  parameters: any[]
) {
  const abnormalParams = parameters.filter(p => p.status !== 'normal');
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0066FF 0%, #0052CC 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0066FF; }
        .parameter { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
        .status { padding: 5px 10px; border-radius: 5px; font-weight: bold; font-size: 12px; }
        .status-low { background: #FEF3C7; color: #92400E; }
        .status-high { background: #FED7AA; color: #9A3412; }
        .status-critical { background: #FEE2E2; color: #991B1B; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; background: #0066FF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 Medical Report Analysis Complete</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Your medical report <strong>${fileName}</strong> has been successfully analyzed.</p>
          
          <div class="summary">
            <h3>📊 AI Analysis Summary</h3>
            <p>${aiSummary}</p>
            ${abnormalCount > 0 ? `<p style="color: #EAB308; font-weight: bold;">⚠️ ${abnormalCount} parameter(s) need attention</p>` : '<p style="color: #22C55E; font-weight: bold;">✅ All parameters are within normal range</p>'}
          </div>
          
          ${abnormalParams.length > 0 ? `
            <h3>⚠️ Parameters Needing Attention:</h3>
            ${abnormalParams.map(p => `
              <div class="parameter">
                <div>
                  <strong>${p.parameter}</strong><br>
                  <span style="color: #666;">${p.result} ${p.unit} (Normal: ${p.normalRange} ${p.unit})</span>
                </div>
                <span class="status status-${p.status}">${p.status.toUpperCase()}</span>
              </div>
            `).join('')}
          ` : ''}
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/dashboard/reports" class="button">
              View Full Report
            </a>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            <strong>Note:</strong> This analysis is for informational purposes only and should not replace professional medical advice.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} HealthDecode AI - Medical Report Analysis Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await transporter.sendMail({
      from: '"HealthDecode AI" <jshreemurugan@gmail.com>',
      to,
      subject: `📊 Your Medical Report Analysis - ${fileName}`,
      html: htmlContent,
    });
    console.log('✅ Email sent:', result.messageId);
    return result;
  } catch (error: any) {
    console.error('❌ Email error:', error.message);
    throw error;
  }
}
