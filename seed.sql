-- ============================================================
-- TREAT HOTELS & RESORTS — DUMMY DATA SEED SCRIPT
-- Run this in your Supabase SQL Editor after running database.sql
-- ============================================================

-- 1. Properties
INSERT INTO public.properties (id, name, entity, gm_name, gm_email, whatsapp_number, google_review_link, latitude, longitude, address, is_active) VALUES
('treat-silvassa', 'Treat Resort Silvassa', 'Mundra Hotels & Resorts', 'Rajesh Kumar', 'gm.silvassa@treatresort.com', '+919876543210', 'https://g.page/r/silvassa', 20.2763, 73.0083, 'Sayli Road, Silvassa, Dadra and Nagar Haveli', TRUE),
('treat-gokarna', 'Treat Resort Gokarna', 'Mundra Hotels & Resorts', 'Priya Sharma', 'gm.gokarna@treatresort.com', '+919876543211', 'https://g.page/r/gokarna', 14.5500, 74.3167, 'Om Beach Road, Gokarna, Karnataka', TRUE),
('ras-resorts', 'RAS Resorts Silvassa', 'RAS Resorts', 'Amit Patel', 'gm.ras@rasresorts.com', '+919876543212', 'https://g.page/r/ras', 20.2700, 73.0100, 'Naroli Road, Silvassa, Dadra and Nagar Haveli', TRUE),
('tarapur-resort', 'Tarapur Resort', 'Tirupati Shelters', 'Karan Mehta', 'gm.tarapur@tirupatishelters.com', '+919876543213', 'https://g.page/r/tarapur', 19.8600, 72.6800, 'Tarapur MIDC, Boisar, Maharashtra', TRUE);

-- 2. Forms
INSERT INTO public.forms (id, property_id, slug, title, description, language, collect_name, collect_email, collect_room, gm_alert_email, md_alert_email, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'treat-silvassa', 'silvassa-feedback', 'Guest Feedback - Treat Resort Silvassa', 'We value your feedback. Please let us know how your stay was.', 'en', TRUE, TRUE, TRUE, 'gm.silvassa@treatresort.com', 'md@mundrahotels.com', TRUE),
('22222222-2222-2222-2222-222222222222', 'treat-gokarna', 'gokarna-feedback', 'Guest Feedback - Treat Resort Gokarna', 'Thank you for staying with us. How did we do?', 'en', TRUE, TRUE, TRUE, 'gm.gokarna@treatresort.com', 'md@mundrahotels.com', TRUE);

-- 3. Questions
INSERT INTO public.questions (id, form_id, type, label, placeholder, required, sort_order) VALUES
('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'rating', 'How would you rate your overall experience?', NULL, TRUE, 1),
('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'nps', 'How likely are you to recommend us to your friends and family?', NULL, TRUE, 2),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'textarea', 'Any other feedback or suggestions?', 'Type your feedback here...', FALSE, 3),

('44444444-4444-4444-4444-444444444441', '22222222-2222-2222-2222-222222222222', 'rating', 'Overall Rating', NULL, TRUE, 1),
('44444444-4444-4444-4444-444444444442', '22222222-2222-2222-2222-222222222222', 'nps', 'NPS Score', NULL, TRUE, 2);

-- 4. Routing Rules
INSERT INTO public.routing_rules (form_id, question_id, condition, value, action, priority) VALUES
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'lte', 3, 'alert_gm', 1),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'gte', 4, 'show_review_link', 2);

-- 5. Submissions
INSERT INTO public.submissions (id, form_id, property_id, guest_name, guest_email, guest_phone, room_number, overall_rating, nps_score, review_link_shown, submitted_at) VALUES
('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', 'treat-silvassa', 'Rahul Desai', 'rahul.d@example.com', '+919998887776', '101', 5, 10, TRUE, NOW() - INTERVAL '2 days'),
('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', 'treat-silvassa', 'Sneha Kapoor', 'sneha.k@example.com', '+919998887777', '105', 2, 3, FALSE, NOW() - INTERVAL '1 day'),
('55555555-5555-5555-5555-555555555553', '22222222-2222-2222-2222-222222222222', 'treat-gokarna', 'Vikram Singh', 'vikram.s@example.com', '+919998887778', '201', 4, 8, TRUE, NOW() - INTERVAL '3 hours'),
('55555555-5555-5555-5555-555555555554', '22222222-2222-2222-2222-222222222222', 'treat-gokarna', 'Anjali Gupta', 'anjali.g@example.com', '+919998887779', '210', 5, 9, TRUE, NOW() - INTERVAL '1 hour');

