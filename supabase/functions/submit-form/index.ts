import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, email, service, phone, day, time, message } = await req.json();

    if (!name || !email || !day || !time) {
      return new Response(
        JSON.stringify({ error: "Name, email, day and time are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: dbError } = await supabase
      .from("applications")
      .insert({
        full_name: name,
        email,
        service: service || null,
        phone: phone || null,
        session_day: day || null,
        session_time: time || null,
        message: message || null,
      });

    if (dbError) {
      console.error("DB error:", dbError);
      return new Response(
        JSON.stringify({ error: "Could not save your message. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendKey = Deno.env.get("RESEND_API_KEY")!;
    const adeliaEmail = Deno.env.get("ADELIA_EMAIL")!;
    const fromEmail = Deno.env.get("FROM_EMAIL")!;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Gold in Balance <${fromEmail}>`,
        to: [adeliaEmail, "info@goldinbalance.nl"],
        subject: `New application: ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#0C3840;">
            <div style="background:#1B6B7B;padding:32px;text-align:center;">
              <h1 style="color:white;margin:0;font-size:22px;">Gold In Balance</h1>
              <p style="color:#E8C97A;margin:8px 0 0;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;">New application</p>
            </div>
            <div style="padding:32px;background:#F4F9FA;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:10px 0;border-bottom:1px solid #E6F2F4;font-size:13px;color:#4A7A87;width:120px;">Name</td><td style="padding:10px 0;border-bottom:1px solid #E6F2F4;font-weight:600;">${name}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #E6F2F4;font-size:13px;color:#4A7A87;">Email</td><td style="padding:10px 0;border-bottom:1px solid #E6F2F4;"><a href="mailto:${email}" style="color:#1B6B7B;">${email}</a></td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #E6F2F4;font-size:13px;color:#4A7A87;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #E6F2F4;">${phone || "—"}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #E6F2F4;font-size:13px;color:#4A7A87;">Preferred Day</td><td style="padding:10px 0;border-bottom:1px solid #E6F2F4;">${day}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #E6F2F4;font-size:13px;color:#4A7A87;">Preferred Time</td><td style="padding:10px 0;border-bottom:1px solid #E6F2F4;">${time}</td></tr>
                <tr><td style="padding:10px 0;font-size:13px;color:#4A7A87;vertical-align:top;">Message</td><td style="padding:10px 0;line-height:1.6;">${message || "—"}</td></tr>
              </table>
              <div style="margin-top:28px;">
                <a href="mailto:${email}?subject=Re: Gold In Balance application" style="background:#D4A843;color:white;padding:14px 28px;text-decoration:none;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">Reply directly</a>
              </div>
            </div>
            <div style="padding:20px 32px;background:#0C3840;text-align:center;">
              <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 4px;">Keizersgracht 316, 1016 EZ Amsterdam</p>
              <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0;">Gold In Balance · <a href="mailto:info@goldinbalance.nl" style="color:#D4A843;text-decoration:none;">info@goldinbalance.nl</a></p>
            </div>
          </div>
        `,
      }),
    });

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Gold in Balance <${fromEmail}>`,
        to: email,
        subject: "Your message to Gold In Balance has been received",
        html: `
          <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#0C3840;background:#ffffff;">

            <!-- HEADER -->
            <div style="background:#1B6B7B;padding:28px 32px 24px 32px;">
              <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                <tr>
                  <td style="vertical-align:middle;width:44px;">
                    <img src="https://lzvrmeasjxvgliappcaq.supabase.co/storage/v1/object/public/assets/logo_icon.png" alt="Gold in Balance" width="36" height="36" style="display:block;width:36px;height:36px;object-fit:contain;" />
                  </td>
                  <td style="vertical-align:middle;padding-left:10px;">
                    <span style="color:white;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Gold in Balance</span>
                  </td>
                </tr>
              </table>
              <p style="color:rgba(255,255,255,0.9);font-size:15px;line-height:1.75;margin:0 0 20px;">I support intercultural women to reshape their lives and careers. Together, we use networking as a simple but powerful tool to open new doors and reach goals.</p>
              <table style="border-collapse:collapse;">
                <tr>
                  <td style="padding:0 6px 6px 0;"><span style="background:rgba(255,255,255,0.15);color:#D4A843;font-size:11px;padding:4px 12px;border-radius:20px;white-space:nowrap;">Behavioral Change</span></td>
                  <td style="padding:0 6px 6px 0;"><span style="background:rgba(255,255,255,0.15);color:#D4A843;font-size:11px;padding:4px 12px;border-radius:20px;white-space:nowrap;">Networking</span></td>
                  <td style="padding:0 6px 6px 0;"><span style="background:rgba(255,255,255,0.15);color:#D4A843;font-size:11px;padding:4px 12px;border-radius:20px;white-space:nowrap;">Personal Development</span></td>
                </tr>
                <tr>
                  <td style="padding:0 6px 0 0;"><span style="background:rgba(255,255,255,0.15);color:#D4A843;font-size:11px;padding:4px 12px;border-radius:20px;white-space:nowrap;">Empowerment</span></td>
                  <td style="padding:0 6px 0 0;"><span style="background:rgba(255,255,255,0.15);color:#D4A843;font-size:11px;padding:4px 12px;border-radius:20px;white-space:nowrap;">Communication</span></td>
                  <td style="padding:0 6px 0 0;"><span style="background:rgba(255,255,255,0.15);color:#D4A843;font-size:11px;padding:4px 12px;border-radius:20px;white-space:nowrap;">Leadership</span></td>
                </tr>
              </table>
            </div>

            <!-- BODY -->
            <div style="padding:40px 32px;background:#F4F9FA;">
              <p style="font-size:16px;font-weight:600;margin:0 0 16px;color:#0C3840;">Hi ${name},</p>
              <p style="font-size:15px;line-height:1.8;color:#134F5C;margin:0 0 16px;">Thank you for booking a session with <strong>Gold in Balance</strong>! I have received your request and will confirm your appointment within <strong>one business day</strong>.</p>
              <p style="font-size:15px;line-height:1.8;color:#134F5C;margin:0 0 28px;">I look forward to connecting with you and supporting your journey.</p>

              <!-- QUOTE BLOCK -->
              <div style="background:white;border-left:4px solid #D4A843;padding:20px 24px;margin:0 0 32px;">
                <p style="font-size:14px;color:#4A7A87;margin:0 0 8px;font-style:italic;line-height:1.7;">"Most people tell me they love my energy — but more importantly, they feel empowered to take immediate action after we talk."</p>
                <p style="font-size:12px;color:#1B6B7B;margin:0;letter-spacing:0.06em;text-transform:uppercase;font-weight:600;">— Adélia Saúde</p>
              </div>

              <!-- BOOKING SUMMARY -->
              <div style="background:white;border:1px solid #D9EDF1;border-radius:6px;padding:20px 24px;margin:0 0 32px;">
                <p style="font-size:12px;color:#4A7A87;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;font-weight:600;">Your booking details</p>
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                  <tr><td style="padding:6px 0;color:#4A7A87;width:120px;border-bottom:1px solid #E6F2F4;">Name</td><td style="padding:6px 0;font-weight:600;border-bottom:1px solid #E6F2F4;">${name}</td></tr>
                  <tr><td style="padding:6px 0;color:#4A7A87;border-bottom:1px solid #E6F2F4;">Phone</td><td style="padding:6px 0;border-bottom:1px solid #E6F2F4;">${phone || "—"}</td></tr>
                  <tr><td style="padding:6px 0;color:#4A7A87;border-bottom:1px solid #E6F2F4;">Preferred Day</td><td style="padding:6px 0;border-bottom:1px solid #E6F2F4;">${day}</td></tr>
                  <tr><td style="padding:6px 0;color:#4A7A87;border-bottom:1px solid #E6F2F4;">Preferred Time</td><td style="padding:6px 0;border-bottom:1px solid #E6F2F4;">${time}</td></tr>
                  ${message ? `<tr><td style="padding:6px 0;color:#4A7A87;vertical-align:top;">Message</td><td style="padding:6px 0;line-height:1.6;">${message}</td></tr>` : ""}
                </table>
              </div>

              <a href="https://www.linkedin.com/company/goldinbalance/posts/?feedView=all" style="display:inline-block;background:#1B6B7B;color:white;padding:14px 28px;text-decoration:none;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;border-radius:3px;">Connect on LinkedIn</a>
            </div>

            <!-- FOOTER -->
            <div style="padding:20px 32px;background:#0C3840;text-align:center;">
              <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 4px;">Keizersgracht 316, 1016 EZ Amsterdam</p>
              <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0;">Gold In Balance · <a href="mailto:info@goldinbalance.nl" style="color:#D4A843;text-decoration:none;">info@goldinbalance.nl</a></p>
            </div>

          </div>
        `,
      }),
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
