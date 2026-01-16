-- Migration pour créer un jeu par défaut "Découverte d'Argenteuil"
-- avec de vraies coordonnées GPS pour tester la carte Mapbox

-- Créer le jeu
INSERT INTO hunts (id, title, description, creator_id, status)
SELECT
  '00000000-0000-0000-0000-000000000001',
  'Découverte d''Argenteuil',
  'Un parcours à travers les lieux emblématiques d''Argenteuil. Explorez la ville tout en résolvant des énigmes historiques et culturelles !',
  COALESCE((SELECT id FROM profiles LIMIT 1), '00000000-0000-0000-0000-000000000000'),
  'active'
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = 'active';

-- Supprimer les anciennes étapes si elles existent
DELETE FROM steps WHERE hunt_id = '00000000-0000-0000-0000-000000000001';

-- Étape 1 : Basilique Saint-Denys (centre-ville Argenteuil)
-- Coordonnées réelles : 2.2527, 48.9458
INSERT INTO steps (id, hunt_id, title, description, question, answer, order_index, location, radius_meters)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'Basilique Saint-Denys',
  'Commencez votre aventure devant cette magnifique basilique du XIXe siècle. Admirez son architecture néo-gothique !',
  'Quelle est l''année de construction de la basilique actuelle (en milliers) ?',
  '1862',
  1,
  'POINT(2.2527 48.9458)',
  30
);

-- Étape 2 : Parc de la Mairie
-- Coordonnées réelles : 2.2505, 48.9470
INSERT INTO steps (id, hunt_id, title, description, question, answer, order_index, location, radius_meters)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'Parc de la Mairie',
  'Direction le parc municipal. Un espace vert idéal pour se détendre au cœur de la ville.',
  'Combien de saisons comporte une année ?',
  '4',
  2,
  'POINT(2.2505 48.9470)',
  25
);

-- Étape 3 : Bords de Seine
-- Coordonnées réelles : 2.2480, 48.9420
INSERT INTO steps (id, hunt_id, title, description, question, answer, order_index, location, radius_meters)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'Bords de Seine',
  'Profitez de la vue sur la Seine. Cette rivière a inspiré de nombreux artistes impressionnistes qui ont peint Argenteuil.',
  'Quel peintre impressionniste célèbre a peint "Le Pont d''Argenteuil" ?',
  'Monet',
  3,
  'POINT(2.2480 48.9420)',
  40
);

-- Étape 4 : Gare d'Argenteuil
-- Coordonnées réelles : 2.2475, 48.9465
INSERT INTO steps (id, hunt_id, title, description, question, answer, order_index, location, radius_meters)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'Gare d''Argenteuil',
  'Point central de transport de la ville. La gare relie Argenteuil à Paris et au reste de la région.',
  'Quel est le nom de la ligne de train qui passe par Argenteuil (J) ?',
  'Ligne J',
  4,
  'POINT(2.2475 48.9465)',
  35
);

-- Étape 5 : Place de la République (fin du parcours)
-- Coordonnées réelles : 2.2530, 48.9460
INSERT INTO steps (id, hunt_id, title, description, question, answer, order_index, location, radius_meters)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'Place de la République',
  'Félicitations ! Vous avez terminé votre découverte d''Argenteuil. Cette place symbolise le cœur historique de la ville.',
  'Quelle est la capitale de la France ?',
  'Paris',
  5,
  'POINT(2.2530 48.9460)',
  30
);

-- Vérification
SELECT 
  h.id,
  h.title,
  COUNT(s.id) as steps_count,
  STRING_AGG(s.title, ' → ' ORDER BY s.order_index) as parcours
FROM hunts h
LEFT JOIN steps s ON s.hunt_id = h.id
WHERE h.id = '00000000-0000-0000-0000-000000000001'
GROUP BY h.id, h.title;