-- 6. Guest Answers
INSERT INTO public.guest_answers (submission_id, question_id, question_type, numeric_value) VALUES
('55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333331', 'rating', 5),
('55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333332', 'nps', 10);
INSERT INTO public.guest_answers (submission_id, question_id, question_type, text_value) VALUES
('55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333333', 'textarea', 'Amazing stay! Will definitely visit again.');

INSERT INTO public.guest_answers (submission_id, question_id, question_type, numeric_value) VALUES
('55555555-5555-5555-5555-555555555552', '33333333-3333-3333-3333-333333333331', 'rating', 2),
('55555555-5555-5555-5555-555555555552', '33333333-3333-3333-3333-333333333332', 'nps', 3);
INSERT INTO public.guest_answers (submission_id, question_id, question_type, text_value) VALUES
('55555555-5555-5555-5555-555555555552', '33333333-3333-3333-3333-333333333333', 'textarea', 'AC was not working properly. Very disappointed.');

-- 7. Complaint Tickets
-- Note: A complaint ticket will be auto-generated by the trigger for Sneha Kapoor''s submission since rating is 2.
-- We will also manually add one that isn''t tied to a submission to test manual ticket flows.
INSERT INTO public.complaint_tickets (property_id, guest_name, guest_email, room_number, description, status, sla_deadline, created_at) VALUES
('treat-silvassa', 'Mohit Verma', 'mohit.v@example.com', '112', 'Guest complained about noise from the adjacent room at 2 AM.', 'in_progress', NOW() + INTERVAL '1 hour', NOW() - INTERVAL '1 hour');

-- 8. Email Threads
INSERT INTO public.email_threads (property_id, message_id, from_email, from_name, to_email, subject, body_preview, category, priority, status, received_at) VALUES
('treat-silvassa', 'msg-12345', 'wedding.planner@example.com', 'Aditi Weddings', 'events.silvassa@treatresort.com', 'Inquiry for Destination Wedding (Dec 2026)', 'Hi, we are looking to host a destination wedding for 500 pax at your Treat Resort Silvassa property in December 2026. 

Could you please share your banquet packages, per plate pricing, and room availability for 150 rooms for 2 nights? We are specifically interested in the grand ballroom and open lawn areas.

Looking forward to hearing from you.

Best,
Aditi Sharma
Aditi Weddings & Events', 'wedding_lead', 'urgent', 'unread', NOW() - INTERVAL '5 hours'),
('treat-gokarna', 'msg-12346', 'john.doe@example.com', 'John Doe', 'info.gokarna@treatresort.com', 'Booking Inquiry - 2 Nights', 'Hello, 

I would like to book a sea-view room for 2 nights starting from the 15th of next month. Do you have any availability? Also, please let me know if airport transfers are included in the package.

Thanks,
John Doe', 'booking_inquiry', 'normal', 'read', NOW() - INTERVAL '1 day'),
('ras-resorts', 'msg-12347', 'vendor@supplies.com', 'Fresh Supplies Ltd', 'finance.ras@rasresorts.com', 'Invoice for August', 'Dear Finance Team,

Please find attached the invoice for vegetables and daily supplies delivered in August. The total amount due is ₹1,45,000. Kindly process the payment at your earliest convenience before the 15th of this month to avoid late fees.

Regards,
Fresh Supplies Ltd', 'finance', 'normal', 'unread', NOW() - INTERVAL '2 days');

-- 9. Finance Records
INSERT INTO public.finance_records (property_id, entity, record_date, total_revenue, room_revenue, fnb_revenue, events_revenue, adventure_revenue, other_revenue, rooms_occupied, total_rooms, adr, revpar, source) VALUES
('treat-silvassa', 'Mundra Hotels & Resorts', CURRENT_DATE - 1, 1500000.00, 800000.00, 400000.00, 200000.00, 50000.00, 50000.00, 120, 150, 6666.67, 5333.33, 'tally'),
('treat-silvassa', 'Mundra Hotels & Resorts', CURRENT_DATE - 2, 1650000.00, 850000.00, 450000.00, 250000.00, 60000.00, 40000.00, 130, 150, 6538.46, 5666.67, 'tally'),
('treat-gokarna', 'Mundra Hotels & Resorts', CURRENT_DATE - 1, 800000.00, 500000.00, 250000.00, 0.00, 30000.00, 20000.00, 60, 80, 8333.33, 6250.00, 'tally'),
('ras-resorts', 'RAS Resorts', CURRENT_DATE - 1, 1200000.00, 700000.00, 300000.00, 150000.00, 20000.00, 30000.00, 90, 120, 7777.78, 5833.33, 'tally'),
('tarapur-resort', 'Tirupati Shelters', CURRENT_DATE - 1, 500000.00, 300000.00, 150000.00, 50000.00, 0.00, 0.00, 40, 60, 7500.00, 5000.00, 'tally');
