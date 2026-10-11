import { fileURLToPath } from 'url';

export const ADMIN_STATE = fileURLToPath(new URL('../playwright/.auth/admin.json', import.meta.url));
