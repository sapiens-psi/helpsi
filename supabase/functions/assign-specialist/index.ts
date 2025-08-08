import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { consultationId, specialistId, type } = await req.json();

    if (!consultationId || !specialistId || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verificar se o especialista existe na tabela profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, full_name')
      .eq('id', specialistId)
      .eq('role', 'specialist')
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Specialist not found or invalid' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Determinar a tabela correta
    const tableName = type === 'pre-compra' ? 'consultations_pre_compra' : 'consultations_pos_compra';

    // Atualizar a consulta com o especialista
    const { data, error } = await supabaseClient
      .from(tableName)
      .update({ specialist_id: specialistId })
      .eq('id', consultationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating consultation:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to assign specialist', details: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data,
        message: `Specialist ${profile.full_name} assigned successfully` 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});