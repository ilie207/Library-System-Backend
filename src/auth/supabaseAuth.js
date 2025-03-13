const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
if (error) return res.status(401).json({ error: error.message });

res.json(data);
