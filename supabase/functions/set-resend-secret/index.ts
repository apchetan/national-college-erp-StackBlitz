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
    const resendApiKey = "re_PULpAL7w_LLcfwqbwxrcNxdyc77H7n5uZ";

    // Use the service role key to authenticate with Supabase Management API
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!serviceRoleKey) {
      throw new Error("Service role key not available");
    }

    // Set the secret using Supabase Management API
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/secrets`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            name: "RESEND_API_KEY",
            value: resendApiKey,
          },
        ]),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to set secret: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "RESEND_API_KEY has been set successfully",
        result,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
