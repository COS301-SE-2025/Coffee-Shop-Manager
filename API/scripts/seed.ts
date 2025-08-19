import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_PUBLIC_DOCKER_URL!;
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const TEST_USER_EMAIL = "testuser@example.com";
const TEST_USER_PASSWORD = "P@ssword123";

async function main() {
  const { data: usersList, error: listError } =
    await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("Error listing users:", listError);
    return;
  }

  const existingUser = usersList?.users?.find(
    (user) => user.email === TEST_USER_EMAIL,
  );
  let userId: string;

  if (existingUser) {
    console.log("User already exists.");
    userId = existingUser.id;
  } else {
    const { data: newUserData, error: createUserError } =
      await supabase.auth.admin.createUser({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
        email_confirm: true,
      });

    if (createUserError || !newUserData.user) {
      console.error("Error creating user:", createUserError);
      return;
    }

    console.log("User created:", newUserData.user.email);
    userId = newUserData.user.id;
  }

  await createTestOrders(userId);
}

async function createTestOrders(userId: string) {
  // Order 1: Ice Coffee (2), Muffin (1)
  const { data: order1, error: order1Error } = await supabase
    .from("orders")
    .insert([{ user_id: userId, status: "created" }])
    .select("id")
    .single();

  if (order1Error || !order1) {
    console.error("Error creating order 1:", order1Error);
    return;
  }

  const { data: order2, error: order2Error } = await supabase
    .from("orders")
    .insert([{ user_id: userId, status: "created" }])
    .select("id")
    .single();

  if (order2Error || !order2) {
    console.error("Error creating order 2:", order2Error);
    return;
  }

  // Fetch product IDs
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name");

  if (productsError || !products) {
    console.error("Error fetching products:", productsError);
    return;
  }

  const getProductId = (name: string) =>
    products.find((p) => p.name === name)?.id;

  const iceCoffeeId = getProductId("Ice Coffee");
  const muffinId = getProductId("Muffin");
  const latteId = getProductId("Latte");

  if (!iceCoffeeId || !muffinId || !latteId) {
    console.error("Missing one or more product IDs");
    return;
  }

  // Insert order_products
  const { error: orderProductsError } = await supabase
    .from("order_products")
    .insert([
      {
        order_id: order1.id,
        product_id: iceCoffeeId,
        quantity: 2,
      },
      {
        order_id: order1.id,
        product_id: muffinId,
        quantity: 1,
      },
      {
        order_id: order2.id,
        product_id: latteId,
        quantity: 1,
      },
    ]);

  if (orderProductsError) {
    console.error("Error inserting order products:", orderProductsError);
    return;
  }

  console.log("Sample orders created for user:", userId);
}

main();
