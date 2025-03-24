
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase URL and service role key are required');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // SQL to create necessary tables for inspections
    const sql = `
-- Add sub_checklist_id column to checklist_itens if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'checklist_itens' AND column_name = 'sub_checklist_id'
  ) THEN
    ALTER TABLE public.checklist_itens 
    ADD COLUMN sub_checklist_id UUID REFERENCES public.checklists(id);
  END IF;
END $$;

-- Add parent_question_id column to checklists if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'checklists' AND column_name = 'parent_question_id'
  ) THEN
    ALTER TABLE public.checklists 
    ADD COLUMN parent_question_id UUID REFERENCES public.checklist_itens(id);
  END IF;
END $$;

-- Create inspections table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  checklist_id UUID NOT NULL REFERENCES public.checklists(id),
  company_id UUID REFERENCES public.companies(id),
  location_name TEXT,
  responsible_id UUID REFERENCES public.users(id),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inspection_responses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.inspection_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.checklist_itens(id),
  response TEXT,
  comment TEXT,
  action_plan TEXT,
  attachments TEXT[],
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(inspection_id, question_id)
);

-- Enable Row Level Security (RLS) for inspections and responses
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inspections
DROP POLICY IF EXISTS "Users can view any inspection" ON public.inspections;
CREATE POLICY "Users can view any inspection" ON public.inspections
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create inspections" ON public.inspections;  
CREATE POLICY "Users can create inspections" ON public.inspections
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update any inspection" ON public.inspections;
CREATE POLICY "Users can update any inspection" ON public.inspections
  FOR UPDATE USING (true);

-- Create RLS policies for inspection_responses
DROP POLICY IF EXISTS "Users can view any response" ON public.inspection_responses;
CREATE POLICY "Users can view any response" ON public.inspection_responses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert responses" ON public.inspection_responses;
CREATE POLICY "Users can insert responses" ON public.inspection_responses
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update any response" ON public.inspection_responses;
CREATE POLICY "Users can update any response" ON public.inspection_responses
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete responses" ON public.inspection_responses;
CREATE POLICY "Users can delete responses" ON public.inspection_responses
  FOR DELETE USING (true);
    `;

    // Execute the SQL
    const { error } = await supabase.rpc('pgmoon', { query: sql });
    
    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Inspection schema initialized successfully"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error initializing inspection schema:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error occurred"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
