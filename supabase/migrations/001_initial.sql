-- ================================================
-- Convive — Migration initiale
-- ================================================

-- Extension pour la génération d'UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================
-- TABLE: profiles
-- Extension de auth.users avec données publiques
-- ================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================
-- TABLE: events
-- 1 événement = 1 repas = 1 date
-- ================================================
CREATE TYPE event_status AS ENUM ('active', 'full', 'cancelled', 'archived');

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  date_time TIMESTAMPTZ NOT NULL,
  max_seats INTEGER NOT NULL CHECK (max_seats > 0 AND max_seats <= 500),
  status event_status NOT NULL DEFAULT 'active',
  cancel_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date_time ON events(date_time);

-- ================================================
-- TABLE: reservations
-- ================================================
CREATE TYPE reservation_status AS ENUM ('confirmed', 'cancelled');

CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status reservation_status NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_reservations_event ON reservations(event_id);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_status ON reservations(status);

-- ================================================
-- FONCTION: updated_at automatique
-- ================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ================================================
-- FONCTION: profil automatique à l'inscription
-- ================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ================================================
-- FONCTION: mise à jour automatique du statut event
-- ================================================
CREATE OR REPLACE FUNCTION sync_event_status()
RETURNS TRIGGER AS $$
DECLARE
  v_confirmed_count INTEGER;
  v_max_seats INTEGER;
  v_event_status event_status;
  v_event_id UUID;
BEGIN
  v_event_id := COALESCE(NEW.event_id, OLD.event_id);

  SELECT
    COUNT(*) FILTER (WHERE r.status = 'confirmed'),
    e.max_seats,
    e.status
  INTO v_confirmed_count, v_max_seats, v_event_status
  FROM events e
  LEFT JOIN reservations r ON r.event_id = e.id
  WHERE e.id = v_event_id
  GROUP BY e.max_seats, e.status;

  -- Ne pas modifier si annulé ou archivé
  IF v_event_status IN ('cancelled', 'archived') THEN
    RETURN NEW;
  END IF;

  IF v_confirmed_count >= v_max_seats THEN
    UPDATE events
    SET status = 'full', updated_at = NOW()
    WHERE id = v_event_id AND status = 'active';
  ELSE
    UPDATE events
    SET status = 'active', updated_at = NOW()
    WHERE id = v_event_id AND status = 'full';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_event_status_on_reservation
  AFTER INSERT OR UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION sync_event_status();

-- ================================================
-- FONCTION: archivage automatique des events passés
-- ================================================
CREATE OR REPLACE FUNCTION archive_past_events()
RETURNS void AS $$
BEGIN
  UPDATE events
  SET status = 'archived', updated_at = NOW()
  WHERE date_time < NOW()
    AND status IN ('active', 'full');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- RLS: Row Level Security
-- ================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profils publics en lecture"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Utilisateur peut modifier son profil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events actifs publics en lecture"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Organisateur crée ses events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organisateur modifie ses events"
  ON events FOR UPDATE
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organisateur supprime ses events"
  ON events FOR DELETE
  USING (auth.uid() = organizer_id);

-- Reservations
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invité voit ses réservations"
  ON reservations FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_id
        AND e.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Invité crée sa réservation"
  ON reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Invité annule sa réservation"
  ON reservations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ================================================
-- VUE: events avec comptage des places
-- ================================================
CREATE OR REPLACE VIEW events_with_seats AS
SELECT
  e.*,
  p.full_name AS organizer_name,
  p.avatar_url AS organizer_avatar,
  COUNT(r.id) FILTER (WHERE r.status = 'confirmed') AS confirmed_seats,
  e.max_seats - COUNT(r.id) FILTER (WHERE r.status = 'confirmed') AS seats_remaining
FROM events e
LEFT JOIN profiles p ON p.id = e.organizer_id
LEFT JOIN reservations r ON r.event_id = e.id
GROUP BY e.id, p.full_name, p.avatar_url;
