/**
 * Central configuration for all searchable data sections.
 * - Drives SearchSidebar tabs, SearchFilterPanel inputs, and SearchSortPanel options.
 * - Add a new section here to extend search without touching any component.
 *
 * Filter types:
 *   'select' — renders a <select> dropdown with predefined options
 *   'date'   — renders a date <input>
 *
 * @type {Record<string, {
 *   label: string,
 *   columns: string[],
 *   emptyMessage: string,
 *   filters: Array<{ key: string, label: string, type: string, options?: string[] }>,
 *   sorts: Array<{ key: string, label: string }>
 * }>}
 */
export const sectionConfig = {
  users: {
    label: 'Users',
    columns: ['User', 'Role', 'Joined', 'Actions'],
    emptyMessage: 'No users matched your search.',
    filters: [
      {
        key: 'role',
        label: 'Role',
        type: 'select',
        options: ['USER', 'ADMIN', 'SUPER_ADMIN'],
      },
      {
        key: 'joinedAfter',
        label: 'Joined After',
        type: 'date',
      },
      {
        key: 'joinedBefore',
        label: 'Joined Before',
        type: 'date',
      },
    ],
    sorts: [
      { key: 'username', label: 'Username' },
      { key: 'createdAt', label: 'Date Joined' },
      { key: 'lastLogin', label: 'Last Login' },
    ],
  },
};

/**
 * Ordered list of section keys for rendering the sidebar tabs.
 * @type {string[]}
 */
export const sectionOrder = Object.keys(sectionConfig);
