import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { cardData } = await req.json();

    // Generate unique ID for QR code
    const qrCodeData = {
      userId: user.id,
      ...cardData,
      generatedAt: new Date().toISOString()
    };

    // Create QR code using an external service (quickchart.io)
    const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(JSON.stringify(qrCodeData))}&size=300`;

    // Upsert emergency card
    const { data, error } = await supabase
      .from('emergency_cards')
      .upsert({
        user_id: user.id,
        emergency_contact_name: cardData.emergency_contact_name,
        emergency_contact_phone: cardData.emergency_contact_phone,
        emergency_contact_relationship: cardData.emergency_contact_relationship,
        blood_type: cardData.blood_type,
        allergies: cardData.allergies,
        medications: cardData.medications,
        conditions: cardData.conditions,
        qr_code: qrCodeUrl,
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({ error: 'Failed to save emergency card' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});