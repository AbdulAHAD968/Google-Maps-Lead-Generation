function baseLayout({ title, preheader = "", body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background-color: #faf9f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #141413; }
  .preheader { display: none !important; visibility: hidden; mso-hide: all; font-size: 1px; color: transparent; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; }
</style>
</head>
<body>
<span class="preheader">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#faf9f5;">
  <tr>
    <td align="center" style="padding: 32px 20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
        <tr>
          <td style="padding: 0 0 20px 4px; font-size:16px; font-weight:600; color:#141413; letter-spacing:-0.2px;">
            Seven Labs &middot; Lead Generation
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff; border-radius:12px; border:1px solid #e6dfd8; overflow:hidden;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="padding:24px 8px; font-size:12px; color:#8e8b82;">
            Seven Labs &mdash; Internal Lead Generation &middot; leadsgen.sevenlabs.site
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function ctaButton({ href, label }) {
  return `<a href="${href}" style="display:inline-block; background:#cc785c; color:#ffffff; font-size:14px; font-weight:500; text-decoration:none; padding:12px 20px; border-radius:8px;">${label}</a>`;
}

export function passwordResetEmail({ resetUrl }) {
  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding:40px;">
          <h1 style="font-size:22px; font-weight:500; color:#141413; margin:0 0 16px;">Reset your password</h1>
          <p style="font-size:15px; color:#3d3d3a; line-height:1.7; margin:0 0 28px;">
            We received a request to reset the password for your Lead Generation account. This link expires in <strong>1 hour</strong>.
          </p>
          ${ctaButton({ href: resetUrl, label: "Reset password" })}
          <p style="font-size:13px; color:#8e8b82; margin:20px 0 0;">
            If you did not request this, you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>
  `;

  return baseLayout({
    title: "Reset your Lead Generation password",
    preheader: "Reset link inside - expires in 1 hour.",
    body,
  });
}
