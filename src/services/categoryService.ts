import { supabase } from "../lib/supabaseClient";

export const getCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  return { data, error };
};