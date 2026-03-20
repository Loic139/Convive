-- ================================================
-- Migration 003 — Type de groupe (solo, couple, famille)
-- ================================================

-- Champ group_type sur reservations
-- Valeurs : 'solo' | 'couple' | 'family'
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS group_type TEXT NOT NULL DEFAULT 'solo';

ALTER TABLE reservations
  ADD CONSTRAINT reservations_group_type_check
    CHECK (group_type IN ('solo', 'couple', 'family'));
