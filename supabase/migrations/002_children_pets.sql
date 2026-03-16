-- ================================================
-- Migration 002 — Enfants et animaux
-- ================================================

-- Champs sur events
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS children_allowed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pets_allowed BOOLEAN NOT NULL DEFAULT false;

-- Champs sur reservations
-- children_count : nombre d'enfants amenés
-- pets : objet JSON { "dog": 1, "cat": 0, "other": 1 }
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS children_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pets JSONB;

-- Contrainte : children_count >= 0
ALTER TABLE reservations
  ADD CONSTRAINT reservations_children_count_check CHECK (children_count >= 0);
