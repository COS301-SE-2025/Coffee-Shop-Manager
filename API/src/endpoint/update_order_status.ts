import { Request, Response } from 'express';
import { supabase } from '../supabase/client';

export async function updateOrderStatusHandler(req: Request, res: Response): Promise<void> {
  try {
    const { order_id, status } = req.body;

    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!order_id || typeof status !== 'string') {
      res.status(400).json({ success: false, message: 'Missing order_id or status' });
      return;
    }

    const validStatuses = ['pending', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', order_id)
      .select('*')
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: `Order ${order_id} updated to ${status}`,
      order: data,
    });
  } catch (err: any) {
    console.error('❌ Error updating order status:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }
}
