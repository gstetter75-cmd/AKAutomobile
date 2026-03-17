/* ==========================================================================
   AK Automobile — Supabase Client for Public Website
   Loads vehicle data from Supabase instead of static vehicles.js
   ========================================================================== */

const SUPABASE_URL = 'https://bwunbletmseulnfgtljn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dW5ibGV0bXNldWxuZmd0bGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MDIxNDYsImV4cCI6MjA4OTI3ODE0Nn0.CT84vb3VL3j8UYgLHHnVIkJR1CciulYEmn5BkyWnGYg';

async function loadVehiclesFromSupabase() {
  try {
    const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error } = await sb
      .from('vehicles')
      .select('*')
      .in('status', ['available', 'reserved'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return false;

    // Convert DB format to the format expected by the website
    vehicleData.length = 0;
    data.forEach(v => {
      vehicleData.push({
        id: v.id,
        brand: v.brand,
        model: v.model,
        name: v.name,
        year: v.year,
        price: v.price,
        mileage: new Intl.NumberFormat('de-DE').format(v.mileage) + ' km',
        category: v.category,
        fuel: v.fuel,
        badge: v.status === 'reserved' ? 'Reserviert' : (v.badge || null),
        reserved: v.status === 'reserved',
        images: [
          `https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800`,
          `https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=400`
        ],
        specs: {
          hp: v.hp || 0,
          topSpeed: v.top_speed || '—',
          acceleration: v.acceleration || '—',
          engine: v.engine || '—',
          drivetrain: v.drivetrain || '—',
          fuel: v.fuel,
          transmission: v.transmission || '—'
        },
        description: {
          en: v.description_en || '',
          de: v.description_de || ''
        }
      });
    });

    // Load images for each vehicle
    const vehicleIds = data.map(v => v.id);
    const { data: images } = await sb
      .from('vehicle_images')
      .select('*')
      .in('vehicle_id', vehicleIds)
      .order('position', { ascending: true });

    if (images && images.length > 0) {
      const imageMap = {};
      images.forEach(img => {
        if (!imageMap[img.vehicle_id]) imageMap[img.vehicle_id] = [];
        imageMap[img.vehicle_id].push(img.url);
      });

      vehicleData.forEach(v => {
        if (imageMap[v.id] && imageMap[v.id].length > 0) {
          v.images = imageMap[v.id];
        }
      });
    }

    return true;
  } catch (err) {
    // Fallback: keep static vehicleData from vehicles.js
    return false;
  }
}
