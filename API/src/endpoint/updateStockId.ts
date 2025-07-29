import { Request, Response } from 'express';
import { supabase } from '../supabase/client';

export async function updateStockByIdHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const fields = req.body;

    if (!id || typeof fields !== 'object' || Object.keys(fields).length === 0) {
      res.status(400).json({ error: 'Missing ID or update fields' });
      return;
    }

    const { data: existing, error: fetchError } = await supabase
      .from('stock')
      .select('id, item')
      .eq('id', id)
      .single();

    if (!existing || fetchError) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    const { error: updateError } = await supabase
      .from('stock')
      .update(fields)
      .eq('id', id);

    if (updateError) throw updateError;

    res.status(200).json({ success: true, updatedItem: existing.item });
  } catch (error: any) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
