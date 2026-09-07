export function circleLabels(locale = 'pt') {
  if (locale === 'en') {
    return {
      title: 'Circles', intro: 'Private spaces to walk alongside people who matter.',
      mine: 'My Circles', managed: 'I manage', invites: 'Invitations', create: 'Create Circle',
      professionalOnly: 'Only verified professionals can create Circles.',
      empty: 'Your Circles will appear here after you accept an invitation.',
      private: 'Private', participates: 'You participate', manages: 'You manage',
      open: 'Open Circle', createPost: 'Create post', circleOnly: 'Only in this Circle',
      publishInOne: 'Publish normally on ONE', publishInCircle: 'Publish only in a Circle',
      noPublicLeak: 'This content will not appear in the public feed or public profile.',
    };
  }
  return {
    title: 'Círculos', intro: 'Espaços privados para caminhar perto de quem importa.',
    mine: 'Meus Círculos', managed: 'Administro', invites: 'Convites', create: 'Criar Círculo',
    professionalOnly: 'Somente profissionais verificados podem criar Círculos.',
    empty: 'Seus Círculos aparecerão aqui quando você aceitar um convite.',
    private: 'Privado', participates: 'Você participa', manages: 'Você administra',
    open: 'Abrir Círculo', createPost: 'Criar publicação', circleOnly: 'Somente neste Círculo',
    publishInOne: 'Publicar normalmente no ONE', publishInCircle: 'Publicar somente em um Círculo',
    noPublicLeak: 'Este conteúdo não aparecerá no feed público nem no perfil público.',
  };
}
