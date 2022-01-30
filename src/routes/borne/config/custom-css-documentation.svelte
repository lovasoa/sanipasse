<script lang="ts">
	const l = [
		{ title: "Message d'accueil", selector: '#welcome_message' },
		{ title: 'Titre', selector: '#welcome_message h1' },
		{ title: 'Description', selector: '#description' },
		{ title: "Message affiché lorsqu'un passe est valide", selector: '.validated_pass' },
		{ title: "Message affiché lorsqu'un passe est refusé", selector: '.refused_pass' },
		{ title: 'Logo supérieur', selector: '.logo' },
		{ title: "Message affiché lorsqu'un passe est refusé", selector: '.refused_pass' },
		{ title: "Message affiché lorsqu'un passe est refusé", selector: '.refused_pass' },
		{ title: "Fond d'écran", selector: '.background' },
		{ title: "Médias affichés au dessus du message d'accueil", selector: '.top_media' }
	];
</script>

<h1 class="mb-3">Personnalisation avancée de l'affichage dans sanipasse borne</h1>
<p>
	Sanipasse borne offre la possibilité de configurer très précisément tous les aspects de la
	présentation visuelle de l'interface de vérification des passes sanitaires.
</p>

<p>
	Ceci est une fonctionnalité avancée qui, si elle est mal utilisée, peut empêcher le bon
	fonctionnement de l'interface. Pour l'utiliser, il vous faudra <a
		class="link-dark"
		href="https://developer.mozilla.org/fr/docs/Learn/Getting_started_with_the_web/CSS_basics"
		>apprendre à maîtriser le language <abbr title="Custom Style">CSS</abbr></a
	>. Soyez sûr de bien comprendre le fonctionnement et la portée des règles CSS que vous entrez ici
	avant de les appliquer.
</p>

<p>
	Une fois que vous avez compris le fonctionnement du langage CSS et que vous avez en tête les
	personnalisations que vous souhaitez appliquer, vous pouvez commencer à configurer l'interface en
	appliquant vos règles CSS aux sélecteurs CSS décrits ci-dessous.
</p>

<h2>Sélecteurs CSS à utiliser</h2>

<p>
	L'interface de sanipasse borne est composée de plusieurs parties, chacune peut être sélectionnée à
	l'aide d'un sélecteur CSS tel que décrit ci-dessous.
</p>
<div class="d-flex flex-wrap">
	{#each l as m}
		<div class="card m-2 w-100">
			<div class="row g-0">
				<a class="col-md-4" href="/documentation/{encodeURIComponent(m.title)}.png" target="_blank">
					<img
						src="/documentation/{encodeURIComponent(m.title)}.png"
						class="img-fluid rounded-start"
						alt="screenshot {m.title}"
					/>
				</a>
				<div class="col-md-8 card-body">
					<h3 class="card-title">{m.title}</h3>
					<div class="card-text">
						<pre class="border border-2 rounded bg-light p-3"><code
								>{m.selector + ' {\n\t...\n}'}</code
							></pre>
					</div>
				</div>
			</div>
		</div>
	{/each}
</div>
