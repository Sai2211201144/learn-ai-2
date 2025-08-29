import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhrdalmripnchheomaww.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhocmRhbG1yaXBuY2hoZW9tYXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMDg2MDEsImV4cCI6MjA3MTU4NDYwMX0.MFD0ZPy8NxLv-Np1NdK8XrUWerMmVzT0RmooXD6xtzw';

// Initialize the Supabase client directly with the hardcoded credentials.
// The previous runtime check is removed as it's redundant and may cause issues in some environments.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);