<script type="ts">
	import { Alert, Row, Col, Icon, Table, Accordion, AccordionItem } from 'sveltestrap';
	import { findCertificateError, getNamesAndBirthdate, getCertificateAuthority, getPublicKey, getSex, getAnalysisResult } from '$lib/2ddoc';
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

		<br>

		{#if error}
			<p class="error">⚠️ <strong>{error}</strong></p>
		{/if}

		<Accordion>
			<AccordionItem header="Données techniques">
				<Accordion>
					<AccordionItem header="Données brutes">
						<code>{certificate.code}</code>
					</AccordionItem>

					<AccordionItem header="Informations entête">
						<Table>
							<tbody>
								<tr>
									<th class="text-start">Version 2D-Doc</th>
									<td class="text-end">{certificate.document_version}</td>
								</tr>
								<tr>
									<th scope="row" class="text-start">Date de création</th>
									<td class="text-end">{certificate.creation_date.toLocaleDateString('fr-FR')}</td>
								</tr>
								<tr>
									<th class="text-start">Date de signature</th>
									<td class="text-end">{certificate.signature_date.toLocaleDateString('fr-FR')}</td>
								</tr>
								<tr>
									<th class="text-start">ID Autorité de certification</th>
									<td class="text-end"><abbr title="{getCertificateAuthority(certificate.certificate_authority_id)}">{certificate.certificate_authority_id}</abbr></td>
								</tr>
								<tr>
									<th class="text-start">ID Certificat</th>
									<td class="text-end"><abbr title="{getPublicKey(certificate.public_key_id)}">{certificate.public_key_id}</abbr></td>
								</tr>
								<tr>
									<th class="text-start">Type document</th>
									<td class="text-end"><abbr title="{certificate.document_type == 'B2' ? 'Résultat de test virologique' : 'Attestation vaccinale'}">{certificate.document_type}</abbr></td>
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
					</AccordionItem>

					<AccordionItem header="Informations message">
						<Table>
							<tbody>
								<tr>
									<th class="text-start">Prénom(s)</th>
									<td class="text-end">{certificate.tested_first_name ? certificate.tested_first_name : certificate.vaccinated_first_name}</td>
								</tr>
								<tr>
									<th class="text-start">Nom</th>
									<td class="text-end">{certificate.tested_last_name ? certificate.tested_last_name : certificate.vaccinated_last_name}</td>
								</tr>
								<tr>
									<th class="text-start">Date de naissance</th>
									<td class="text-end">{(certificate.tested_birth_date ? certificate.tested_birth_date : certificate.vaccinated_birth_date).toLocaleDateString('fr-FR')}</td>
								</tr>

								{#if certificate.sex}
								<tr>
									<th class="text-start">Genre</th>
									<td class="text-end"><abbr title="{getSex(certificate.sex)}">{certificate.sex}</abbr></td>
								</tr>
								{/if}

								{#if certificate.analysis_code}
								<tr>
									<th class="text-start">Code analyse</th>
									<td class="text-end">{certificate.analysis_code}</td>
								</tr>
								{/if}

								{#if certificate.analysis_result}
								<tr>
									<th class="text-start">Resultat analyse</th>
									<td class="text-end"><abbr title="{getAnalysisResult(certificate.analysis_result)}">{certificate.analysis_result}</abbr></td>
								</tr>
								{/if}

								{#if certificate.analysis_datetime}
								<tr>
									<th class="text-start">Date prélèvement</th>
									<td class="text-end">{certificate.analysis_datetime.toLocaleDateString('fr-FR')}</td>
								</tr>
								{/if}

								{#if certificate.disease}
								<tr>
									<th class="text-start">Maladie couverte</th>
									<td class="text-end">{certificate.disease}</td>
								</tr>
								{/if}

								{#if certificate.prophylactic_agent}
								<tr>
									<th class="text-start"><a href="https://fr.wikipedia.org/wiki/Classification_ATC" target="_blank">Agent prophylactique</a></th>
									<td class="text-end">{certificate.prophylactic_agent}</td>
								</tr>
								{/if}

								{#if certificate.vaccine}
								<tr>
									<th class="text-start">Nom vaccin</th>
									<td class="text-end">{certificate.vaccine}</td>
								</tr>
								{/if}

								{#if certificate.vaccine_maker}
								<tr>
									<th class="text-start">Fabricant vaccin</th>
									<td class="text-end">{certificate.vaccine_maker}</td>
								</tr>
								{/if}

								{#if certificate.doses_received}
								<tr>
									<th class="text-start">Doses reçues</th>
									<td class="text-end">{certificate.doses_received}</td>
								</tr>
								{/if}

								{#if certificate.doses_expected}
								<tr>
									<th class="text-start">Doses attendues</th>
									<td class="text-end">{certificate.doses_expected}</td>
								</tr>
								{/if}

								{#if certificate.last_dose_date}
								<tr>
									<th class="text-start">Date dernière dose</th>
									<td class="text-end">{certificate.last_dose_date.toLocaleDateString('fr-FR')}</td>
								</tr>
								{/if}

								{#if certificate.cycle_state}
								<tr>
									<th class="text-start">Etat vaccination</th>
									<td class="text-end"><abbr title="{certificate.cycle_state === 'TE' ? 'Terminé' : 'En cours'}">{certificate.cycle_state}</abbr></td>
								</tr>
								{/if}
							</tbody>
						</Table>
					</AccordionItem>

					<AccordionItem header="Informations signature">
						<code>{ certificate.signature }</code>
					</AccordionItem>
				</Accordion>
			</AccordionItem>
		</Accordion>
	</div>
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
