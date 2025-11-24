-- Create vending machines table
CREATE TABLE public.vending_machines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location_name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create machine inventory table (links products to specific machines)
CREATE TABLE public.machine_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id UUID NOT NULL REFERENCES public.vending_machines(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  current_stock INTEGER NOT NULL DEFAULT 0,
  max_capacity INTEGER NOT NULL DEFAULT 10,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(machine_id, product_id)
);

-- Create customer orders table
CREATE TABLE public.customer_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_phone TEXT NOT NULL,
  machine_id UUID NOT NULL REFERENCES public.vending_machines(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KWD',
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  loyalty_points_earned INTEGER DEFAULT 0,
  loyalty_points_redeemed INTEGER DEFAULT 0,
  order_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer order items table
CREATE TABLE public.customer_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.customer_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer loyalty points table
CREATE TABLE public.customer_loyalty_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_phone TEXT NOT NULL,
  current_balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_redeemed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(customer_phone)
);

-- Create loyalty transactions table
CREATE TABLE public.loyalty_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_phone TEXT NOT NULL,
  order_id UUID REFERENCES public.customer_orders(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'redeemed')),
  points INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ads/promotions table for splash screen
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create spin wheel prizes table
CREATE TABLE public.spin_wheel_prizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  prize_type TEXT NOT NULL CHECK (prize_type IN ('loyalty_points', 'free_product', 'discount')),
  prize_value INTEGER NOT NULL,
  probability DECIMAL(5, 2) NOT NULL CHECK (probability >= 0 AND probability <= 100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create spin wheel attempts table
CREATE TABLE public.spin_wheel_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_phone TEXT NOT NULL,
  prize_id UUID REFERENCES public.spin_wheel_prizes(id),
  week_start DATE NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(customer_phone, week_start)
);

-- Enable Row Level Security
ALTER TABLE public.vending_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_wheel_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_wheel_attempts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access to vending machines and promotions
CREATE POLICY "Vending machines are viewable by everyone" ON public.vending_machines FOR SELECT USING (true);
CREATE POLICY "Machine inventory is viewable by everyone" ON public.machine_inventory FOR SELECT USING (true);
CREATE POLICY "Promotions are viewable by everyone" ON public.promotions FOR SELECT USING (true);
CREATE POLICY "Spin wheel prizes are viewable by everyone" ON public.spin_wheel_prizes FOR SELECT USING (true);

-- Create admin policies
CREATE POLICY "Admins can manage vending machines" ON public.vending_machines FOR ALL USING (true);
CREATE POLICY "Admins can manage machine inventory" ON public.machine_inventory FOR ALL USING (true);
CREATE POLICY "Admins can manage promotions" ON public.promotions FOR ALL USING (true);
CREATE POLICY "Admins can manage spin wheel prizes" ON public.spin_wheel_prizes FOR ALL USING (true);

-- Customer data policies (phone-based since we're using phone auth)
CREATE POLICY "Customers can view their own orders" ON public.customer_orders FOR SELECT USING (true);
CREATE POLICY "Customers can create orders" ON public.customer_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can view their own order items" ON public.customer_order_items FOR SELECT USING (true);
CREATE POLICY "Customers can view their own loyalty points" ON public.customer_loyalty_points FOR SELECT USING (true);
CREATE POLICY "Customers can view their own loyalty transactions" ON public.loyalty_transactions FOR SELECT USING (true);
CREATE POLICY "Customers can view their own spin attempts" ON public.spin_wheel_attempts FOR SELECT USING (true);

-- Admin policies for customer data
CREATE POLICY "Admins can manage customer orders" ON public.customer_orders FOR ALL USING (true);
CREATE POLICY "Admins can manage customer order items" ON public.customer_order_items FOR ALL USING (true);
CREATE POLICY "Admins can manage customer loyalty points" ON public.customer_loyalty_points FOR ALL USING (true);
CREATE POLICY "Admins can manage loyalty transactions" ON public.loyalty_transactions FOR ALL USING (true);
CREATE POLICY "Admins can manage spin attempts" ON public.spin_wheel_attempts FOR ALL USING (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_vending_machines_updated_at
  BEFORE UPDATE ON public.vending_machines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_machine_inventory_updated_at
  BEFORE UPDATE ON public.machine_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_orders_updated_at
  BEFORE UPDATE ON public.customer_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_loyalty_points_updated_at
  BEFORE UPDATE ON public.customer_loyalty_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_spin_wheel_prizes_updated_at
  BEFORE UPDATE ON public.spin_wheel_prizes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.vending_machines (name, location_name, address, latitude, longitude) VALUES
('VendIT Mall 1', 'Avenues Mall', 'The Avenues Mall, Kuwait City', 29.302326, 47.933083),
('VendIT Campus', 'Kuwait University', 'Kuwait University, Jabriya', 29.331876, 48.020833),
('VendIT Hospital', 'Al-Sabah Medical Area', 'Sabah Medical Area, Kuwait City', 29.338611, 47.973611);

-- Insert sample promotions
INSERT INTO public.promotions (title, description, image_url, is_active) VALUES
('Welcome to VendIT!', 'Get 10% off your first order', null, true),
('Healthy Snacks Week', 'Try our new organic options', null, true);

-- Insert sample spin wheel prizes
INSERT INTO public.spin_wheel_prizes (name, prize_type, prize_value, probability) VALUES
('10 Loyalty Points', 'loyalty_points', 10, 40.0),
('25 Loyalty Points', 'loyalty_points', 25, 25.0),
('50 Loyalty Points', 'loyalty_points', 50, 15.0),
('Free Chips', 'free_product', 1, 10.0),
('Free Chocolate', 'free_product', 1, 8.0),
('Better luck next time!', 'loyalty_points', 0, 2.0);