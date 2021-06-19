<script type="ts">
	import { Alert, Icon, Table, Card, CardHeader, CardBody, CardTitle, Row, Col } from 'sveltestrap';
	import {
		findCertificateError,
		getNamesAndBirthdate,
		getCertificateAuthority,
		getPublicKey
	} from '$lib/2ddoc';
	import type { Certificate } from '../lib/2ddoc';
	import CertificateVaccineInfo from './_CertificateVaccineInfo.svelte';
	import CertificateTestInfo from './_CertificateTestInfo.svelte';
	export let certificate: Certificate;
	export let with_fullscreen = false;
	$: error = findCertificateError(certificate);
	$: vaccine = 'vaccinated_first_name' in certificate;
	$: info = getNamesAndBirthdate(certificate);
</script>

<Alert color={error ? 'warning' : 'info'} fade={false}>
	{#if with_fullscreen}
		<a style="float:right" href="/fullscreen#{certificate.code}">
			<Icon name="arrows-fullscreen" />
		</a>
	{/if}
	<Row>
		<div class="col-sm-0 col-md-3 text-center align-middle emoji">{vaccine ? '💉' : '🧪'}</div>
		<Col sm="12" md="9">
			<h4>{vaccine ? 'Vaccin' : 'Test de dépistage'}</h4>
			<p>
				👤
				<span class="first_name">{info.first_name.toLocaleLowerCase()}</span>
				<span class="last_name">{info.last_name}</span>
			</p>
			<p>🎂 Né(e) le {info.birth_date.toLocaleDateString('fr')}</p>
		</Col>
	</Row>
	<Row>
		{#if error}
			<p class="error">⚠️ <strong>{error}</strong></p>
		{/if}
		<details>
			<summary>Détails techniques</summary>

			<Card class="mb-3 mt-3">
				<CardHeader>
					<CardTitle>Informations générales</CardTitle>
				</CardHeader>
				<CardBody>
					<Table class="table-sm">
						<tbody>
							<tr>
								<th class="text-start">Version 2D-Doc</th>
								<td class="text-end">{certificate.document_version}</td>
							</tr>
							<tr>
								<th scope="row" class="text-start">Date de création</th>
								<td class="text-end"
									>{certificate.creation_date
										? certificate.creation_date.toLocaleDateString('fr-FR')
										: ' - '}</td
								>
							</tr>
							<tr>
								<th class="text-start">Date de signature</th>
								<td class="text-end"
									>{certificate.signature_date
										? certificate.signature_date.toLocaleDateString('fr-FR')
										: ' - '}</td
								>
							</tr>
							<tr>
								<th class="text-start">Autorité de certification</th>
								<td class="text-end"
									>{getCertificateAuthority(certificate.certificate_authority_id)}
									<small>({certificate.certificate_authority_id})</small></td
								>
							</tr>
							<tr>
								<th class="text-start">Clé de chiffrement</th>
								<td class="text-end"
									>{getPublicKey(certificate.public_key_id)}
									<small>({certificate.public_key_id})</small></td
								>
							</tr>
							<tr>
								<th class="text-start">Type de document</th>
								<td class="text-end"
									>{certificate.document_type == 'B2'
										? 'Résultat de test virologique'
										: 'Attestation vaccinale'} <small>({certificate.document_type})</small></td
								>
							</tr>
							<tr>
								<th class="text-start">Périmètre</th>
								<td class="text-end">{certificate.document_perimeter}</td>
							</tr>
							<tr>
								<th class="text-start">Pays émetteur</th>
								<td class="text-end">{certificate.document_country}</td>
							</tr>
						</tbody>
					</Table>
				</CardBody>
			</Card>

			{#if 'vaccinated_first_name' in certificate}
				<CertificateVaccineInfo {certificate} />
			{:else}
				<CertificateTestInfo {certificate} />
			{/if}

			<Card class="mb-3">
				<CardHeader>
					<CardTitle>Données brutes</CardTitle>
				</CardHeader>
				<CardBody>
					<Table class="table-sm">
						<tbody>
							<tr>
								<td class="text-start">Code 2D-Doc</td>
								<td class="text-end"><code class="rawdata">{certificate.code}</code></td>
							</tr>
						</tbody>
					</Table>
				</CardBody>
			</Card>
		</details>
	</Row>
</Alert>

<style>
	.first_name {
		text-transform: capitalize;
	}
	p {
		margin-bottom: 0.5rem;
	}
	.rawdata {
		word-break: break-all;
	}
	.emoji {
		font-size: 3.5em;
		margin: auto;
	}
</style>
