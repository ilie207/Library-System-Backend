import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

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
        headers: corsHeaders,
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
        headers: corsHeaders,
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
      headers: corsHeaders,
    });
  }

  if (req.method === "GET") {
    try {
      const url = new URL(req.url);
      const statsParam = url.searchParams.get("stats");
      const email = url.searchParams.get("email");
      const bookId = url.searchParams.get("bookId");

      if (email && bookId) {
        const { data, error } = await supabase
          .from("borrowed_books")
          .select("*")
          .eq("user_email", email)
          .eq("book_id", bookId)
          .eq("status", "borrowed");

        if (error) throw error;

        return new Response(JSON.stringify({ hasBorrowed: data.length > 0 }), {
          headers: corsHeaders,
        });
      }

      // return detailed statistics
      if (statsParam) {
        const { data: borrowedBooks, error } = await supabase
          .from("borrowed_books")
          .select("*");

        if (error) throw error;

        const totalBorrowed = borrowedBooks.filter(
          (book) => book.status === "borrowed"
        ).length;

        const today = new Date();
        const pendingReturns = borrowedBooks.filter(
          (book) =>
            book.status === "borrowed" && new Date(book.return_date) < today
        ).length;

        // last 10 borrows
        const recentBorrows = borrowedBooks
          .filter((book) => book.status === "borrowed")
          .sort((a, b) => new Date(b.borrow_date) - new Date(a.borrow_date))
          .slice(0, 10);

        // last 10 returns
        const recentReturns = borrowedBooks
          .filter((book) => book.status === "returned")
          .sort((a, b) => {
            const dateA = a.return_date
              ? new Date(a.return_date)
              : new Date(a.borrow_date);
            const dateB = b.return_date
              ? new Date(b.return_date)
              : new Date(b.borrow_date);
            return dateB - dateA;
          })
          .slice(0, 10);

        return new Response(
          JSON.stringify({
            totalBorrowed,
            pendingReturns,
            recentBorrows,
            recentReturns,
          }),
          {
            headers: corsHeaders,
          }
        );
      }

      // return all borrowed books
      const { data: borrowedBooks, error } = await supabase
        .from("borrowed_books")
        .select("*");

      if (error) throw error;

      return new Response(JSON.stringify(borrowedBooks), {
        headers: corsHeaders,
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: corsHeaders,
  });
});
