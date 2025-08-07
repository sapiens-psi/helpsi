import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AvailableSlot {
  time: string;
  slot_time: string;
  maxConsultations: number;
  max_consultations: number;
  current_bookings: number;
  availableSpots: number;
  available_spots: number;
  displayTime: string;
  display_time: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables:', { supabaseUrl: !!supabaseUrl, supabaseServiceKey: !!supabaseServiceKey });
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const requestBody = await req.json();
    const { date, schedule_type, scheduleType } = requestBody;
    
    // Accept both schedule_type and scheduleType for compatibility
    const finalScheduleType = schedule_type || scheduleType;
    console.log('Request data:', { date, schedule_type, scheduleType, finalScheduleType });

    // Validate input parameters
    if (!date || !finalScheduleType) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: date and schedule_type (or scheduleType)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return new Response(
        JSON.stringify({ error: 'Invalid date format. Use YYYY-MM-DD' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate schedule_type
    if (!['pos_compra', 'pre_compra'].includes(finalScheduleType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid schedule_type. Use pos_compra or pre_compra' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get day of week from date
    const targetDate = new Date(date + 'T00:00:00');
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[targetDate.getDay()];

    console.log('Target date info:', { date, dayOfWeek });

    // Determine which tables to use based on schedule_type
    const slotsTable = finalScheduleType === 'pos_compra' ? 'schedule_slots_pos_compra' : 'schedule_slots_pre_compra';
    const consultationsTable = finalScheduleType === 'pos_compra' ? 'consultations_pos_compra' : 'consultations_pre_compra';
    const configTable = finalScheduleType === 'pos_compra' ? 'schedule_config_pos_compra' : 'schedule_config_pre_compra';

    // Get available slots for the specific day
    const { data: slots, error: slotsError } = await supabase
      .from(slotsTable)
      .select('*')
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .order('start_time');

    if (slotsError) {
      console.error('Error fetching slots:', slotsError);
      return new Response(
        JSON.stringify({ error: 'Error fetching available slots', details: slotsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!slots || slots.length === 0) {
      console.log('No slots found for:', { dayOfWeek, finalScheduleType });
      return new Response(
        JSON.stringify({ slots: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found slots:', slots.length);

    // Get existing consultations for the date
    const { data: consultations, error: consultationsError } = await supabase
      .from(consultationsTable)
      .select('scheduled_time')
      .eq('scheduled_date', date)
      .in('status', ['agendada', 'confirmada']); // Only count active consultations

    if (consultationsError) {
      console.error('Error fetching consultations:', consultationsError);
      return new Response(
        JSON.stringify({ error: 'Error fetching consultations', details: consultationsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found consultations:', consultations?.length || 0);

    // Count consultations by time
    const consultationCounts: { [key: string]: number } = {};
    if (consultations) {
      consultations.forEach(consultation => {
        const timeKey = consultation.scheduled_time;
        consultationCounts[timeKey] = (consultationCounts[timeKey] || 0) + 1;
      });
    }

    // Build available slots response
    const availableSlots: AvailableSlot[] = slots
      .map(slot => {
        const currentBookings = consultationCounts[slot.start_time] || 0;
        const availableSpots = Math.max(0, (slot.max_consultations || 1) - currentBookings);
        
        // Format time for display (HH:MM)
        const timeFormatted = slot.start_time.substring(0, 5);
        
        return {
          time: slot.start_time,
          slot_time: slot.start_time,
          maxConsultations: slot.max_consultations || 1,
          max_consultations: slot.max_consultations || 1,
          current_bookings: currentBookings,
          availableSpots: availableSpots,
          available_spots: availableSpots,
          displayTime: timeFormatted,
          display_time: timeFormatted
        };
      })
      .filter(slot => slot.available_spots > 0); // Only return slots with availability

    console.log('Available slots result:', availableSlots.length);

    return new Response(
      JSON.stringify({ slots: availableSlots }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});