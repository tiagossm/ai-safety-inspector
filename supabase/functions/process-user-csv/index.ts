
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { parse } from 'https://deno.land/std@0.181.0/encoding/csv.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      throw new Error('No file uploaded')
    }

    const text = await file.text()
    const rows = parse(text, { skipFirstRow: true })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const importId = crypto.randomUUID()
    
    // Create import record
    await supabase.from('user_imports').insert({
      id: importId,
      filename: file.name,
      total_rows: rows.length,
      status: 'processing'
    })

    let processed = 0
    const errors = []

    for (const [name, email, role, phone, position] of rows) {
      try {
        // Create auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          password: crypto.randomUUID(), // temporary password
          user_metadata: { name }
        })

        if (authError) throw authError

        // Update user record
        await supabase.from('users').update({
          name,
          role: role || 'Técnico',
          phone,
          position,
        }).eq('id', authUser.user.id)

        processed++
      } catch (error) {
        errors.push({ row: processed + 1, error: error.message })
      }
    }

    // Update import status
    await supabase.from('user_imports').update({
      status: errors.length ? 'completed_with_errors' : 'completed',
      processed_rows: processed,
      error_log: errors
    }).eq('id', importId)

    return new Response(
      JSON.stringify({ success: true, processed, errors }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
