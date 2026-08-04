# Acesso remoto à câmera

O One Up Day tem a página autenticada `/camera`. Ela abre o painel do `camera-ip-app`, que continua rodando no computador local.

## Configuração

1. Instale Tailscale ou configure uma VPN entre o computador da câmera e o dispositivo que fará o acesso.
2. No computador da câmera, deixe o `camera-ip-app` rodando com `AUTH_USER` e `AUTH_PASS` definidos no `.env`.
3. Confirme o acesso privado, por exemplo `http://100.x.x.x:8088` dentro da VPN.
4. Cadastre no ambiente da Vercel a variável `CAMERA_REMOTE_URL` com esse endereço.
5. Acesse `https://oneupday.app/camera` depois de entrar na conta.

Não use a porta 8088 diretamente exposta na internet. A URL da câmera não deve conter usuário ou senha.
