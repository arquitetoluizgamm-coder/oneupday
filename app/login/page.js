import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import Logo from '../../components/Logo';
import GoogleButton from './GoogleButton';

export default function Login() {
  const locale = getLocale();
  const t = getDict(locale);
  return (
    <>
      <header className="top"><Logo /></header>
      <main className="auth-wrap">
        <div className="auth-card">
          <h1>{t.loginTitle}</h1>
          <p>{t.loginSub}</p>
          <GoogleButton labelIdle={t.continueGoogle} labelLoading={t.openingGoogle} errorMsg={t.loginError} />
          <small>{t.loginTerms}</small>
        </div>
      </main>
    </>
  );
}
