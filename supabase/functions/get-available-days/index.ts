import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { scheduleType = 'pos_compra', startDate, endDate } = await req.json()

    // Validar tipo de agendamento
    if (!['pos_compra', 'pre_compra'].includes(scheduleType)) {
      return new Response(
        JSON.stringify({ error: 'Tipo de agendamento inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Definir datas padrão se não fornecidas
    const today = new Date().toISOString().split('T')[0]
    const twoMonthsLater = new Date()
    twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2)
    const defaultEndDate = twoMonthsLater.toISOString().split('T')[0]

    const finalStartDate = startDate || today
    const finalEndDate = endDate || defaultEndDate

    // Determinar tabelas baseado no tipo de agendamento
    const slotsTable = scheduleType === 'pos_compra' ? 'schedule_slots_pos_compra' : 'schedule_slots_pre_compra'
    const consultationsTable = scheduleType === 'pos_compra' ? 'consultations_pos_compra' : 'consultations_pre_compra'

    console.log(`Checking availability for date range: ${finalStartDate} to ${finalEndDate}`)

    // Buscar todos os slots configurados
    const { data: allSlots, error: slotsError } = await supabaseClient
      .from(slotsTable)
      .select('day_of_week, start_time, max_consultations')
      .eq('is_active', true)

    if (slotsError) {
      console.error('Error fetching slots:', slotsError)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar configurações de horário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!allSlots || allSlots.length === 0) {
      return new Response(
        JSON.stringify({ availableDays: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar todas as consultas no período
    const { data: allConsultations, error: consultationsError } = await supabaseClient
      .from(consultationsTable)
      .select('scheduled_date, scheduled_time')
      .gte('scheduled_date', finalStartDate)
      .lte('scheduled_date', finalEndDate)
      .in('status', ['agendada', 'confirmada'])

    if (consultationsError) {
      console.error('Error fetching consultations:', consultationsError)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar consultas existentes' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar mapa de consultas por data e horário
    const consultationCounts: { [key: string]: { [key: string]: number } } = {}
    if (allConsultations) {
      allConsultations.forEach(consultation => {
        const dateKey = consultation.scheduled_date
        const timeKey = consultation.scheduled_time
        if (!consultationCounts[dateKey]) {
          consultationCounts[dateKey] = {}
        }
        consultationCounts[dateKey][timeKey] = (consultationCounts[dateKey][timeKey] || 0) + 1
      })
    }

    // Criar mapa de slots por dia da semana
    const slotsByDay: { [key: string]: Array<{start_time: string, max_consultations: number}> } = {}
    allSlots.forEach(slot => {
      if (!slotsByDay[slot.day_of_week]) {
        slotsByDay[slot.day_of_week] = []
      }
      slotsByDay[slot.day_of_week].push({
        start_time: slot.start_time,
        max_consultations: slot.max_consultations || 1
      })
    })

    // Gerar e verificar datas disponíveis
    const availableDays = []
    const currentDate = new Date(finalStartDate)
    const endDateObj = new Date(finalEndDate)
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    
    while (currentDate <= endDateObj) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const dayOfWeek = dayNames[currentDate.getDay()]
      
      // Verificar se há slots configurados para este dia da semana
      const daySlots = slotsByDay[dayOfWeek] || []
      
      if (daySlots.length > 0) {
        // Verificar se há pelo menos um slot disponível
        const hasAvailableSlot = daySlots.some(slot => {
          const currentBookings = consultationCounts[dateStr]?.[slot.start_time] || 0
          return currentBookings < slot.max_consultations
        })
        
        if (hasAvailableSlot) {
          availableDays.push({ available_date: dateStr })
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    console.log(`Found ${availableDays.length} available days out of ${Math.ceil((endDateObj.getTime() - new Date(finalStartDate).getTime()) / (1000 * 60 * 60 * 24))} total days`)

    return new Response(
      JSON.stringify({ availableDays }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro na Edge Function:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})