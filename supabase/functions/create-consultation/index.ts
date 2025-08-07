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
    console.log('Edge Function started');
    console.log('Request method:', req.method);
    
    const authHeader = req.headers.get('Authorization');
    const apiKey = req.headers.get('apikey');
    const contentType = req.headers.get('Content-Type');
    
    console.log('Authorization header present:', !!authHeader);
    console.log('Authorization header length:', authHeader?.length || 0);
    console.log('API Key header present:', !!apiKey);
    console.log('Content-Type header:', contentType);
    
    if (!authHeader) {
      console.log('ERROR: Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!apiKey) {
      console.log('ERROR: Missing API key header');
      return new Response(
        JSON.stringify({ error: 'Missing API key header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    console.log('Auth check - User:', user?.id);
    console.log('Auth check - Error:', authError);
    
    if (authError || !user) {
      console.log('ERROR: Authentication failed');
      return new Response(
        JSON.stringify({ error: 'Authentication failed', details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse request body
    let requestBody;
    try {
      const rawBody = await req.text();
      console.log('Raw body text:', rawBody);
      console.log('Raw body length:', rawBody.length);
      
      if (!rawBody || rawBody.trim() === '') {
        console.log('ERROR: Empty request body');
        return new Response(
          JSON.stringify({ error: 'Empty request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      requestBody = JSON.parse(rawBody);
      console.log('Parsed request body:', JSON.stringify(requestBody, null, 2));
      console.log('Request body type:', typeof requestBody);
      console.log('Request body keys:', Object.keys(requestBody || {}));
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      console.error('Parse error details:', parseError.message);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', details: parseError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const {
      client_id,
      scheduled_date,
      scheduled_time,
      description,
      duration = 60,
      scheduleType,
      type, // Frontend sends 'type' instead of 'scheduleType'
      duration_minutes, // Frontend sends 'duration_minutes' instead of 'duration'
      coupon_code_used,
      coupon_id
    } = requestBody;

    // Handle frontend data format
    const finalScheduleType = scheduleType || (type === 'pre-compra' ? 'pre_compra' : 'pos_compra');
    const finalDuration = duration_minutes || duration || 60;

    console.log('Request received:', {
      client_id,
      scheduled_date,
      scheduled_time,
      description,
      duration: finalDuration,
      scheduleType: finalScheduleType,
      type,
      duration_minutes,
      coupon_code_used,
      coupon_id
    });

    console.log('Processed values:', {
      finalScheduleType,
      finalDuration
    });

    // Validate required fields with detailed logging
    console.log('Field validation:', {
      client_id: { value: client_id, type: typeof client_id, present: !!client_id },
      scheduled_date: { value: scheduled_date, type: typeof scheduled_date, present: !!scheduled_date },
      scheduled_time: { value: scheduled_time, type: typeof scheduled_time, present: !!scheduled_time },
      finalScheduleType: { value: finalScheduleType, type: typeof finalScheduleType, present: !!finalScheduleType }
    });

    if (!client_id || !scheduled_date || !scheduled_time || !finalScheduleType) {
      console.log('VALIDATION FAILED - Missing required fields:', { 
        client_id: !!client_id, 
        scheduled_date: !!scheduled_date, 
        scheduled_time: !!scheduled_time, 
        finalScheduleType: !!finalScheduleType 
      });
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          details: {
            client_id: !!client_id,
            scheduled_date: !!scheduled_date,
            scheduled_time: !!scheduled_time,
            scheduleType: !!finalScheduleType
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate scheduleType
    if (!['pre_compra', 'pos_compra'].includes(finalScheduleType)) {
      console.log('Invalid scheduleType:', finalScheduleType);
      return new Response(
        JSON.stringify({ error: 'Invalid scheduleType. Must be pre_compra or pos_compra' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(scheduled_date)) {
      return new Response(
        JSON.stringify({ error: 'Invalid date format. Use YYYY-MM-DD' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate time format (HH:MM or HH:MM:SS) and normalize to HH:MM
    const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/;
    if (!timeRegex.test(scheduled_time)) {
      return new Response(
        JSON.stringify({ error: 'Invalid time format. Use HH:MM or HH:MM:SS' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Normalize time to HH:MM format if it comes as HH:MM:SS
    const normalizedTime = scheduled_time.length === 8 ? scheduled_time.substring(0, 5) : scheduled_time;

    // Determine table name based on schedule type
    const tableName = finalScheduleType === 'pre_compra' ? 'consultations_pre_compra' : 'consultations_pos_compra';
    const meetingRoomField = finalScheduleType === 'pre_compra' ? 'consultations_pre_compra_id' : 'consultations_pos_compra_id';
    const consultationType = finalScheduleType === 'pre_compra' ? 'pre-compra' : 'pos-compra';

    // Create consultation
    const consultationData = {
      client_id,
      scheduled_date,
      scheduled_time: normalizedTime,
      description,
      duration_minutes: finalDuration,
      status: 'agendada'
    };

    // Add coupon fields if provided
    if (coupon_code_used) {
      consultationData.coupon_code_used = coupon_code_used;
    }
    if (coupon_id) {
      consultationData.coupon_id = coupon_id;
    }

    const { data: consultation, error: consultationError } = await supabaseClient
      .from(tableName)
      .insert(consultationData)
      .select()
      .single();

    if (consultationError) {
      console.error('Error creating consultation:', consultationError);
      return new Response(
        JSON.stringify({ error: 'Failed to create consultation', details: consultationError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Consultation created:', consultation);

    // Create meeting room automatically
    const roomToken = `room-${consultation.id}-${Date.now()}`;
    const roomName = `Consulta ${consultationType} - ${scheduled_date} ${normalizedTime}`;
    const scheduledAt = `${scheduled_date}T${normalizedTime}:00`;

    const meetingRoomData = {
      consultation_id: consultation.id,
      [meetingRoomField]: consultation.id,
      room_token: roomToken,
      name: roomName,
      description: description || `Sala para consulta ${consultationType}`,
      type: consultationType,
      scheduled_at: scheduledAt,
      is_active: true,
      created_manually: false
    };

    const { data: meetingRoom, error: roomError } = await supabaseClient
      .from('meeting_rooms')
      .insert(meetingRoomData)
      .select()
      .single();

    if (roomError) {
      console.error('Error creating meeting room:', roomError);
      // Don't fail the entire operation if room creation fails
      console.log('Consultation created successfully, but meeting room creation failed');
    } else {
      console.log('Meeting room created:', meetingRoom);
    }

    const response = {
      success: true,
      consultation,
      meeting_room: meetingRoom || null,
      message: meetingRoom ? 'Consultation and meeting room created successfully' : 'Consultation created successfully, but meeting room creation failed'
    };

    console.log('Sending response:', response);

    return new Response(
      JSON.stringify(response),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});