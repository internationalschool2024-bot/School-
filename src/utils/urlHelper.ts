import { TabType } from '../components/Navbar';

export interface ParsedRoute {
  tab: TabType;
  studentId?: string;
}

/**
 * Parses the current window URL to determine the active tab and optional studentId
 */
export function getRouteFromUrl(): ParsedRoute {
  if (typeof window === 'undefined') {
    return { tab: 'dashboard' };
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.replace(/^#\/?/, '').trim();

    // Check for studentId in query
    let studentId = 
      params.get('studentId') || 
      params.get('student_id') || 
      params.get('id') || 
      params.get('student') || 
      undefined;

    // Check query params for tab/portal
    const portalParam = params.get('portal')?.toLowerCase();
    const tabParam = (params.get('tab') || portalParam)?.toLowerCase();

    if (portalParam === 'parent' || tabParam === 'portal' || tabParam === 'parent') {
      return { tab: 'portal', studentId };
    }

    const validTabs: TabType[] = ['dashboard', 'students', 'teachers', 'finances', 'grades', 'followup', 'sms', 'portal'];
    if (tabParam && validTabs.includes(tabParam as TabType)) {
      return { tab: tabParam as TabType, studentId };
    }

    // Check hash route fallback: e.g. #portal/10425 or #portal or #students
    if (hash) {
      const parts = hash.split('/');
      const hashTab = parts[0]?.toLowerCase();
      const hashId = parts[1];

      if (hashTab === 'parent' || hashTab === 'portal') {
        return { tab: 'portal', studentId: hashId || studentId };
      }
      if (validTabs.includes(hashTab as TabType)) {
        return { tab: hashTab as TabType, studentId: hashId || studentId };
      }
    }
  } catch (err) {
    console.error('Error parsing route from URL:', err);
  }

  return { tab: 'dashboard' };
}

/**
 * Builds a clean, shareable URL for any portal/tab
 */
export function buildPortalUrl(tab: TabType, studentId?: string): string {
  if (typeof window === 'undefined') return '';

  const origin = window.location.origin;
  const pathname = window.location.pathname;

  if (tab === 'portal') {
    if (studentId) {
      return `${origin}${pathname}?portal=parent&studentId=${encodeURIComponent(studentId)}`;
    }
    return `${origin}${pathname}?portal=parent`;
  }

  if (tab === 'dashboard') {
    return `${origin}${pathname}?tab=dashboard`;
  }

  return `${origin}${pathname}?tab=${tab}`;
}

/**
 * Updates the browser's address bar without triggering a reload
 */
export function syncUrlWithTab(tab: TabType, studentId?: string) {
  if (typeof window === 'undefined') return;

  try {
    const newUrl = buildPortalUrl(tab, studentId);
    if (window.location.href !== newUrl) {
      window.history.replaceState({ tab, studentId }, '', newUrl);
    }
  } catch (err) {
    console.error('Failed to sync URL:', err);
  }
}

/**
 * Robust copy-to-clipboard function
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback below
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Copy fallback failed:', err);
    return false;
  }
}
