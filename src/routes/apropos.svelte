<svelte:head>
	<title>Sanipasse: Comment ça marche</title>
</svelte:head>
<h1>À propos de Sanipasse</h1>

<p>Bonjour ! 👋</p>
<p>
	Moi c'est <a href="https://ophir.dev">Ophir</a>, et je suis le développeur de
	<a href="https://sanipasse.fr">sanipasse</a>. Vous trouverez sur cette page la description du
	fonctionnement de l'application, des informations sur sa sécurité et la gestion des données
	personnelles, ainsi que les mentions légales.
</p>

<h2>🤔 Comment utiliser Sanipasse</h2>

<p>Sanipasse est un logiciel libre qui a deux fonctions principales:</p>
<ul>
	<li>
		la création de <i>listes d'invités</i> qui peuvent confirmer eux-mêmes leur présence en scannant
		leur passe sanitaire,
	</li>
	<li>
		et la <i>lecture de vos propres certificats</i>, pour vérifier les informations qu'ils
		contiennent.
	</li>
</ul>

<p>
	Sanipasse vous aide ainsi à organiser le déconfinement en toute sérénité, dans le respect des
	règles sanitaires.
</p>

<h3>📜 Liste d'invités</h3>
<p>
	Si vous organisez un évènement, vous avez peut-être déjà une liste d'invités. Et comme vous ne
	voulez pas prendre de risque, vous aimeriez que tous vos invités soient vaccinés ou testés avant
	de venir. Sans sanipasse, lorsque vos invités arriveront, vous allez donc devoir prendre le temps
	de vérifier deux choses:
</p>
<ul>
	<li>la personne qui se présente est-elle bien sur la liste d'invités ?</li>
	<li>a-t-elle bien un certificat de test ou de vaccination ?</li>
</ul>
<p>
	D'une part, même en vérifiant ces deux choses, vous ne saurez pas si le certificat qui vous a été
	présenté est authentique. D'autre part, cela oblige vos invités à vous révéler un document à
	caractère médical, qui est personnel.
</p>
<p>
	Avec <i>sanipasse</i>, c'est plus simple, plus sécurisé, et plus respectueux de la vie privée:
</p>
<ol>
	<li>Vous créez votre liste d'invités directement sur sanipasse.</li>
	<li>Un lien est généré automatiquement, vous l'envoyez à vos invités.</li>
	<li>
		Ils confirment eux-mêmes leur présence en scannant leur certificat de test ou de vaccination sur
		le lien que vous leur avez envoyé.
	</li>
	<li>
		Lorsque les invités arrivent, vous pouvez vérifier s’ils sont bien testés ou vaccinés
		directement depuis la liste d'invités que vous avez créée sur sanipasse.
	</li>
</ol>
<h3>🔑 Sécurité</h3>
<p>
	Les certificats de test ou de vaccination contiennent une
	<a href="https://fr.wikipedia.org/wiki/Signature_num%C3%A9rique">signature numérique</a>, ce qui
	empêche de les contrefaire. Si quelqu'un essaie de modifier un certificat existant ou d'en créer
	un lui-même, sanipasse détectera que la signature du document est invalide, et ne validera pas son
	certificat.
</p>

<h3>🔒 Protection des données personnelles</h3>
<p>
	Sanipasse restreint son utilisation des données personnelles au <b>strict minimum</b>.
</p>
<p>
	Lorsque vous chargez un passe sanitaire <b>depuis la page d'accueil</b>, il reste sur votre
	ordinateur, et n'est pas envoyé au serveur de sanipasse.
</p>
<p>
	Lorsque vous chargez un passe sanitaire <b>en réponse à une invitation à un évènement</b>, et que
	vous choisissez explicitement de l'envoyer, il est envoyé au serveur
	<i>uniquement pour vérifier sa validité</i>. Une fois la validité vérifiée (en quelques
	millisecondes), il est <i>immédiatement supprimé</i>. Nous ne gardons ensuite aucune trace des
	informations sensibles, et conservons uniquement une donnée binaire: si oui ou non l'invitation
	qui vous a été envoyée a été validée. Seule cette validation est visible par l'organisateur de
	l'évènement. Aucun humain n'a ainsi eu accès aux informations contenues dans le certificat
	sanitaire.
