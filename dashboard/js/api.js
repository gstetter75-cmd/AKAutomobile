/* ==========================================================================
   AK Automobile Dashboard — API Client (Supabase CRUD)
   ========================================================================== */

const api = {
  async fetchAll(table, { filters = {}, orderBy = 'created_at', ascending = false, limit = 100 } = {}) {
    let query = supabaseClient.from(table).select('*');

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        query = query.eq(key, value);
      }
    });

    query = query.order(orderBy, { ascending }).limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async fetchById(table, id) {
    const { data, error } = await supabaseClient.from(table).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async insert(table, row) {
    const { data, error } = await supabaseClient.from(table).insert(row).select().single();
    if (error) throw error;
    return data;
  },

  async update(table, id, updates) {
    const { data, error } = await supabaseClient.from(table).update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async remove(table, id) {
    const { error } = await supabaseClient.from(table).delete().eq('id', id);
    if (error) throw error;
  },

  async count(table, filters = {}) {
    let query = supabaseClient.from(table).select('*', { count: 'exact', head: true });
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) query = query.eq(key, value);
    });
    const { count, error } = await query;
    if (error) throw error;
    return count;
  },

  async rpc(fnName, params = {}) {
    const { data, error } = await supabaseClient.rpc(fnName, params);
    if (error) throw error;
    return data;
  },

  async logActivity(action, entityType, entityId, description) {
    const user = await getUser();
    await this.insert('activity_log', {
      action,
      entity_type: entityType,
      entity_id: entityId,
      description,
      user_id: user?.id || null
    });
  }
};
