import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import BottomNav from '../../components/BottomNav';
import AddMediaForm from './AddMediaForm';
import AppTop from '../../components/AppTop';

export const dynamic = 'force-dynamic';

export default async function Midia() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const t = getDict(getLocale());
  const { data: journeys } = await supabase.from('journeys').select('id, title, created_at').eq('owner_id', user.id).order('created_at', { ascending: false });

  return (
    <>
      <AppTop backLabel={t.back} />
      <main className="wrap">
        <div className="create-head"><p className="eyebrow">{t.mediaEyebrow}</p><h1>{t.mediaTitle}</h1></div>
        <AddMediaForm userId={user.id} journeys={journeys || []} t={{
          pick: t.mediaPick, uploading: t.uploading, replace: t.mediaReplace2, error: t.postError, videoTooBig: t.videoTooBig,
          destTitle: t.mediaDest, destJourney: t.mediaDestJourney, destJourneySub: t.mediaDestJourneySub, destAlbum: t.mediaDestAlbum, destAlbumSub: t.mediaDestAlbumSub,
          whichJourney: t.mediaWhichJourney, whichDay: t.mediaWhichDay, whoSees: t.mediaWhoSees,
          pubPublic: t.pubPublic, pubFollowers: t.pubFollowers, pubPrivate: t.pubPrivate,
          save: t.mediaSave, saving: t.creating, captionLabel: t.mediaCaption, captionPh: t.mediaCaptionPh,
          crop: { original: t.cropOriginal, square: t.cropSquare, portrait: t.cropPortrait, landscape: t.cropLandscape, use: t.cropUse, edit: t.cropEdit, cancel: t.cropCancel, hint: t.cropHint, hintOriginal: t.cropHintOriginal, zoom: t.cropZoom },
        }} />
      </main>
      <BottomNav active="profile" t={t} />
    </>
  );
}