</p>
<p>
	Pour toute demande concernant la gestion de la vie privée dans sanipasse (information, demande de
	modification, ou de rétractation), vous pouvez m'envoyer un mail à <a
		href="mailto:contact@ophirdev?subject=Sanipasse, données personnelles">contact@ophir.dev</a
	>.
</p>

<h2>⚖️ Mentions légales</h2>
<h5>Licéité du traitement</h5>
<p>
	Le traitement des données personnelles effectué par sanipasse se fonde sur l'
	<a href="https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre2#Article6"
		>Article 6</a
	>
	du règlement général sur la protection des données (RGPD) européen, paragraphe <i>(f)</i>:
</p>
<blockquote class="blockquote fs-6">
	Le traitement est nécessaire aux fins des intérêts légitimes poursuivis par le responsable du
	traitement ou par un tiers, à moins que ne prévalent les intérêts ou les libertés et droits
	fondamentaux de la personne concernée qui exigent une protection des données à caractère
	personnel, notamment lorsque la personne concernée est un enfant.
</blockquote>
<p>
	Délégué à la protection des données: <a href="mailto:contact@ophir.dev">Ophir LOJKINE</a>.
</p>

<h3>Identification</h3>
<h4>🧔 Auteur</h4>
<pre>
Ophir LOJKINE
84 rue de Charenton, 75012 Paris
contact@ophir.dev
</pre>
<h4>🇪🇺 Hébergeur</h4>
<p>
	Site hébergé par
	<a href="https://www.hetzner.com/rechtliches/impressum">Hetzner</a>
	(<a href="mailto:info@hetzner.com">info@hetzner.com</a>).
</p>
<pre>
Hetzner Online GmbH
Industriestr. 25
91710 Gunzenhausen
Germany

Tel.: +49 (0)9831 505-0*
Fax: +49 (0)9831 505-3

Ansbach Registration Office, HRB 6089
VAT Reg. No. DE 812871812
CEO: Martin Hetzner, Stephan Konvickova, Günther Müller
</pre>

<h3>🍪 Cookies</h3>
<p>
	Ce site web n'utilise pas de cookies, et ne piste pas ses utilisateurs. Pas de bannière “accepter
	les cookies” ici, et c'est tant mieux !
</p>

<h2>📝 Code source</h2>
<p>
	Cette application est un logiciel libre, sous license <a href="/LICENSE">AGPL</a>. Vous pouvez
	lire et télécharger son
	<a href="https://github.com/lovasoa/sanipasse">code source sur Github</a>.
</p>

<h3>Auto-hébergement</h3>
<p>
	Si vous possédez un serveur, vous êtes encouragés à héberger sanipasse par vous-mêmes: installez
	sanipasse sur votre serveur, et vous aurez le contrôle total de son déploiement et de son
	utilisation.
</p>

<h3>Orthographe</h3>
<p>
	Oui, je sais que le gouvernement écrit <i>pass sanitaire</i>, mais moi j'écris
	<i>pass<b>e</b> sanitaire</i>.
	<figure class="mt-2">
		<blockquote class="blockquote">
			<p class="fs-6"><strong>passe</strong> <i>nom masculin</i>: Passe-partout, Laissez-passer.</p>
		</blockquote>
		<figcaption class="blockquote-footer">
			Le <cite title="Source Title"
				><a href="https://www.larousse.fr/dictionnaires/francais/passe/58462">Larousse</a></cite
			>
		</figcaption>
	</figure>
	Le mot <i>pass</i> n'est lui pas dans le dictionnaire.
</p>
