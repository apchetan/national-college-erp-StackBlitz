import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function cleanEmptyValue(value: any): any {
  if (value === null || value === undefined) {
    return null;
  }

  // Convert to string and clean quotes
  if (typeof value === 'string') {
    const cleaned = value.replace(/^["'\s]+|["'\s]+$/g, '').trim();
    if (cleaned === '' || cleaned === 'null' || cleaned === 'undefined') {
      return null;
    }
    return cleaned;
  }

  if (value === '') {
    return null;
  }

  return value;
}

interface ImportRequest {
  targetTable: string;
  fileName: string;
  columnMapping: Record<string, string>; // uploadedColumn -> dbColumn
  transformationRules: Record<string, any>;
  data: Record<string, any>[];
  saveAsTemplate?: boolean;
  templateName?: string;
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

    // Check if user has permission to import
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role) || !profile.is_active) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: ImportRequest = await req.json();
    const { targetTable, fileName, columnMapping, transformationRules, data, saveAsTemplate, templateName } = body;

    // Create import session
    const { data: session, error: sessionError } = await supabase
      .from('import_sessions')
      .insert({
        target_table: targetTable,
        file_name: fileName,
        total_rows: data.length,
        mapping_used: columnMapping,
        started_by: user.id,
        status: 'processing'
      })
      .select()
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Failed to create import session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process and validate data
    const errors: any[] = [];
    const validRows: any[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const transformedRow: Record<string, any> = {};
      const rowErrors: string[] = [];

      // Apply column mapping and transformations
      for (const [uploadedCol, dbCol] of Object.entries(columnMapping)) {
        let value = row[uploadedCol];

        // Skip if ignore rule is set
        if (transformationRules[uploadedCol]?.ignore) {
          continue;
        }

        // Apply transformations
        if (transformationRules[uploadedCol]) {
          const rules = transformationRules[uploadedCol];
          
          if (rules.trim && typeof value === 'string') {
            value = value.trim();
          }
          
          if (rules.uppercase && typeof value === 'string') {
            value = value.toUpperCase();
          }
          
          if (rules.lowercase && typeof value === 'string') {
            value = value.toLowerCase();
          }
          
          if (rules.dateFormat && value) {
            // Simple date transformation (can be enhanced)
            try {
              value = new Date(value).toISOString().split('T')[0];
            } catch (e) {
              rowErrors.push(`Invalid date format in column ${uploadedCol}`);
            }
          }
          
          if (rules.replace && typeof value === 'string') {
            for (const [find, replace] of Object.entries(rules.replace)) {
              value = value.replace(new RegExp(find, 'g'), replace as string);
            }
          }
        }

        transformedRow[dbCol] = cleanEmptyValue(value);
      }

      // Add created_by if table supports it
      if (['contacts', 'enquiries', 'appointments', 'admissions'].includes(targetTable)) {
        transformedRow.created_by = user.id;
      }

      if (rowErrors.length > 0) {
        errors.push({ row: i + 1, errors: rowErrors, data: row });
      } else {
        validRows.push(transformedRow);
      }
    }

    // Insert valid rows
    let successCount = 0;
    const insertErrors: any[] = [];

    if (validRows.length > 0) {
      // Insert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < validRows.length; i += batchSize) {
        const batch = validRows.slice(i, i + batchSize);
        const { error: insertError, count } = await supabase
          .from(targetTable)
          .insert(batch)
          .select('*', { count: 'exact' });

        if (insertError) {
          insertErrors.push({
            batch: Math.floor(i / batchSize) + 1,
            error: insertError.message
          });
        } else {
          successCount += count || batch.length;
        }
      }
    }

    // Update import session
    await supabase
      .from('import_sessions')
      .update({
        successful_rows: successCount,
        failed_rows: data.length - successCount,
        error_report: [...errors, ...insertErrors],
        completed_at: new Date().toISOString(),
        status: successCount === data.length ? 'completed' : 'partially_completed'
      })
      .eq('id', session.id);

    // Save mapping template if requested
    if (saveAsTemplate && templateName) {
      await supabase.from('mapping_templates').insert({
        template_name: templateName,
        target_table: targetTable,
        mapping_config: columnMapping,
        transformation_rules: transformationRules,
        created_by: user.id
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: session.id,
        totalRows: data.length,
        successfulRows: successCount,
        failedRows: data.length - successCount,
        errors: [...errors, ...insertErrors]
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