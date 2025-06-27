import { Request, Response } from 'express';
import { supabase } from '../supabase/client';

export async function getStockHandler(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { data: stockItems, error } = await supabase
            .from('stock')
            .select('id, item, quantity, unit_type, max_capacity, reserved_quantity')
            .order('item', { ascending: true });

        if (error) {
            throw error;
        }

        const stockWithPercentage = stockItems.map((stock) => {
            const percentage_left = stock.max_capacity && stock.max_capacity > 0
                ? (Number(stock.quantity) / Number(stock.max_capacity)) * 100
                : null;

            return {
                ...stock,
                percentage_left: percentage_left !== null ? Math.round(percentage_left * 100) / 100 : null,
            };
        });

        res.status(200).json({ success: true, stock: stockWithPercentage });
    } catch (error: any) {
        console.error('Get stock error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
