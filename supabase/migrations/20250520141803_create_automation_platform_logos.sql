-- Create automation platform logos table
CREATE TABLE IF NOT EXISTS automation_platform_logos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_name TEXT NOT NULL UNIQUE,
  logo_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add some initial automation platforms
INSERT INTO automation_platform_logos (platform_name, logo_url) VALUES
  ('Zapier', 'https://cdn.zapier.com/zapier/images/favicon.ico'),
  ('IFTTT', 'https://assets.ifttt.com/images/channels/icons/on_color_large.png'),
  ('Make', 'https://images.ctfassets.net/qqlj6g4ee76j/5ghJkWc6EQlZBGvlmQKBBz/c4a23f0c41e6f6f3c748f9c6c1e84e6c/Make-Logo-Icon.png'),
  ('n8n', 'https://n8n.io/favicon.ico'),
  ('Power Automate', 'https://static2.sharepointonline.com/files/fabric/assets/brand-icons/product-fluent/svg/power-automate-32x32.svg'),
  ('Workato', 'https://workato.com/favicon.ico'),
  ('Tray.io', 'https://tray.io/favicon.ico'),
  ('Integromat', 'https://www.integromat.com/favicon.ico'),
  ('Automate.io', 'https://automate.io/favicon.ico'),
  ('Pipedream', 'https://pipedream.com/favicon.ico')
ON CONFLICT (platform_name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  updated_at = TIMEZONE('utc'::text, NOW());

-- Add automation_platform column to prompts table
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS automation_platform TEXT REFERENCES automation_platform_logos(platform_name);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_automation_platform_logos_updated_at
  BEFORE UPDATE ON automation_platform_logos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 