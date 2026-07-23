import { getSupabase } from '../lib/supabase';
import { TOPIC_SLUGS } from '../lib/topics';

export default async function sitemap() {
  const base = 'https://oneupday.app';
  const now = new Date();
  const staticUrls = ['', '/login', '/explore', '/dia1'].map(u => ({ url: `${base}${u}`, lastModified: now, changeFrequency: 'daily', priority: u === '' ? 1 : 0.7 }));
  const topicUrls = TOPIC_SLUGS.map(s => ({ url: `${base}/tema/${s}`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 }));
  let journeyUrls = [];
  try {
    const sb = getSupabase();
    const { data } = await sb.from('journeys').select('slug, created_at').eq('visibility', 'public').order('created_at', { ascending: false }).limit(1000);
    journeyUrls = (data || []).map(j => ({ url: `${base}/${j.slug}`, lastModified: new Date(j.created_at || now), changeFrequency: 'weekly', priority: 0.5 }));
  } catch { }
  return [...staticUrls, ...topicUrls, ...journeyUrls];
}
