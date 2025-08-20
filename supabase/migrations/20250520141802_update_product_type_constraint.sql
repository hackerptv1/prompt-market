-- Drop the existing constraint
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_product_type_check;

-- Add the new constraint with 'automation' as an allowed value
ALTER TABLE prompts ADD CONSTRAINT prompts_product_type_check 
CHECK (product_type IN ('prompt', 'api', 'ai-agent', 'automation')); 