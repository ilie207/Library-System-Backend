import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function checkRole(req: Request, allowedRoles: string[]) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Get the user ID from the request headers or JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw new Error("No authorization header");
  }

  // Verify the token and get user info
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(authHeader.split(" ")[1]);

  if (error || !user) {
    throw new Error("Invalid authentication");
  }

  // Check user role
  const { data: userData, error: roleError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (roleError || !userData || !allowedRoles.includes(userData.role)) {
    throw new Error("Insufficient permissions");
  }

  return user;
}
