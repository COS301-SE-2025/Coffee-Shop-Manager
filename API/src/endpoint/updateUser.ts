import { Request, Response } from "express";
import { supabase } from "../supabase/client";

export async function updateUserProfileHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.params.id;
    if (!userId) {
      res.status(400).json({ success: false, message: "User ID is required" });
      return;
    }

    const allowedFields = ["display_name", "date_of_birth", "phone_number"];
    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (field in req.body) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      res
        .status(400)
        .json({ success: false, message: "No valid fields to update" });
      return;
    }

    const { data: updatedProfile, error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!updatedProfile) {
      res
        .status(404)
        .json({ success: false, message: "User profile not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (err: any) {
    console.error("Update profile error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}
