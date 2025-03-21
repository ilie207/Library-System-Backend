import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  if (req.method === "POST") {
    const { user_email, book_id } = await req.json();
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 30);

    const { data: existingBorrow } = await supabase
      .from("borrowed_books")
      .select("*")
      .eq("user_email", user_email)
      .eq("book_id", book_id)
      .eq("status", "borrowed")
      .single();

    if (existingBorrow) {
      return new Response(JSON.stringify({ error: "Already borrowed" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const { data: book } = await supabase
      .from("books")
      .select("available")
      .eq("id", book_id)
      .single();

    if (!book || book.available <= 0) {
      return new Response(JSON.stringify({ error: "Book not available" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const { data, error } = await supabase
      .from("borrowed_books")
      .insert({
        user_email,
        book_id,
        borrow_date: new Date().toISOString(),
        return_date: returnDate.toISOString(),
        status: "borrowed",
      })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from("books")
      .update({ available: book.available - 1 })
      .eq("id", book_id);

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
