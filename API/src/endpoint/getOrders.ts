import { Request, Response } from 'express';
import { supabase } from '../supabase/client';

export async function getOrdersHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total_price,
        created_at,
        updated_at,
        order_products (
          quantity,
          price,
          product_id,
          products:product_id (
            name,
            description,
            price
          )
        ),
        payments (
          id,
          method,
          amount,
          status,
          transaction_id,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (ordersError) {
      throw ordersError;
    }

    res.status(200).json({ success: true, orders });
  } catch (error: any) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
