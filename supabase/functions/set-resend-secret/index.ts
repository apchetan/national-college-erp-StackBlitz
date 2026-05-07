const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const projectRef = "obqyndxmkgtshalmchot";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!serviceRoleKey) {
      throw new Error("Service role key not available");
    }

    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/secrets`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          { name: "RESEND_API_KEY", value: "re_PULpAL7w_LLcfwqbwxrcNxdyc77H7n5uZ" },
          { name: "ADMIN_NOTIFY_EMAILS", value: "admissions@nationalcollege.in" },
          { name: "APP_BASE_URL", value: "https://obqyndxmkgtshalmchot.supabase.co" },
        ]),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to set secrets: ${response.status} - ${errorText}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "All secrets (RESEND_API_KEY, ADMIN_NOTIFY_EMAILS, APP_BASE_URL) have been set successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
