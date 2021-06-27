<script type="ts">
	import { Table, Card, CardHeader, CardBody, CardTitle } from 'sveltestrap';
	import { getCertificateAuthority, getPublicKey } from '$lib/2ddoc';
	import type { Certificate2ddoc } from '../lib/2ddoc';
	import CertificateVaccineInfo from './_Certificate2ddocVaccineInfo.svelte';
	import CertificateTestInfo from './_Certificate2ddocTestInfo.svelte';
	export let certificate: Certificate2ddoc;
</script>

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

<style>
	.rawdata {
		word-break: break-all;
	}
</style>
