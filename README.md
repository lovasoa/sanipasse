# Sanipasse

Application opensource de vérification de passeport sanitaire et d'organisation d'événements zéro-COVID.

Cette application sait lire les codes 2D-DOC français ainsi que les "digital green certificates" européens (sous forme de QR code).

## Screenshots

<table>
    <tr>
    <td><img src="https://raw.githubusercontent.com/lovasoa/sanipasse/master/docs/screenshots/main.jpg" width="250" />
    <td><img src="https://raw.githubusercontent.com/lovasoa/sanipasse/master/docs/screenshots/event.jpg" width="250" />
    <td><img src="https://raw.githubusercontent.com/lovasoa/sanipasse/master/docs/screenshots/test.jpg" width="250" />
</table>

## Héberger son instance Sanipasse

La manière recommandée d'auto-héberger une instance de sanipasse est d'utiliser l'image docker officielle
[lovasoa/sanipasse](https://hub.docker.com/r/lovasoa/sanipasse).

L'image écoute en HTTP sur le port 3000 et stocke ses données persistentes dans le répertoire `/data/`.

Pour lancer le service sur le port 80 sur un serveur, en conservant les données dans un
[volume docker](https://docs.docker.com/storage/volumes/), on peut utiliser la commande suivante :

```bash
docker run -d -p 80:3000 -v sanipasse_data:/data/ --name sanipasse --rm lovasoa/sanipasse
```

L'image expose uniquement un serveur HTTP, mais pour fonctionner correctement, l'application doit être servie en HTTPS.
Il vous faudra donc mettre un place un reverse proxy ([nginx](https://www.nginx.com/), par exemple)
et obtenir un certificat SSL (avec [letsencrypt](https://certbot.eff.org/lets-encrypt/sharedhost-nginx), par exemple).
Une manière simple et automatisée de mettre cela en place sur un serveur personnel est d'utiliser [dokku](https://dokku.com/)
avec [dokku-letsencrypt](https://github.com/dokku/dokku-letsencrypt#dokku-letsencrypt).

## Developing

Sanipasse supports Node.js v16+.

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Running

Build the app

```bash
SVELTEKIT_ADAPTER=node npm run build
```

Then run it:

```bash
node build
```
