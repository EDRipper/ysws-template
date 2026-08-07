import { getPublicYswsConfig } from '$lib/server/ysws-config';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	return { yswsConfig: getPublicYswsConfig() };
};
