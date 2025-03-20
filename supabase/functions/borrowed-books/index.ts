import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  if (req.method === "POST") {
    const { user_id, book_id } = await req.json();

    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("available")
      .eq("id", book_id)
      .single();

    if (bookError || !book || book.available <= 0) {
      return new Response(JSON.stringify({ error: "Book not available" }), {
        status: 400,
      });
    }

    const { data, error } = await supabase
      .from("borrowed_books")
      .insert({
        user_id,
        book_id,
        borrow_date: new Date().toISOString(),
        status: "borrowed",
      })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    await supabase
      .from("books")
      .update({ available: book.available - 1 })
      .eq("id", book_id);

    return new Response(JSON.stringify(data), { status: 200 });
  }
});
