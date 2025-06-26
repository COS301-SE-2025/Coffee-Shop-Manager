import { Request, Response } from 'express';
import { supabase } from '../supabase/client';

interface ProductInput {
  product_id?: string;
  name?: string;
  quantity: number;
}

export async function createOrderHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { products } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      res.status(400).json({ error: 'Products list is required' });
      return;
    }

    const validationError = validateProductInputs(products);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    const resolvedProducts = await resolveProductReferences(products);
    if ('error' in resolvedProducts) {
      res.status(400).json({ error: resolvedProducts.error });
      return;
    }

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{ user_id: userId }])
      .select('*')
      .single();

    if (orderError) throw orderError;

    const finalOrderProducts = resolvedProducts.matched.map(p => ({
      order_id: orderData.id,
      product_id: p.product_id,
      quantity: p.quantity,
    }));

    const { error: insertError } = await supabase
      .from('order_products')
      .insert(finalOrderProducts);

    if (insertError) throw insertError;

    res.status(201).json({
      success: true,
      order_id: orderData.id,
      message: 'Order created successfully',
    });
    return;
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
    return;
  }
}

function validateProductInputs(products: ProductInput[]): string | null {
  for (const product of products) {
    if (!product.product_id && !product.name) {
      return 'Each product must have at least a product_id or a name';
    }
    if (!product.quantity || product.quantity <= 0) {
      return `Invalid quantity for product: ${product.name ?? product.product_id}`;
    }
  }
  return null;
}

async function resolveProductReferences(products: ProductInput[]): Promise<
  { matched: { product_id: string; quantity: number }[] } | { error: string } >
  {
  const ids = products.map(p => p.product_id).filter(Boolean);
  const names = products.map(p => p.name).filter(Boolean);

  const { data: foundProducts, error } = await supabase
    .from('products')
    .select('id, name')
    .or([
      ids.length ? `id.in.(${ids.join(',')})` : '',
      names.length ? `name.in.(${names.map(n => `"${n}"`).join(',')})` : '',
    ].filter(Boolean).join(','));

  if (error) return { error: error.message };

  const matched: { product_id: string; quantity: number }[] = [];
  const missing: string[] = [];

  for (const p of products) {
    let matchedProduct;

    if (p.product_id) {
      matchedProduct = foundProducts?.find(fp => fp.id === p.product_id);
    } else if (p.name) {
      matchedProduct = foundProducts?.find(fp => fp.name === p.name);
    }

    if (!matchedProduct) {
      missing.push(p.name || p.product_id!);
    } else {
      matched.push({
        product_id: matchedProduct.id,
        quantity: p.quantity,
      });
    }
  }

  if (missing.length > 0) {
    return { error: `The following products were not found: ${missing.join(', ')}` };
  }

  return { matched };
}
