<script type="ts">
	import { Alert, Icon, Table, Card, CardHeader, CardBody, CardTitle } from 'sveltestrap';
	import {
		findCertificateError,
		getNamesAndBirthdate,
		getCertificateAuthority,
		getPublicKey,
		getSex,
		getAnalysisResult
	} from '$lib/2ddoc';
	import type { Certificate } from '../lib/2ddoc';
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
	<h4 class="text-center">{vaccine ? '💉 Vaccin' : '🧪 Test de dépistage'}</h4>

	<div class="text-center">
		<p>
			👤
			<span class="first_name">{info.first_name.toLocaleLowerCase()}</span>
			<span class="last_name">{info.last_name}</span>
		</p>
		<p>🎂 Né(e) le {info.birth_date.toLocaleDateString('fr')}</p>

		<br />

		{#if error}
			<p class="error">⚠️ <strong>{error}</strong></p>
		{/if}

		<p>
			<details>
				<summary>Détails techniques</summary>

				<Card class="mb-3 mt-3">
					<CardHeader>
						<CardTitle>Informations entête</CardTitle>
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
									<th class="text-start">ID Autorité de certification</th>
									<td class="text-end"
										>{getCertificateAuthority(certificate.certificate_authority_id)}
										<small>({certificate.certificate_authority_id})</small></td
									>
								</tr>
								<tr>
									<th class="text-start">ID Certificat</th>
									<td class="text-end"
										>{getPublicKey(certificate.public_key_id)}
										<small>({certificate.public_key_id})</small></td
									>
								</tr>
								<tr>
									<th class="text-start">Type document</th>
									<td class="text-end"
										>{certificate.document_type == 'B2'
											? 'Résultat de test virologique'
											: 'Attestation vaccinale'} <small>({certificate.document_type})</small></td
									>
								</tr>
								<tr>
									<th class="text-start">Perimetre</th>
									<td class="text-end">{certificate.document_perimeter}</td>
								</tr>
								<tr>
									<th class="text-start">Pays emetteur</th>
									<td class="text-end">{certificate.document_country}</td>
								</tr>
							</tbody>
						</Table>
					</CardBody>
				</Card>

				<Card class="mb-3">
					<CardHeader>
						<CardTitle>Informations message</CardTitle>
					</CardHeader>
					<CardBody>
						<Table class="table-sm">
							<tbody>
								<tr>
									<th class="text-start">Prénom(s)</th>
									<td class="text-end">{info.first_name}</td>
								</tr>

								<tr>
									<th class="text-start">Nom</th>
									<td class="text-end">{info.last_name}</td>
								</tr>

								<tr>
									<th class="text-start">Date de naissance</th>
									<td class="text-end">{info.birth_date.toLocaleDateString('fr-FR')}</td>
								</tr>

								{#if 'sex' in certificate}
									<tr>
										<th class="text-start">Genre</th>
										<td class="text-end"
											>{getSex(certificate.sex)} <small>({certificate.sex})</small></td
										>
									</tr>
								{/if}

								{#if 'analysis_code' in certificate}
									<tr>
										<th class="text-start">Code analyse</th>
										<td class="text-end">{certificate.analysis_code}</td>
									</tr>
								{/if}

								{#if 'analysis_result' in certificate}
									<tr>
										<th class="text-start">Resultat analyse</th>
										<td class="text-end"
											>{getAnalysisResult(certificate.analysis_result)}
											<small>({certificate.analysis_result})</small></td
										>
									</tr>
								{/if}

								{#if 'analysis_datetime' in certificate}
									<tr>
										<th class="text-start">Date prélèvement</th>
										<td class="text-end"
											>{certificate.analysis_datetime.toLocaleDateString('fr-FR')}</td
										>
									</tr>
								{/if}

								{#if 'disease' in certificate}
									<tr>
										<th class="text-start">Maladie couverte</th>
										<td class="text-end">{certificate.disease}</td>
									</tr>
								{/if}

								{#if 'prophylactic_agent' in certificate}
									<tr>
										<th class="text-start"
											><a href="https://fr.wikipedia.org/wiki/Classification_ATC" target="_blank"
												>Agent prophylactique</a
											></th
										>
										<td class="text-end">{certificate.prophylactic_agent}</td>
									</tr>
								{/if}

								{#if 'vaccine' in certificate}
									<tr>
										<th class="text-start">Nom vaccin</th>
										<td class="text-end">{certificate.vaccine}</td>
									</tr>
								{/if}

								{#if 'vaccine_maker' in certificate}
									<tr>
										<th class="text-start">Fabricant vaccin</th>
										<td class="text-end">{certificate.vaccine_maker}</td>
									</tr>
								{/if}

								{#if 'doses_received' in certificate}
									<tr>
										<th class="text-start">Doses reçues</th>
										<td class="text-end">{certificate.doses_received}</td>
									</tr>
								{/if}

								{#if 'doses_expected' in certificate}
									<tr>
										<th class="text-start">Doses attendues</th>
										<td class="text-end">{certificate.doses_expected}</td>
									</tr>
								{/if}

								{#if 'last_dose_date' in certificate}
									<tr>
										<th class="text-start">Date dernière dose</th>
										<td class="text-end"
											>{certificate.last_dose_date.toLocaleDateString('fr-FR')}</td
										>
									</tr>
								{/if}

								{#if 'cycle_state' in certificate}
									<tr>
										<th class="text-start">Etat vaccination</th>
										<td class="text-end"
											>{certificate.cycle_state === 'TE' ? 'Terminé' : 'En cours'}
											<small>({certificate.cycle_state})</small></td
										>
									</tr>
								{/if}
							</tbody>
						</Table>
					</CardBody>
				</Card>

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
								<tr>
									<td class="text-start">Signature ECDSA</td>
									<td class="text-end"><code class="rawdata">{certificate.signature}</code></td>
								</tr>
							</tbody>
						</Table>
					</CardBody>
				</Card>
			</details>
		</p>
	</div>
</Alert>

<style>
	.first_name {
		text-transform: capitalize;
	}
	p {
		margin-bottom: 0.5rem;
	}
	.rawdata {
		display: inline-block;
		max-width: 270px;
		white-space: nowrap;
		overflow: scroll;
	}
</style>
