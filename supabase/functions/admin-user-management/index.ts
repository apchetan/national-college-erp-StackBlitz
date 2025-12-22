import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    
    // Create admin client with service role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Create regular client to verify the requesting user
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the requesting user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Requesting user:', user.id);

    // Check if user is admin or super_admin
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile || !profile.is_active || !['admin', 'super_admin'].includes(profile.role)) {
      console.log('Insufficient permissions:', profile);
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { method } = req;
    const url = new URL(req.url);
    const path = url.pathname;

    // CREATE USER
    if (method === 'POST' && path.endsWith('/create')) {
      const body = await req.json();
      const { email, password, full_name, role } = body;

      console.log('Creating user:', { email, role });

      // Validate role permissions
      if (profile.role === 'admin' && ['admin', 'super_admin'].includes(role)) {
        return new Response(
          JSON.stringify({ error: 'Admins cannot create admin or super_admin users' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create user with admin API
      const { data, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          role
        }
      });

      if (createError) {
        console.error('Create user error:', createError);
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('User created:', data.user?.id);

      return new Response(
        JSON.stringify({ user_id: data.user.id, user: data.user }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // UPDATE USER
    if (method === 'POST' && path.endsWith('/update')) {
      const body = await req.json();
      const { user_id, updates } = body;

      // Check target user's role
      const { data: targetProfile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user_id)
        .single();

      if (profile.role === 'admin' && targetProfile && ['admin', 'super_admin'].includes(targetProfile.role)) {
        return new Response(
          JSON.stringify({ error: 'Admins cannot modify admin or super_admin users' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update user
      const { data: updatedUser, error: updateError } = await adminClient.auth.admin.updateUserById(
        user_id,
        updates
      );

      if (updateError) {
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ user: updatedUser }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE USER
    if (method === 'POST' && path.endsWith('/delete')) {
      const body = await req.json();
      const { user_id } = body;

      // Check target user's role
      const { data: targetProfile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user_id)
        .single();

      if (profile.role === 'admin' && targetProfile && ['admin', 'super_admin'].includes(targetProfile.role)) {
        return new Response(
          JSON.stringify({ error: 'Admins cannot delete admin or super_admin users' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Delete user
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(user_id);

      if (deleteError) {
        return new Response(
          JSON.stringify({ error: deleteError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // RESET PASSWORD
    if (method === 'POST' && path.endsWith('/reset-password')) {
      const body = await req.json();
      const { user_id, new_password } = body;

      console.log('Resetting password for user:', user_id);

      // Check target user's role
      const { data: targetProfile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user_id)
        .single();

      if (profile.role === 'admin' && targetProfile && ['admin', 'super_admin'].includes(targetProfile.role)) {
        return new Response(
          JSON.stringify({ error: 'Admins cannot reset passwords for admin or super_admin users' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Reset password using admin API
      const { error: resetError } = await adminClient.auth.admin.updateUserById(
        user_id,
        { password: new_password }
      );

      if (resetError) {
        console.error('Password reset error:', resetError);
        return new Response(
          JSON.stringify({ error: resetError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Password reset successful for user:', user_id);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
