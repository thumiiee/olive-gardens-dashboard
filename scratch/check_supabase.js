const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://zbjiqpudirpsrwlkdvvlh.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiamlncHVkaXJzcndsa2R2dmxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTkyOTQsImV4cCI6MjA5NDY5NTI5NH0.LiuDnnSfWOBOIT-OZXOX8xzG86n4zwteJCm-lU5LWWk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .limit(10);
    
    if (txError) {
      console.error('Error fetching transactions:', txError);
    } else {
      console.log(`Fetched ${txData.length} transactions:`);
      console.log(txData);
    }

    const { data: unitData, error: unitError } = await supabase
      .from('units')
      .select('*')
      .limit(10);
    
    if (unitError) {
      console.error('Error fetching units:', unitError);
    } else {
      console.log(`Fetched ${unitData.length} units:`);
      console.log(unitData);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

check();
