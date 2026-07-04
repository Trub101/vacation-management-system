-- ============================================================
--  Vacation Management System - full database export
--  Schema + seed data (users, vacations, likes)
--
--  Login credentials created by this seed:
--    Admin :  admin@test.com / admin123
--    Users :  user@test.com  / user123
--             sarah@test.com / user123
--             david@test.com / user123
--
--  Dates are spread around mid-2026 so the "Active Now" and
--  "Not Started Yet" filters have data to show.
-- ============================================================

-- Force the connection charset so UTF-8 characters (e.g. em-dashes) load
-- correctly regardless of the client's default character set.
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS vacations_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vacations_db;

-- Drop in FK-safe order so re-running the script is idempotent.
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS vacations;
DROP TABLE IF EXISTS users;

-- ---------- Users ----------
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user'
);

-- ---------- Vacations ----------
CREATE TABLE vacations (
  vacation_id INT AUTO_INCREMENT PRIMARY KEY,
  destination VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0 AND price <= 10000),
  image_filename VARCHAR(255) NOT NULL
);

-- ---------- Likes (junction) ----------
CREATE TABLE likes (
  user_id INT,
  vacation_id INT,
  PRIMARY KEY (user_id, vacation_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (vacation_id) REFERENCES vacations(vacation_id) ON DELETE CASCADE
);

-- ============================================================
--  Seed data
-- ============================================================

-- Passwords are bcrypt hashes (saltRounds = 10).
--   admin123  ->  $2a$10$7uW0f5EW68X3XdjoU7o/VumMMX4GuIrR/DRYG9GlQi5YNS6bcPHR6
--   user123   ->  $2a$10$yj41jTfWvFdEzvkYFM6Kue4sNwHDXcQYyamv478vGIyR.oUzOITUa
INSERT INTO users (user_id, first_name, last_name, email, password, role) VALUES
  (1, 'Admin', 'System', 'admin@test.com', '$2a$10$7uW0f5EW68X3XdjoU7o/VumMMX4GuIrR/DRYG9GlQi5YNS6bcPHR6', 'admin'),
  (2, 'John',  'Doe',    'user@test.com',  '$2a$10$yj41jTfWvFdEzvkYFM6Kue4sNwHDXcQYyamv478vGIyR.oUzOITUa', 'user'),
  (3, 'Sarah', 'Cohen',  'sarah@test.com', '$2a$10$yj41jTfWvFdEzvkYFM6Kue4sNwHDXcQYyamv478vGIyR.oUzOITUa', 'user'),
  (4, 'David', 'Levi',   'david@test.com', '$2a$10$yj41jTfWvFdEzvkYFM6Kue4sNwHDXcQYyamv478vGIyR.oUzOITUa', 'user');

INSERT INTO vacations (vacation_id, destination, description, start_date, end_date, price, image_filename) VALUES
  (1,  'Paris, France',           'Stroll along the Seine, climb the Eiffel Tower and lose yourself in the Louvre. A timeless escape full of art, cafés and romance.',                  '2026-05-01', '2026-05-10', 2199.99, 'paris.jpg'),
  (2,  'Rome, Italy',             'Walk through 2,000 years of history — the Colosseum, the Vatican and the Trevi Fountain — between plates of fresh pasta and gelato.',              '2026-06-01', '2026-06-12', 1899.99, 'rome.jpg'),
  (3,  'Barcelona, Spain',        'Gaudí''s surreal architecture, buzzing tapas bars and Mediterranean beaches make this Catalan capital impossible to forget.',                     '2026-06-25', '2026-07-08', 1749.99, 'barcelona.jpg'),
  (4,  'Tokyo, Japan',            'Neon-lit streets, ancient temples and the world''s best food scene collide in Japan''s electric, endlessly surprising capital.',                   '2026-06-28', '2026-07-15', 3299.99, 'tokyo.jpg'),
  (5,  'Bali, Indonesia',         'Rice terraces, volcanic peaks and palm-fringed beaches — the ultimate island retreat for surfers, yogis and sun-seekers alike.',               '2026-06-20', '2026-07-05', 2499.99, 'bali.jpg'),
  (6,  'New York, USA',           'The city that never sleeps: Broadway shows, Central Park, world-class museums and skyline views from the Empire State Building.',              '2026-07-10', '2026-07-20', 2899.99, 'new_york.jpg'),
  (7,  'Sydney, Australia',       'Sail past the iconic Opera House, surf at Bondi Beach and explore the Blue Mountains in Australia''s sun-drenched harbour city.',              '2026-07-15', '2026-07-28', 3799.99, 'sydney.jpg'),
  (8,  'Amsterdam, Netherlands',  'Glide along picture-perfect canals, tour the Van Gogh Museum and cycle through this charming, laid-back European gem.',                       '2026-08-01', '2026-08-10', 1999.99, 'amsterdam.jpg'),
  (9,  'Cancun, Mexico',          'Turquoise Caribbean waters, powder-white beaches and ancient Mayan ruins nearby — pure tropical paradise on the Yucatán coast.',            '2026-08-15', '2026-08-25', 2299.99, 'cancun.jpg'),
  (10, 'Prague, Czech Republic',  'A fairy-tale city of Gothic spires, a medieval astronomical clock and cosy beer halls along the winding Vltava river.',                     '2026-09-05', '2026-09-14', 1599.99, 'prague.jpg'),
  (11, 'Bangkok, Thailand',       'Golden temples, floating markets and legendary street food — a vibrant, chaotic and delicious gateway to Southeast Asia.',                 '2026-09-20', '2026-10-02', 2099.99, 'bangkok.jpg'),
  (12, 'Rio de Janeiro, Brazil',  'Samba, sun and spectacular scenery beneath the arms of Christ the Redeemer, from Copacabana beach to Sugarloaf Mountain.',              '2026-10-10', '2026-10-22', 2699.99, 'rio.jpg'),
  (13, 'Santorini, Greece',       'Whitewashed villages tumbling down cliffs, blue-domed churches and the most breathtaking sunsets in the Aegean Sea.',                      '2026-11-01', '2026-11-11', 3199.99, 'santorini.jpg'),
  (14, 'Dubai, UAE',              'Futuristic skyscrapers, desert safaris and luxury shopping — a dazzling blend of tradition and cutting-edge extravagance.',               '2026-12-10', '2026-12-20', 3599.99, 'dubai.jpg');

INSERT INTO likes (user_id, vacation_id) VALUES
  (2, 1), (2, 3), (2, 4), (2, 6), (2, 9), (2, 11),
  (3, 1), (3, 2), (3, 4), (3, 5), (3, 7), (3, 10), (3, 13),
  (4, 2), (4, 3), (4, 5), (4, 6), (4, 8), (4, 12), (4, 14);
