<script type="ts">
	import { Table, Card, CardHeader, CardBody, CardTitle } from 'sveltestrap';
	import { getSex, getAnalysisResult } from '$lib/2ddoc';
	import type { TestCertificate } from '../lib/2ddoc';
	export let certificate: TestCertificate;

	function loincLink(analysis_code: string): string {
		const p1 = analysis_code.slice(0, 5);
		const p2 = analysis_code.slice(5);
		return `https://loinc.org/${p1}-${p2}`;
	}
</script>

<Card class="mb-3">
	<CardHeader>
		<CardTitle>Certificat de dépistage</CardTitle>
	</CardHeader>
	<CardBody>
		<Table class="table-sm">
			<tbody>
				<tr>
					<th class="text-start">Prénom(s)</th>
					<td class="text-end">{certificate.tested_first_name}</td>
				</tr>

				<tr>
					<th class="text-start">Nom</th>
					<td class="text-end">{certificate.tested_last_name}</td>
				</tr>

				<tr>
					<th class="text-start">Date de naissance</th>
					<td class="text-end">{certificate.tested_birth_date.toLocaleDateString('fr-FR')}</td>
				</tr>

				<tr>
					<th class="text-start">Genre</th>
					<td class="text-end">{getSex(certificate.sex)} <small>({certificate.sex})</small></td>
				</tr>

				<tr>
					<th class="text-start">Code LOINC</th>
					<td class="text-end">
						<a href={loincLink(certificate.analysis_code)}>{certificate.analysis_code}</a></td
					>
				</tr>

				<tr>
					<th class="text-start">Résultat de l'analyse</th>
					<td class="text-end"
						>{getAnalysisResult(certificate.analysis_result)}
						<small>({certificate.analysis_result})</small></td
					>
				</tr>

				<tr>
					<th class="text-start">Date prélèvement</th>
					<td class="text-end">{certificate.analysis_datetime.toLocaleDateString('fr-FR')}</td>
				</tr>
			</tbody>
		</Table>
	</CardBody>
</Card>
