import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import AnimatedLogo from '../../components/AnimatedLogo';
import GoogleButton from './GoogleButton';
import EmailLogin from './EmailLogin';
import { safeAuthNext } from '../../lib/authNext.mjs';

export default function Login({ searchParams }) {
  const locale = getLocale();
  const t = getDict(locale);
  const nextPath = safeAuthNext(searchParams?.next);
  return (
    <>
      <main className="auth-wrap">
        <div className="auth-card">
          <div className="auth-mark auth-mark-anim"><AnimatedLogo /></div>
          <h1>{t.loginTitle}</h1>
          <p>{t.loginSub}</p>
          <GoogleButton labelIdle={t.continueGoogle} labelLoading={t.openingGoogle} errorMsg={t.loginError} nextPath={nextPath} />
          {/* Segunda porta: quem não quer amarrar o app à conta Google
              pessoal hoje simplesmente não entra — e não avisa ninguém. */}
          <div className="auth-or"><span>{t.mailOr}</span></div>
          <EmailLogin t={t} nextPath={nextPath} />
          <small>{t.loginTerms}</small>
        </div>
      </main>
    </>
  );
}
