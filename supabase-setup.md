# Supabase Setup Guide

## Storage Bucket Setup

To enable avatar uploads in the profile settings, you need to create a storage bucket in your Supabase project:

### 1. Create Storage Bucket

1. Go to your Supabase dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Set the bucket name to: `avatars`
5. Make it **Public** (so images can be accessed)
6. Click **Create bucket**

### 2. Set Storage Policies

After creating the bucket, set up the following policies:

#### Policy 1: Allow authenticated users to upload avatars
```sql
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);
```

#### Policy 2: Allow public access to view avatars
```sql
CREATE POLICY "Allow public access to view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

#### Policy 3: Allow users to update their own avatars
```sql
CREATE POLICY "Allow users to update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 4: Allow users to delete their own avatars
```sql
CREATE POLICY "Allow users to delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Database Migration

Run the following SQL in your Supabase SQL editor to add the `bio` column:

```sql
-- Add bio column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'bio'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN bio text;
    END IF;
END $$;
```

### 4. Verify Setup

After completing the above steps:
1. The profile settings page should work without errors
2. Users should be able to upload avatar images
3. The bio field should save correctly
4. All profile updates should work smoothly

## Troubleshooting

If you still get errors:

1. **Check Storage Bucket**: Ensure the `avatars` bucket exists and is public
2. **Check Policies**: Verify all storage policies are in place
3. **Check Database**: Ensure the `bio` column exists in `user_profiles` table
4. **Check Console**: Look for specific error messages in the browser console 