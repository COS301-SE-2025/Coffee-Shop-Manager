import { Request, Response } from "express";
import { spawn } from "child_process";
import path from "path";

export async function getRecommendationsHandler(req: Request, res: Response): Promise<void> {
    try {
        const supabase = req.supabase!;
        const userId = req.user!.id;
        const { lat, lon } = req.query;

        if (!userId || !lat || !lon) {
            res.status(400).json({ error: "Missing userId, lat, or lon" });
            return;
        }

        // Fetch user's orders
        const { data: orders, error } = await supabase
            .from("orders")
            .select(`
                id,
                user_id,
                status,
                total_price,
                created_at,
                updated_at,
                order_products (
                    product_id,
                    quantity,
                    price
                )
            `)
            .eq("user_id", userId)
            .order("created_at", { ascending: true });

        if (error) {
            res.status(500).json({ error: "Failed to fetch orders" });
            return;
        }

        const inputData = { data: orders };

        // const scriptPath = path.resolve(__dirname, "../../../Prediction/main.py");
        const scriptPath = path.join(process.cwd(), "Prediction/main.py");

        const py = spawn("python3", [
            scriptPath,
            userId,
            lat.toString(),
            lon.toString(),
            "--json"
        ]);

        let output = "";
        let errorOutput = "";

        py.stdout.on("data", (data) => {
            output += data.toString();
        });

        py.stderr.on("data", (data) => {
            errorOutput += data.toString();
        });

        py.on("close", (code) => {
            if (code !== 0) {
                console.error("Python process failed:", errorOutput);
                res.status(500).json({ error: "Recommendation engine failed" });
                return;
            }

            try {
                const recommendations = JSON.parse(output);
                res.status(200).json({
                    success: true,
                    recommendations
                });
            } catch (err: any) {
                console.error("Failed to parse Python output:", output, err);
                res.status(500).json({ error: "Failed to parse recommendation result" });
            }
        });

        // Send inputData as JSON to Python's stdin
        py.stdin.write(JSON.stringify(inputData));
        py.stdin.end();

    } catch (error: any) {
        console.error("Get recommendations error:", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
}