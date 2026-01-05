import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AddColumnRequest {
  tableName: string;
  columnName: string;
  displayName: string;
  dataType: string;
  isNullable: boolean;
  defaultValue?: string;
  validationRules?: Record<string, any>;
  isUnique: boolean;
  isGlobal: boolean;
  dropdownOptions?: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is super_admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'super_admin' || !profile.is_active) {
      return new Response(
        JSON.stringify({ error: 'Only super admins can modify schema' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: AddColumnRequest = await req.json();
    const { tableName, columnName, displayName, dataType, isNullable, defaultValue, validationRules, isUnique, isGlobal, dropdownOptions } = body;

    // Validate input
    if (!tableName || !columnName || !dataType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize column name (only alphanumeric and underscores)
    const sanitizedColumnName = columnName.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    // Map data type to PostgreSQL type
    const pgTypeMap: Record<string, string> = {
      text: 'text',
      number: 'integer',
      decimal: 'numeric',
      date: 'date',
      boolean: 'boolean',
      email: 'text',
      phone: 'text',
      dropdown: 'text',
      multiselect: 'text[]'
    };

    const pgType = pgTypeMap[dataType] || 'text';
    const nullableClause = isNullable ? '' : 'NOT NULL';
    const defaultClause = defaultValue ? `DEFAULT '${defaultValue.replace(/'/g, "''")}'` : '';

    // Build ALTER TABLE statement
    const alterTableSQL = `
      ALTER TABLE ${tableName}
      ADD COLUMN IF NOT EXISTS ${sanitizedColumnName} ${pgType} ${nullableClause} ${defaultClause};
    `;

    // Execute ALTER TABLE
    const { error: alterError } = await supabase.rpc('execute_sql', { query: alterTableSQL });

    if (alterError) {
      // Log failed attempt
      await supabase.from('schema_change_log').insert({
        table_name: tableName,
        column_name: sanitizedColumnName,
        change_type: 'add_column',
        change_details: { dataType, isNullable, defaultValue },
        executed_by: user.id,
        status: 'failed',
        error_message: alterError.message
      });

      return new Response(
        JSON.stringify({ error: 'Failed to add column', details: alterError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add unique constraint if requested
    if (isUnique) {
      const uniqueSQL = `ALTER TABLE ${tableName} ADD CONSTRAINT ${tableName}_${sanitizedColumnName}_unique UNIQUE (${sanitizedColumnName});`;
      await supabase.rpc('execute_sql', { query: uniqueSQL });
    }

    // Register column in column_registry
    const { error: registryError } = await supabase.from('column_registry').insert({
      table_name: tableName,
      column_name: sanitizedColumnName,
      display_name: displayName || columnName,
      data_type: dataType,
      is_nullable: isNullable,
      default_value: defaultValue,
      validation_rules: validationRules || {},
      is_unique: isUnique,
      is_global: isGlobal,
      dropdown_options: dropdownOptions ? { options: dropdownOptions } : null,
      created_by: user.id
    });

    if (registryError) {
      console.error('Failed to register column:', registryError);
    }

    // Log successful change
    await supabase.from('schema_change_log').insert({
      table_name: tableName,
      column_name: sanitizedColumnName,
      change_type: 'add_column',
      change_details: { dataType, isNullable, defaultValue, isUnique, isGlobal },
      executed_by: user.id,
      status: 'success'
    });

    return new Response(
      JSON.stringify({
        success: true,
        columnName: sanitizedColumnName,
        message: 'Column added successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});