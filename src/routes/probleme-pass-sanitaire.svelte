<svelte:head>
	<title>Le problème avec les passes sanitaires - Sanipasse</title>
</svelte:head>

<h1>Le problème avec les passes sanitaires</h1>
<p>Le 18 mai 2021, l'instauration d'un système de passe sanitaire a été voté au Sénat.</p>
<p>
	À partir du 9 juin 2021, un certificat de test négatif, de rétablissement, ou de vaccination
	contre le COVID-19 sera obligatoire pour participer à certains événements de plus de 1000
	participants.
</p>
<p>
	Le texte voté par le Sénat précise que

	<figure class="mt-2">
		<blockquote class="blockquote">
			<p class="fs-6">
				La présentation, sur papier ou sous format numérique, des documents mentionnés au premier
				alinéa du présent B est réalisée sous une forme ne permettant pas aux personnes habilitées
				ou aux services autorisés à en assurer le contrôle de connaître la nature du document ni les
				données qu’il contient.
			</p>
		</blockquote>
		<figcaption class="blockquote-footer">
			Projet de loi sur <cite title="Sénat"
				><a href="http://www.senat.fr/leg/pjl20-622.html">senat.fr</a></cite
			>
		</figcaption>
	</figure>
</p>

<p>
	Pourtant, ni le format de données utilisé dans les codes barres présents sur les certificats de
	test et de vaccination émis aujourd'hui en France (<abbr
		title="format standardisé par l'agence nationale des titres sécurisés">2D-DOC</abbr
	>), ni le format du futur "passe sanitaire européen" (<abbr title="Digital Green Certificate"
		>DGC</abbr
	>) ne permettent techniquement d'offrir cette garantie si ils sont présentés directement aux
	<i>personnes habilitées</i>.
</p>

<p>
	En effet, les codes contenant ces certificats contiennent toutes leurs informations en clair, et
	peuvent être lus par tout un chacun avec une simple lecteur de QR code, ou avec le logiciel libre
	<a href="/">sanipasse</a> présent sur ce site pour en mettre en forme tout le contenu, par exemple.
</p>

<p>
	La solution technique vers laquelle nous nous dirigeons est donc probablement la simple
	distribution aux agents de vérification d'une application privée et propriétaire qui est
	volontairement bridée pour ne pas afficher tous les champs de données contenus dans les passes des
	personnes qu'ils contrôlent. Cette solution est problématique pour plusieurs raisons:
</p>
<ul>
	<li>
		Elle est facilement contournable. La personne chargée du contrôle peut facilement scanner le
		passe sanitaire différemment, et avoir accès aux informations qu'il n'est pas censé pouvoir
		lire.
	</li>
	<li>
		Elle n'est pas auditable. Si l'application de vérification est privée (comme l'est actuellement
		l'application <i>TousAntiCovid-Vérif</i>), elle ne peut pas être auditée publiquement par des
		chercheurs en sécurité indépendants.
	</li>
	<li>
		Et c'est une conséquence des deux points ci-dessus: elle ne peut susciter que la défiance de la
		part des citoyens dont le passe est contrôlé, et qui n'ont pas de garanties sur le contenu exact
		des informations personnelles qui sont lues.
	</li>
</ul>

<h2>Une solution plus respectueuse de la vie privée</h2>
<p>
	Puisque les informations privées sont contenues en clair dans les certificats, le seul moyen de
	les cacher aux organisateurs d'événement est de ne pas leur montrer les certificats.
</p>
<p>
	Si l'on veut quand même avoir un système permettant d'organiser de grands événements sans risque
	de contamination, alors il faut instaurer un tiers de confiance entre les organisateurs
	d'événements et les participants.
</p>
<p>
	<i>Sanipasse</i> tente de répondre à ce problème en offrant un système open-source
	<a href="/events">d’organisation d’événements</a> dans lequel les invités scannent eux-mêmes leur passe
	sanitaire, qui est vérifié de manière sécurisée, et ensuite immédiatement supprimé. Cela offre ainsi
	la garantie que les organisateurs n’ont accès à aucune autre information que ce qu'ils ont légalement
	l'autorisation de vérifier.
</p>

<footer class="fs-6 mt-2 mb-3 text-italics">
	<hr />
	<i>Ophir LOJKINE</i>, le 2021-05-23
</footer>

<style>
	blockquote {
		border-left: 3px solid grey;
		padding-left: 13px;
	}
</style>
