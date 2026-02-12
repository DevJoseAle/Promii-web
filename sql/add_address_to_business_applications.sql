-- Add address column to business_applications table

ALTER TABLE business_applications
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add comment
COMMENT ON COLUMN business_applications.address IS 'Full business address';
