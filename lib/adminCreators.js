/**
 * Builds a deduplicated list of admin & sub-admin creators.
 * Normalizes by user name & email, merges multiple account IDs belonging
 * to the same administrator, and promotes role to ADMIN if any account is ADMIN.
 */
export function buildDeduplicatedCreators({
  currentAdmin = null,
  adminUsersList = [],
  items = [],
  getItemCreator = (item) => item?.createdBy,
  getItemCreatorId = (item) => item?.createdById,
}) {
  const map = new Map();

  const addCreator = (rawUser) => {
    if (!rawUser) return;
    const id = String(rawUser.id || rawUser._id || '').trim();
    if (!id) return;
    const name = (rawUser.name || rawUser.email || (rawUser.role === 'ADMIN' ? 'Main Admin' : 'Sub-Admin')).trim();
    const normKey = name.toLowerCase();

    if (!map.has(normKey)) {
      map.set(normKey, {
        id,
        ids: [id],
        name,
        email: rawUser.email || '',
        role: rawUser.role || 'ADMIN'
      });
    } else {
      const existing = map.get(normKey);
      if (!existing.ids.includes(id)) {
        existing.ids.push(id);
      }
      if (rawUser.role === 'ADMIN') {
        existing.role = 'ADMIN';
        existing.id = id;
      }
    }
  };

  if (currentAdmin && (currentAdmin.role === 'ADMIN' || currentAdmin.role === 'SUB_ADMIN')) {
    addCreator(currentAdmin);
  }

  if (Array.isArray(adminUsersList)) {
    adminUsersList.forEach((u) => addCreator(u));
  }

  if (Array.isArray(items)) {
    items.forEach((item) => {
      const cId = getItemCreatorId(item);
      const cObj = getItemCreator(item);
      if (cId) {
        addCreator({
          id: cId,
          name: cObj?.name,
          email: cObj?.email,
          role: cObj?.role
        });
      }
    });
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
    if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1;
    return (a.name || '').localeCompare(b.name || '');
  });
}

/**
 * Checks if a given item's createdById matches the selectedAdmin filter,
 * checking all merged IDs for that creator.
 */
export function matchesCreatorFilter(itemCreatorId, selectedAdmin, allCreators = []) {
  if (!selectedAdmin || selectedAdmin === 'ALL') return true;
  const creator = allCreators.find((c) => String(c.id) === String(selectedAdmin));
  if (creator && Array.isArray(creator.ids)) {
    return creator.ids.map(String).includes(String(itemCreatorId));
  }
  return String(itemCreatorId) === String(selectedAdmin);
}
