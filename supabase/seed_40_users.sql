-- ============================================================
-- Supabase Seed: 40 Realistic Test Users for BIS Copilot
-- File: supabase/seed_40_users.sql
-- Covers: MSMEs, QA Managers, Labs, Consumers, and Researchers
-- ============================================================

DO $$
DECLARE
    u RECORD;
BEGIN
    -- Temporary table to hold user data for upsert
    CREATE TEMP TABLE IF NOT EXISTS temp_fake_users (
        id UUID,
        display_name TEXT,
        email TEXT,
        preferred_language TEXT
    ) ON COMMIT DROP;

    DELETE FROM temp_fake_users;

    INSERT INTO temp_fake_users (id, display_name, email, preferred_language) VALUES
    ('00000000-0000-0000-0001-000000000001', 'Aarav Sharma (PureDrop Beverages)', 'aarav.sharma@puredropbeverages.in', 'en'),
    ('00000000-0000-0000-0001-000000000002', 'Priya Patel (Apex Home Appliances)', 'priya.patel@apexelectronics.com', 'en'),
    ('00000000-0000-0000-0001-000000000003', 'Vikram Malhotra (Shakti Steel)', 'vikram.m@shaktisteel.co.in', 'hi'),
    ('00000000-0000-0000-0001-000000000004', 'Ananya Rao (Lumen Solar Technologies)', 'ananya.rao@lumensolar.in', 'en'),
    ('00000000-0000-0000-0001-000000000005', 'Debashis Mohapatra (Kalinga Pipes)', 'debashis.m@kalingapipes.in', 'or'),
    ('00000000-0000-0000-0001-000000000006', 'Kavita Deshmukh (Om Toy Crafters)', 'kavita.d@omtoys.in', 'en'),
    ('00000000-0000-0000-0001-000000000007', 'Mohammad Rizwan (Crown Footwear)', 'm.rizwan@crownfootwear.com', 'hi'),
    ('00000000-0000-0000-0001-000000000008', 'Sneha Sen (Bengal Cables)', 'sneha.sen@bengalcables.in', 'en'),
    ('00000000-0000-0000-0001-000000000009', 'Harish Verma (EcoCell Energy Storage)', 'harish.v@ecobatteries.in', 'en'),
    ('00000000-0000-0000-0001-000000000010', 'Lakshmi Narayanan (Chennai Fine Chemicals)', 'lakshmi.n@chennaichem.com', 'en'),
    ('00000000-0000-0000-0001-000000000011', 'Gaurav Joshi (Himalayan Organics)', 'gaurav.joshi@himalayanfoods.in', 'hi'),
    ('00000000-0000-0000-0001-000000000012', 'Sunita Kulkarni (Modern Kitchen Appliances)', 'sunita.k@moderncookware.com', 'en'),
    ('00000000-0000-0000-0001-000000000013', 'Jaspreet Singh (Punjab Pumps)', 'jaspreet.s@punjabpumps.in', 'en'),
    ('00000000-0000-0000-0001-000000000014', 'Meera Chawla (Nova LED Lighting)', 'meera.c@novaled.in', 'en'),
    ('00000000-0000-0000-0001-000000000015', 'Tarun Banerjee (Howrah Mechanical)', 'tarun.b@howrahgears.com', 'en'),
    ('00000000-0000-0000-0001-000000000016', 'Deepak Mehta (Tata Metaliks QA)', 'deepak.mehta@tataquality.com', 'en'),
    ('00000000-0000-0000-0001-000000000017', 'Dr. Rashmi Nambiar (Kerala Ayurvedic)', 'r.nambiar@keralapharma.org', 'en'),
    ('00000000-0000-0000-0001-000000000018', 'Siddharth Goel (Havells India Compliance)', 's.goel@havellscompliance.in', 'en'),
    ('00000000-0000-0000-0001-000000000019', 'Fatima Sheikh (BioCon QA)', 'fatima.s@bioconcompliance.com', 'en'),
    ('00000000-0000-0000-0001-000000000020', 'Naveen Reddy (Amara Raja Batteries)', 'naveen.r@amaratabatteries.com', 'en'),
    ('00000000-0000-0000-0001-000000000021', 'Pooja Hegde (Godrej Appliances QA)', 'pooja.h@godrejappliances.in', 'en'),
    ('00000000-0000-0000-0001-000000000022', 'Abhishek Tiwari (UltraTech Cement QA)', 'a.tiwari@ultratechqa.com', 'hi'),
    ('00000000-0000-0000-0001-000000000023', 'Ritu Agarwal (Maruti Suzuki Standards)', 'ritu.agarwal@marutisuzuki.co.in', 'en'),
    ('00000000-0000-0000-0001-000000000024', 'Karthik Swaminathan (L&T Infrastructure)', 'karthik.s@lntconstruction.com', 'en'),
    ('00000000-0000-0000-0001-000000000025', 'Shalini Nair (Britannia Industries)', 'shalini.n@britanniaqa.in', 'en'),
    ('00000000-0000-0000-0001-000000000026', 'Dr. Pradeep Mishra (Shriram Institute Labs)', 'p.mishra@sriramlabs.org', 'en'),
    ('00000000-0000-0000-0001-000000000027', 'Bhavna Trivedi (ERDA Vadodara)', 'bhavna.t@ercindia.org', 'en'),
    ('00000000-0000-0000-0001-000000000028', 'Manish Kaushik (Spectro Analytical Labs)', 'manish.k@spectrolabs.com', 'en'),
    ('00000000-0000-0000-0001-000000000029', 'Soumya Ranjan Das (CSIR-IMMT Testing)', 'soumya.das@immt.res.in', 'or'),
    ('00000000-0000-0000-0001-000000000030', 'Anil Kulkarni (ARAI Automotive Testing)', 'anil.kulkarni@arailabs.com', 'en'),
    ('00000000-0000-0000-0001-000000000031', 'Rameshwar Prasad (Consumer - Varanasi)', 'rameshwar.prasad@gmail.com', 'hi'),
    ('00000000-0000-0000-0001-000000000032', 'Geeta Krishnan (Jewellery Buyer - Kozhikode)', 'geeta.krishnan@yahoo.com', 'en'),
    ('00000000-0000-0000-0001-000000000033', 'Vijay Chouhan (Consumer Rights - Jaipur)', 'vijay.chouhan@rediffmail.com', 'hi'),
    ('00000000-0000-0000-0001-000000000034', 'Sujata Patnaik (Householder - Cuttack)', 'sujata.patnaik@gmail.com', 'or'),
    ('00000000-0000-0000-0001-000000000035', 'Amitabh Bose (Citizen Buyer - Kolkata)', 'amitabh.bose@outlook.com', 'en'),
    ('00000000-0000-0000-0001-000000000036', 'Prof. Arvind Saxena (IIT Delhi Thermal Engg)', 'arvind.saxena@iitd.ac.in', 'en'),
    ('00000000-0000-0000-0001-000000000037', 'Dr. Smriti Chandran (IISc Nanomaterials)', 'smriti.c@iisc.ac.in', 'en'),
    ('00000000-0000-0000-0001-000000000038', 'Advocate Rohit Bhargava (Regulatory Law)', 'rohit@bhargavalegal.in', 'en'),
    ('00000000-0000-0000-0001-000000000039', 'Tanmayee Jena (OUTR Electrical Engg Student)', 'tanmayee.jena@cet.edu.in', 'or'),
    ('00000000-0000-0000-0001-000000000040', 'Alok Kumar Soni (BIS Compliance Consultant)', 'alok.soni@bisconsulting.in', 'en');

    -- Insert into auth.users (if running against real Supabase Auth instance)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        FOR u IN SELECT * FROM temp_fake_users LOOP
            INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
            VALUES (
                u.id,
                u.email,
                json_build_object('display_name', u.display_name, 'preferred_language', u.preferred_language),
                now(),
                now()
            )
            ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                raw_user_meta_data = EXCLUDED.raw_user_meta_data,
                updated_at = now();
        END LOOP;
    END IF;

    -- Insert into public.users
    FOR u IN SELECT * FROM temp_fake_users LOOP
        INSERT INTO public.users (id, display_name, email, preferred_language, created_at, updated_at)
        VALUES (
            u.id,
            u.display_name,
            u.email,
            u.preferred_language,
            now(),
            now()
        )
        ON CONFLICT (id) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            email = EXCLUDED.email,
            preferred_language = EXCLUDED.preferred_language,
            updated_at = now();
    END LOOP;
END $$;
