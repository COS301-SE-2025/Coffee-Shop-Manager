import { Request, Response } from 'express';
import { supabase } from '../supabase/client';

interface ModificationInput {
  stock_item: string; // name or id
  action: 'add' | 'remove' | 'replace';
  quantity?: number;
}

interface ProductInput {
  product: string; // name or id
  quantity: number;
  custom?: any;
  modifications?: ModificationInput[];
}

export async function createOrderHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { products }: { products: ProductInput[] } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      res.status(400).json({ error: 'Products list is required' });
      return;
    }

    // Validate input
    for (const p of products) {
      if (!p.product || !p.quantity || p.quantity <= 0) {
        res.status(400).json({ error: 'Each product must have a name or ID and a valid quantity' });
        return;
      }
    }

    // Resolve product names or IDs
    const productNames = products.map(p => p.product).filter(p => typeof p === 'string');
    const { data: allProducts, error: productFetchError } = await supabase
      .from('products')
      .select('id, name');

    if (productFetchError || !allProducts) throw productFetchError;

    const resolvedProducts = products.map(p => {
      const match = allProducts.find(prod => prod.id === p.product || prod.name === p.product);
      if (!match) throw new Error(`Product not found: ${p.product}`);
      return { ...p, product_id: match.id };
    });

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ user_id: userId }])
      .select('id')
      .single();

    if (orderError || !order) throw orderError;

    // Build order_products insert array
    const orderProductsToInsert: {
      order_id: string;
      product_id: string;
      quantity: number;
      custom: any;
    }[] = [];

    // Map of inserted order_product index → product index
    const orderProductToOriginalIndexMap: number[] = [];

    for (let i = 0; i < resolvedProducts.length; i++) {
      const p = resolvedProducts[i];
      for (let j = 0; j < p.quantity; j++) {
        orderProductsToInsert.push({
          order_id: order.id,
          product_id: p.product_id,
          quantity: 1,
          custom: p.custom ?? {},
        });
        orderProductToOriginalIndexMap.push(i);
      }
    }

    // Insert order_products and get IDs
    const { data: insertedOrderProducts, error: insertOrderError } = await supabase
      .from('order_products')
      .insert(orderProductsToInsert)
      .select('id');

    if (insertOrderError || !insertedOrderProducts) throw insertOrderError;

    // Resolve stock items (names or ids)
    const allStockItems = resolvedProducts.flatMap(p => p.modifications ?? []).map(m => m.stock_item);
    const { data: stockData, error: stockError } = await supabase
      .from('stock')
      .select('id, item');

    if (stockError || !stockData) throw stockError;

    // Prepare modifications insert
    const modificationsToInsert: {
      order_product_id: string;
      stock_id: string;
      action: 'add' | 'remove' | 'replace';
      quantity?: number;
    }[] = [];

    insertedOrderProducts.forEach((op, idx) => {
      const originalIdx = orderProductToOriginalIndexMap[idx];
      const product = resolvedProducts[originalIdx];
      const mods = product.modifications || [];

      for (const mod of mods) {
        const matchedStock = stockData.find(s => s.id === mod.stock_item || s.item === mod.stock_item);
        if (!matchedStock) {
          throw new Error(`Stock item not found: ${mod.stock_item}`);
        }

        modificationsToInsert.push({
          order_product_id: op.id,
          stock_id: matchedStock.id,
          action: mod.action,
          quantity: mod.quantity,
        });
      }
    });

    // Insert modifications
    if (modificationsToInsert.length > 0) {
      const { error: modsError } = await supabase
        .from('custom_order_modifications')
        .insert(modificationsToInsert);

      if (modsError) throw modsError;
    }

    res.status(201).json({
      success: true,
      order_id: order.id,
      message: 'Order created with customizations',
    });

  } catch (err: any) {
    console.error('Order creation failed:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
