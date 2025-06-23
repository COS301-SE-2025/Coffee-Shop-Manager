import { Request, Response } from 'express';
import { supabase } from '../supabase/client';

interface ProductInput {
  product_id?: string;
  name?: string;
  quantity: number;
}

export async function createOrderHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { products } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products list is required' });
    }

    for (const p of products) {
      if (!p.product_id && !p.name) {
        return res.status(400).json({ error: 'Each product must have at least a product_id or a name' });
      }
    }

    const ids = products.map(p => p.product_id).filter(Boolean);
    const names = products.map(p => p.name).filter(Boolean);

    const { data: allProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, name')
      .or([
        ids.length > 0 ? `id.in.(${ids.join(',')})` : '',
        names.length > 0 ? `name.in.(${names.map(n => `"${n}"`).join(',')})` : '',
      ].filter(Boolean).join(','));

    if (fetchError) throw fetchError;
    if (!allProducts || allProducts.length < products.length) {
      return res.status(400).json({ error: 'One or more products were not found' });
    }

    const productMap = new Map(allProducts.map(p => [p.id, p]));
    const nameMap = new Map(allProducts.map(p => [p.name, p]));

    const orderProducts = [];

    for (const p of products) {
      let matchedProduct = null;

      if (p.product_id && productMap.has(p.product_id)) {
        matchedProduct = productMap.get(p.product_id);
      } else if (p.name && nameMap.has(p.name)) {
        matchedProduct = nameMap.get(p.name);
      }

      if (!matchedProduct) {
        return res.status(400).json({ error: `Product not found: ${p.name || p.product_id}` });
      }

      orderProducts.push({
        order_id: null,
        product_id: matchedProduct.id,
        quantity: p.quantity,
      });
    }

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{ user_id: userId }])
      .select('*')
      .single();

    if (orderError) throw orderError;

    const orderId = orderData.id;

    const finalOrderProducts = orderProducts.map(op => ({
      ...op,
      order_id: orderId,
    }));

    const { error: insertError } = await supabase
      .from('order_products')
      .insert(finalOrderProducts);

    if (insertError) throw insertError;

    return res.status(201).json({
      success: true,
      order_id: orderId,
      message: 'Order created successfully',
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
