import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  if (req.method === "GET") {
    const { data, error } = await supabase.from("books").select("*");

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "POST") {
    const bookData = await req.json();

    const { data, error } = await supabase
      .from("books")
      .insert([
        {
          title: bookData.title,
          author: bookData.author,
          available: bookData.total_copies,
          total_copies: bookData.total_copies,
          cover_image: bookData.cover_image,
          genre: bookData.genre,
          description: bookData.description,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "PUT") {
    const bookData = await req.json();

    const { data, error } = await supabase
      .from("books")
      .update({
        title: bookData.title,
        author: bookData.author,
        available: bookData.total_copies,
        total_copies: bookData.total_copies,
        cover_image: bookData.cover_image,
        genre: bookData.genre,
        description: bookData.description,
      })
      .eq("id", bookData.id)
      .select();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "DELETE") {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const bookId = pathParts[pathParts.length - 1];

    if (!bookId || isNaN(parseInt(bookId))) {
      return new Response(JSON.stringify({ error: "Invalid book ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // does the book have any active borrowings?
    const { data: borrowings, error: borrowingsError } = await supabase
      .from("borrowed_books")
      .select("*")
      .eq("book_id", bookId)
      .eq("status", "borrowed");

    if (borrowingsError) {
      return new Response(JSON.stringify({ error: borrowingsError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // if so, deletion should be denied
    if (borrowings.length > 0) {
      return new Response(
        JSON.stringify({ error: "Cannot delete book with active borrowings" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // book deletion
    const { data, error } = await supabase
      .from("books")
      .delete()
      .eq("id", bookId);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
});
