<h1>Utiliser un lecteur de QR code avec sanipasse</h1>

<p>
	Sanipasse borne peut fonctionner de deux manières différentes : soit en mode "lecteur physique"
	soit en mode "webcam".
</p>
<p>
	Le mode webcam est plus simple à mettre en place, car il ne nécessite pas de matériel spécial en
	dehors de la webcam déjà intégrée dans la plupart des appareils. Mais le mode "lecteur physique"
	est plus puissant et plus flexible, car il permet de scanner des codes de manière plus rapide et
	plus fiable même dans de mauvaises conditions de luminosité.
</p>
<p>
	Pour mettre en place le mode "lecteur physique", il vous faudra vous procurer un lecteur de QR
	code USB compatible.
</p>
<p>
	Les lecteurs suivants ont été testés par leur distributeur, qui garantit leur fonctionnement avec
	sanipasse borne:
</p>
<ul class="list-group m-3">
	<a
		class="list-group-item list-group-item-action"
		href="https://solucode.com/fr/inventaires-codebarre/189-dc320-lecteur-2d-imageur-filaire-kit-complet-usb-noir-districode.html"
	>
		<img
			src="https://solucode.com/306-thickbox_default/dc320-lecteur-2d-imageur-filaire-kit-complet-usb-noir-districode.jpg"
			class="rounded float-start m-1"
			alt="DC320 Lecteur 2D imageur filaire kit complet USB noir DISTRICODE"
			height="74"
			width="80"
		/>
		<b>Pistolet</b>
		<p>
			Scanner que l'on tient dans la main, qui permet de scanner les codes de barres dans n'importe
			quel endroit et dans n'importe quelle position.
		</p>
	</a>
	<a
		class="list-group-item list-group-item-action"
		href="https://solucode.com/fr/accueil/257-dc7500-scanner-omnidirectionnel-filaire-2d-rs232.html"
	>
		<img
			src="https://solucode.com/424-thickbox_default/dc7500-scanner-omnidirectionnel-filaire-2d-rs232.jpg"
			class="rounded float-start m-1"
			alt="DC7500 scanner omnidirectionnel filaire 2D RS232"
			height="74"
			width="80"
		/>
		<b>Mini Scanner intégrable</b>
		<p>
			Utilisation idéale en magasin, pour intégration dans un kiosque, une borne ou dans un plan de
			travail, pour créer votre propre solution matérielle.
		</p>
	</a>
</ul>
<p>
	Une fois que vous avez connecté votre scanner de QR code à votre appareil, il doit être reconnu
	comme un clavier, et vous devez vous assurer que la disposition clavier associée à l'appareil est
	correcte. Il doit être configuré pour ne remonter que le contenu du QR code, sans aucune
	modification: il ne doit pas ajouter d'espace ou de saut de ligne après la fin du contenu du code.
	Référez-vous à la documentation de votre appareil pour plus d'informations.
</p>
<p>
	Dans la <a href="/borne/config">page de configuration de sanipasse borne</a>, vous pouvez ensuite
	choisir le mode de scan "Scanneur de QR code USB physique", comme indiqué sur la capture d'écran
	ci-dessous:
</p>
<img
	class="img-fluid shadow-sm border"
	src="/screenshot-qrscanner.png"
	alt="scan-lecteur-qr-code"
/>
