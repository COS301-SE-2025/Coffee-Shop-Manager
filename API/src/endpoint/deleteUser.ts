import { Request, Response } from "express";
import { supabase } from "../supabase/client";

export async function deleteUserHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.params.id || req.body.user_id;

    if (!userId) {
      res.status(400).json({ success: false, message: "User ID is required" });
      return;
    }

    const { data, error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    res.status(200).json({
      success: true,
      message: `User ${userId} deleted successfully.`,
    });
    return;
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
}
