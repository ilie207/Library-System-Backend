import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  switch (req.method) {
    case "GET":
      const { data: users, error: fetchError } = await supabase
        .from("users")
        .select("id, email, f_name, l_name, role");

      if (fetchError) {
        return new Response(JSON.stringify({ error: fetchError.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(users), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    case "PUT":
      const updateBody = await req.json();
      const { data: updateData, error: updateError } = await supabase
        .from("users")
        .update({
          f_name: updateBody.f_name,
          l_name: updateBody.l_name,
          email: updateBody.email,
        })
        .eq("id", updateBody.id)
        .select();

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(updateData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    case "POST":
      const createBody = await req.json();
      const { data: insertData, error: insertError } = await supabase
        .from("users")
        .insert({
          email: createBody.email,
          f_name: createBody.f_name,
          l_name: createBody.l_name,
          role: createBody.role,
        })
        .select();

      if (insertError) {
        return new Response(JSON.stringify({ error: insertError.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(insertData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    default:
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
  }
});
