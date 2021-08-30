<script lang="ts">
	const articles = [
		{
			title: "L'API de vérification des passes sanitaires Sanipasse",
			emoji: '🌐',
			date: new Date('2021-08-30'),
			link: '/api-pass-sanitaire',
			description:
				'Sanipasse propose désormais une API de vérification des passes sanitaires qui permet' +
				"de décoder et contrôler la validité d'un passe sanitaire avec une simple requête HTTP."
		},
		{
			title: 'Le problème avec les passes sanitaires',
			emoji: '🕵️',
			date: new Date('2021-05-23'),
			link: '/probleme-pass-sanitaire',
			description:
				'Les informations médicales des certificats de test et de vaccination ne sont pas cryptées. ' +
				'Comment faire fonctionner les passes sanitaires sans divulguer ses données de santé  ?'
		},
		{
			title: 'The french health pass',
			emoji: '🇬🇧',
			lang: 'en',
			date: new Date('2021-05-19'),
			link: '/french-health-pass',
			description: 'An article in english about the the french health pass and how it works.'
		},
		{
			title: 'À propos',
			emoji: '🤔',
			date: new Date('2021-05-15'),
			link: '/apropos',
			description: 'Description du fonctionnement de Sanipasse, et réponse aux questions courantes.'
		}
	];
</script>

{#each articles as { title, emoji, date, link, description, lang }}
	<a
		href={link}
		class="card mb-3"
		style="max-width: 540px;"
		lang={lang || 'fr'}
		hreflang={lang || 'fr'}
	>
		<div class="row g-0">
			<div class="col-md-4 text-center d-flex" style="font-size: 3em">
				<span class="align-self-center w-100">{emoji}</span>
			</div>
			<div class="col-md-8">
				<div class="card-body">
					<h5 class="card-title">{title}</h5>
					<p class="card-text">
						{description}
					</p>
					<p class="card-text"><small class="text-muted">{date.toLocaleDateString()}</small></p>
				</div>
			</div>
		</div>
	</a>
{/each}

<style>
	a {
		color: inherit;
		text-decoration: none;
	}
	a:hover h5 {
		text-decoration: underline;
	}
</style>
