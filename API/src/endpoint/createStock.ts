import { Request, Response } from 'express';
import { supabase } from '../supabase/client';

type CreateEntry = {
  item: string;
  quantity: number;
  unit_type: string;
  max_capacity?: number;
  reserved_quantity?: number;
};

export async function createStockHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const entries: CreateEntry[] = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      res.status(400).json({ error: 'Request body must be a non-empty array of stock items' });
      return;
    }

    const createdItems: string[] = [];
    const failedItems: { item: string; reason: string }[] = [];

    for (const entry of entries) {
      const { item, quantity, unit_type, max_capacity, reserved_quantity } = entry;

      // Basic validation
      if (!item || quantity === undefined || !unit_type) {
        failedItems.push({ item: item ?? 'unknown', reason: 'Missing required fields' });
        continue;
      }

      // Check if item already exists
      const { data: existingItem, error: checkError } = await supabase
        .from('stock')
        .select('id')
        .eq('item', item)
        .single();

      if (existingItem && !checkError) {
        failedItems.push({ item, reason: 'Item already exists' });
        continue;
      }

      const newStock: Record<string, any> = { item, quantity, unit_type };
      if (max_capacity !== undefined) newStock.max_capacity = max_capacity;
      if (reserved_quantity !== undefined) newStock.reserved_quantity = reserved_quantity;

      const { error: insertError } = await supabase.from('stock').insert([newStock]);

      if (insertError) {
        failedItems.push({ item, reason: insertError.message });
        continue;
      }

      createdItems.push(item);
    }

    res.status(201).json({
      success: true,
      createdItems,
      failedItems: failedItems.length > 0 ? failedItems : undefined,
    });
  } catch (error: any) {
    console.error('Create stock error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
