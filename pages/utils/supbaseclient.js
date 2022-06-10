import { createClient } from '@supabase/supabase-js'


const supakey = process.env.supakey ? process.env.supakey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bG5rem1ueWNrbHVpZ252dnhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY1NDgxMTAwNCwiZXhwIjoxOTcwMzg3MDA0fQ.NOh7-H8VCXA5hyRSxJt34KCNYXI4TQ7BDt-omFSWdEY';


export const supabase = createClient('https://dulnkzmnyckluignvvxc.supabase.co', supakey)
