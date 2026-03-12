
-- Seed services
INSERT INTO public.services (title, description, icon, price, sort_order) VALUES
('Haircut & Styling', 'Precision cuts tailored to your face shape and personality', 'Scissors', '₹499', 1),
('Hair Spa & Treatments', 'Deep conditioning and nourishing treatments for healthy hair', 'Sparkles', '₹999', 2),
('Hair Coloring & Highlights', 'Premium color services with international products', 'Palette', '₹1,999', 3),
('Keratin & Smoothening', 'Frizz-free, silky smooth hair that lasts for months', 'Wind', '₹3,999', 4),
('Facials & Skin Treatments', 'Rejuvenating facials for radiant, glowing skin', 'Heart', '₹799', 5),
('Manicure & Pedicure', 'Luxurious hand and foot care with premium products', 'Hand', '₹599', 6),
('Nail Extensions & Art', 'Stunning nail designs and extensions by expert artists', 'Gem', '₹1,499', 7),
('Waxing & Grooming', 'Gentle, effective grooming services for smooth skin', 'Flower2', '₹299', 8),
('Bridal Makeup', 'Complete bridal packages for your special day', 'Crown', '₹15,000', 9);

-- Seed stylists
INSERT INTO public.stylists (name, specialty, experience, rating) VALUES
('Rahul Sharma', 'Senior Hair Stylist', '10+ Years Experience', 4.9),
('Priya Patel', 'Color Specialist', '8+ Years Experience', 4.8),
('Amit Das', 'Skin & Grooming Expert', '6+ Years Experience', 4.7);

-- Seed reviews
INSERT INTO public.reviews (customer_name, rating, comment, is_approved) VALUES
('Sneha Roy', 5, 'Best salon experience in Durgapur. The staff is extremely professional and the haircut quality is outstanding.', true),
('Arjun Banerjee', 5, 'Rahul is an amazing stylist. He understood exactly what I wanted. Will definitely come back!', true),
('Priya Ghosh', 5, 'The bridal makeup was absolutely stunning. Everyone at my wedding complimented my look. Thank you Hair Dot Com!', true),
('Vikram Das', 4, 'Great keratin treatment. My hair feels so smooth and manageable now. Highly recommend their hair treatments.', true),
('Ananya Mukherjee', 5, 'Love the salon ambiance and the nail art is incredible! Priya did an amazing job with my hair color too.', true);
