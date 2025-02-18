
import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/adminClient";
import { User, UserRole } from "@/types/user";

export async function fetchUsers(): Promise<User[]> {
  const { data: usersData, error: usersError } = await supabase
    .from("users")
    .select("id, name, email, roles, status")
    .order("name", { ascending: true });

  if (usersError) throw usersError;
  if (!usersData) return [];

  const usersWithDetails = await Promise.all(
    usersData.map(async (user) => {
      const { data: companiesData } = await supabase
        .from("user_companies")
        .select("company:company_id(fantasy_name)")
        .eq("user_id", user.id as string);

      const { data: checklistsData } = await supabase
        .from("user_checklists")
        .select("checklist_id")
        .eq("user_id", user.id as string);

      return {
        id: user.id as string,
        name: user.name || "",
        email: user.email || "",
        roles: user.roles || [],
        status: user.status || "active",
        companies: companiesData?.map(c => c.company?.fantasy_name).filter(Boolean) || [],
        checklists: checklistsData?.map(c => c.checklist_id).filter(Boolean) || []
      } as User;
    })
  );

  return usersWithDetails;
}

export async function createOrUpdateUser(
  user: Omit<User, "id">,
  selectedUser: User | null,
  selectedCompanies: string[],
  selectedChecklists: string[]
) {
  if (!user.email || !user.email.trim()) {
    throw new Error("O email é obrigatório");
  }

  if (!user.email.includes("@")) {
    throw new Error("Email inválido");
  }

  let userId = selectedUser?.id;

  if (!userId) {
    // First, check if the user already exists in our database
    const { data: existingUser, error: existingUserError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", user.email.trim())
      .maybeSingle();

    if (existingUserError) throw existingUserError;
    if (existingUser) {
      throw new Error("Um usuário com este email já está cadastrado");
    }

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email.trim(),
        password: "temporary123",
        email_confirm: true,
        user_metadata: { name: user.name }
      });

      if (authError) {
        // Handle specific auth errors
        if (authError.message.includes("email_exists") || authError.message.includes("already been registered")) {
          throw new Error("Um usuário com este email já está cadastrado");
        }
        throw authError;
      }

      userId = authData.user?.id;
      if (!userId) throw new Error("Falha ao criar usuário");

      // Wait a moment to ensure the auth user is fully created
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Insert into users table
      const { error: insertError } = await supabaseAdmin
        .from("users")
        .insert({
          id: userId,
          name: user.name,
          email: user.email.trim(),
          roles: user.roles,
          status: user.status
        });

      if (insertError) {
        // If insert fails, try to clean up the auth user
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw insertError;
      }
    } catch (error: any) {
      // If anything fails after auth user creation, try to clean up
      if (userId) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(userId);
        } catch (cleanupError) {
          console.error("Failed to cleanup auth user after error:", cleanupError);
        }
      }
      throw error;
    }
  } else {
    // Update existing user
    await supabaseAdmin
      .from("users")
      .update({
        name: user.name,
        roles: user.roles,
        status: user.status
      })
      .eq("id", userId);
  }

  await updateUserAssociations(userId, selectedCompanies, selectedChecklists);
  await updateUserRole(userId, user.roles[0] as UserRole);

  return userId;
}

async function updateUserAssociations(
  userId: string,
  selectedCompanies: string[],
  selectedChecklists: string[]
) {
  if (selectedCompanies.length > 0) {
    await supabaseAdmin
      .from("user_companies")
      .delete()
      .eq("user_id", userId);

    const companyAssignments = selectedCompanies.map(companyId => ({
      user_id: userId,
      company_id: companyId
    }));

    await supabaseAdmin
      .from("user_companies")
      .insert(companyAssignments);
  }

  if (selectedChecklists.length > 0) {
    await supabaseAdmin
      .from("user_checklists")
      .delete()
      .eq("user_id", userId);

    const checklistAssignments = selectedChecklists.map(checklistId => ({
      user_id: userId,
      checklist_id: checklistId
    }));

    await supabaseAdmin
      .from("user_checklists")
      .insert(checklistAssignments);
  }
}

async function updateUserRole(userId: string, role: UserRole) {
  if (role === "Administrador") {
    await supabaseAdmin
      .from("user_roles")
      .upsert({
        user_id: userId,
        role: "admin"
      }, {
        onConflict: "user_id"
      });
  }
}

export async function deleteUserById(userId: string) {
  await supabaseAdmin.auth.admin.deleteUser(userId);
  await supabaseAdmin
    .from("users")
    .delete()
    .eq("id", userId);
}
