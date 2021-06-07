<script type="ts">
	import { Alert, Row, Col, Icon } from 'sveltestrap';
	import { findCertificateError, getNamesAndBirtdate } from '$lib/2ddoc';
	import type { Certificate } from '../lib/2ddoc';
	export let certificate: Certificate;
	export let with_fullscreen = false;
	$: error = findCertificateError(certificate);
	$: vaccine = 'vaccinated_first_name' in certificate;
	$: info = getNamesAndBirtdate(certificate);
</script>

<Alert color={error ? 'warning' : 'info'} fade={false}>
	{#if with_fullscreen}
		<a style="float:right" href="/fullscreen#{certificate.code}">
			<Icon name="arrows-fullscreen" />
		</a>
	{/if}
	<h4 class="text-center">{vaccine ? 'Vaccin' : 'Test de dépistage'}</h4>
	<Row>
		<div class="col-sm-0 col-md-3 text-center align-middle emoji">{vaccine ? '💉' : '🧪'}</div>
		<Col sm="12" md="9">
			<p>
				👤
				<span class="first_name">{info.first_name.toLocaleLowerCase()}</span>
				<span class="last_name">{info.last_name}</span>
			</p>
			<p>🎂 Né(e) le {info.birth_date.toLocaleDateString('fr')}</p>
			{#if error}
				<p class="error">⚠️ <strong>{error}</strong></p>
			{/if}
			<p>
				<details>
					<summary>Détails techniques</summary>
					<pre>{JSON.stringify(certificate, null, '  ')}</pre>
				</details>
			</p>
		</Col>
	</Row>
</Alert>

<style>
	.emoji {
		font-size: 4em;
		margin: auto;
	}
	.first_name {
		text-transform: capitalize;
	}
	p {
		margin-bottom: 0.5rem;
	}
	pre {
		font-size: 0.8em;
	}
</style>
