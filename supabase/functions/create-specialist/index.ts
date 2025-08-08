import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';

serve(async (req) => {
  // Configurar CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Responder ao preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    const requestBody = await req.json();
    console.log('Dados recebidos na Edge Function:', requestBody);
    
    const { fullName, email, password, phone, crp, bio, specialties, name, specialty } = requestBody;
    
    // Usar 'name' se 'fullName' não estiver presente
    const finalName = fullName || name;
    // Usar 'specialty' se 'specialties' não estiver presente
    const finalSpecialties = specialties || (specialty ? [specialty] : []);
    
    console.log('Dados processados:', {
      finalName,
      email,
      password: password ? '[PRESENTE]' : '[AUSENTE]',
      phone,
      crp,
      bio,
      finalSpecialties
    });
    
    // Validação dos campos obrigatórios
    if (!email || !password || !finalName || !crp) {
      const missingFields = [];
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      if (!finalName) missingFields.push('name/fullName');
      if (!crp) missingFields.push('crp');
      
      console.error('Campos obrigatórios ausentes:', missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Criar usuário na autenticação
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: finalName,
        phone,
        crp,
      },
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Erro ao criar usuário');
    }

    // 2. Atualizar perfil com dados completos e role de specialist
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: finalName,
        phone: phone || '',
        crp,
        role: 'specialist',
        cpf_cnpj: '00000000000', // Valor temporário, pode ser editado depois
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('Profile error:', profileError);
      throw new Error(profileError.message);
    }

    // 3. Criar registro de especialista
    const { data: specialistData, error: specialistError } = await supabaseAdmin
      .from('specialists')
      .insert({
        user_id: authData.user.id,
        bio: bio || '',
        specialties: finalSpecialties,
        is_available: true,
      })
      .select()
      .single();

    if (specialistError) {
      console.error('Specialist error:', specialistError);
      throw new Error(specialistError.message);
    }

    // 4. Criar configuração padrão de horários
    const { error: rpcError } = await supabaseAdmin.rpc('create_default_specialist_schedule', {
      p_specialist_id: authData.user.id,
    });

    if (rpcError) {
      console.error('RPC error:', rpcError);
      throw new Error(rpcError.message);
    }

    return new Response(JSON.stringify(specialistData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});