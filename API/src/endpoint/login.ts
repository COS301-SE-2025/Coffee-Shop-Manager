import { Request, Response } from "express";
import { supabase } from "../supabase/client";

export async function loginHandler(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res
        .status(400)
        .json({ success: false, message: "Email and password required" });
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user || !data.session) {
      res
        .status(401)
        .json({ success: false, message: error?.message || "Login failed" });
      return;
    }

    const { access_token, refresh_token } = data.session;

    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000, // long time
    });

    // For mobile
    res.setHeader("x-access-token", access_token);
    res.setHeader("x-refresh-token", refresh_token);

    // res.status(200).json({
    //   success: true,
    //   username: data.user.user_metadata.display_name || "Mr. Bean",
    //   role: data.user.user_metadata.role
    // });

    // old response
    res.status(200).json({
      success: true,
      user: data.user,
      username: data.user.user_metadata.display_name || "Mr. Bean",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
