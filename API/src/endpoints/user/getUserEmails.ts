import { Request, Response } from "express";
import { supabase } from "../../supabase/client";

export async function getUserEmailsHandler(req: Request, res: Response): Promise<void> {
    try {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;

        const emails = data.users.map(user => user.email);

        res.status(200).json({
            success: true,
            emails
        });
    } catch (error: any) {
        console.error("Get user emails error:", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
}
